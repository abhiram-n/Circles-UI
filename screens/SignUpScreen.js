import React, { Component } from "react";
import {  Platform, StyleSheet, ScrollView, Text, View,PermissionsAndroid,Linking,FlatList,NativeEventEmitter,NativeModules} from "react-native";
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
import LinearGradient from "react-native-linear-gradient";
import changeNavigationBarColor from "react-native-navigation-bar-color";
import ImagePicker from "react-native-image-picker";
import RoundIconWithBackgroundAndCaptionButton from "../components/RoundIconWithBackgroundAndCaptionButton";
import TopLeftButton from "../components/TopLeftButton";
import RoundImageWithCaptionButton from "../components/RoundImageWithCaptionButton";
import ImageResizer from "react-native-image-resizer"
import GradientButton from "../components/GradientButton";
import InfoPopup from "../components/InfoPopup";

const SMSListener = NativeModules.SMSListener;
const REGULAR_CARDS_API = "/card/filter?type=Regular";

class SignUpScreen extends Component<Props> {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      email: "",
      countryCode: "+91",
      phone: "",
      statusMessage: "",
      canAutoVerify: true,
      cards: [],
      selectedCards: [],
      nameSuccess: false,
      emailSuccess: false,
      phoneSuccess: false,
      disableVerify: false,
      showManualCodeEntry: false,
      imageUri: null,
      showPopup: false,
      suppressPopup: false,
      showResend: false,
      numResend: 0
    };

    this.eventEmitter = new NativeEventEmitter(SMSListener);
    this.cards = [];
    this.newListenerNeeded = true;
    this.profileImgUrl = "";
    this.firebaseUID = "NA";
    this.inviteCode = this.props.navigation.getParam("inviteCode", Constants.NONE);
  }

  componentDidMount() {
    this._isMounted = true;

    // signin the user on firebase
    firebase.auth().signInAnonymously()
    .then((value)=>{
      if (value == null || value.user == null || value.user.uid == null){
        console.log('Auth returned null object. Cannot upload to Firebase');
        return null;
      }

      this.firebaseUID = value.user.uid;
    })
    .catch((reason)=>{
      console.log('Error with Firebase auth: ' + reason)
    })

    // Get the device token
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

    this.init();
  }

  componentWillUnMount(){
    this.eventEmitter.removeAllListeners(Constants.MESSAGE_RECEIVED_EVENT);
    this._isMounted = false;
  }

  async init() {
    firebase.analytics().setCurrentScreen("SignUp", "SignUpScreen");

    fetch(Constants.SERVER_ENDPOINT + REGULAR_CARDS_API, { method: "GET" })
      .then(response => {
        if (!this._isMounted) {
          return null;
        }

        if (response.ok) {
          return response.json();
        }

        Utilities.showLongToast(UIStrings.SERVER_CONNECTION_ERROR);
        return null;
      })
      .then(responseJson => {
        if (responseJson != null) {
          var cardArray = responseJson.cards.map(item => {
            return { name: item.name, id: item.id, key: item.id.toString() };
          });
          this.cards = cardArray;
        }
      })
      .catch(error => {
        if (!this._isMounted) {
          return null;
        }

        Utilities.showLongToast(UIStrings.SERVER_CONNECTION_ERROR);
        console.log("Error for allcards is: " + error);
      });
  }

  showNotificationOrLaunchImagePicker(){
    if (!this.state.suppressPopup){
      this.setState({showPopup: true});
    }
    else{
      this.launchImagePicker();
    }
  }

  async launchImagePicker() {
    this.setState({showPopup: false, suppressPopup: true});
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const options:Object = {};
        ImagePicker.launchImageLibrary(options, response => {
          if (!(response.didCancel || response.error || response.customButton) && response.uri != null) {
            this.compressAndUploadImage(response);
          }
        });
      } else {
        console.log("Not granted");
      }
    } catch (err) {
      console.warn(err);
    }
  }

  compressAndUploadImage(response){
    pathForUpload = null;
    ImageResizer.createResizedImage(response.uri, (response.width/2), (response.height/2), "JPEG", 50, 0).then((result) => {
      this.setState({imageUri: result.uri});
      pathForUpload = result.path;
      storageRef = firebase.storage().ref(Constants.FIREBASE_STORAGE_REF + this.firebaseUID + ".jpg");
      return storageRef.putFile(pathForUpload);
    })
    .then((snapshot)=>{
      if (snapshot == null){
        return null;
      }

      this.profileImgUrl = snapshot.downloadURL;
    })
    .catch((err) => {
      console.log('Error uploading: ' + err)
    });
  }
  
  parseOTPAndVerify(smsMessage){
    codeFromSMS = smsMessage.substr(Constants.START_INDEX_OTP, Constants.VERIFICATION_CODE_LENGTH);
    this.setState({statusMessage: UIStrings.CODE_RECEIVED});
    firebase.analytics().logEvent('AutoOTPVerification');
    this.verifyAuthCode(codeFromSMS);
  }

  getFullPhoneNumber(){
    countryCode = this.state.countryCode.replace('+', '');
    return "+" + countryCode + this.state.phone
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
          mustExist: false
         })
      }).then((response)=>{
        if (!this._isMounted) {
          return null;
        }

        if (response.ok) {
          this.setState(prevState => ({
            statusMessage: prevState.canAutoVerify ? UIStrings.CODE_SENT_AUTO_VERIFY : UIStrings.CODE_SENT,
            showManualCodeEntry: isResend ? prevState.showManualCodeEntry : !prevState.canAutoVerify}));

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
          this.setState({statusMessage: UIStrings.PHONE_ALREADY_EXISTS, disableVerify: false})
        }
        else {
          this.setState({statusMessage: UIStrings.SEND_CODE_FAILED, disableVerify: false});
        }
      }).catch((error)=> {
        if (!this._isMounted) {
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
        headers: { "Content-Type": Constants.APPLICATION_JSON },
        body: JSON.stringify({ phoneNumber: this.getFullPhoneNumber(), code: code })
      }).then((response)=>{
        if (!this._isMounted) {
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
            params = {
              phoneNumber: this.getFullPhoneNumber(),
              cards: this.cards,
              name: this.state.name,
              profileImgUrl: this.profileImgUrl != "" ? this.profileImgUrl : this.firebaseUID,
              inviteCode: this.inviteCode
            }

            this.props.navigation.replace('SelectCardsYouOwn', params);
          }
        }
        else{
          this.setState({statusMessage: UIStrings.PHONE_VERIFICATION_ERROR, disableVerify: false});
        }
      }).catch((error)=>{
        if (!this._isMounted) {
          return null;
        }
        
        this.setState({statusMessage: UIStrings.PHONE_VERIFICATION_ERROR, disableVerify: false});
        console.log('Error verifying code: ' + error);
      });
  }

  onNameChange(value){
    success = value != null && value.length >= Constants.NAME_MIN_LENGTH && this.isNameLegitimate(value);
    this.setState({ name: value, nameSuccess: success })
  }

  onEmailChange(value){
    success =  value != null && value.indexOf("@") >= 1 && value.length > Constants.EMAIL_MIN_LENGTH && !value.endsWith("@") && value.indexOf(".") > 0;
    this.setState({ email: value, emailSuccess: success })
  }

  onCountryCodeChange(value){
    this.setState({countryCode: value});
  }

  onPhoneChange(value){
    phoneSuccess = value != null && value.length >= Constants.PHONE_NUMBER_MIN_LENGTH;
    countryCodeSuccess = this.state.countryCode != null && this.state.countryCode.length > 0;
    this.setState({phone: value, phoneSuccess: phoneSuccess && countryCodeSuccess});
  }

  isNameLegitimate(value){
    name = value.toLowerCase();
    if (name.endsWith(" ")){
      name = name.slice(0, -1);
    }

    if (Constants.INVALID_NAMES_LOWERCASE.includes(name)){
      return false;
    }

    return true;
  }

  onChangeManualOTP(val){
    if (val.length == Constants.VERIFICATION_CODE_LENGTH){
      this.setState({statusMessage: UIStrings.VERIFYING_CODE});
      firebase.analytics().logEvent('ManualOTPVerification');
      this.verifyAuthCode(val);
    }
  }

  onNextPress(){
    if (this.state.disableVerify){
      Utilities.showLongToast(UIStrings.OPERATION_IN_PROGRESS);
      return;
    }

    if (!this.state.nameSuccess){
      Utilities.showLongToast(UIStrings.ENTER_VALID_NAME)
      return;
    }

    if (!this.state.phoneSuccess){
      Utilities.showLongToast(UIStrings.ENTER_VALID_PHONE_NUMBER);
      return;
    }

    if (this.state.imageUri == null){
      Utilities.showLongToast(UIStrings.ADD_VALID_IMAGE);
      return;
    }

    this.setState({disableVerify: true});
    this.sendCodeToPhone()
  }

  render() {
    return (
      <View style={{backgroundColor: Constants.BRAND_BACKGROUND_COLOR, flexDirection: 'column', height: "100%", width: '100%', justifyContent: 'center', alignContent: 'center'}}>
      <StatusBar  translucent backgroundColor={Constants.APP_STATUS_BAR_COLOR} />
      <TopLeftButton iconName={Constants.ICON_BACK_BUTTON} onPress={()=>this.props.navigation.goBack()} color={Constants.TEXT_COLOR_FOR_DARK_BACKGROUND} />
        <ScrollView scrollEnabled={true} contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}} style={{padding: 20, width: '80%', alignSelf: 'center', alignContent: 'center'}}>
        <Text style={styles.title}>{UIStrings.GREAT_WELCOME}</Text>
          <View style={{alignSelf: 'center'}}>
          {this.state.imageUri == null ? 
            <RoundIconWithBackgroundAndCaptionButton isLight isLarge thinFont colors={Constants.DEFAULT_GRADIENT}  onPress={()=>this.showNotificationOrLaunchImagePicker()} 
              iconParams={{type:"SimpleLineIcons",icon:"camera", size: 40}} caption={"Add Photo"}  />
            :
            <RoundImageWithCaptionButton onPress={()=>this.showNotificationOrLaunchImagePicker()} isLarge={true} imgUri={this.state.imageUri}  />
          }
          </View>
          <InfoPopup makeExteriorTransparent lottieProps={{name: require("../assets/resources/image_suggestion.json")}} content={UIStrings.GREAT_PICTURES_CIRCLES}  
          isVisible={this.state.showPopup && !this.state.suppressPopup} onClose={()=>this.launchImagePicker()}  />
         <View style={{borderRadius: 10, marginTop: 25, marginBottom: 10, flexDirection: 'row', backgroundColor: Constants.INITIAL_SCREEN_TEXT_INPUT_COLOR}}>
            <Input
              placeholder={UIStrings.PLACEHOLDER_ENTER_NAME}
              maxLength={Constants.NAME_MAX_LENGTH}
              placeholderTextColor={ Constants.APP_PLACEHOLDER_TEXT_COLOR  }
              style={{paddingLeft: 8, width: '85%', fontSize: 17, color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND, fontFamily: "Montserrat-Light" }}
              onChangeText={val => this.onNameChange(val)} />
              <Icon name={ this.state.nameSuccess ? Constants.ICON_CHECKMARK : null } style={[styles.checkmark, {width: '11%'}]} />
          </View>
          
          {/* Input for country code and phone number */}
          <View style={{flexDirection:'row', marginBottom: 10}}>
            <View style={{width: '20%', marginRight: 10, borderWidth: 0}} >
              <TextInput
                editable={!this.state.disableVerify}
                defaultValue={this.state.countryCode} keyboardType="number-pad" onChangeText={val => this.onCountryCodeChange(val)}
                maxLength={Constants.COUNTRY_CODE_MAX_LENGTH}
                placeholderTextColor={ Constants.APP_PLACEHOLDER_TEXT_COLOR  }
                style={{paddingHorizontal: 8, backgroundColor: Constants.INITIAL_SCREEN_TEXT_INPUT_COLOR, width: "100%", height: 50, borderRadius: 10, fontSize: 17, color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND, fontFamily: "Montserrat-Light" }} />
            </View>
            <View style={{backgroundColor: Constants.INITIAL_SCREEN_TEXT_INPUT_COLOR, borderRadius: 10, width: '76.5%', flexDirection: 'row', justifyContent: 'center'}} >
                <TextInput
                editable={!this.state.disableVerify}
                onChangeText={text=>this.onPhoneChange(text)} keyboardType="number-pad"
                maxLength={Constants.PHONE_NUMBER_MAX_LENGTH}
                placeholder={UIStrings.PLACEHOLDER_ENTER_PHONE}
                placeholderTextColor={Constants.APP_PLACEHOLDER_TEXT_COLOR}
                style={{paddingLeft: 10, fontSize: 17, width: '80%', height: 50, borderRadius: 10, color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND, fontFamily: "Montserrat-Light" }} />
                <Icon name={ this.state.phoneSuccess ? Constants.ICON_CHECKMARK : null } style={[styles.checkmark, {width: '12%'}]} />
            </View>
          </View>


          {/* Manual Code Entry */}
          {this.state.showManualCodeEntry ? 
          <View style={{flexDirection: 'row', marginTop: 20, marginBottom: 30, alignSelf: 'center'}}>
            <Text style={styles.enterOTP}>{UIStrings.ENTER_OTP}</Text>
            <TextInput onChangeText={val=>this.onChangeManualOTP(val)} 
              keyboardType="number-pad" maxLength= {Constants.VERIFICATION_CODE_LENGTH}
              style={{paddingHorizontal: 10, borderRadius: 10, fontSize: 17, backgroundColor: Constants.INITIAL_SCREEN_TEXT_INPUT_COLOR, width: 120, padding: 5, color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND, fontFamily: Constants.APP_BODY_FONT}} />
          </View>
           : null  }

          {/* Status Notes */}
          <Text style={styles.status}>{this.state.statusMessage}</Text>

          {/* Bottom buttons */}
          <View style={{marginTop: 30, flexDirection: 'column', justifyContent: 'center'}}>
              <GradientButton isLarge isLight colors={Constants.DEFAULT_GRADIENT} title={this.state.disableVerify ? UIStrings.TITLE_VERIFYING : UIStrings.TITLE_VERIFY} 
              onPress={()=>this.onNextPress()}  />
              {
                this.state.showResend ? 
                <Text onPress={()=>this.sendCodeToPhone(true)} style={styles.resend}>{UIStrings.RESEND_CODE}</Text>
                :
                null
              }
         </View>
       </ScrollView>
      </View>

    );
  }
}

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  buttonText: {
    color: "#1488cc",
    padding: 20,
    fontWeight: "bold",
    fontFamily: 'Roboto-Bold'
  },
  title:{
    color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND,
    fontFamily: Constants.APP_THIN_FONT,
    fontSize: 35,
    marginBottom: 40,
    textAlign: 'center'
  },
  dropdownTextInput: {
      padding: 12,
      borderWidth: 2,
      borderColor: Constants.APP_TEXT_COLOR,
      borderRadius: 5,
      width: '100%', 
      color: 'white',
      fontFamily: 'Montserrat-Light'
  },
  dropdownItem: {
    padding: 12,
    marginTop: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: 'white'
  },
  selectedCards: {
    borderColor: Constants.APP_BUTTON_COLOR,
    borderWidth: 2,
    borderRadius: 5,
    width: "90%",
    height: "25%",
    alignSelf: "center"
  },
  checkmark: {
    color: "#00C497",
    margin: 5,
    alignSelf: 'center',
  },
  moreCards:{
    color: Constants.APP_TEXT_COLOR, 
    textAlign: 'center',
    margin: 5,
    marginBottom: 20,
    fontFamily: "Montserrat-Light"
  },
  noRetype:{
    color: Constants.APP_TEXT_COLOR, 
    fontSize: 12, 
    fontFamily: 'Montserrat-Light',
    textAlign: 'center',
    marginTop: 5
  },
  status:{
    marginTop: 10,
    textAlign: 'center',
    fontFamily: Constants.APP_BODY_FONT,
    color: Constants.SUCCESS_COLOR,
    fontSize: 14,
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
