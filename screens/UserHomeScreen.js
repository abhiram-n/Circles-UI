import React, { Component } from "react";
import { StyleSheet, BackHandler, Text, View, StatusBar, ActivityIndicator, Image, FlatList, TouchableOpacity, Modal, NativeModules } from "react-native";
import * as Constants from "../helpers/Constants";
import * as UIStrings from "../helpers/UIStrings";
import { Button, Icon, Input, InputGroup } from "native-base";
import LinearGradient from "react-native-linear-gradient";
import firebase from "react-native-firebase";
import * as Utilities from "../helpers/Utilities";
import changeNavigationBarColor from "react-native-navigation-bar-color";
import * as AuthHelpers from "../helpers/AuthHelpers";
import * as NavigationHelpers from "../helpers/NavigationHelpers";
import * as VirgilEncryptionHelpers from "../helpers/VirgilEncryptionHelpers";
import IconWithCaptionButton from "../components/IconWithCaptionButton";
import RoundIconWithBackgroundAndCaptionButton from "../components/RoundIconWithBackgroundAndCaptionButton";
import RoundImageWithCaptionButton from "../components/RoundImageWithCaptionButton";
import FriendRequestButton from "../components/FriendRequestButton";
import TopRightButton from "../components/TopRightButton";
import CreditCardWithButton from "../components/CreditCardWithButtons";
import { ScrollView } from "react-native-gesture-handler";
import TopLeftButton from "../components/TopLeftButton";
import CommonStyles from '../components/CommonStyles';
import InfoPopup from "../components/InfoPopup";
import LottieView from 'lottie-react-native';

const GET_USERS_IN_CIRCLE = "/user/friends"
const NEW_FRIEND_REQUEST = "/friendRequests/new"
const ADD_BUTTON_KEY = "ADD_BUTTON"

export default class UserHomeScreen extends Component {
  _isMounted = false;
  constructor(props){
    super(props);
    this.state = {
      numFriends: -1,
      friends: [],
      loading: false,
      showCircleTooltip: false,
      spotsLeft: Constants.MAX_NUMBER_IN_CIRCLE,
      errorString: null,
      expandOptions: false,
      showNotificationPopup: false
    }

    this.askNotification = this.props.navigation.getParam("askNotification", false);
    this.initializeEncryption = this.props.navigation.getParam("initializeEncryption", false);
  }

