package com.plankton.circles;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.util.Log;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.gms.auth.api.phone.SmsRetriever;
import com.google.android.gms.common.api.CommonStatusCodes;
import com.google.android.gms.common.api.Status;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import java.util.ArrayList;

/**
 * BroadcastReceiver to wait for SMS messages. This can be registered either
 * in the AndroidManifest or at runtime.  Should filter Intents on
 * SmsRetriever.SMS_RETRIEVED_ACTION.
 */
public class SMSBroadcastReceiver extends BroadcastReceiver {
    private ReactApplicationContext  mContext;
    private static final String MESSAGE_RECEIVED = "received";
    private static final String MESSAGE_KEY = "message";
    private static final String STATUS_KEY = "status";

    public SMSBroadcastReceiver(){
        super();
    }

    public SMSBroadcastReceiver(ReactApplicationContext context) {
        mContext = context;
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        if (SmsRetriever.SMS_RETRIEVED_ACTION.equals(intent.getAction()) && mContext != null) {
        Bundle extras = intent.getExtras();
        Status status = (Status) extras.get(SmsRetriever.EXTRA_STATUS);
        WritableMap params = Arguments.createMap();
        int statusCode = status.getStatusCode();
        params.putInt(STATUS_KEY, statusCode);
        switch(statusCode) {
          case CommonStatusCodes.SUCCESS:
            // Get SMS message contents
            String message = (String) extras.get(SmsRetriever.EXTRA_SMS_MESSAGE);
            // Extract one-time code from the message and complete verification
            // by sending the code back to your server.
            params.putString(MESSAGE_KEY, message);
            break;
          case CommonStatusCodes.TIMEOUT:
            // Waiting for SMS timed out (5 minutes)
            // Handle the error ...
            break;
        }

        sendEvent(MESSAGE_RECEIVED, params);
      }
    }

    private void sendEvent(String eventName, WritableMap params) {
      mContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }
  }