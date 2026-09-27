import UIKit
import Capacitor

// Keep the banner in the root view and resize the actual WKWebView. A CSS
// translation cannot change dvh, native safe areas, or fixed-position controls.
@objc(DrawerBridgeViewController)
class DrawerBridgeViewController: CAPBridgeViewController {
    private var bannerHeight: CGFloat = 0
    private let bannerStatus = UIButton(type: .system)

    override func capacitorDidLoad() {
        if let web = webView {
            let host = UIView(frame: web.frame)
            host.backgroundColor = .black
            view = host
            web.autoresizingMask = []
            host.addSubview(web)
            bannerStatus.backgroundColor = UIColor(red: 245/255, green: 239/255, blue: 223/255, alpha: 1)
            bannerStatus.setTitleColor(UIColor(red: 85/255, green: 67/255, blue: 46/255, alpha: 1), for: .normal)
            bannerStatus.titleLabel?.font = .systemFont(ofSize: 12)
            bannerStatus.titleLabel?.numberOfLines = 3
            bannerStatus.titleLabel?.textAlignment = .center
            bannerStatus.addTarget(self, action: #selector(retryBanner), for: .touchUpInside)
            bannerStatus.isHidden = true
            host.addSubview(bannerStatus)
        }
        bridge?.registerPluginInstance(AdViewportPlugin())
        bridge?.registerPluginInstance(IOSProfileExportPlugin())
        if #available(iOS 15.0, *) { bridge?.registerPluginInstance(AppleBillingPlugin()) }
    }

    #if DEBUG
    private var checkedBannerViewport = false
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        guard !checkedBannerViewport, ProcessInfo.processInfo.arguments.contains("--check-ad-viewport") else { return }
        checkedBannerViewport = true
        var samples: [[String: Any]] = []
        for height in [CGFloat(56), CGFloat(90), CGFloat(0)] {
            reserveBanner(height: height, message: "Banner viewport check")
            guard let web = webView else { continue }
            samples.append(["height": height, "safeTop": view.safeAreaInsets.top,
                "rootHeight": view.bounds.height, "webTop": web.frame.minY,
                "webBottom": web.frame.maxY, "webHeight": web.frame.height,
                "separateRoot": view !== web, "statusHidden": bannerStatus.isHidden])
        }
        let report: [String: Any] = ["samples": samples]
        if let data = try? JSONSerialization.data(withJSONObject: report),
           let documents = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
            try? data.write(to: documents.appendingPathComponent("drawer-ad-viewport-check.json"))
        }
    }
    #endif

    func reserveBanner(height: CGFloat, message: String) {
        bannerHeight = height.isFinite ? max(0, min(240, height)) : 0
        bannerStatus.setTitle(message, for: .normal)
        bannerStatus.isHidden = bannerHeight == 0
        view.setNeedsLayout()
        view.layoutIfNeeded()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        layoutBannerViewport()
    }

    override func viewSafeAreaInsetsDidChange() {
        super.viewSafeAreaInsetsDidChange()
        view.setNeedsLayout()
    }

    private func layoutBannerViewport() {
        guard let web = webView else { return }
        let bounds = view.bounds
        let top = bannerHeight > 0 ? view.safeAreaInsets.top : 0
        let reserved = min(bounds.height, top + bannerHeight)
        let frame = CGRect(x: 0, y: reserved, width: bounds.width, height: max(0, bounds.height - reserved))
        if web.frame != frame { web.frame = frame }
        bannerStatus.frame = CGRect(x: view.safeAreaInsets.left, y: top,
            width: max(0, bounds.width - view.safeAreaInsets.left - view.safeAreaInsets.right), height: bannerHeight)
    }

    @objc private func retryBanner() {
        webView?.evaluateJavaScript("window.dispatchEvent(new Event('drawer-ad-retry'))", completionHandler: nil)
    }
}

@objc(AdViewportPlugin)
public class AdViewportPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AdViewportPlugin"
    public let jsName = "AdViewport"
    public let pluginMethods = [CAPPluginMethod(name: "reserve", returnType: CAPPluginReturnPromise)]

    @objc func reserve(_ call: CAPPluginCall) {
        let height = CGFloat(call.getDouble("height") ?? 0)
        let message = call.getString("message") ?? ""
        DispatchQueue.main.async {
            guard let controller = self.bridge?.viewController as? DrawerBridgeViewController else {
                call.reject("Banner viewport is unavailable")
                return
            }
            controller.reserveBanner(height: height, message: message)
            call.resolve()
        }
    }
}

