import React, { Component } from "react";
import { StyleSheet, BackHandler, Text, View, StatusBar, ActivityIndicator, Image, FlatList, TouchableOpacity, Modal } from "react-native";
import * as Constants from "../helpers/Constants";
import * as UIStrings from "../helpers/UIStrings";
import { Button, Icon, Input, InputGroup } from "native-base";
import LinearGradient from "react-native-linear-gradient";
import firebase from "react-native-firebase";
import * as Utilities from "../helpers/Utilities";
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
import CirclePopup from "../components/CirclePopup";
import InfoPopup from "../components/InfoPopup";


const GET_USERS_IN_CIRCLE = "/user/friends"
const NEW_FRIEND_REQUEST = "/friendRequests/new"

export default class UserHomeScreen extends Component {
  _isMounted = false;
  constructor(props){
    super(props);
    this.state = {
      numFriends: -1,
      friends: [],
      loading: false,
      showCirclePopup: false,
      showCircleTooltip: false,
      spotsLeft: Constants.MAX_NUMBER_IN_CIRCLE,
      errorString: null,
    }

    this.initializeEncryption = this.props.navigation.getParam("initializeEncryption", false);
  }

  componentDidMount() {
    this._isMounted = true;
    firebase.analytics().setCurrentScreen("Home");
    if (this.initializeEncryption){
      VirgilEncryptionHelpers.initializeVirgilForUser();
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
          this.setState({numFriends: responseJson.count, friends: friends, spotsLeft: Constants.MAX_NUMBER_IN_CIRCLE - friends.length});
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
  
  onCirclePress(){
    this.setState((prevState)=> ({showCirclePopup: !prevState.showCirclePopup}));
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
      <StatusBar backgroundColor={Constants.APP_THEME_COLORS[0]} />

      {/* The top banner */}
       <View style={{alignItems: "center", position: "absolute", top: 0, height: Constants.SMALL_BANNER_HEIGHT, width: "100%"}}>
        <LinearGradient colors={Constants.APP_THEME_COLORS} style={{flexDirection: "column", justifyContent: 'center', width: '100%', height: '100%'}} >
          <TouchableOpacity  onPress={()=>this.props.navigation.navigate("SearchCard")}>
            <Icon name="arrow-right" type="FontAwesome" style={{color: 'white', fontSize: 40, alignSelf: 'center', marginBottom: 10}} />
            <Text style={{textAlign: 'center', color: 'white', fontFamily: Constants.APP_SUBTITLE_FONT, fontSize: 14}}>{UIStrings.FIND_CARD}</Text>
          </TouchableOpacity>
        </LinearGradient>
       </View>

      {/* The circle tool tip */}
      <InfoPopup onClose={()=>this.setState({showCircleTooltip: false})} title={UIStrings.ABOUT_CIRCLE} 
                isVisible={this.state.showCircleTooltip} content={UIStrings.CIRCLE_TOOLTIP_EXPLAINER} />
       
       {/* The arch component */}
       <View style={{ position: "absolute", borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderRadius: 80, bottom: 0, height: Constants.LARGE_ARCH_SCREEN_HEIGHT, width: "100%", backgroundColor: Constants.BACKGROUND_WHITE_COLOR}}>
       <View style={{flexDirection: 'row', justifyContent: 'center', alignSelf: 'center', alignContent: 'center'}}>
         <Text style={styles.title}>{UIStrings.MY_CIRCLE}</Text>
         <Icon name="info-circle" type="FontAwesome5" style={{alignSelf: 'center', fontSize: 12, padding: 5}} onPress={()=>this.setState({showCircleTooltip: true})} />
       </View>
       <Text style={styles.subtitle}>{UIStrings.SPOTS_LEFT} {this.state.spotsLeft}/{Constants.MAX_NUMBER_IN_CIRCLE}</Text>
        <ScrollView horizontal={false} style={{flex: 1,marginHorizontal: "5%", marginTop: "7%", marginBottom: Constants.BOTTOM_MENU_HEIGHT}}>
          { this.state.loading ? <ActivityIndicator size="large" color={Constants.APP_LOADING_COLOR} /> : null }
          { this.state.errorString != null ? <Text style={[styles.title, {fontSize: 14, color: Constants.APP_LOADING_COLOR, marginTop: 20}]}>{UIStrings.COULD_NOT_CONNECT_SERVER}</Text> : null }
          { this.state.numFriends == 0 ? 
            <View style={{justifyContent: 'center', marginTop: 30, alignSelf: 'center'}}>
              <Text style={{textAlign: 'center', marginBottom: 10, fontFamily: Constants.APP_BODY_FONT, fontSize: 16, color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND}}>{UIStrings.WELCOME}</Text>
              <RoundIconWithBackgroundAndCaptionButton 
                colors={Constants.APP_THEME_COLORS} onPress={()=>this.props.navigation.navigate('AddToCircle')}
                isLarge={true} icon="plus" iconType="FontAwesome5"
                caption={UIStrings.ADD_FRIENDS} /> 
              <Text onPress={()=>this.props.navigation.navigate('HowItWorks')} style={{textAlign: 'center', textDecorationLine: "underline", marginTop: 25, fontFamily: Constants.APP_BODY_FONT, fontSize: 14, color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND}}>{UIStrings.HOW_IT_WORKS}</Text>
            </View>
          : null}
          {this.state.numFriends > 0 ?
            <FlatList contentContainerStyle={{alignItems: 'center', height: '100%'}}
              showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}
              data={this.state.friends} numColumns={3}
              renderItem={({item}) =>
              <RoundImageWithCaptionButton onPress={()=>this.onFriendProfilePress(item)} caption={this.getTruncatedName(item)} 
              imgUri={item.profileImgUrl}  subtitle={UIStrings.CARDS_COLON.concat([item.numCards])} />
            } />
          : null
          }
         </ScrollView>
       </View>

       {/* Circle popup */}
       { <CirclePopup  onClose={()=>this.onCirclePress()} isVisible={this.state.showCirclePopup} navigate={this.props.navigation.navigate} />  }

       {/* Bottom menu */}
       <View style={{backgroundColor:Constants.BACKGROUND_WHITE_COLOR, zIndex: 99, position: 'absolute', bottom: 0, flexDirection: 'row', justifyContent: 'center', height: Constants.BOTTOM_MENU_HEIGHT, width: '100%', padding: 10}}>
          <IconWithCaptionButton icon="home" iconType="FontAwesome5" caption={UIStrings.HOME} />
          <IconWithCaptionButton icon="user" iconType="FontAwesome5" caption={UIStrings.PROFILE} onPress={()=>{this.props.navigation.navigate('Profile')}} />
          <TouchableOpacity onPress={()=>this.onCirclePress()} style={{alignContent: 'center', justifyContent: 'center'}}>
            <View style={{flexDirection: "column", justifyContent: 'center', marginHorizontal: 5, alignContent: 'center'}}>
              <Image source={require('../assets/logo/logo_tp.png')} style={{width: 34, height: 34, borderRadius: 17, alignSelf: 'center'}} />
            </View>
          </TouchableOpacity>
          <IconWithCaptionButton icon="paper-plane" iconType="FontAwesome5" caption={UIStrings.TITLE_CONTACT_US} onPress={()=>{this.props.navigation.navigate('ContactUs')}}/>
          <IconWithCaptionButton icon="log-out" iconType="Ionicons" caption={UIStrings.SIGN_OUT} onPress={()=>NavigationHelpers.logout(this.props.navigation) } />
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
