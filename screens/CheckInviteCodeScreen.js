import React, { Component } from "react";
import { Platform, StyleSheet, Text, View,Linking,FlatList,NativeEventEmitter,NativeModules} from "react-native";
import { ActivityIndicator, Image, Picker, TextInput, ToastAndroid, StatusBar } from "react-native";
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
import LottieView from 'lottie-react-native'
import { TouchableOpacity } from "react-native-gesture-handler";

const CHECK_INVITE_CODE_EXISTS = "/auth/userExists?idCode="
export default class CheckInviteCodeScreen extends Component<Props> {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
        inviteCode: "",
        statusMessage: "",
        disableInviteCode: false
    };

  }

  componentDidMount() {
    firebase.analytics().setCurrentScreen("CheckInviteCode", "CheckInviteCodeScreen");
    this._isMounted = true;
  }

  componentWillUnmount(){
    this._isMounted = false;
  }

  onNextPress(){
    if (this.state.inviteCode == null || this.state.inviteCode.length < Constants.INVITE_CODE_MIN_LENGTH){
      Utilities.showLongToast(UIStrings.ENTER_VALID_CODE);
      return;
    }

    if (this.state.disableInviteCode){
      Utilities.showLongToast(UIStrings.OPERATION_IN_PROGRESS);
      return;
    }

      this.setState({disableInviteCode: true, statusMessage: null});
      fetch(Constants.SERVER_ENDPOINT + CHECK_INVITE_CODE_EXISTS + this.state.inviteCode, {method: Constants.GET_METHOD})
      .then((response)=> {
          if (!this._isMounted){
              return null;
          }

          if (response.ok){
              return response.json();
          }

          this.setState({statusMessage: UIStrings.GENERIC_ERROR, disableInviteCode: false});
          return null;
      })
      .then((responseJson)=>{
          if (responseJson != null){
              if (responseJson.exists == 1){
                this.setState({statusMessage:  UIStrings.FOUND_INVITE_CODE });
                this.props.navigation.replace('SignUp', {inviteCode: this.state.inviteCode});
              }
              else{
                this.setState({statusMessage: UIStrings.INVITE_CODE_NOT_FOUND, disableInviteCode: false});
              }

              return null;
          }
      })
      .catch((err)=>{
          if (!this._isMounted){
              return null;
          }

          this.setState({statusMessage: UIStrings.GENERIC_ERROR, disableInviteCode: false});
          console.debug('Error checking invite code: ' + err);
          return null;
      })
  }
  
  render() {
    return (
      <View style={{flexDirection: 'column', height: "100%", width: '100%', backgroundColor: Constants.BRAND_BACKGROUND_COLOR}}>
      <StatusBar  translucent backgroundColor={Constants.APP_STATUS_BAR_COLOR} />
      <TopLeftButton iconName={Constants.ICON_BACK_BUTTON} onPress={()=>this.props.navigation.goBack()} color={Constants.TEXT_COLOR_FOR_DARK_BACKGROUND} />
      <View style={{flexDirection: 'column', alignSelf: 'center', justifyContent: 'center', flex: 1, padding: 20, width: '90%'}}>
      <LottieView speed={0.3} source={require("../assets/resources/invite.json")} autoPlay loop style={{alignSelf: 'center',width: 50, height: 50, marginBottom: 20}} />
         <Text style={styles.title}>{UIStrings.ENTER_INVITE_CODE}</Text>
         <Text style={styles.subTitle}>{UIStrings.APP_INVITE_ONLY}</Text>
          {/* Input for invite code */}
          <View style={{flexDirection:'row', margin: 10, justifyContent: 'center', width: '75%', alignSelf: 'center'}}>
              <Input
               autoCapitalize="characters"
               editable={!this.state.disableInviteCode}
               onChangeText={text=>this.setState({inviteCode: text})}
               maxLength={Constants.INVITE_CODE_MAX_LENGTH}
               placeholder={UIStrings.PLACEHOLDER_ENTER_INVITE_CODE}
               placeholderTextColor={Constants.APP_PLACEHOLDER_TEXT_COLOR}
               style={styles.codeInput} />
          </View>

          {/* Status Notes */}
          <Text style={styles.status}>{this.state.statusMessage}</Text>
          
          {/* Bottom buttons */}
          <View style={{marginTop: 30, paddingBottom: 20, flexDirection: 'row', justifyContent: 'center', alignSelf: 'center'}}>
              <GradientButton isLarge isLight colors={Constants.DEFAULT_GRADIENT} title={this.state.disableInviteCode ? UIStrings.TITLE_VERIFYING : UIStrings.TITLE_VERIFY} onPress={()=>this.onNextPress()}/>
          </View> 

          <View style={{marginTop: 5, position: 'absolute', bottom: 5, flexDirection: 'row', justifyContent: 'center', alignSelf: 'center'}}>
            <Text onPress={()=>Linking.openURL(Constants.WEBSITE_URL)} style={styles.dontHaveInvideCode}>Don't have an invite code? </Text>
            <Text onPress={()=>Linking.openURL(Constants.WEBSITE_URL)} style={[ styles.dontHaveInvideCode]}>Sign up here!</Text>
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
  codeInput:{
    borderRadius: 10, 
    paddingHorizontal: 8, 
    backgroundColor: Constants.INITIAL_SCREEN_TEXT_INPUT_COLOR, 
    fontSize: 20, 
    textAlign: 'center', 
    color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND, 
    fontFamily: Constants.APP_BODY_FONT 
  },
  dontHaveInvideCode:{
    fontFamily: Constants.APP_THIN_FONT, 
    fontSize: 13, 
    color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND
  },
  title:{
    color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND,
    fontFamily: Constants.APP_THIN_FONT,
    fontSize: 45,
    textAlign: 'center'
  },
  welcome: {
    textAlign: "center",
    color: Constants.APP_TEXT_COLOR,
    fontSize: 36,
    fontFamily: "Montserrat-Bold"
  },
  subTitle: {
    color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND,
    fontFamily: Constants.APP_THIN_FONT,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 40,
    marginTop: 5
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
    fontSize: 13
  }
});
