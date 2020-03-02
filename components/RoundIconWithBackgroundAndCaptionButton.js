import React, { Component } from "react";
import { StyleSheet, Text, View, StatusBar, TouchableOpacity } from "react-native";
import * as Constants from "../helpers/Constants";
import { Button, Icon } from "native-base";
import LinearGradient from "react-native-linear-gradient";
import firebase from "react-native-firebase";

const RoundIconWithBackgroundAndCaptionButton = ({colors, isLarge, caption, iconParams, onPress, isLight, thinFont}) => (
    <TouchableOpacity style={[styles.container, isLarge ? styles.containerMedium : styles.containerSmall]} onPress={onPress}>
        <LinearGradient colors={colors} start={{x:0, y:1}} end={{x:1, y:1}} style={[styles.circle, isLarge ? styles.circleMedium : styles.circleSmall]}>
            <Icon name={iconParams.icon} type={iconParams.type} style={[styles.icon, 
                                                      {fontSize: iconParams.size}, 
                                                      {color: isLight ? Constants.BRAND_BACKGROUND_COLOR : Constants.LIGHT_ICON_COLOR}]}/>
        </LinearGradient>
        <Text numberOfLines={2} style={[styles.caption, 
                                        {color: isLight ? Constants.TEXT_COLOR_FOR_DARK_BACKGROUND : Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND},
                                        {fontFamily: thinFont ? Constants.APP_BODY_FONT : Constants.APP_SUBTITLE_FONT  },
                                        isLarge ? styles.captionMedium : styles.captionSmall]}>{caption} </Text>
   </TouchableOpacity>
)

const styles = StyleSheet.create({
    caption:{
        textAlign: 'center',
    },
    captionSmall:{
      fontSize: 14.5,
      paddingTop: 3 
    },
    captionMedium:{
      fontSize: 17,
      paddingTop: 6 
    },
    circle:{ 
        alignSelf: 'center'
      },
    circleSmall:{
      width: 80, 
      height: 80, 
      borderRadius: 40,
    },
    circleMedium:{
      width: 120, 
      height: 120, 
      borderRadius: 60,
    },
    container:{
        flexDirection: 'column', 
        alignContent: 'center', 
        justifyContent: 'center',
        margin: 10
    },
    containerSmall:{
      width: 100
    },
    containerMedium:{
      width: 120
    },
    icon:{
        alignSelf: 'center', 
        justifyContent: 'center',
        flex: 1,
        alignItems: 'center',
        alignContent: 'center',
        textAlignVertical: "center"
    },
    iconSmall:{
      fontSize: 28,
    },
    iconMedium:{
      fontSize: 40,
    }
});

export default RoundIconWithBackgroundAndCaptionButton;