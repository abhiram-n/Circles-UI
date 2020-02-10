import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, StatusBar} from 'react-native';
import * as Constants from '../helpers/Constants';
import * as UIStrings from '../helpers/UIStrings';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import AppIntroSlider from 'react-native-app-intro-slider';
import firebase from 'react-native-firebase';

export default class HowItWorksScreen extends Component<Props>{
    constructor(props){
        super(props);
        this.nextScreen = this.props.navigation.getParam("nextScreen", Constants.NONE);
        this.visitType = this.props.navigation.getParam("visitType", Constants.NONE);
        this.slides=[
            {
                key: 'first',
                backgroundColor: Constants.APP_HOW_IT_WORKS_COLOR, 
                imageStyle: styles.image,                
                textStyle: styles.text,
                titleStyle: styles.title,
            },
            {
                key: 'second',
                backgroundColor: Constants.APP_HOW_IT_WORKS_COLOR,
                imageStyle: styles.image,                
                textStyle: styles.text,
                titleStyle: styles.title,
            },
            {
                key: 'third',
                backgroundColor: Constants.APP_HOW_IT_WORKS_COLOR,
                imageStyle: styles.flowImage,
                titleStyle: styles.title
            },
            {
                key: 'fourth',
                backgroundColor: Constants.APP_HOW_IT_WORKS_COLOR,
                //image: require("../assets/logo/high-five.png"),
                textStyle: styles.text,
                imageStyle: styles.image,
                titleStyle: styles.title
            },
        ]
    }

    componentWillMount(){
        firebase.analytics().setCurrentScreen("HowItWorks");
        changeNavigationBarColor(Constants.APP_HOW_IT_WORKS_COLOR, false);
        StatusBar.setBackgroundColor(Constants.APP_HOW_IT_WORKS_COLOR);
    }

    componentWillUnmount(){
        changeNavigationBarColor(Constants.APP_NATIVE_NAV_BAR_COLOR, false)
    }

    _onDone = () => {
        changeNavigationBarColor(Constants.APP_NATIVE_NAV_BAR_COLOR, false)
        if (this.nextScreen == Constants.NONE)
        {
            this.props.navigation.goBack();
        }
        else{
            this.props.navigation.replace(this.nextScreen, {visitType: this.visitType});
        }
    }
    
    render()
    {
        return(
              <AppIntroSlider slides={this.slides} onDone={this._onDone} />
        )
    }
}

const styles = StyleSheet.create({
    text:{
        fontFamily: 'Montserrat-Light',
        fontSize: 14,
        textAlign: 'center',
        color: Constants.APP_TEXT_COLOR
    },
    title: {
        fontFamily: 'Montserrat-Regular',
        textAlign: 'center',
        color: Constants.APP_TEXT_COLOR
    },
    image:{
        width: "70%",
        height: "40%",
        borderWidth: 2,
        borderRadius: 8,
    },
    flowImage:{
        width: "92%",
        height: "65%",
        borderWidth: 2,
        borderRadius: 8,
    }
})