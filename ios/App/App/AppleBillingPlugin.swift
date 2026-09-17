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
    private let allowed: Set<String> = ["com.drawervillage.app.character_slot_1", "com.drawervillage.app.character_slots_5", "com.drawervillage.app.town_slot_1", "com.drawervillage.app.green_tea", "com.drawervillage.app.ad_free"]
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
            call.resolve(["build": Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "", "sandboxReceipt": Bundle.main.appStoreReceiptURL?.lastPathComponent == "sandboxReceipt", "hasWindow": controller?.viewIfLoaded?.window != nil, "hasScene": scene != nil, "sceneActive": scene?.activationState == .foregroundActive, "purchaseActive": purchaseActive, "waitingSeconds": purchaseStarted.map { Int(Date().timeIntervalSince($0)) } ?? 0, "errorCode": lastErrorCode])
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
                var syncError = ""
                if interactive && !purchaseActive {
                    do { try await AppStore.sync() }
                    catch {
                        let detail = error as NSError
                        syncError = "\(detail.domain):\(detail.code)"
                        lastErrorCode = syncError
                    }
                }
                var purchases: [String: [String: Any]] = [:]
                for await result in StoreKit.Transaction.unfinished {
                    if case .verified(let transaction) = result, allowed.contains(transaction.productID), transaction.revocationDate == nil { purchases[String(transaction.id)] = try payload(result) }
                }
                for await result in StoreKit.Transaction.currentEntitlements {
                    if case .verified(let transaction) = result, allowed.contains(transaction.productID), transaction.revocationDate == nil { purchases[String(transaction.id)] = try payload(result) }
                }
                // A failed interactive sync must not hide locally verified unfinished purchases.
                call.resolve(["purchases": Array(purchases.values), "syncError": syncError])
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
        bridge?.registerPluginInstance(IOSProfileExportPlugin())
        if #available(iOS 15.0, *) { bridge?.registerPluginInstance(AppleBillingPlugin()) }
    }
}

// File export uses the system share sheet on both iPhone and iPad. Bounded
// chunks avoid retaining a full document in a single Capacitor call.
@objc(IOSProfileExportPlugin)
public class IOSProfileExportPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "IOSProfileExportPlugin"
    public let jsName = "IOSProfileExport"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "appendImage", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancelImage", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "savePng", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "savePdf", returnType: CAPPluginReturnPromise)
    ]
    private var token = ""
    private var bytes = Data()
    private var offset = 0
    private var exporting = false
    @objc func appendImage(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard !self.exporting, let text = call.getString("data"), text.count <= 49152,
                  let chunk = Data(base64Encoded: text), let position = call.getInt("offset") else { call.reject("INVALID_IMAGE_CHUNK"); return }
            if position == 0 { self.token = UUID().uuidString; self.bytes = Data(); self.offset = 0 }
            guard position == self.offset, position == 0 || call.getString("token") == self.token,
                  self.bytes.count + chunk.count <= 32 * 1024 * 1024 else { call.reject("IMAGE_CHUNK_LIMIT"); return }
            self.bytes.append(chunk); self.offset += text.count
            call.resolve(["token": self.token])
        }
    }
    @objc func cancelImage(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if call.getString("token") == self.token { self.bytes = Data(); self.token = ""; self.offset = 0 }
            call.resolve()
        }
    }
    @objc func savePng(_ call: CAPPluginCall) { export(call, pdf: false) }
    @objc func savePdf(_ call: CAPPluginCall) { export(call, pdf: true) }
    private func export(_ call: CAPPluginCall, pdf: Bool) {
        DispatchQueue.main.async {
            guard !self.exporting, !self.token.isEmpty, call.getString("token") == self.token,
                  let presenter = self.bridge?.viewController else { call.reject("EXPORT_UNAVAILABLE"); return }
            self.exporting = true
            let data = self.bytes
            self.bytes = Data(); self.token = ""; self.offset = 0
            let name = URL(fileURLWithPath: call.getString("filename") ?? "profile").lastPathComponent
            DispatchQueue.global(qos: .userInitiated).async {
                do {
                    guard let image = UIImage(data: data), image.size.width > 0 else { throw NSError(domain: "ProfileExport", code: 1) }
                    let folder = FileManager.default.temporaryDirectory.appendingPathComponent("profile-" + UUID().uuidString)
                    try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
                    let file = folder.appendingPathComponent(name)
                    if pdf {
                        let page = CGRect(x: 0, y: 0, width: 595, height: 842)
                        let width: CGFloat = 547, height = image.size.height * width / image.size.width
                        let renderer = UIGraphicsPDFRenderer(bounds: page)
                        try renderer.writePDF(to: file) { context in
                            for index in 0..<Int(ceil(height / 794)) {
                                context.beginPage()
                                context.cgContext.saveGState()
                                context.cgContext.clip(to: CGRect(x: 24, y: 24, width: width, height: 794))
                                image.draw(in: CGRect(x: 24, y: 24 - CGFloat(index) * 794, width: width, height: height))
                                context.cgContext.restoreGState()
                            }
                        }
                    } else { try data.write(to: file, options: .atomic) }
                    DispatchQueue.main.async {
                        let sheet = UIActivityViewController(activityItems: [file], applicationActivities: nil)
                        sheet.popoverPresentationController?.sourceView = presenter.view
                        sheet.popoverPresentationController?.sourceRect = CGRect(x: presenter.view.bounds.midX, y: presenter.view.bounds.midY, width: 1, height: 1)
                        sheet.completionWithItemsHandler = { _, completed, _, error in
                            self.exporting = false
                            try? FileManager.default.removeItem(at: folder)
                            if let error = error { call.reject("EXPORT_FAILED", nil, error) }
                            else { call.resolve(["cancelled": !completed]) }
                        }
                        presenter.present(sheet, animated: true)
                    }
                } catch {
                    DispatchQueue.main.async { self.exporting = false; call.reject("EXPORT_FAILED", nil, error) }
                }
            }
        }
    }
}
