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
    this._isMounted = true;
    changeNavigationBarColor(Constants.BACKGROUND_WHITE_COLOR);
  }

  componentWillUnmount(){
    this._isMounted = false;
  }

  onNextPress(){
    if (this.state.inviteCode == null || this.state.inviteCode.length < Constants.INVITE_CODE_MIN_LENGTH){
      Utilities.showLongToast(UIStrings.ENTER_VALID_CODE);
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
      <View style={{flexDirection: 'column', height: "100%", width: '100%'}}>
      <StatusBar translucent backgroundColor='transparent' />
      <TopLeftButton iconName={Constants.ICON_BACK_BUTTON} onPress={()=>this.props.navigation.goBack()} color={Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND} />
      <View style={{flexDirection: 'column', alignSelf: 'center', justifyContent: 'center', flex: 1, padding: 20, width: '90%'}}>
         <Text style={styles.title}>{UIStrings.ENTER_INVITE_CODE}</Text>
         <Text style={styles.subTitle}>{UIStrings.APP_INVITE_ONLY}</Text>
          
          {/* Input for invite code */}
          <View style={{flexDirection:'row', margin: 10, justifyContent: 'center'}}>
            <InputGroup style={{width: '75%'}} error={this.state.inviteCode == null || this.state.inviteCode.length < Constants.INVITE_CODE_MIN_LENGTH}>
              <Input
               autoCapitalize="characters"
               editable={!this.state.disableInviteCode}
               onChangeText={text=>this.setState({inviteCode: text})}
               maxLength={Constants.INVITE_CODE_MAX_LENGTH}
               style={{fontSize: 30, textAlign: 'center', color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND, fontFamily: Constants.APP_BODY_FONT }} />
            </InputGroup>
          </View>

          {/* Status Notes */}
          <Text style={styles.status}>{this.state.statusMessage}</Text>
          
          {/* Bottom buttons */}
          <View style={{marginTop: 30, flexDirection: 'row', justifyContent: 'center', alignSelf: 'center'}}>
              <GradientButton isLarge={true} title={this.state.disableInviteCode ? UIStrings.TITLE_VERIFYING : UIStrings.TITLE_VERIFY} onPress={()=>this.onNextPress()}/>
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
    textAlign: 'center'
  },
  welcome: {
    textAlign: "center",
    color: Constants.APP_TEXT_COLOR,
    fontSize: 36,
    fontFamily: "Montserrat-Bold"
  },
  subTitle: {
    color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
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
    fontSize: 14
  }
});
