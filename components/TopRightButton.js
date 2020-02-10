import React, { Component } from "react";
import { StyleSheet, Text, View, StatusBar, TouchableOpacity, Image } from "react-native";
import * as Constants from "../helpers/Constants";
import { Button, Icon } from "native-base";
import LinearGradient from "react-native-linear-gradient";
import firebase from "react-native-firebase";

const TopRightButton = ({iconName, imgPath, height, color, onPress}) => (
    <TouchableOpacity style={[styles.container, {height: height ?? 70}]} onPress={onPress}>
        {iconName != null ? 
          <Icon name={iconName} type="FontAwesome5" style={{color: color, fontSize: 16}}/>
          : 
          <Image source={imgPath} style={{width: 26, height: 26, borderRadius: 13}} />
        }
   </TouchableOpacity>
)

const styles = StyleSheet.create({
      container:{
        width: 45,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute', 
        top: 0,
        right: 0,
        zIndex: 100,
      },
});

export default TopRightButton;