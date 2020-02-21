import React, { Component } from "react";
import { Image, StyleSheet, Text, View, StatusBar, TouchableOpacity, ImageBackground } from "react-native";
import * as Constants from "../helpers/Constants";
import { Button, Icon } from "native-base";
import LinearGradient from "react-native-linear-gradient";
import firebase from "react-native-firebase";
import TextTicker from "react-native-text-ticker";

const CreditCardWithText = ({imgName, title, name, onDeletePress}) => (
    <View style={styles.container} >
        {onDeletePress != null ?
        <TouchableOpacity onPress={onDeletePress} style={{padding: 5, paddingLeft: 10, top: 5, right: 5, zIndex: 100, position: 'absolute', height: 50, weight: 50}} >
          <Icon name="times" type="FontAwesome5" style={{color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND, fontSize: 13}}/>
        </TouchableOpacity>    
        : null}    
        <ImageBackground source={imgName}  style={{width: "100%", height: "100%", flex: 1}}>
                <View style={styles.titleContainer}>
                    <View style={{alignContent: 'center', alignSelf: 'center', paddingHorizontal: '8%', paddingTop: 15}}>
                        <TextTicker  style={styles.title} loop bounce duration={5000} repeatSpacer={50} marqueeDelay={1000}>{title}</TextTicker>
                    </View>
                </View>
                <View style={styles.nameContainer}>
                    <Text numberOfLines={1} style={styles.name}>{name}</Text>
                </View>
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
        opacity: 0.8
    },
    titleContainer: {
        width: "100%",
        height: "33%",
    },
    title:{
        fontFamily: Constants.APP_SUBTITLE_FONT,
        fontSize: 16, 
        color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND,
        textAlign: 'center',
    },
    nameContainer:{
        width: "80%",
        alignSelf: "center",
        bottom: "10%",
        position: "absolute"
    },
    name: {
        fontFamily: "Montserrat-Light",
        fontSize: 15, 
        color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND,
        textAlign: 'center',
        paddingHorizontal: 8
    }
})

export default CreditCardWithText;