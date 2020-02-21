import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  StatusBar,
  ImageBackground,
  Animated,
  TouchableOpacity
} from "react-native";
import * as Constants from "../helpers/Constants";
import * as UIStrings from "../helpers/UIStrings";
import { Button, Icon } from "native-base";
import LinearGradient from "react-native-linear-gradient";
import changeNavigationBarColor from "react-native-navigation-bar-color";
import firebase from "react-native-firebase";
import { NativeModules } from "react-native";
import {EThree } from '@virgilsecurity/e3kit-native';
import AsyncStorage from '@react-native-community/async-storage';
import GradientButton from '../components/GradientButton';

export default class WelcomeScreen extends Component {
  constructor(props){
    super(props);
    this.state = {
      fadeNum: new Animated.Value(0)
    }
  }

  componentWillMount() {
    // Sometimes setting navbar color doesn't work, so set again for First time users.
    firebase.analytics().setCurrentScreen("Welcome", "WelcomeScreen");
  }
  
  componentDidMount(){
    changeNavigationBarColor(Constants.BRAND_BACKGROUND_COLOR)
    setTimeout(()=>{Animated.timing(this.state.fadeNum, { toValue: 1, duration: 1000}).start()}, Constants.LANDING_PAGE_BUTTON_DELAY)
  }

  goToPhoneVerification(isLogIn){
    if (isLogIn){
      this.props.navigation.navigate('LogIn');
      return;
    }

    this.props.navigation.navigate('CheckInviteCode');
  }


  render() {
    return (
      <View style={[styles.container]}> 
        <StatusBar  translucent backgroundColor={Constants.APP_STATUS_BAR_COLOR} />
          <Image source={require("../assets/resources/Circles-low-res-no-loop.gif")} 
            style={{ width: "100%", height: "60%", alignSelf: 'center', marginBottom: 0 }} />
          <Animated.View style={{width: '100%', height: '24%', opacity: this.state.fadeNum}}>
              <GradientButton isLight colors={Constants.DEFAULT_GRADIENT} isLarge={true} title={UIStrings.TITLE_SIGNUP} onPress={()=>{this.goToPhoneVerification(false)}} style={{marginTop:10}}/> 
              <GradientButton isLight colors={Constants.DEFAULT_GRADIENT} isLarge={true} title={UIStrings.TITLE_LOGIN} onPress={()=>{this.goToPhoneVerification(true)}} style={{marginTop:10}}/>
              <GradientButton colors={Constants.INPUT_BACKGROUND_GRADIENT} isLarge={true} title={UIStrings.HOW_IT_WORKS} onPress={()=>{this.props.navigation.navigate('HowItWorks', {colorOnExit: Constants.BRAND_BACKGROUND_COLOR})}} style={{marginTop:10}}/>
          </Animated.View>

          <Animated.View style={{width: '90%', alignSelf: 'flex-end', opacity: this.state.fadeNum, marginRight: 15}}>
            <TouchableOpacity onPress={()=>this.props.navigation.navigate('NotesFromFounders')} style={{flexDirection: 'column'}}>
              <Image source={require('../assets/resources/scroll.png')} style={{width: 40, height: 40, borderRadius: 20, alignSelf: 'flex-end'}} />
            </TouchableOpacity>
          </Animated.View>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Constants.BRAND_BACKGROUND_COLOR
  },
  welcome: {
    textAlign: "center",
    color: Constants.BRAND_BACKGROUND_COLOR,
    fontSize: 45,
    fontFamily: Constants.APP_THIN_FONT,
    marginTop: 10,
    marginBottom: 60
  },
  subtitle: {
    textAlign: "center",
    color: Constants.APP_TEXT_COLOR,
    fontSize: 20,
    fontFamily: "Montserrat-Regular",
    marginBottom: 40,
  },
  overlay:{
    opacity: 0.1,
  }
});
