import React, { Component } from "react";
import { StyleSheet, Text, View, StatusBar, TouchableOpacity, Image } from "react-native";
import * as Constants from "../helpers/Constants";
import { Button, Icon } from "native-base";
import LinearGradient from "react-native-linear-gradient";
import firebase from "react-native-firebase";

const FriendRequestButton = ({name, subtitle, onPress, imageSource, iconColor, iconName, status}) => (
    <TouchableOpacity style={styles.container} onPress={onPress}>
        <View style={styles.imageContainer}>
            <Image source={{uri: imageSource}} resizeMethod="resize" style={styles.image}/>
        </View>
        <View style={{flexDirection: 'column', width: '50%', height: '100%', justifyContent: 'center', alignContent: 'center', marginLeft: 10, overflow: 'hidden'}}>
            <Text numberOfLines={1} style={styles.name}>{name}</Text>
            {subtitle != null ?
            <Text  numberOfLines={1} style={styles.subtitle}>{subtitle}</Text>
            : null }
        </View>
        <View style={{flexDirection: 'column', width: '20%', justifyContent: 'center'}}>
            <Icon name={iconName} type="FontAwesome5" style={{color: iconColor, fontSize: 14, alignSelf: 'center'}} />
            <Text numberOfLines={1} style={[styles.iconText, {color: iconColor}]}>{status}</Text>
        </View>
   </TouchableOpacity>
)

const styles = StyleSheet.create({
      container:{
        height: 80,
        width: "90%",
        borderRadius: 20,
        flexDirection: 'row',
        margin: 10,
        backgroundColor: Constants.BACKGROUND_GREY_COLOR
      },
      imageContainer:{
        width: "25%",
        justifyContent: 'center',
        alignContent: 'center',
      },
      image:{
          width: 55,
          height: 55,
          borderRadius: 27.5,
          margin: 5,
          alignSelf: 'center',
          overflow: "hidden",
          backgroundColor: "#f4f4f4",
      },
      name:{
          fontFamily: Constants.APP_SUBTITLE_FONT,
          fontSize: 16, 
          color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
          overflow: 'hidden',
          paddingVertical: 3 
      },
      subtitle:{
        fontFamily: Constants.APP_BODY_FONT,
        paddingVertical: 3,
        fontSize: 12, 
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND
      },
      iconText:{
          fontSize: 10,
          fontFamily: Constants.APP_SUBTITLE_FONT,
          textAlign: 'center',
          marginTop: 5
      }
});

export default FriendRequestButton;