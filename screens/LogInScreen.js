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
import { virgilCrypto } from "react-native-virgil-crypto";
import LottieView from 'lottie-react-native'


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
      showResend: false,
      numResend: 0
    };

    this.eventEmitter = new NativeEventEmitter(SMSListener);
    this.newListenerNeeded = true;
  }

  componentDidMount() {
    // Get the device token
    this._isMounted = true;
    firebase.analytics().setCurrentScreen("LogIn", "LogInScreen");
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
    firebase.analytics().logEvent('AutoOTPVerification');
    this.verifyAuthCode(codeFromSMS);
  }

  onChangeManualOTP(val){
    if (val.length == Constants.VERIFICATION_CODE_LENGTH){
      this.setState({statusMessage: UIStrings.VERIFYING_CODE});
      firebase.analytics().logEvent('ManualOTPVerification');
      this.verifyAuthCode(val);
    }
  }

  async sendCodeToPhone(isResend){   
    if (isResend && this.state.numResend >= Constants.MAX_RESEND_SMS_COUNT){
      Utilities.showLongToast("Sorry, you have exceeded the resending limit for OTP.")
      return null;
    }
    else if (isResend){
      this.setState(prevState => ({numResend: prevState.numResend + 1}));
    }

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
          this.setState(prevState => ({
            statusMessage: prevState.canAutoVerify ? UIStrings.CODE_SENT_AUTO_VERIFY : UIStrings.CODE_SENT,
            showManualCodeEntry: isResend ? prevState.showManualCodeEntry : !prevState.canAutoVerify}))

            // If its been a while, then open the manual otp
            if (!isResend){
              setTimeout(()=>{
                if(!this.state.showManualCodeEntry && this._isMounted){
                  this.setState({showManualCodeEntry: true, statusMessage: UIStrings.OPTIONALLY_ENTER_OTP, showResend: true})
                }
              }, Constants.DELAY_BEFORE_MANUAL_OTP)
            }
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
    this.setState({statusMessage: UIStrings.VERIFIED_LOGGING_YOU_IN});
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
        AuthHelpers.setTokenIdPhone(responseJson.access_token, responseJson.id, responseJson.phoneNumber).then(()=>{
          let params = { initializeEncryption: true }
          NavigationHelpers.clearStackAndNavigateWithParams("UserHome", this.props.navigation, params);
        })
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
      <View style={{flexDirection: 'column', height: "100%", width: '100%', backgroundColor: Constants.BRAND_BACKGROUND_COLOR}}>
      <StatusBar  translucent backgroundColor={Constants.APP_STATUS_BAR_COLOR} />
      <TopLeftButton iconName={Constants.ICON_BACK_BUTTON} onPress={()=>this.props.navigation.goBack()} color={Constants.TEXT_COLOR_FOR_DARK_BACKGROUND} />
      <View style={{flexDirection: 'column', alignSelf: 'center', justifyContent: 'center', flex: 1, padding: 20, width: '90%'}}>
          <LottieView style={{alignSelf: 'center', width: 150, height: 130}} source={require('../assets/resources/coffee.json')} autoPlay loop />

         <Text style={styles.title}>{UIStrings.WELCOME_BACK}</Text>
          
          {/* Input for country code and phone number */}
          <View style={{flexDirection:'row', marginBottom: 10, justifyContent: 'center'}}>
            <View style={{width: '20%', marginRight: 10, borderWidth: 0}} >
              <TextInput
                editable={!this.state.disableVerify}
                defaultValue={this.state.countryCode} keyboardType="number-pad" onChangeText={val => this.onCountryCodeChange(val)}
                maxLength={Constants.COUNTRY_CODE_MAX_LENGTH}
                placeholderTextColor={ Constants.APP_PLACEHOLDER_TEXT_COLOR  }
                style={{paddingHorizontal: 8, backgroundColor: Constants.INITIAL_SCREEN_TEXT_INPUT_COLOR, width: "100%", height: 50, borderRadius: 10, fontSize: 20, color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND, fontFamily: "Montserrat-Light" }} />
            </View>
            <View style={{paddingLeft: 8, backgroundColor: Constants.INITIAL_SCREEN_TEXT_INPUT_COLOR, borderRadius: 10, width: '75%', flexDirection: 'row', justifyContent: 'center'}} >
              <TextInput
               editable={!this.state.disableVerify}
               onChangeText={text=>this.onPhoneChange(text)} keyboardType="number-pad"
               maxLength={Constants.PHONE_NUMBER_MAX_LENGTH}
               placeholder={UIStrings.PLACEHOLDER_ENTER_PHONE}
               placeholderTextColor={Constants.APP_PLACEHOLDER_TEXT_COLOR}
               style={{fontSize: 20, width: '83%', height: 50, borderRadius: 10, color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND, fontFamily: "Montserrat-Light" }} />
              <Icon name={ this.state.phoneSuccess ? Constants.ICON_CHECKMARK : null } style={styles.checkmark} />
            </View>
          </View>


          {/* Manual Code Entry */}
          {this.state.showManualCodeEntry ? 
          <View style={{flexDirection: 'row', marginTop: 20, marginBottom: 30, alignSelf: 'center'}}>
            <Text style={styles.enterOTP}>{UIStrings.ENTER_OTP}</Text>
            <TextInput onChangeText={val=>this.onChangeManualOTP(val)} 
              keyboardType="number-pad" maxLength= {Constants.VERIFICATION_CODE_LENGTH}
              style={{paddingHorizontal: 10, fontSize: 20, backgroundColor: Constants.INITIAL_SCREEN_TEXT_INPUT_COLOR, borderRadius: 10, width: 120, padding: 5, color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND, fontFamily: Constants.APP_BODY_FONT}} />
          </View>
          : null }

          {/* Status Notes */}
          <Text style={styles.status}>{this.state.statusMessage}</Text>

          <View style={{marginTop: 30, marginBottom: 50, flexDirection: 'column', justifyContent: 'center', alignSelf: 'center', width: '100%'}}>
              <GradientButton isLarge isLight colors={Constants.DEFAULT_GRADIENT} title={this.state.disableVerify ? UIStrings.TITLE_VERIFYING : UIStrings.TITLE_VERIFY} onPress={()=>this.onNextPress()}/>
              {
                this.state.showResend ? 
                <Text onPress={()=>this.sendCodeToPhone(true)} style={styles.resend}>{UIStrings.RESEND_CODE}</Text>
                :
                null
              }
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
    color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND,
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
    margin: 5,
    width: '12%',
    alignSelf: 'center',
  },
  status:{
    marginTop: 10,
    textAlign: 'center',
    fontFamily: Constants.APP_BODY_FONT,
    color: Constants.SUCCESS_COLOR,
    fontSize: 14
  },
  enterOTP:{
    marginTop: 4,
    marginRight: 15,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: Constants.APP_THIN_FONT,
    color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND,
    fontSize: 18
  },
  resend:{
    marginTop: 5, 
    textAlign: 'center', 
    textDecorationLine: "underline",
    fontSize: 14, 
    fontFamily: Constants.APP_BODY_FONT, 
    color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND
  }
});
