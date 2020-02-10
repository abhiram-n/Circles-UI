import React, { Component } from "react";
import { StyleSheet, Text, View, StatusBar, TouchableOpacity, ImageBackground } from "react-native";
import * as Constants from "../helpers/Constants";
import { Button, Icon } from "native-base";
import LinearGradient from "react-native-linear-gradient";
import firebase from "react-native-firebase";
import RoundIconWithBackgroundAndCaptionButton from "./RoundIconWithBackgroundAndCaptionButton"
import TextTicker from "react-native-text-ticker"

const CreditCardWithButton = ({colors, size, title, subtitle, leftButtonParams, rightButtonParams }) => (
    <View style={styles.container}>
        <ImageBackground source={require("../assets/logo/Card_Pattern.png")}  style={{width: "100%", height: "100%", flex: 1}}>
        <LinearGradient colors={colors} style={styles.gradient}>
            <View style={styles.titleContainer}>
                <View style={{alignContent: 'center', alignSelf: 'center', paddingHorizontal: '8%', paddingTop: 15}}>
                    <TextTicker  style={styles.title} loop bounce duration={5000} repeatSpacer={50} marqueeDelay={1000}>{title}</TextTicker>
                </View>
                {subtitle != null ? <Text numberOfLines={1} style={[styles.title, {paddingTop: 5, paddingHorizontal: '7%', fontSize: 12, fontFamily: Constants.APP_BODY_FONT}]}>{subtitle}</Text> : null}
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={{flexDirection: 'column', justifyContent: 'center', marginRight: 60}} onPress={leftButtonParams.onPress}>
                    <Icon name={leftButtonParams.icon} type={leftButtonParams.type == null ? "FontAwesome5": leftButtonParams.type} style={styles.icon} />
                    <Text style={styles.buttonText}>{leftButtonParams.caption}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{flexDirection: 'column', justifyContent: 'center'}} onPress={rightButtonParams.onPress}>
                    <Icon name={rightButtonParams.icon} type={rightButtonParams.type == null ? "FontAwesome5": rightButtonParams.type} style={styles.icon} />
                    <Text style={styles.buttonText}>{rightButtonParams.caption}</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
        </ImageBackground>
   </View>
)

const styles = StyleSheet.create({
    container: {
        width: 290,
        height: 185,
        marginHorizontal: 10,
        borderRadius: 12,
        overflow: 'hidden'
    },
    gradient:{
        flex: 1, 
        width: "100%",
        height: "100%",
        opacity: 0.85
    },
    titleContainer: {
        width: "100%",
        height: "33%",
    },
    title:{
        fontFamily: "Montserrat-Regular",
        fontSize: 16, 
        color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND,
        textAlign: 'center',
    },
    buttonContainer:{
        width: "70%",
        flexDirection: "row",
        justifyContent: "center",
        alignSelf: 'center',
        position: 'absolute',
        bottom: 0,
        marginBottom: 20
    },
    buttonText:{
        textAlign: 'center',
        color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND,
        fontFamily: Constants.APP_BODY_FONT,
        fontSize: 12
    },
    icon:{
        alignSelf: 'center', 
        fontSize: 20, 
        color: Constants.BACKGROUND_WHITE_COLOR,
        paddingBottom: 5
    }
})

export default CreditCardWithButton;