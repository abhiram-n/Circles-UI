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
                backgroundColor: Constants.BACKGROUND_WHITE_COLOR, 
                text: "A Circle is a private space for 10 of your close friends and family with whom you're comfortable enough to share your credit and debit cards.",
                title: "Your Circle",
                imageStyle: styles.image,                
                textStyle: styles.text,
                titleStyle: styles.title,
            },
            {
                key: 'second',
                backgroundColor: Constants.BACKGROUND_WHITE_COLOR,
                text: "Figure out who has the card you're looking for either in your Circle or in your friends' Circles.",
                title: "Discover Cards",
                imageStyle: styles.image,                
                textStyle: styles.text,
                titleStyle: styles.title,
            },
            {
                key: 'third',
                backgroundColor: Constants.BACKGROUND_WHITE_COLOR,
                text: "Request friends in your Circle or acquaintances in your friends' Circles to share card details in an end-to-end encrypted chat.",
                title: "Request and Share",
                imageStyle: styles.image,
                textStyle: styles.text,
                titleStyle: styles.title
            },
        ]
    }

    componentWillMount(){
        firebase.analytics().setCurrentScreen("HowItWorks");
        changeNavigationBarColor(Constants.APP_HOW_IT_WORKS_COLOR, false);
    }

    componentWillUnmount(){
        changeNavigationBarColor(Constants.BRAND_BACKGROUND_COLOR, false)
    }

    _onDone = () => {
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
        fontFamily: Constants.APP_THIN_FONT,
        fontSize: 14,
        textAlign: 'center',
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND
    },
    title: {
        fontFamily: Constants.APP_THIN_FONT,
        textAlign: 'center',
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND
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