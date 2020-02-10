import React, { Component } from "react";
import { Platform, StyleSheet, Text, View,Linking,FlatList,NativeEventEmitter,NativeModules} from "react-native";
import { ActivityIndicator, Picker, TextInput, ToastAndroid, StatusBar } from "react-native";
import { Button, Icon, InputGroup, Input } from "native-base";
import { createStackNavigator, createAppContainer } from "react-navigation";
import SearchableDropdown from "react-native-searchable-dropdown";
import firebase from "react-native-firebase";
import * as Constants from "../helpers/Constants";
import * as Utilities from "../helpers/Utilities";
import * as UIStrings from "../helpers/UIStrings";
import * as AuthHelpers from "../helpers/AuthHelpers";
import * as NavigationHelpers from "../helpers/NavigationHelpers";
import base64 from "react-native-base64";
import RoundIconWithBackgroundAndCaptionButton from "../components/RoundIconWithBackgroundAndCaptionButton";
import TopLeftButton from "../components/TopLeftButton";
import changeNavigationBarColor from "react-native-navigation-bar-color";
import GradientButton from "../components/GradientButton";


const PHONE_VERIFIED_LOGIN_API = "/auth/phoneAuthLogin";
const SMSListener = NativeModules.SMSListener;
export default class LogInScreen extends Component<Props> {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      phone: "",
      countryCode: "+91",
      statusMessage: "",
      canAutoVerify: true,
      phoneSuccess: false,
      disableVerify: false,
      showManualCodeEntry: false,
    };

    this.eventEmitter = new NativeEventEmitter(SMSListener);
    this.newListenerNeeded = true;
  }

  componentDidMount() {
    // Get the device token
    this._isMounted = true;
    changeNavigationBarColor(Constants.BACKGROUND_WHITE_COLOR);
    firebase.messaging().getToken()
      .then(value => {
        AuthHelpers.setDeviceToken(value);
      })
      .catch(reason => {
        console.log("Error getting Firebase Token: " + reason);
      });

    // Set the event listener to retrieve the SMS code
    this.eventEmitter.addListener(Constants.MESSAGE_RECEIVED_EVENT, (event) => {
       this.newListenerNeeded = true;
       if (event.status == Constants.MESSAGE_SUCCESS_STATUS_CODE){
         this.parseOTPAndVerify(event.message);
       }
       else {
         Utilities.showLongToast(UIStrings.VERIFICATION_TIMED_OUT)
       }
    });
  }

  componentWillUnmount(){
    this._isMounted = false;
    this.eventEmitter.removeAllListeners(Constants.MESSAGE_RECEIVED_EVENT);
  }
  
  parseOTPAndVerify(smsMessage){
    codeFromSMS = smsMessage.substr(Constants.START_INDEX_OTP, Constants.VERIFICATION_CODE_LENGTH);
    this.setState({statusMessage: UIStrings.CODE_RECEIVED});
    this.verifyAuthCode(codeFromSMS);
  }

  onChangeManualOTP(val){
    if (val.length == Constants.VERIFICATION_CODE_LENGTH){
      this.setState({statusMessage: UIStrings.VERIFYING_CODE});
      this.verifyAuthCode(val);
    }
  }

  async sendCodeToPhone(){
    // TEST: the manual OTP
    // ABout your circle popup must contain something about your circle.. like avg number of cards/user
    // TEST: app hash changes?
    // TEST: chat bkgd
    // TEST: Posts, AR, FR sort the requests, posts when displaying
    // check all todos in server and client
    // TEST: Cards colors
    // OO Messages are sometimes not sorted on chat
    // set up how it works
    // OO make stronger chat firebase database rules
    // TEST: Chat slow
    // TEST handle second degree flow. in search results, display name of friend + sec degree friend + card
    // notification icon and the photo on the right for notifications
    // TEST Communicate and handle the 10 person rule (add to circle screen)
    // TEST and Brainstorm :searching cardholders must account for tags
    // on accessrequests and FR and posts screen, last item in list is partially invisible
    // fix ui for info screens, edit cards on profile screen
    // OO setup the signup flow with welcome screen and invite code
    // make the view on info screens scrollable
    // REMOVE THE CLEAR TEXT TRAFIC AFTER TESTING
    // TEST on anchals screen some divs are showing shadows (check search card screen)
    // check strings with anchal, notifications, errors etc.
    // improve the design of the popups (esp Accesws Req) and increase the opacityso that it stands out (does not stand out)
    // Privacy policy: info we collect
    // Add tags on playstore console
    // password protect the cred file
    // slow splash screen in app.js
    // reset the founders password
    // OO SSL connection for RDB
    // redirect getcircles.in to new app
    // decompile and see apk

    // Start the SMS listener
    try{
      if (this.newListenerNeeded){
        await SMSListener.startListener();
        this.newListenerNeeded = false;
      }
    }
    catch (e){
      console.log('Disabling auto verification: ' + e);
      this.setState({canAutoVerify: false});
    }

    this.setState({statusMessage: UIStrings.SENDING_CODE});

    // Notify server to send auth code.
    fetch(Constants.SERVER_ENDPOINT + Constants.SEND_AUTH_CODE_API,{
        method: Constants.POST_METHOD,
        headers: {
          "Content-Type": Constants.APPLICATION_JSON
        },
        body: JSON.stringify({ 
          phoneNumber: this.getFullPhoneNumber(), 
          length: Constants.VERIFICATION_CODE_LENGTH,
          mustExist: true
         })
      }).then((response)=>{
        if (!this._isMounted){
          return null;
        }

        if (response.ok) {
          this.setState({
            statusMessage: this.state.canAutoVerify ? UIStrings.CODE_SENT_AUTO_VERIFY : UIStrings.CODE_SENT,
            showManualCodeEntry: !this.state.canAutoVerify})

            // If its been a while, then open the manual otp
            setTimeout(()=>{
              console.log('Timeout');
              if(!this.state.showManualCodeEntry && this._isMounted){
                console.log('Setting the code entry');
                this.setState({showManualCodeEntry: true, statusMessage: UIStrings.OPTIONALLY_ENTER_OTP})
              }
            }, Constants.DELAY_BEFORE_MANUAL_OTP)
        }
        else if (response.status == Constants.PRECONDITION_FAILED_STATUS_CODE) {
          this.setState({statusMessage: UIStrings.PHONE_DOES_NOT_EXIST, disableVerify: false})
        }
        else {
          this.setState({statusMessage: UIStrings.SEND_CODE_FAILED, disableVerify: false});
        }
      }).catch((error)=> {
        if (!this._isMounted){
          return null;
        
        }
        console.log('Error sending code to phone: ' + error);
        this.setState({statusMessage: UIStrings.SEND_CODE_FAILED, disableVerify: false});
      });
  }

  verifyAuthCode(code){
    // Notify server to verify code.
    fetch(Constants.SERVER_ENDPOINT + Constants.VERIFY_AUTH_CODE_API,{
        method: Constants.POST_METHOD,
        headers: {
          "Content-Type": Constants.APPLICATION_JSON
        },
        body: JSON.stringify({ phoneNumber: this.getFullPhoneNumber(), code: code })
      }).then((response)=>{
        if (!this._isMounted){
          return null;
        }

        if (response.ok){
          return response.json();
        }

        return null;
      }).then((responseJson)=>{
        if (responseJson != null){
          if (responseJson.status == -1){
            this.setState({statusMessage: UIStrings.CODE_EXPIRED, disableVerify: false});
          }
          else if (responseJson.status == 0){
            this.setState({statusMessage: UIStrings.INCORRECT_CODE_ENTERED, disableVerify: false});
          }
          else{
            this.setState({statusMessage: UIStrings.PHONE_VERIFIED});
            this.logIn();
          }
        }
        else{
          this.setState({statusMessage: UIStrings.PHONE_VERIFICATION_ERROR, disableVerify: false});
        }
      }).catch((error)=>{
        if (!this._isMounted){
          return null;
        }
        
        this.setState({statusMessage: UIStrings.PHONE_VERIFICATION_ERROR, disableVerify: false});
        console.log('Error verifying code: ' + error);
      });
  }

  async logIn(){
    this.setState({statusMessage: UIStrings.LOGGING_YOU_IN});
    fetch(Constants.SERVER_ENDPOINT + PHONE_VERIFIED_LOGIN_API, {
      method: Constants.POST_METHOD,
      headers:{ "Content-Type": Constants.APPLICATION_JSON },
      body: JSON.stringify({ phoneNumber: this.getFullPhoneNumber(), fcmToken: await AuthHelpers.getDeviceToken() })
    })
    .then((response)=>{
      if (!this._isMounted) {
        return null;
      }

      if (response.ok) {
        return response.json();
      }

      if (response.status == Constants.UNAUTHORIZED_STATUS_CODE) {
        Utilities.showLongToast(UIStrings.PHONE_DOES_NOT_EXIST)
        return null;
      }

      Utilities.showLongToast(UIStrings.GENERIC_ERROR);
      return null;

    }).
    then((responseJson)=>{
      if (responseJson != null){
        AuthHelpers.setTokenIdPhone(responseJson.access_token, responseJson.id, responseJson.phoneNumber);
        let params = { initializeEncryption: true }
        NavigationHelpers.clearStackAndNavigateWithParams("UserHome", this.props.navigation, params);
    }})
    .catch((err)=>{
      if (!this._isMounted){
        return null;
    }
      console.log('Error logging in: ' + err);
    })
  }

  onCountryCodeChange(value){
    this.setState({countryCode: value});
  }

  onPhoneChange(value){
    phoneSuccess = value != null && value.length >= Constants.PHONE_NUMBER_MIN_LENGTH;
    countryCodeSuccess = this.state.countryCode != null && this.state.countryCode.length > 0;
    this.setState({phone: value, phoneSuccess: phoneSuccess && countryCodeSuccess});
  }

  onNextPress(){
    if (this.state.disableVerify){
      Utilities.showLongToast(UIStrings.OPERATION_IN_PROGRESS);
      return;
    }

    if (!this.state.phoneSuccess){
      Utilities.showLongToast(UIStrings.ENTER_VALID_PHONE_NUMBER);
      return;
    }

    this.setState({disableVerify: true});
    this.sendCodeToPhone()
  }

  getFullPhoneNumber(){
    countryCode = this.state.countryCode.replace('+', '');
    return "+" + countryCode + this.state.phone
  }

  setLoginFailed(message){
    this.setState({showLoading: false})
    ToastAndroid.showWithGravity(message, duration= ToastAndroid.LONG, gravity = ToastAndroid.TOP);
    this.props.navigation.goBack();
    return;
  }

  render() {
    return (
      <View style={{flexDirection: 'column', height: "100%", width: '100%'}}>
      <StatusBar translucent backgroundColor='transparent' />
      <TopLeftButton iconName={Constants.ICON_BACK_BUTTON} onPress={()=>this.props.navigation.goBack()} color={Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND} />
      <View style={{flexDirection: 'column', alignSelf: 'center', justifyContent: 'center', flex: 1, padding: 20, width: '90%'}}>
         <Text style={styles.title}>{UIStrings.WELCOME_BACK}</Text>
          
          {/* Input for country code and phone number */}
          <View style={{flexDirection:'row', marginBottom: 10, justifyContent: 'center'}}>
            <InputGroup style={{width: '20%', marginRight: 10}} error={!this.state.phoneSuccess}>
              <Input
                editable={!this.state.disableVerify}
                defaultValue={this.state.countryCode} keyboardType="number-pad" onChangeText={val => this.onCountryCodeChange(val)}
                maxLength={Constants.COUNTRY_CODE_MAX_LENGTH}
                placeholderTextColor={ Constants.APP_PLACEHOLDER_TEXT_COLOR  }
                style={{ fontSize: 24, color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND, fontFamily: "Montserrat-Light" }} />
            </InputGroup>
            <InputGroup style={{width: '75%'}} error={!this.state.phoneSuccess}>
              <Input
               editable={!this.state.disableVerify}
               onChangeText={text=>this.onPhoneChange(text)} keyboardType="number-pad"
               maxLength={Constants.PHONE_NUMBER_MAX_LENGTH}
               placeholder={UIStrings.PLACEHOLDER_ENTER_PHONE}
               placeholderTextColor={Constants.APP_PLACEHOLDER_TEXT_COLOR}
               style={{fontSize: 24, color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND, fontFamily: "Montserrat-Light" }} />
              <Icon name={ this.state.phoneSuccess ? Constants.ICON_CHECKMARK : null } style={styles.checkmark} />
            </InputGroup>
          </View>


          {/* Manual Code Entry */}
          {this.state.showManualCodeEntry ? 
          <View style={{flexDirection: 'row', marginTop: 20, marginBottom: 40}}>
            <Text style={styles.enterOTP}>{UIStrings.ENTER_OTP}</Text>
            <TextInput onChangeText={val=>this.onChangeManualOTP(val)} 
              keyboardType="number-pad" maxLength= {Constants.VERIFICATION_CODE_LENGTH}
              style={{fontSize: 26, borderBottomColor: Constants.HEADING_COLOR, borderBottomWidth: 0.5, width: 180, padding: 5, color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND, fontFamily: Constants.APP_BODY_FONT}} />
          </View>
          : null }

          {/* Status Notes */}
          <Text style={styles.status}>{this.state.statusMessage}</Text>

          {/* Bottom buttons */}
          <View style={{marginTop: 30, flexDirection: 'row', justifyContent: 'center', alignSelf: 'center'}}>
              <GradientButton isLarge={true} title={this.state.disableVerify ? UIStrings.TITLE_VERIFYING : UIStrings.TITLE_VERIFY} onPress={()=>this.onNextPress()}/>
          </View> 
       </View>
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  title:{
    color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
    fontFamily: Constants.APP_THIN_FONT,
    fontSize: 45,
    marginBottom: 40,
    width: 250
  },
  welcome: {
    textAlign: "center",
    color: Constants.APP_TEXT_COLOR,
    fontSize: 36,
    fontFamily: "Montserrat-Bold"
  },
  subTitle: {
    color: Constants.APP_TEXT_COLOR,
    fontFamily: "Montserrat-Light",
    fontSize: 13,
    textAlign: "center",
    marginTop: 15
  },
  checkmark: {
    color: "#00C497",
    margin: 5
  },
  status:{
    marginTop: 10,
    textAlign: 'center',
    fontFamily: Constants.APP_BODY_FONT,
    color: Constants.SUCCESS_COLOR,
    fontSize: 14
  },
  enterOTP:{
    marginTop: 10,
    marginRight: 15,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: Constants.APP_THIN_FONT,
    color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
    fontSize: 20
  }
});