  componentDidMount() {
    changeNavigationBarColor(Constants.BACKGROUND_WHITE_COLOR); 
    this._isMounted = true;
    firebase.analytics().setCurrentScreen("Home");
    if (this.initializeEncryption){
      VirgilEncryptionHelpers.initializeVirgilForUser();
    }

    if (this.askNotification){
      setTimeout(()=>{
        if (this._isMounted){
          this.setState({showNotificationPopup: true})
        }, 
        Constants.NOTIFICATION_POPUP_DELAY);
    }
    
    this.getUsersInCirlce();
  }

  componentWillUnmount(){
    this._isMounted = false;
  }

  async getUsersInCirlce(){
    this.setState({loading: true, errorString: null});
    fetch(Constants.SERVER_ENDPOINT + GET_USERS_IN_CIRCLE, { method: Constants.GET_METHOD, headers:  await AuthHelpers.getRequestHeaders() })
    .then((response)=>{
      if (!this._isMounted){
        return null;
      }

      this.setState({loading: false});
      if (response.ok){
        return response.json();
      }

      if(response.status == Constants.TOKEN_EXPIRED_STATUS_CODE){
        Utilities.showLongToast(UIStrings.SESSION_EXPIRED);
        return null;
      }

      this.setState({errorString: UIStrings.ERROR_FINDING_CIRCLE_USERS})
      return null;
    })
    .then((responseJson)=>{
      if (responseJson != null){
        if (responseJson.friends != null){
          let friends = responseJson.friends.map(item=>{ return {name: item.name, profileImgUrl: item.profileImgUrl, id: item.id, numCards: item.numCards, key: item.id.toString()}});
          
          // Tell the Flatlist to append the add button if Circle is not maxed out yet.
          if (responseJson.count > 0 && responseJson.count < Constants.MAX_NUMBER_IN_CIRCLE){
            addButton = {key: ADD_BUTTON_KEY}
            friends.push(addButton);
          }

          this.setState({numFriends: responseJson.count, friends: friends, spotsLeft: Constants.MAX_NUMBER_IN_CIRCLE - responseJson.count});
        }
      }
    })
    .catch((error)=>{
      if (!this._isMounted){
        return null;
      }

      this.setState({loading: false, errorString: UIStrings.COULD_NOT_CONNECT_SERVER});
      console.log("Error getting users in Circle: " + error);
    })
  }
  
  onFriendProfilePress(item){
    let params = {userId: item.id}
    this.props.navigation.navigate('Profile', params);
  }

  getTruncatedName(item){
    if (item.name == null || item.name == '' || item.name.indexOf(' ') == -1){
      return item.name;
    }

    return item.name.split(" ")[0];
  }

  render() {
    return (
      <View style={{  flexDirection: 'column', height: "100%", width: '100%'}}>
      <StatusBar translucent backgroundColor={Constants.APP_STATUS_BAR_COLOR} />
      <TopLeftButton color={Constants.TEXT_COLOR_FOR_DARK_BACKGROUND} imgPath={require("../assets/resources/logo_tp.png")} />
      
      {/* Menu on the top right */}
      <View style={{zIndex: 101, position: 'absolute', top: 20, right: 10, flexDirection: 'column', justifyContent: 'center'}}>
        <Icon name="ellipsis1" type="AntDesign" onPress={()=>this.setState(prevState=>({expandOptions: !prevState.expandOptions}))} style={{paddingVertical: 8, fontSize: 18, color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND}} />
        {
          this.state.expandOptions ? 
          <View>
            <Icon name="user" type="AntDesign" onPress={()=>this.props.navigation.navigate('Profile')} style={{paddingVertical: 8, fontSize: 18, color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND}} />
            <Icon name="mail" type="AntDesign" onPress={()=>this.props.navigation.navigate('ContactUs')} style={{paddingVertical: 8, fontSize: 18, color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND}} />
            <Icon name="logout" type="AntDesign" onPress={()=>NavigationHelpers.logout(this.props.navigation)} style={{paddingVertical: 8, fontSize: 18, color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND}} />
          </View>
          :
          null
        }
      </View>

      {/* Prompt about notifications */}
      <InfoPopup lottieProps={{name: require("../assets/resources/notification_req.json"), speed: 2}} isVisible={this.state.showNotificationPopup} 
                 title={UIStrings.NOTIFICATIONS} content={UIStrings.ENABLE_NOTIFICATIONS_EXPLANATION} onClose={()=>{this.setState({showNotificationPopup: false})}} 
                 buttonParams={{title: "Take me there", onPress:()=>{this.setState({showNotificationPopup: false}); NativeModules.Circles.openChannelSettings()}}}/>

      {/* The top banner */}
       <View style={{alignItems: "center", position: "absolute", top: 0, height: Constants.SMALL_BANNER_HEIGHT, width: "100%"}}>
        <LinearGradient colors={Constants.APP_THEME_COLORS} style={{flexDirection: "column", justifyContent: 'center', width: '100%', height: '100%'}} >
          <TouchableOpacity onPress={()=>this.props.navigation.navigate("SearchCard")}>
            <LottieView style={{alignSelf: 'center', width: '70%', height: 70, marginBottom: 5, marginHorizontal: 10}} 
                        source={require("../assets/resources/search.json")} autoPlay loop />
            <Text style={{textAlign: 'center', color: 'white', fontFamily: Constants.APP_SUBTITLE_FONT, fontSize: 14}}>{UIStrings.FIND_CARD}</Text>
          </TouchableOpacity>
        </LinearGradient>
       </View>

      {/* About circle tool tip */}
      <InfoPopup lottieProps={{name: require("../assets/resources/form_circle.json")}} onClose={()=>this.setState({showCircleTooltip: false})} 
        title={UIStrings.ABOUT_YOUR_CIRCLE} isVisible={this.state.showCircleTooltip} content={UIStrings.ABOUT_CIRCLE_BODY} />
       
       {/* The arch component */}
       <View style={{ position: "absolute", borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderRadius: 80, bottom: 0, height: Constants.LARGE_ARCH_SCREEN_HEIGHT, width: "100%", backgroundColor: Constants.BACKGROUND_WHITE_COLOR}}>
       <View style={{flexDirection: 'row', justifyContent: 'center', alignSelf: 'center', alignContent: 'center'}}>
         <Text style={styles.title}>{UIStrings.MY_CIRCLE}</Text>
         <Icon name="info-circle" type="FontAwesome5" style={{alignSelf: 'center', fontSize: 12, padding: 5, paddingLeft: 2}} onPress={()=>this.setState({showCircleTooltip: true})} />
       </View>
       <Text style={styles.subtitle}>{UIStrings.SPOTS_LEFT} {this.state.spotsLeft}/{Constants.MAX_NUMBER_IN_CIRCLE}</Text>
        <ScrollView horizontal={false} style={{flex: 1,marginHorizontal: "5%", marginTop: "7%", marginBottom: Constants.BOTTOM_MENU_HEIGHT}}>
          { this.state.loading ? 
            <LottieView style={{alignSelf: 'center', width: '70%', height: 90, marginVertical: 5, marginHorizontal: 10}} 
            source={require("../assets/resources/loading.json")} autoPlay loop />
            : 
            null }
          { this.state.errorString != null ? <Text style={[styles.title, {fontSize: 14, color: Constants.APP_LOADING_COLOR, marginTop: 20}]}>{UIStrings.COULD_NOT_CONNECT_SERVER}</Text> : null }
          { this.state.numFriends == 0 ? 
            <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 40, alignSelf: 'center'}}>
              <RoundIconWithBackgroundAndCaptionButton 
                colors={Constants.APP_THEME_COLORS} onPress={()=>this.props.navigation.navigate('AddToCircle')}
                icon="adduser" iconType="AntDesign" caption={UIStrings.ADD_TO_CIRCLE} /> 
              <RoundIconWithBackgroundAndCaptionButton 
                colors={Constants.APP_THEME_COLORS} onPress={()=>this.props.navigation.navigate('HowItWorks')}
                icon="bulb1" iconType="AntDesign" caption={UIStrings.HOW_IT_WORKS } /> 
            </View>
          : null}
          {this.state.numFriends > 0 ?
            <FlatList contentContainerStyle={{alignItems: 'center', height: '100%'}}
              showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}
              data={this.state.friends} numColumns={3}
              renderItem={({item}) => 
                <View>
                  {
                    item.key == ADD_BUTTON_KEY ? 
                    <RoundIconWithBackgroundAndCaptionButton 
                    colors={Constants.APP_THEME_COLORS} onPress={()=>this.props.navigation.navigate('AddToCircle')}
                    isLarge={false} icon="adduser" iconType="AntDesign"
                    caption={UIStrings.ADD} /> 
                    :
                    <RoundImageWithCaptionButton onPress={()=>this.onFriendProfilePress(item)} caption={this.getTruncatedName(item)} 
                    imgUri={item.profileImgUrl}  subtitle={UIStrings.CARDS_COLON.concat([item.numCards])} />                  
                  }
                </View>
            } />
          : null
          }
         </ScrollView>
       </View>

