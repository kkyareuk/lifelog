package com.drawervillage.app;

import android.content.Intent;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.games.PlayGames;

@CapacitorPlugin(name = "PlayGamesAchievements")
public class PlayGamesAchievementsPlugin extends Plugin {
    private static final int ACHIEVEMENTS_REQUEST_CODE = 9003;

    private boolean configured() {
        return getContext().getResources().getBoolean(R.bool.play_games_configured);
    }

    private String achievementId(String resourceName) {
        if (resourceName == null || resourceName.trim().isEmpty()) return "";
        int resourceId = getContext().getResources().getIdentifier(
            resourceName.trim(), "string", getContext().getPackageName()
        );
        return resourceId == 0 ? "" : getContext().getString(resourceId).trim();
    }

    private boolean rejectIfUnavailable(PluginCall call) {
        if (!configured()) {
            call.reject("Play Console의 Google Play 게임즈 프로젝트 ID와 업적 ID를 먼저 연결해 주세요.", "NOT_CONFIGURED");
            return true;
        }
        if (getActivity() == null) {
            call.reject("업적 화면을 열 수 있는 Android 화면이 없습니다.", "NO_ACTIVITY");
            return true;
        }
        return false;
    }

    @PluginMethod
    public void status(PluginCall call) {
        JSObject result = new JSObject();
        result.put("available", true);
        result.put("configured", configured());
        if (!configured() || getActivity() == null) {
            result.put("authenticated", false);
            call.resolve(result);
            return;
        }
        PlayGames.getGamesSignInClient(getActivity()).isAuthenticated().addOnCompleteListener(task -> {
            result.put("authenticated", task.isSuccessful() && task.getResult().isAuthenticated());
            call.resolve(result);
        });
    }

    @PluginMethod
    public void signIn(PluginCall call) {
        if (rejectIfUnavailable(call)) return;
        PlayGames.getGamesSignInClient(getActivity()).signIn().addOnCompleteListener(task -> {
            if (!task.isSuccessful()) {
                call.reject("Google Play 게임즈 로그인에 실패했습니다.", "SIGN_IN_FAILED", task.getException());
                return;
            }
            JSObject result = new JSObject();
            result.put("authenticated", task.getResult().isAuthenticated());
            call.resolve(result);
        });
    }

    @PluginMethod
    public void unlock(PluginCall call) {
        if (rejectIfUnavailable(call)) return;
        String id = achievementId(call.getString("resource", ""));
        if (id.isEmpty()) {
            call.reject("Google Play 업적 ID가 비어 있습니다.", "MISSING_ACHIEVEMENT_ID");
            return;
        }
        PlayGames.getAchievementsClient(getActivity()).unlock(id);
        call.resolve();
    }

    @PluginMethod
    public void setSteps(PluginCall call) {
        if (rejectIfUnavailable(call)) return;
        String id = achievementId(call.getString("resource", ""));
        int steps = Math.max(0, call.getInt("steps", 0));
        if (id.isEmpty()) {
            call.reject("Google Play 업적 ID가 비어 있습니다.", "MISSING_ACHIEVEMENT_ID");
            return;
        }
        if (steps > 0) PlayGames.getAchievementsClient(getActivity()).setSteps(id, steps);
        call.resolve();
    }

    @PluginMethod
    public void show(PluginCall call) {
        if (rejectIfUnavailable(call)) return;
        PlayGames.getAchievementsClient(getActivity()).getAchievementsIntent()
            .addOnSuccessListener(intent -> {
                getActivity().startActivityForResult(intent, ACHIEVEMENTS_REQUEST_CODE);
                call.resolve();
            })
            .addOnFailureListener(error -> call.reject("Google Play 업적 화면을 열지 못했습니다.", "ACHIEVEMENTS_UI_FAILED", error));
    }
}
