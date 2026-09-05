package com.drawervillage.app;

import com.getcapacitor.BridgeActivity;
import android.view.View;
import android.view.ViewGroup;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(PlayBillingPlugin.class);
        registerPlugin(ProfileExportPlugin.class);
        registerPlugin(PlayGamesAchievementsPlugin.class);
        super.onCreate(savedInstanceState);
        installSystemBarInsets();
        hideStatusBar();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideStatusBar();
    }

    private void hideStatusBar() {
        androidx.core.view.WindowInsetsControllerCompat controller =
            androidx.core.view.WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.hide(androidx.core.view.WindowInsetsCompat.Type.statusBars());
        controller.setSystemBarsBehavior(
            androidx.core.view.WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        );
    }

    private void installSystemBarInsets() {
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        final View webView = getBridge().getWebView();
        ViewCompat.setOnApplyWindowInsetsListener(webView, (view, windowInsets) -> {
            Insets navigation = windowInsets.getInsets(
                WindowInsetsCompat.Type.navigationBars() | WindowInsetsCompat.Type.displayCutout()
            );
            ViewGroup.LayoutParams rawParams = view.getLayoutParams();
            if (rawParams instanceof ViewGroup.MarginLayoutParams) {
                ViewGroup.MarginLayoutParams params = (ViewGroup.MarginLayoutParams) rawParams;
                if (params.leftMargin != navigation.left || params.rightMargin != navigation.right || params.bottomMargin != navigation.bottom) {
                    params.leftMargin = navigation.left;
                    params.rightMargin = navigation.right;
                    params.bottomMargin = navigation.bottom;
                    view.setLayoutParams(params);
                }
            }
            return windowInsets;
        });
        ViewCompat.requestApplyInsets(webView);
    }
}
