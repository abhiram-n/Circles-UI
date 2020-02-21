import React, { Component } from "react";
import { StyleSheet, Text, View, StatusBar, TouchableOpacity, Image } from "react-native";
import * as Constants from "../helpers/Constants";
import { Button, Icon } from "native-base";
import LinearGradient from "react-native-linear-gradient";
import firebase from "react-native-firebase";

const RoundImageWithCaptionButton = ({caption, subtitle, isLarge, imgUri, onPress}) => (
    <TouchableOpacity style={styles.container} onPress={onPress}>
        <Image  source={{uri: imgUri}} style={isLarge ? styles.circleLarge : styles.circleSmall} />
        {caption != null ?
          <Text numberOfLines={1} style={styles.caption}>{caption}</Text>
          :
          null}
        {subtitle != null ?
          <Text numberOfLines={1} style={[styles.subtitle]}>{subtitle}</Text>
          : 
          null}
   </TouchableOpacity>
)

const styles = StyleSheet.create({
    caption:{
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
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
        overflow: 'hidden',
        backgroundColor: Constants.IMAGE_DEFAULT_BKGD_COLOR
      },
      circleLarge:{
        width: 120, 
        height: 120, 
        borderRadius: 60, 
        alignSelf: 'center',
        overflow: 'hidden',
        backgroundColor: Constants.IMAGE_DEFAULT_BKGD_COLOR,
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
      },
      smallCircleSize:{
        width: 80,
        height: 80,
        borderRadius: 40
      },
      largeCircleSize:{
        width: 120,
        height: 120, 
        borderRadius: 60
      }
});

export default RoundImageWithCaptionButton;