        {/* Bottom menu */}
        <View style={{backgroundColor:Constants.BACKGROUND_WHITE_COLOR, zIndex: 99, position: 'absolute', bottom: 0, flexDirection: 'row', justifyContent: 'center', height: Constants.BOTTOM_MENU_HEIGHT, width: '100%', padding: 10}}>
                <IconWithCaptionButton icon="home" iconType="AntDesign" caption={UIStrings.HOME} onPress={()=>{this.props.navigation.navigate('UserHome')}} />
                <IconWithCaptionButton icon="notification" iconType="AntDesign" caption={UIStrings.BROADCAST} onPress={()=>{this.props.navigation.navigate('AllPosts')}} />
                <IconWithCaptionButton icon="search1" iconType="AntDesign" caption={UIStrings.TITLE_SEARCH} onPress={()=>{this.props.navigation.navigate('SearchCard')}} />
                <IconWithCaptionButton icon="unlock" iconType="AntDesign" caption={"Access"} onPress={()=>{this.props.navigation.navigate('AllAccessRequests')}} />
                <IconWithCaptionButton icon="team" iconType="AntDesign" caption={"Circle"} onPress={()=>{this.props.navigation.navigate('AllFriendRequests')}} />
        </View>
       </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  bottomLine: {
    width: "80%",
    margin: 10
  },
  buttonIcon: {
    color: "#1488cc",
    fontSize: 25
  },
  title: {
    fontSize: 22,
    textAlign: "center",
    marginTop: "7%",
    color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
    fontFamily: Constants.APP_BODY_FONT
  },
  subtitle:{
    color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
    fontFamily: Constants.APP_BODY_FONT,
    textAlign: 'center',
    marginTop: 7,
    fontSize: 14
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
