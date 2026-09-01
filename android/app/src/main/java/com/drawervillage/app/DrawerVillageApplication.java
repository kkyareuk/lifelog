package com.drawervillage.app;

import android.app.Application;
import com.google.android.gms.games.PlayGamesSdk;

public class DrawerVillageApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        if (getResources().getBoolean(R.bool.play_games_configured)) {
            PlayGamesSdk.initialize(this);
        }
    }
}
