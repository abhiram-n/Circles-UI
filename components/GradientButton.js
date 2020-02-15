import React, { Component } from "react";
import { StyleSheet, Text, View, StatusBar, TouchableOpacity, Image } from "react-native";
import * as Constants from "../helpers/Constants";
import { Button, Icon } from "native-base";
import LinearGradient from "react-native-linear-gradient";

const GradientButton = ({title, onPress, colors, isLarge, isLight}) => (
    <TouchableOpacity style={isLarge ? styles.containerLarge : styles.containerSmall} onPress={onPress}>
        <LinearGradient start={{x:0, y:1}} end={{x:1, y:1}} colors={colors ?? Constants.BUTTON_COLORS} style={styles.gradientStyle}>
            <Text numberOfLines={1}  style={[styles.title, {fontSize: isLarge ? 18 : 15, color: isLight ? Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND : Constants.TEXT_COLOR_FOR_DARK_BACKGROUND}]}>{title}</Text>
        </LinearGradient>
   </TouchableOpacity>
);

const styles = StyleSheet.create({
      title:{
          fontFamily: Constants.APP_BODY_FONT,
          textAlign: 'center',
          padding: 5
      },
      containerSmall:{
        justifyContent: 'center', 
        alignContent: 'center',
        alignSelf: 'center',
        marginHorizontal: 10, 
        marginVertical: 5,
        width: '50%', 
        height: 40, 
    },
    containerLarge:{
      justifyContent: 'center', 
      alignContent: 'center',
      alignSelf: 'center',
      paddingHorizontal: 10, 
      paddingVertical: 5,
       width: '60%', 
      height: 60
    },
    gradientStyle:{
        borderRadius: 10, 
        alignSelf: 'center', 
        width: '100%', 
        height: '100%', 
        justifyContent: 'center'
    }
});

export default GradientButton;