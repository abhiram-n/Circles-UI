import React, { Component } from "react";
import { StyleSheet, Text, View, StatusBar, TouchableOpacity, Image } from "react-native";
import * as Constants from "../helpers/Constants";
import { Button, Icon } from "native-base";
import LinearGradient from "react-native-linear-gradient";
import firebase from "react-native-firebase";

const RoundImageWithCaptionButton = ({caption, subtitle, isLarge, imgUri, onPress}) => (
    <TouchableOpacity style={styles.container} onPress={onPress}>
        <Image resizeMethod="resize" source={{uri: imgUri}} style={isLarge ? styles.circleLarge : styles.circleSmall} />
        <Text numberOfLines={1} style={[styles.caption]}>{caption}</Text>
        <Text numberOfLines={1} style={[styles.subtitle]}>{subtitle}</Text>
   </TouchableOpacity>
)

const styles = StyleSheet.create({
    caption:{
        color: 'black',
        fontSize: 15,
        fontFamily: Constants.APP_SUBTITLE_FONT,
        textAlign: 'center',
        paddingTop: 3 
    },
    circleSmall:{
        width: 80, 
        height: 80, 
        borderRadius: 40, 
        alignSelf: 'center',
        overflow: 'hidden'
      },
      circleLarge:{
        width: 120, 
        height: 120, 
        borderRadius: 60, 
        alignSelf: 'center',
        overflow: 'hidden'
      },
      container:{
        flexDirection: 'column', 
        margin: 10, 
        width: 100,
        justifyContent: 'center',
      },
      subtitle:{
        color: 'black',
        fontSize: 11,
        fontFamily: Constants.APP_BODY_FONT,
        textAlign: 'center',
        marginTop: 3
      }
});

export default RoundImageWithCaptionButton;