package com.plankton.circles;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import android.content.IntentFilter;
import android.content.BroadcastReceiver;
import android.util.Log;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.NonNull;

import java.util.ArrayList;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.LifecycleEventListener;
import com.google.android.gms.auth.api.phone.SmsRetriever;
import com.google.android.gms.auth.api.phone.SmsRetrieverClient;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;

public class SMSListenerModule extends ReactContextBaseJavaModule implements LifecycleEventListener{
    private final ReactApplicationContext smsContext;
    private final SMSBroadcastReceiver receiver;
    private boolean isReceiverRegistered = false;

    SMSListenerModule(ReactApplicationContext context) {
        super(context);
        receiver = new SMSBroadcastReceiver(context);
        smsContext = context;
    }

    @Override
    public String getName(){
        return "SMSListener";
    }

    @ReactMethod
    public void startListener(Promise promise){
        // Get an instance of SmsRetrieverClient, used to start listening for a matching
        // SMS message.
        SmsRetrieverClient client = SmsRetriever.getClient(smsContext);

        // Starts SmsRetriever, which waits for ONE matching SMS message until timeout
        // (5 minutes). The matching SMS message will be sent via a Broadcast Intent with
        // action SmsRetriever#SMS_RETRIEVED_ACTION.
        Task<Void> task = client.startSmsRetriever();

        try{
            registerBroadcastReceiver();
        }
        catch (Exception e){
            promise.reject(e);
            return;
        }
        
        // Listen for success/failure of the start Task. If in a background thread, this
        // can be made blocking using Tasks.await(task, [timeout]);
        task.addOnSuccessListener(new OnSuccessListener<Void>() {
            @Override
            public void onSuccess(Void aVoid) {
        
                Log.d("Received", "Success listener");
                // Successfully started retriever, expect broadcast intent
                promise.resolve(true);
            }
        });

        task.addOnFailureListener(new OnFailureListener() {
            @Override
            public void onFailure(Exception e) {
                Log.d("Received", "Failed Listener");
                // Failed to start retriever, inspect Exception for more details
                promise.reject(e);
            }
        });
    }

    private void registerBroadcastReceiver() {
        Log.d("Received", "Arrived in receiver");
        if (isReceiverRegistered) { return; }
        smsContext.registerReceiver(receiver, new IntentFilter(SmsRetriever.SMS_RETRIEVED_ACTION));
        isReceiverRegistered = true;
    }

    private void unregisterReceiver() {
        if (isReceiverRegistered && receiver != null) {
            try 
            {
                smsContext.unregisterReceiver(receiver);
                Log.d("Received", "Receiver UnRegistered");
                isReceiverRegistered = false;
            } 
            catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    public void onHostResume() {
        try{
            registerBroadcastReceiver();
        }
        catch (Exception e){
            e.printStackTrace();
        }
    }

    @Override
    public void onHostPause() {
        unregisterReceiver();
    }

    @Override
    public void onHostDestroy() {
        unregisterReceiver();
    }
}