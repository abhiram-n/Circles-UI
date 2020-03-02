import React, { Component } from "react";
import { StyleSheet, View, Text, Modal, Button, ScrollView, Image } from 'react-native';
import * as Constants from '../helpers/Constants';
import CommonStyles from './CommonStyles';
import * as UIStrings from '../helpers/UIStrings';
import TopRightButton from './TopRightButton';
import { Icon, Input } from "native-base";
import { TouchableOpacity } from "react-native";
import GradientButton from "./GradientButton";
import LottieView from "lottie-react-native"

const InfoPopup = ({isVisible, onClose, title, content, buttonParams, lottieProps, makeExteriorTransparent}) => (
  <Modal visible={isVisible} transparent={true} onRequestClose={onClose}>
  <View style={[CommonStyles.popupContainer, makeExteriorTransparent ? styles.exteriorTransparent : null]}>
    <View style={[CommonStyles.popup, {padding: 15}]}>
      <TopRightButton color={Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND} iconName="times" onPress={onClose} height={40}/>
      {lottieProps != null ?
        <LottieView speed={lottieProps.speed ?? 1} style={{alignSelf: 'center', width: '70%', height: 100, marginVertical: 5, marginHorizontal: 10}} source={lottieProps.name} autoPlay loop />
        : 
        null
      }
      {title != null ? 
        <Text style={CommonStyles.popupTitle}>{title}</Text>
        : 
        null
      }
      <ScrollView style={styles.textContainer}>
        <Text style={styles.text}>{content}</Text>
      </ScrollView>
      <GradientButton isLarge={false} title={buttonParams != null ? buttonParams.title : UIStrings.OK} 
                      onPress={buttonParams != null ? buttonParams.onPress : onClose} />
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
  exteriorTransparent: {
    backgroundColor: 'transparent'
  },
  textContainer:{
    marginTop: 5, 
    marginBottom: 25, 
    alignSelf: 'center', 
    alignContent: 'center', 
    width: '100%', 
    minHeight: 30,
    maxHeight: 120
  },
  text:{
    fontFamily: Constants.APP_BODY_FONT, 
    fontSize: 13, 
    color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND, 
    textAlign: 'left', 
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