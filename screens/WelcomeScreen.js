import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  StatusBar,
  ImageBackground
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
      isFirstRun: false
    }

    this.visitType = this.props.navigation.getParam("visitType", Constants.NONE);
  }

  componentWillMount() {
    // Sometimes setting navbar color doesn't work, so set again for First time users.
    firebase.analytics().setCurrentScreen((screenName = "Welcome"));
    this.setState({isFirstRun: this.visitType == Constants.VISIT_TYPE_FIRST});
  }

  goToPhoneVerification(isLogIn){
    if (isLogIn){
      this.props.navigation.navigate('LogIn');
      return;
    }

    this.props.navigation.navigate('SelectCardsYouOwn');
  }


  render() {
    return (
      // TODO: Pop up about notifications , this.state.isFirstRun ? styles.overlay : null]}>
      // <ImageBackground source={require("../assets/logo/pattern_1.png")} style={{width: '100%', height: '100%'}}>
      <View style={[styles.container]}> 
          <StatusBar translucent backgroundColor={Constants.APP_STATUS_BAR_COLOR} />
          <Image
            source={require("../assets/logo/logo_max.png")}
            style={{ width: 175, height: 175, alignSelf: 'center' }}
          />
            <Text style={styles.welcome}>{UIStrings.APP_TITLE}</Text>
            <GradientButton isLarge={true} title={UIStrings.TITLE_LOGIN} onPress={()=>{this.goToPhoneVerification(true)}} style={{marginTop:10}}/>
            <GradientButton isLarge={true} title={UIStrings.TITLE_SIGNUP} onPress={()=>{this.goToPhoneVerification(false)}} style={{marginTop:10}}/>
            <GradientButton isLarge={true} title={UIStrings.TITLE_HOW_IT_WORKS} onPress={()=>{this.props.navigation.navigate('HowItWorks')}} style={{marginTop:10}}/>
        </View>
        // </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcome: {
    textAlign: "center",
    color: Constants.HEADING_COLOR,
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
