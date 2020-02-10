import React, {Component} from 'react';
import {Clipboard, Platform, StyleSheet, Text, Linking, View, Modal, PermissionsAndroid, TouchableOpacity, Image} from 'react-native';
import { Picker, TextInput, StatusBar } from 'react-native';
import {Button, Fab, Icon} from 'native-base';
import {createStackNavigator, createAppContainer, FlatList} from 'react-navigation';
import firebase from 'react-native-firebase';
import * as Constants from '../helpers/Constants';
import * as Utilities from '../helpers/Utilities';
import * as AuthHelpers from '../helpers/AuthHelpers';
import * as UIStrings from '../helpers/UIStrings';
import IconWithCaptionButton from '../components/IconWithCaptionButton';
import * as NavigationHelpers from '../helpers/NavigationHelpers';
import CirclePopup from "../components/CirclePopup";
import CommonStyles from '../components/CommonStyles';
import TopRightButton from '../components/TopRightButton';
import GradientButton from '../components/GradientButton';
import LinearGradient from 'react-native-linear-gradient';
import RoundIconWithBackgroundAndCaptionButton from '../components/RoundIconWithBackgroundAndCaptionButton';
import FriendRequestButton from '../components/FriendRequestButton';


const SEARCH_USER_API = "/user/searchUser?idCode="
const GET_USER_IDCODE_API = "/user/idCode"
const NEW_FRIEND_REQUEST_API = "/friendRequests/new"
export default class AddToCircleScreen extends Component<Props>{
    _isMounted = false;
    constructor(props)
    {
        super(props);
        this.state = {
            floatActive: false,
            idCode: "",
            friendName: "",
            friendId: "",
            friendImgUrl: "",
            showResult: false,
            userIdCodeLoading: true,
            searchInput: "",
            numFriends: 0,
            showCirclePopup: false,
            showNoUserFound: false,
            showPopup: false,
            recipientName: null,
            searching: false
        };
    }

