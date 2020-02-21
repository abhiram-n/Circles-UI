import React, { Component } from "react";
import { StyleSheet, Text, View, StatusBar, TouchableOpacity, Image } from "react-native";
import * as Constants from "../helpers/Constants";
import { Button, Icon } from "native-base";
import LinearGradient from "react-native-linear-gradient";

const RowWithTextLeftAndRight = ({leftText, rightText, backgroundColor, onPress}) => (
    <View style={[styles.container, {backgroundColor: backgroundColor ?? Constants.BACKGROUND_GREY_COLOR}]} >
        <Text onPress={onPress} numberOfLines={1} style={styles.leftText}>{leftText}</Text>
        <Text onPress={onPress} numberOfLines={1} style={styles.rightText}>{rightText}</Text>
   </View>
);

const styles = StyleSheet.create({
    container:{
        backgroundColor: '#f2f2f2', 
        alignSelf: 'center', 
        flexDirection: 'row', 
        borderRadius: 8, 
        paddingHorizontal: 10, 
        paddingVertical: 5, 
        marginVertical: 4, 
        width: '80%', 
        height: 40
    },
    leftText:{
        textAlign: 'left',
        textAlignVertical: 'center', 
        width: '30%', 
        overflow: 'hidden', 
        fontFamily: Constants.APP_SUBTITLE_FONT, 
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND
    },
    rightText:{
        textAlign: 'right',
        textAlignVertical: 'center', 
        width: '70%', 
        overflow: 'hidden', 
        fontFamily: Constants.APP_SUBTITLE_FONT, 
        color: Constants.BRAND_BACKGROUND_COLOR
    }
});

export default RowWithTextLeftAndRight;