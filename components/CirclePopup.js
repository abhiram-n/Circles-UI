import React, { Component } from "react";
import { StyleSheet, View, Text, Modal, Button } from 'react-native';
import * as Constants from '../helpers/Constants';
import * as UIStrings from '../helpers/UIStrings';
import TopRightButton from './TopRightButton';
import { Icon, Input } from "native-base";
import { TouchableOpacity } from "react-native";

const CirclePopup = ({isVisible, navigate, onClose}) => (
  <Modal  visible={isVisible} transparent={true} onRequestClose={onClose}>
    <View style={{height: '100%', width: '100%', backgroundColor: "rgba(255,255,255,0.85)"}}>
      <View style={styles.optionsContainer}>
      <TopRightButton iconName="times"  height={40} color={Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND} onPress={onClose}/>
      <TouchableOpacity style={{flexDirection: 'row', padding: 10}} onPress={()=>{onClose(); navigate("AddToCircle")}}>
          <Icon name="plus" type="FontAwesome5" style={[styles.icon, {fontSize: 22, color: Constants.APP_THEME_COLORS[0]}]} />
          <View style={{flexDirection: 'column', alignSelf: 'center'}}>
              <Text style={styles.circlePopupOptionTitle}>{UIStrings.ADD}</Text>
              <Text numberOfLines={1} style={styles.circlePopupOptionSubtitle}>{UIStrings.ADD_SUBTITLE}</Text>
          </View>
      </TouchableOpacity>
      <View style={{borderBottomWidth: 1, marginVertical: 2, borderColor: Constants.BACKGROUND_GREY_COLOR, width: '90%', alignSelf: 'center'}} />
      <TouchableOpacity style={{flexDirection: 'row', padding: 10}} onPress={()=>{onClose();navigate("AllFriendRequests");}}>
          <Icon name="user-plus" type="FontAwesome5" style={[styles.icon, {fontSize: 16, color: Constants.APP_THEME_COLORS[0]}]} />
          <View style={{flexDirection: 'column', alignSelf: 'center'}}>
              <Text style={styles.circlePopupOptionTitle}>{UIStrings.CONNECTIONS}</Text>
              <Text numberOfLines={1} style={styles.circlePopupOptionSubtitle}>{UIStrings.FRIEND_REQUESTS_SUBTITLE}</Text>
          </View>
      </TouchableOpacity>
      <View style={{borderBottomWidth: 1, marginVertical: 2, borderColor: Constants.BACKGROUND_GREY_COLOR, width: '90%', alignSelf: 'center'}} />
      <TouchableOpacity style={{flexDirection: 'row', padding: 10}} onPress={()=>{onClose();navigate("AllAccessRequests");}}>
          <Icon name="credit-card-alt" type="FontAwesome" style={[styles.icon, {fontSize: 16, color: Constants.APP_THEME_COLORS[0]}]} />
          <View style={{flexDirection: 'column', alignSelf: 'center'}}>
              <Text style={styles.circlePopupOptionTitle}>{UIStrings.ACCESS_CARD_REQUESTS}</Text>
              <Text numberOfLines={1} style={styles.circlePopupOptionSubtitle}>{UIStrings.ACCESS_CARD_REQUESTS_SUBTITLE}</Text>
          </View>
      </TouchableOpacity>
      <View style={{borderBottomWidth: 1, marginVertical: 2, borderColor: Constants.BACKGROUND_GREY_COLOR, width: '90%', alignSelf: 'center'}} />
      <TouchableOpacity style={{flexDirection: 'row', padding: 10}} onPress={()=>{onClose();navigate("AllPosts");}}>
          <Icon name="microphone-alt" type="FontAwesome5" style={[styles.icon, {fontSize: 22, color: Constants.APP_THEME_COLORS[0]}]} />
          <View style={{flexDirection: 'column', alignSelf: 'center'}}>
              <Text style={styles.circlePopupOptionTitle}>{UIStrings.BROADCAST}</Text>
              <Text numberOfLines={1} style={styles.circlePopupOptionSubtitle}>{UIStrings.BROADCAST_SUBTITLE}</Text>
          </View>
      </TouchableOpacity>
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
    height: 280,
  },
  circleIconText:{
    color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
    fontSize: 12,
    fontFamily: Constants.APP_BODY_FONT,
    textAlign: 'center',
    paddingTop: 3 
  },
  circlePopupOptionTitle:{
    fontFamily: Constants.APP_SUBTITLE_FONT,
    fontSize: 14,
    color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
    paddingBottom: 5,
  },
  circlePopupOptionSubtitle:{
    fontFamily: Constants.APP_BODY_FONT,
    fontSize: 12,
    color: Constants.SUBTEXT_COLOR_FOR_LIGHT_BACKGROUND
  },
  icon:{
    width: 40, 
    alignSelf: 'center', 
    justifyContent: 'center',
    padding: 10,
    fontSize: 16, 
  }
});

export default CirclePopup;