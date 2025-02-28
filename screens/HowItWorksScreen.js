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
        this.colorOnExit = this.props.navigation.getParam("colorOnExit", Constants.NONE);
        this.slides=[
            {
                key: 'first',
                backgroundColor: Constants.APP_HOW_IT_WORKS_COLOR, 
                text: "A Circle is a trusted space for 10 of your close friends and family you're comfortable sharing your credit and debit cards with.",
                title: "Your Circle",
                imageStyle: styles.image,                
                textStyle: styles.text,
                titleStyle: styles.title,
                image: require('../assets/resources/howitworks1.png'),
            },
            {
                key: 'second',
                backgroundColor: Constants.APP_HOW_IT_WORKS_COLOR,
                text: "Figure out who has the card you're looking for either in your Circle or in your friends' Circles.",
                title: "Discover",
                imageStyle: styles.image,                
                textStyle: styles.text,
                image: require('../assets/resources/howitworks2.png'),
                titleStyle: styles.title,
            },
            {
                key: 'third',
                backgroundColor: Constants.APP_HOW_IT_WORKS_COLOR,
                text: "Send requests to share card details in a self-destructing end-to-end encrypted chat. No one else, not even Circles, can access chat messages.",
                title: "Request and Share",
                imageStyle: styles.image,
                textStyle: styles.smallText,
                image: require('../assets/resources/howitworks3.png'),
                titleStyle: styles.title
            },
        ]
    }

    componentWillMount(){
        firebase.analytics().setCurrentScreen("HowItWorks", "HowItWorksScreen");
        changeNavigationBarColor(Constants.APP_HOW_IT_WORKS_COLOR, false);
    }

    componentWillUnmount(){
        if (this.colorOnExit != null && this.colorOnExit != Constants.NONE){
            changeNavigationBarColor(this.colorOnExit, false)
        }
    }

    _onDone = () => {
            this.props.navigation.goBack();
    }

    _renderDoneButton = () => {
        return (
          <Text style={{color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND, fontFamily: Constants.APP_ULTRA_THIN_FONT}}>Done</Text>
        );
      };
    
    _renderNextButton = () => {
        return (
          <Text style={{color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND, fontFamily: Constants.APP_ULTRA_THIN_FONT}}>Next</Text>
        );
      };

    render()
    {
        return(
              <AppIntroSlider renderDoneButton={this._renderDoneButton} renderNextButton={this._renderNextButton} slides={this.slides} onDone={this._onDone} />
        )
    }
}

const styles = StyleSheet.create({
    text:{
        fontFamily: Constants.APP_ULTRA_THIN_FONT,
        fontSize: 14,
        textAlign: 'center',
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND
    },
    smallText:{
        fontFamily: Constants.APP_ULTRA_THIN_FONT,
        fontSize: 13.5,
        textAlign: 'center',
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND
    },
    title: {
        fontFamily: Constants.APP_ULTRA_THIN_FONT,
        textAlign: 'center',
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND
    },
    buttonTextStyle:{
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND
    },
    image:{
        width: 232,
        height: "71%",
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