    componentDidMount(){
        this._isMounted = true;
        firebase.analytics().setCurrentScreen("AddToCircle");
        this.getUserIdCode();
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    async getUserIdCode(){
        this.setState({userIdCodeLoading: true});
        fetch(Constants.SERVER_ENDPOINT + GET_USER_IDCODE_API, {
            method: Constants.GET_METHOD,
            headers: await AuthHelpers.getRequestHeaders()})
        .then((response)=>{
            if (!this._isMounted){
                return null;
            }

            this.setState({userIdCodeLoading: false});
            if (response.ok){
                return response.json();
            }

            if (response.status == Constants.TOKEN_EXPIRED_STATUS_CODE){
                Utilities.showLongToast(UIStrings.SESSION_EXPIRED);
                return null;
            }

            Utilities.showLongToast(UIStrings.GENERIC_ERROR);
            return null;
        })
        .then((responseJson)=>{
            if (responseJson != null){
                this.setState({idCode: responseJson.idCode, numFriends: responseJson.numFriends})
            }
        })
        .catch((err)=>{
            if (!this._isMounted){
                return null;
            }

            this.setState({userIdCodeLoading: false})
            Utilities.showLongToast(UIStrings.GENERIC_ERROR);
            console.log('Error getting the id code: ' + err);
        })
    }

    async searchWithIdCode(){
        code = this.state.searchInput;
        if (code == null || code.length < 1){
            Utilities.showLongToast(UIStrings.ENTER_VALID_CODE)
            return null;    
        }

        if (code.toUpperCase() == this.state.idCode){
            Utilities.showLongToast(UIStrings.THAT_IS_YOUR_CODE);
            return null;
        }

        this.setState({showNoUserFound: false, showResult: false, friendId: null, friendName: null, friendImgUrl: null, searching: true});
        fetch(Constants.SERVER_ENDPOINT + SEARCH_USER_API + code, {
            method: Constants.GET_METHOD,
            headers: await AuthHelpers.getRequestHeaders()})
        .then((response)=>{
            if (!this._isMounted){
                return null;
            }

            this.setState({searching: false})
            if (response.ok){
                return response.json();
            }

            if (response.status == Constants.TOKEN_EXPIRED_STATUS_CODE){
                Utilities.showLongToast(UIStrings.SESSION_EXPIRED);
                return null;
            }

            Utilities.showLongToast(UIStrings.GENERIC_ERROR);
            return null;
        })
        .then((responseJson)=>{
            if (responseJson != null){
                if (responseJson.count == 0){
                    this.setState({showNoUserFound: true});
                    return null;
                }

                this.setState({showResult: true, friendId: responseJson.id, friendName: responseJson.name, friendImgUrl: responseJson.profileImgUrl});
            }
        })
        .catch((err)=>{
            if (!this._isMounted){
                return null;
            }
            
            this.setState({searching: false})
            Utilities.showLongToast(UIStrings.GENERIC_ERROR);
            console.log('Error searching for friends: ' + err)
            return null;
        })
    }

  openConfirmationPopup(){
      this.setState({showPopup: true, requestSubmitButtonText: UIStrings.TITLE_SEND, requestSubmitButtonColors: Constants.BUTTON_COLORS});
  }  

  async sendFriendRequest(id){
    if (id == null){
          Utilities.showLongToast(UIStrings.NO_VALID_USER_FRIEND_REQUEST);
          return;
    }

    if (this.state.numFriends == Constants.MAX_NUMBER_IN_CIRCLE){
        Utilities.showLongToast(UIStrings.TOO_MANY_IN_CIRCLE.replace("%", Constants.MAX_NUMBER_IN_CIRCLE));
        return;
    }
    
    this.setState({requestSubmitButtonText: UIStrings.SENDING});
    fetch(Constants.SERVER_ENDPOINT + NEW_FRIEND_REQUEST_API, {
      method: Constants.POST_METHOD,
      headers: await AuthHelpers.getRequestHeaders(),
      body: JSON.stringify({ to: id })
    })
    .then((response)=>{
        if (!this._isMounted) {
          return null;
        }

        if (response.ok){
          this.setState({requestSubmitButtonText: UIStrings.SENT, requestSubmitButtonColors: Constants.SUCCESS_COLORS});
          setTimeout(()=>{this.setState({showPopup: false})}, 1000);
          Utilities.showLongToast(UIStrings.REQUEST_SENT);
          return null;
        }

        this.setState({requestSubmitButtonText: UIStrings.TITLE_SEND});
        if(response.status == Constants.TOKEN_EXPIRED_STATUS_CODE){
          Utilities.showLongToast(UIStrings.SESSION_EXPIRED);
          return null;
        }

        if(response.status == Constants.CONFLICT_ERROR_STATUS_CODE){
            Utilities.showLongToast(UIStrings.FRIEND_REQUEST_ALREADY_SENT);
            return null;
        }

        Utilities.showLongToast(UIStrings.ERROR_SENDING_FRIEND_REQUEST);
        return null;
      })
      .catch((error)=>{
        if (!this._isMounted) {
          return null;
        }
        
        this.setState({requestSubmitButtonText: UIStrings.TITLE_SEND});
        Utilities.showLongToast(UIStrings.ERROR_SENDING_FRIEND_REQUEST);
        console.log("ERROR: Error sending friend request: " + error);
      })
  }


    onWhatsappPress(){
        let whatsapp_url = UIStrings.WHATSAPP_SHARE_CODE.replace('%', this.state.idCode);
        Linking.canOpenURL(whatsapp_url)
        .then((isSupported) => {
          if (!isSupported){
            alert('Oops, looks like you do not have Whatsapp on your phone.');
          }
          else{
            Linking.openURL(whatsapp_url);
          }});
    }

    onIdCodePress(){
        Clipboard.setString(this.state.idCode);
        Utilities.showShortToast(UIStrings.COPIED);
    }

    onCirclePress(){
        this.setState((prevState)=> ({showCirclePopup: !prevState.showCirclePopup}));
    }

    render()
    {
        return (
            <View style={{flexDirection: 'column', height: "100%", width: '100%'}}>
            <StatusBar backgroundColor={Constants.APP_THEME_COLORS[0]} />
             
             {/* Display the code */}
             <View style={{justifyContent: "center", flexDirection: 'column', position: "absolute", top: 0, height: Constants.SMALL_BANNER_HEIGHT, width: "100%"}}>
              <LinearGradient colors={Constants.APP_THEME_COLORS} style={{justifyContent: "center", flexDirection: 'column', width: '100%', height: '100%'}}>
                  <Text style={styles.inviteLine1}>{UIStrings.SHARE_YOUR_INVITE_CODE}</Text>
                  {
                  this.state.userIdCodeLoading ? 
                    <Text style={styles.idCodeLoading}>{UIStrings.LOADING_DOTS}</Text> : 
                    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                        <Text onPress={()=>this.onIdCodePress()} style={styles.inviteLine2}>{this.state.idCode}</Text>
                        <TouchableOpacity onPress={()=>this.onWhatsappPress()} style={{marginTop: 20}}>
                            <Image  source={require("../assets/logo/whatsapp.png")} style={{marginLeft: 15, alignSelf: 'center', width: 25, height: 25, }}/>
                        </TouchableOpacity>
                    </View>
                  }
                  <Text style={styles.inviteLine3}>{UIStrings.FRIENDS_FIND_YOUR_CODE}</Text>
              </LinearGradient>
             </View>


        {/* Popup view */}
        {
            <Modal visible={this.state.showPopup} transparent={true} onRequestClose={()=>{this.setState({showPopup: false})}}>
              <View style={CommonStyles.popupContainer}>
                <View style={CommonStyles.popup}>
                  <TopRightButton height={50} color={Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND} iconName="times" onPress={()=>{this.setState({showPopup: false})}} />
                  <Text style={CommonStyles.popupTitle}>{UIStrings.ADD_TO_CIRCLE}</Text>
                  <Text style={CommonStyles.popupText}>
                    {UIStrings.SEND_CIRCLE_REQUEST_CONFIRMATION.replace('%', this.state.friendName)}
                  </Text>
                  <View style={{marginBottom: 30}} />
                  <GradientButton colors={this.state.requestSubmitButtonColors} onPress={()=>this.sendFriendRequest(this.state.friendId)} title={this.state.requestSubmitButtonText} />
                </View>
                </View>
              </Modal>
        }

             {/* Search space */}
             <View style={{position: "absolute", borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderRadius: 50, bottom: 0, height: Constants.LARGE_ARCH_SCREEN_HEIGHT, width: "100%", backgroundColor: Constants.BACKGROUND_WHITE_COLOR}}>
               <View style={{marginHorizontal: "15%", marginTop: "15%", marginBottom: 60}}>
                <Text style={[styles.inviteLine1, {color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND}]}>{UIStrings.SEARCH_FRIENDS}</Text>
                                
                <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 10}}>
                    <TextInput placeholder={UIStrings.ENTER_FRIENDS_CODE} placeholderTextColor={Constants.APP_PLACEHOLDER_TEXT_COLOR} 
                               style={styles.input} onChangeText={(val)=>this.setState({searchInput: val})}/>
                    <Text onPress={()=>this.searchWithIdCode()} style={{paddingLeft: 7, fontFamily: Constants.APP_TITLE_FONT,textAlignVertical: 'center', color: Constants.HEADING_COLOR, fontSize: 15}}>Go</Text>
                </View>
                {
                    this.state.numFriends < Constants.MAX_NUMBER_IN_CIRCLE ?
                    <Text style={styles.circleCount}>
                        {UIStrings.NUM_FRIENDS_CAN_ADD_TO_CIRCLE.replace('%', Constants.MAX_NUMBER_IN_CIRCLE - this.state.numFriends)}
                    </Text>
                    :
                    <Text style={styles.circleCount}>
                        {UIStrings.LIMIT_REACHED_CIRCLE}
                    </Text>
                }

                <View style={{marginTop: 30}}>
                    {
                        this.state.showResult ?
                            <FriendRequestButton imageSource={this.state.friendImgUrl} name={this.state.friendName} 
                                onPress={()=>this.openConfirmationPopup()}  iconName="plus" iconColor={Constants.SUCCESS_COLOR} status={UIStrings.ADD}/>
                            :
                            null
                    }
                    {
                        this.state.searching ? 
                            <Text style={[styles.inviteLine3, {color: Constants.APP_LOADING_COLOR}]}> {UIStrings.LOADING_DOTS}</Text>
                            : 
                            null
                    }
                    {
                        this.state.showNoUserFound ? 
                            <Text style={[styles.inviteLine3, {color: Constants.APP_LOADING_COLOR}]}> {UIStrings.NO_USERS_FOUND_ID}</Text>
                            : 
                            null
                    }
                </View>
               </View>
             </View>

            {/* Circle options */}
            { <CirclePopup  onClose={()=>this.onCirclePress()} isVisible={this.state.showCirclePopup} navigate={this.props.navigation.navigate} />  }

              {/* Bottom menu */}
              <View style={{backgroundColor:Constants.BACKGROUND_WHITE_COLOR, zIndex: 99, position: 'absolute', bottom: 0, flexDirection: 'row', justifyContent: 'center', height: Constants.BOTTOM_MENU_HEIGHT, width: '100%', padding: 10}}>
                  <IconWithCaptionButton icon="home" iconType="FontAwesome5" caption={UIStrings.HOME} onPress={()=>NavigationHelpers.clearStackAndNavigate('UserHome', this.props.navigation)} />
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
    container:{
        flex:1, 
        flexDirection: 'column', 
        justifyContent: 'center'
    },
    idCodeLoading:{
        fontSize: 12,
        color: Constants.APP_LOADING_COLOR,
        fontFamily: Constants.APP_BODY_FONT,
        textAlign: 'center'
    },
    inviteLine1:{
        textAlign: 'center', 
        color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND,
        fontFamily: Constants.APP_BODY_FONT,
        fontSize: 20,
        marginBottom: 4,
    },
    inviteLine2:{
        textAlign: 'center', 
        color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND,
        fontFamily: Constants.APP_TITLE_FONT,
        fontSize: 40,
        marginVertical: 7
    },
    inviteLine3:{
        textAlign: 'center', 
        color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND,
        fontFamily: Constants.APP_BODY_FONT,
        fontSize: 12,
        marginTop: 4,
        marginBottom: 20
    },
    input:{
        padding: 12,
        width: '90%', 
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
        fontFamily: Constants.APP_BODY_FONT,
        alignSelf: 'flex-start',
        backgroundColor: Constants.BACKGROUND_WHITE_COLOR,
        borderRadius: 20,
        elevation: 10 
    },
    circleCount:{
        textAlign: 'center', 
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
        fontFamily: Constants.APP_BODY_FONT,
        fontSize: 12,
        padding: 5,
        paddingTop: 8
    }
})