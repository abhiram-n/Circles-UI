import React, { Component } from "react";
import { StyleSheet, Text, View, StatusBar, TouchableOpacity } from "react-native";
import * as Constants from "../helpers/Constants";
import { Button, Icon } from "native-base";
import LinearGradient from "react-native-linear-gradient";
import firebase from "react-native-firebase";

const RoundIconWithBackgroundAndCaptionButton = ({colors, isLarge, caption, icon, iconType, onPress, textColor, thinFont}) => (
    <TouchableOpacity style={[styles.container, isLarge ? styles.containerMedium : styles.containerSmall]} onPress={onPress}>
        <LinearGradient colors={colors} start={{x:0, y:1}} end={{x:1, y:1}} style={[styles.circle, isLarge ? styles.circleMedium : styles.circleSmall]}>
            <Icon name={icon} type={iconType} style={[styles.icon, isLarge ? styles.iconMedium : styles.iconSmall]}/>
        </LinearGradient>
        <Text numberOfLines={1} style={[styles.caption, 
                                        {fontFamily: thinFont ? Constants.APP_THIN_FONT : Constants.APP_BODY_FONT  },
                                        isLarge ? styles.captionMedium : styles.captionSmall]}>{caption} </Text>
   </TouchableOpacity>
)

const styles = StyleSheet.create({
    caption:{
        color: 'black',
        textAlign: 'center',
    },
    captionSmall:{
      fontSize: 12,
      paddingTop: 3 
    },
    captionMedium:{
      fontSize: 15,
      paddingTop: 6 
    },
    circle:{ 
        alignSelf: 'center'
      },
    circleSmall:{
      width: 50, 
      height: 50, 
      borderRadius: 25,
    },
    circleMedium:{
      width: 100, 
      height: 100, 
      borderRadius: 55,
    },
    container:{
        flexDirection: 'column', 
        alignContent: 'center', 
        justifyContent: 'center',
    },
    containerSmall:{
      width: 70
    },
    containerMedium:{
      width: 120
    },
    icon:{
        alignSelf: 'center', 
        color: Constants.LIGHT_ICON_COLOR, 
        justifyContent: 'center',
        flex: 1,
        alignItems: 'center',
        alignContent: 'center',
        textAlignVertical: "center"
    },
    iconSmall:{
      fontSize: 22,
    },
    iconMedium:{
      fontSize: 30,
    }
});

export default RoundIconWithBackgroundAndCaptionButton;