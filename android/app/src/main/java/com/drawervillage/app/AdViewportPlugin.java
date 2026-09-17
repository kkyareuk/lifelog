package com.drawervillage.app;

import android.graphics.Color;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.text.TextUtils;
import android.widget.TextView;
import androidx.coordinatorlayout.widget.CoordinatorLayout;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Native banners and the game own disjoint rectangles, including in immersive mode. */
@CapacitorPlugin(name = "AdViewport")
public class AdViewportPlugin extends Plugin {
    private int space;
    private int safeTop;
    private View cameraMask;
    private TextView status;
    private ViewGroup host;

    @PluginMethod
    public void reserve(PluginCall call) {
        final int height = Math.max(0, Math.min(240, call.getInt("height", 0)));
        final String message = call.getString("message", "");
        getActivity().runOnUiThread(() -> {
            View web = getBridge().getWebView();
            host = (ViewGroup) web.getParent();
            space = Math.round(height * getContext().getResources().getDisplayMetrics().density);
            if (status == null) {
                cameraMask = new View(getContext());
                cameraMask.setBackgroundColor(Color.BLACK);
                host.addView(cameraMask);
                status = new TextView(getContext());
                status.setGravity(Gravity.CENTER);
                status.setTextColor(Color.rgb(85,67,46));
                status.setBackgroundColor(Color.rgb(245,239,223));
                status.setTextSize(12);
                status.setOnClickListener(v -> web.post(() -> getBridge().getWebView().evaluateJavascript(
                    "window.dispatchEvent(new Event('drawer-ad-retry'))", null)));
                host.addView(status);
                ViewCompat.setOnApplyWindowInsetsListener(status, (view, insets) -> {
                    int top = insets.getInsets(WindowInsetsCompat.Type.statusBars() | WindowInsetsCompat.Type.displayCutout()).top;
                    if (safeTop != top) { safeTop = top; layout(); }
                    return insets;
                });
            }
            WindowInsetsCompat insets = ViewCompat.getRootWindowInsets(web);
            if (insets != null) safeTop = insets.getInsets(WindowInsetsCompat.Type.statusBars() | WindowInsetsCompat.Type.displayCutout()).top;
            if (!TextUtils.equals(status.getText(), message)) status.setText(message);
            status.setVisibility(space > 0 ? View.VISIBLE : View.GONE);
            layout();
            call.resolve();
        });
    }

    private void layout() {
        if (host == null) return;
        View web = getBridge().getWebView();
        ViewGroup.MarginLayoutParams wp = (ViewGroup.MarginLayoutParams) web.getLayoutParams();
        int top = space > 0 ? safeTop : 0;
        int reserved = space + top;
        if (wp.topMargin != reserved) { wp.topMargin = reserved; web.setLayoutParams(wp); }
        cameraMask.setVisibility(top > 0 ? View.VISIBLE : View.GONE);
        ViewGroup.LayoutParams mask = cameraMask.getLayoutParams();
        if (mask.height != top || mask.width != ViewGroup.LayoutParams.MATCH_PARENT) {
            mask.height = top; mask.width = ViewGroup.LayoutParams.MATCH_PARENT;
            if (mask instanceof CoordinatorLayout.LayoutParams) ((CoordinatorLayout.LayoutParams) mask).gravity = Gravity.TOP;
            cameraMask.setLayoutParams(mask);
        }
        ViewGroup.MarginLayoutParams sp = (ViewGroup.MarginLayoutParams) status.getLayoutParams();
        if (sp.height != space || sp.width != ViewGroup.LayoutParams.MATCH_PARENT || sp.topMargin != top) {
            sp.topMargin = top; sp.height = space; sp.width = ViewGroup.LayoutParams.MATCH_PARENT;
            if (sp instanceof CoordinatorLayout.LayoutParams) ((CoordinatorLayout.LayoutParams) sp).gravity = Gravity.TOP;
            status.setLayoutParams(sp);
        }
    }
}
