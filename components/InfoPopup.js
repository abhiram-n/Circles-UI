import React, { Component } from "react";
import { StyleSheet, View, Text, Modal, Button } from 'react-native';
import * as Constants from '../helpers/Constants';
import CommonStyles from './CommonStyles';
import * as UIStrings from '../helpers/UIStrings';
import TopRightButton from './TopRightButton';
import { Icon, Input } from "native-base";
import { TouchableOpacity } from "react-native";
import GradientButton from "./GradientButton";

const InfoPopup = ({isVisible, onClose, title, content}) => (
  <Modal visible={isVisible} transparent={true} onRequestClose={onClose}>
  <View style={CommonStyles.popupContainer}>
    <View style={[CommonStyles.popup, {padding: 15}]}>
      <TopRightButton color={Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND} iconName="times" onPress={onClose} height={50}/>
      <Text style={CommonStyles.popupTitle}>{title}</Text>
      <View style={styles.textContainer}>
        <Text style={styles.text}>{content}</Text>
      </View>
      <GradientButton isLarge={false} title={UIStrings.OK} onPress={onClose} />
    </View>
    </View>
  </Modal>

  );


const styles = StyleSheet.create({
  optionsContainer:{
    justifyContent: 'center', 
    zIndex: 100, 
    backgroundColor: Constants.BACKGROUND_WHITE_COLOR, 
    width: '100%', 
    position: 'absolute', 
    bottom: Constants.BOTTOM_MENU_HEIGHT, 
    borderWidth: 2, 
    borderColor: Constants.BACKGROUND_GREY_COLOR, 
    borderTopRightRadius: 30, 
    borderTopLeftRadius: 30, 
    height: 210,
  },
  textContainer:{
    marginTop: 13, 
    marginBottom: 30, 
    alignSelf: 'center', 
    justifyContent: 'center', 
    alignContent: 'center', 
    width: '100%', 
    height: 100
  },
  text:{
    fontFamily: Constants.APP_BODY_FONT, 
    fontSize: 14, 
    color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND, 
    textAlign: 'center', 
    paddingHorizontal: 8
  },
  icon:{
    width: 40, 
    alignSelf: 'center', 
    justifyContent: 'center',
    padding: 10,
    fontSize: 16, 
    color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND
  }
});

export default InfoPopup;