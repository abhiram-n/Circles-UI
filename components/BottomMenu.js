import React, { Component } from "react";
import { StyleSheet, View, Text, Modal, Button } from 'react-native';
import * as Constants from '../helpers/Constants';
import * as UIStrings from '../helpers/UIStrings';
import TopRightButton from './TopRightButton';
import IconWithCaptionButton from './IconWithCaptionButton';
import { Icon, Input } from "native-base";
import { TouchableOpacity } from "react-native";

const BottomMenu = ({navigation, containerStyle}) => (
<View style={containerStyle ?? styles.containerStyle}>
    <IconWithCaptionButton icon="circle-thin" iconType="FontAwesome" caption={UIStrings.CIRCLE} onPress={()=>{navigation.navigate('UserHome')}} />
    <IconWithCaptionButton icon="credit-card" iconType="SimpleLineIcons" caption={UIStrings.REQUESTS} onPress={()=>{navigation.navigate('AllAccessRequests')}} />
    <IconWithCaptionButton icon="notification" iconType="AntDesign" caption={UIStrings.BROADCASTS} onPress={()=>{navigation.navigate('AllPosts')}} />
    <IconWithCaptionButton icon="team" iconType="AntDesign" caption={UIStrings.INVITES} onPress={()=>{navigation.navigate('AllFriendRequests')}} />
    <IconWithCaptionButton icon="user" iconType="AntDesign" caption={UIStrings.PROFILE} onPress={()=>{navigation.navigate({routeName: 'Profile', key: 'MyProfile'})}}  />
</View>
);

const styles = StyleSheet.create({
    containerStyle:{
        backgroundColor:Constants.BACKGROUND_WHITE_COLOR, 
        zIndex: 100, 
        position: 'absolute', 
        bottom: 0, 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        height: Constants.BOTTOM_MENU_HEIGHT, 
        width: '100%', 
        padding: 10}
});

export default BottomMenu;