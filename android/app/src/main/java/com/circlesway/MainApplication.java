package com.plankton.circles;

import android.provider.Settings;
import android.app.Application;
import android.content.Intent;
import com.facebook.react.ReactApplication;
import fr.bamlab.rnimageresizer.ImageResizerPackage;
import com.virgilsecurity.rn.crypto.RNVirgilCryptoPackage;
import com.oblador.keychain.KeychainPackage;
import com.thebylito.navigationbarcolor.NavigationBarColorPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.imagepicker.ImagePickerPackage;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.analytics.RNFirebaseAnalyticsPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.auth.RNFirebaseAuthPackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import io.invertase.firebase.database.RNFirebaseDatabasePackage;
import com.airbnb.android.react.lottie.LottiePackage;
import io.invertase.firebase.storage.RNFirebaseStoragePackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new ImageResizerPackage(),
            new RNVirgilCryptoPackage(),
            new KeychainPackage(),
            new NavigationBarColorPackage(),
            new LinearGradientPackage(),
            new AsyncStoragePackage(),
            new ImagePickerPackage(),
            new RNFirebasePackage(),
            new RNFirebaseAnalyticsPackage(),
            new RNGestureHandlerPackage(),
            new RNFirebaseMessagingPackage(),
            new RNFirebaseNotificationsPackage(),
            new RNFirebaseDatabasePackage(),
            new CirclesWayPackage(),
            new RNFirebaseAuthPackage(),
            new RNFirebaseStoragePackage(),
            new SMSListenerPackage(),
            new SplashScreenReactPackage(),
            new LottiePackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
