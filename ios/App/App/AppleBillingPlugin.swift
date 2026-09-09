import Foundation
import Capacitor
import StoreKit
import UIKit

@available(iOS 15.0, *)
@objc(AppleBillingPlugin)
public class AppleBillingPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AppleBillingPlugin"
    public let jsName = "AppleBilling"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getDiagnostics", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restorePurchases", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "finishPurchase", returnType: CAPPluginReturnPromise)
    ]
    private let allowed: Set<String> = ["com.drawervillage.app.character_slots_5", "com.drawervillage.app.town_slot_1", "com.drawervillage.app.green_tea"]
    @MainActor private var loadedProducts: [String: Product] = [:]
    @MainActor private var purchaseActive = false
    @MainActor private var purchaseStarted: Date?
    @MainActor private var lastErrorCode = "none"
    private var updates: Task<Void, Never>?
    public override func load() {
        updates = Task { [weak self] in
            for await result in StoreKit.Transaction.updates {
                guard let self = self else { return }
                if case .verified(let transaction) = result, self.allowed.contains(transaction.productID) {
                    self.notifyListeners("transactionUpdated", data: ["transactionId": String(transaction.id)])
                }
            }
        }
    }
    deinit { updates?.cancel() }
    private func payload(_ result: VerificationResult<StoreKit.Transaction>) throws -> [String: Any] {
        guard case .verified(let transaction) = result else { throw BillingError.unverified }
        guard allowed.contains(transaction.productID), transaction.revocationDate == nil else { throw BillingError.unverified }
        return ["transactionId": String(transaction.id), "productId": transaction.productID, "signedTransaction": result.jwsRepresentation]
    }
    enum BillingError: Error { case unverified }
    @objc func getDiagnostics(_ call: CAPPluginCall) {
        Task { @MainActor in
            let controller = bridge?.viewController
            let scene = controller?.viewIfLoaded?.window?.windowScene
            call.resolve(["build": Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "", "hasWindow": controller?.viewIfLoaded?.window != nil, "hasScene": scene != nil, "sceneActive": scene?.activationState == .foregroundActive, "purchaseActive": purchaseActive, "waitingSeconds": purchaseStarted.map { Int(Date().timeIntervalSince($0)) } ?? 0, "errorCode": lastErrorCode])
        }
    }
    @objc func getProducts(_ call: CAPPluginCall) {
        let ids = (call.getArray("productIds", String.self) ?? []).filter { allowed.contains($0) }
        Task { @MainActor in
            do {
                let products = try await Product.products(for: ids)
                for product in products { loadedProducts[product.id] = product }
                call.resolve(["products": products.map { ["productId": $0.id, "title": $0.displayName, "formattedPrice": $0.displayPrice, "regularPaidOffer": $0.price > 0] as [String: Any] }])
            } catch { call.reject("PRODUCTS_UNAVAILABLE", "PRODUCTS_UNAVAILABLE") }
        }
    }
    @objc func purchase(_ call: CAPPluginCall) {
        guard let id = call.getString("productId"), allowed.contains(id), let token = UUID(uuidString: call.getString("appAccountToken") ?? "") else { call.reject("INVALID_PURCHASE", "INVALID_PURCHASE"); return }
        Task { @MainActor in
            guard !purchaseActive else { call.reject("BUSY", "BUSY"); return }
            // Products are loaded by the bounded JS preflight before any payment starts.
            guard let product = loadedProducts[id] else { call.reject("PRODUCTS_UNAVAILABLE", "PRODUCTS_UNAVAILABLE"); return }
            guard let presenter = bridge?.viewController, presenter.viewIfLoaded?.window != nil else { call.reject("PURCHASE_FAILED", "PURCHASE_FAILED"); return }
            guard let scene = presenter.view.window?.windowScene, scene.activationState == .foregroundActive else { call.reject("APPLE_WINDOW_UNAVAILABLE", "APPLE_WINDOW_UNAVAILABLE"); return }
            purchaseStarted = Date()
            lastErrorCode = "none"
            purchaseActive = true
            defer { purchaseActive = false; purchaseStarted = nil }
            do {
                let result: Product.PurchaseResult
                if #available(iOS 18.2, *) {
                    result = try await product.purchase(confirmIn: scene, options: [.appAccountToken(token)])
                } else {
                    result = try await product.purchase(options: [.appAccountToken(token)])
                }
                switch result {
                case .success(let verified): call.resolve(try payload(verified))
                case .userCancelled: call.reject("PURCHASE_CANCELLED", "PURCHASE_CANCELLED")
                case .pending: call.reject("PURCHASE_PENDING", "PURCHASE_PENDING")
                @unknown default: call.reject("PURCHASE_FAILED", "PURCHASE_FAILED")
                }
            } catch { lastErrorCode = "\((error as NSError).domain):\((error as NSError).code)"; call.reject("PURCHASE_FAILED", "PURCHASE_FAILED") }
        }
    }
    @objc func restorePurchases(_ call: CAPPluginCall) {
        let interactive = call.getBool("interactive") ?? true
        Task { @MainActor in
            do {
                if interactive && !purchaseActive { try await AppStore.sync() }
                var purchases: [String: [String: Any]] = [:]
                for await result in StoreKit.Transaction.unfinished {
                    if case .verified(let transaction) = result, allowed.contains(transaction.productID), transaction.revocationDate == nil { purchases[String(transaction.id)] = try payload(result) }
                }
                for await result in StoreKit.Transaction.currentEntitlements {
                    if case .verified(let transaction) = result, allowed.contains(transaction.productID), transaction.revocationDate == nil { purchases[String(transaction.id)] = try payload(result) }
                }
                call.resolve(["purchases": Array(purchases.values)])
            } catch { call.reject("RESTORE_FAILED", "RESTORE_FAILED") }
        }
    }
    @objc func finishPurchase(_ call: CAPPluginCall) {
        guard let id = call.getString("transactionId") else { call.reject("INVALID_PURCHASE"); return }
        Task {
            for await result in StoreKit.Transaction.unfinished {
                if case .verified(let transaction) = result, String(transaction.id) == id, allowed.contains(transaction.productID) { await transaction.finish(); break }
            }
            call.resolve()
        }
    }
}

@objc(DrawerBridgeViewController)
class DrawerBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        if #available(iOS 15.0, *) { bridge?.registerPluginInstance(AppleBillingPlugin()) }
    }
}
