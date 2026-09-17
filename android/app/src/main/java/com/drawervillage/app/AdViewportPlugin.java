package com.drawervillage.app;

import android.graphics.Color;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;
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
    private TextView status;
    private ViewGroup host;
    private ViewTreeObserver.OnGlobalLayoutListener listener;

    @PluginMethod
    public void reserve(PluginCall call) {
        final int height = Math.max(0, Math.min(240, call.getInt("height", 0)));
        final String message = call.getString("message", "");
        getActivity().runOnUiThread(() -> {
            View web = getBridge().getWebView();
            host = (ViewGroup) web.getParent();
            space = Math.round(height * getContext().getResources().getDisplayMetrics().density);
            if (status == null) {
                status = new TextView(getContext());
                status.setGravity(Gravity.CENTER);
                status.setTextColor(Color.rgb(85,67,46));
                status.setBackgroundColor(Color.rgb(245,239,223));
                status.setTextSize(12);
                status.setOnClickListener(v -> web.post(() -> getBridge().getWebView().evaluateJavascript(
                    "window.dispatchEvent(new Event('drawer-ad-retry'))", null)));
                host.addView(status);
                listener = this::layout;
                host.getViewTreeObserver().addOnGlobalLayoutListener(listener);
            }
            status.setText(message);
            status.setVisibility(space > 0 ? View.VISIBLE : View.GONE);
            layout();
            call.resolve();
        });
    }

    private void layout() {
        if (host == null) return;
        View web = getBridge().getWebView();
        ViewGroup.MarginLayoutParams wp = (ViewGroup.MarginLayoutParams) web.getLayoutParams();
        if (wp.topMargin != space) { wp.topMargin = space; web.setLayoutParams(wp); }
        ViewGroup.LayoutParams sp = status.getLayoutParams();
        if (sp.height != space || sp.width != ViewGroup.LayoutParams.MATCH_PARENT) {
            sp.height = space; sp.width = ViewGroup.LayoutParams.MATCH_PARENT;
            if (sp instanceof CoordinatorLayout.LayoutParams) ((CoordinatorLayout.LayoutParams) sp).gravity = Gravity.TOP;
            status.setLayoutParams(sp);
        }
        // AdMob applies an obsolete status-bar inset on Android 15 even while
        // our activity hides system bars. Its top banner must start at host y=0.
        if (space > 0) for (int i=0; i<host.getChildCount(); i++) {
            View child=host.getChildAt(i);
            if (child==web || child==status || !containsBanner(child)) continue;
            ViewGroup.LayoutParams raw=child.getLayoutParams();
            if (raw instanceof ViewGroup.MarginLayoutParams) {
                ViewGroup.MarginLayoutParams p=(ViewGroup.MarginLayoutParams)raw;
                if (p.topMargin!=0) {p.topMargin=0;child.setLayoutParams(p);}
            }
            if (host.indexOfChild(child)<host.indexOfChild(status)) child.bringToFront();
        }
    }
    private boolean containsBanner(View view) {
        if (view.getClass().getName().equals("com.google.android.gms.ads.AdView")) return true;
        if (view instanceof ViewGroup) {
            ViewGroup group=(ViewGroup)view;
            for(int i=0;i<group.getChildCount();i++) if(containsBanner(group.getChildAt(i))) return true;
        }
        return false;
    }
    @Override protected void handleOnDestroy() {
        if(host!=null && listener!=null) host.getViewTreeObserver().removeOnGlobalLayoutListener(listener);
        super.handleOnDestroy();
    }
}
