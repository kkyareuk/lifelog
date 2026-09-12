// CI-only diagnostics; never used by the App Store archive workflow.
import {readFileSync,writeFileSync} from 'node:fs';
const file='ios/App/App/AppleBillingPlugin.swift';
let source=readFileSync(file,'utf8');
const anchor='class DrawerBridgeViewController: CAPBridgeViewController {';
if(!source.includes(anchor))throw Error('Missing bridge controller');
source=source.replace('import UIKit','import UIKit\nimport WebKit');
source=source.replace(anchor,anchor+`
    #if DEBUG
    private var startupChecks = 0
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        inspectStartup()
    }
    private func inspectStartup() {
        startupChecks += 1
        guard startupChecks <= 45 else { return }
        let destination = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!.appendingPathComponent("drawer-startup-check.json")
        var report: [String: Any] = ["attempt": startupChecks, "hasWebView": webView != nil, "loading": webView?.isLoading ?? false, "width": webView?.bounds.width ?? 0, "height": webView?.bounds.height ?? 0]
        if let data = try? JSONSerialization.data(withJSONObject: report) { try? data.write(to: destination) }
        webView?.evaluateJavaScript("JSON.stringify({ready:document.readyState,appChildren:document.querySelector('#app')?.children.length||0,textLength:document.querySelector('#app')?.textContent.length||0,buttons:document.querySelectorAll('#app button').length,url:location.href,rendered:document.documentElement.dataset.drawerRendered||null,bootError:document.documentElement.dataset.drawerBootError||null})") { [weak self] value, error in
            if let value = value as? String, let bytes = value.data(using: .utf8), let js = try? JSONSerialization.jsonObject(with: bytes) { report["dom"] = js }
            if let error = error { report["error"] = error.localizedDescription }
            if let data = try? JSONSerialization.data(withJSONObject: report) { try? data.write(to: destination) }
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) { self?.inspectStartup() }
        }
    }
    #endif
`);
writeFileSync(file,source);
