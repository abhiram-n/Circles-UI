import React, { Component } from "react";
import { StyleSheet, Text, View, StatusBar, TouchableOpacity } from "react-native";
import * as Constants from "../helpers/Constants";
import { Button, Icon } from "native-base";
import LinearGradient from "react-native-linear-gradient";
import firebase from "react-native-firebase";

const IconWithCaptionButton = ({caption, icon, iconType, onPress}) => (
    <TouchableOpacity style={styles.container} onPress={onPress}>
        <Icon name={icon} type={iconType} style={styles.icon}/>
        <Text numberOfLines={1} style={styles.caption}>{caption}</Text>
   </TouchableOpacity>
)

const styles = StyleSheet.create({
    caption:{
        color: 'black',
        fontSize: 12,
        fontFamily: "Montserrat-Light",
        textAlign: 'center',
        paddingTop: 3 
    },
      container:{
        flexDirection: 'column', 
        marginHorizontal: 5, 
        width: 70
      },
      icon:{
        alignSelf: 'center', 
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND, 
        justifyContent: 'center',
        flex: 1,
        fontSize: 16,
        alignItems: 'center',
        alignContent: 'center',
        textAlignVertical: "center"
      }
});

export default IconWithCaptionButton;