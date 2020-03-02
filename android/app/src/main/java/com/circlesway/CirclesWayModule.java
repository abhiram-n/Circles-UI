package com.plankton.circles;

import android.app.Activity;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;


import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import android.provider.Settings;

import static android.content.Context.MODE_PRIVATE;


public class CirclesWayModule extends ReactContextBaseJavaModule implements ActivityEventListener {
    ReactApplicationContext reactContext;
    private static final String EXTRA_CHANNEL_ID = "circlesWay";


    public CirclesWayModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        reactContext.addActivityEventListener(this);
    }

    @Override
    public String getName() {
        return "Circles";
    }

    @ReactMethod
    public void openChannelSettings(){
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) { 
            Intent intent = new Intent(Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS)
            .putExtra(Settings.EXTRA_APP_PACKAGE, getReactApplicationContext().getPackageName())
            .putExtra(Settings.EXTRA_CHANNEL_ID, EXTRA_CHANNEL_ID);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getReactApplicationContext().startActivity(intent);
        }
        else{
            Intent intent = new Intent();
            intent.setAction("android.settings.APP_NOTIFICATION_SETTINGS");
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            intent.putExtra("app_package", getReactApplicationContext().getPackageName());
            intent.putExtra("app_uid", getReactApplicationContext().getApplicationInfo().uid);
            getReactApplicationContext().startActivity(intent);
        }
    }

    @ReactMethod
    public void isFirstRun(Promise promise){
        WritableMap map = Arguments.createMap();
        SharedPreferences prefs = getReactApplicationContext().getSharedPreferences("com.plankton.circles", MODE_PRIVATE);
        final String IS_FIRST_RUN = "isFirstRun";
        map.putBoolean(IS_FIRST_RUN,prefs.getBoolean(IS_FIRST_RUN, true));
        prefs.edit().putBoolean(IS_FIRST_RUN, false).commit();
        promise.resolve(map);
    }


    @Override
    public void onNewIntent(Intent intent) {
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent intent) {

    }
}
