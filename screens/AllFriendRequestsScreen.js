import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, PermissionsAndroid, TouchableOpacity, Image} from 'react-native';
import { Picker, TextInput, StatusBar } from 'react-native';
import {Button, Fab, Icon, Segment} from 'native-base';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import firebase from 'react-native-firebase';
import * as Constants from '../helpers/Constants';
import * as Utilities from '../helpers/Utilities';
import * as AuthHelpers from '../helpers/AuthHelpers';
import * as UIStrings from '../helpers/UIStrings';
import * as NavigationHelpers from '../helpers/NavigationHelpers';
import LinearGradient from 'react-native-linear-gradient';
import RoundIconWithBackgroundAndCaptionButton from '../components/RoundIconWithBackgroundAndCaptionButton';
import IconWithCaptionButton from '../components/IconWithCaptionButton';
import CirclePopup from "../components/CirclePopup";
import CommonStyles from '../components/CommonStyles';
import { FlatList } from 'react-native-gesture-handler';
import FriendRequestButton from '../components/FriendRequestButton';
import TopRightButton from '../components/TopRightButton';


const GET_USER_FRIEND_REQUESTS = "/friendRequests"
const REQUESTS_RECEIVED_SUFFIX = "/received"
const REQUESTS_SENT_SUFFIX = "/sent"
export default class AllFriendRequestsScreen extends Component<Props>{
    _isMounted = false;
    constructor(props)
    {
        super(props);
        this.state = {
            receivedRequestsPressed: true,
            requests: null,
            loading: false,
            count: 0,
            showCirclePopup: false
        };

    }

    componentDidMount(){
        this._isMounted = true;
        firebase.analytics().setCurrentScreen("AllFriendRequests");
        this.getUserRequests();
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    async getUserRequests(){
        this.setState({loading: true});
        suffix = this.state.receivedRequestsPressed ? REQUESTS_RECEIVED_SUFFIX : REQUESTS_SENT_SUFFIX;
        fetch(Constants.SERVER_ENDPOINT + GET_USER_FRIEND_REQUESTS + suffix, {
            method: Constants.GET_METHOD,
            headers: await AuthHelpers.getRequestHeaders()})
        .then((response)=>{
            if (!this._isMounted){
                return null;
            }

            if (response.ok){
                return response.json();
            }

            this.setState({loading: false});
            if (response.status == Constants.TOKEN_EXPIRED_STATUS_CODE){
                Utilities.showLongToast(UIStrings.SESSION_EXPIRED);
                return null;
            }

            Utilities.showLongToast(UIStrings.GENERIC_ERROR);
            return null;
        })
        .then((responseJson)=>{
            if (responseJson != null){
                var requestsArray = responseJson.requests == null ? [] : responseJson.requests.map((item) =>{
                    return {name: item.name, id: item.id, requestId: item.requestId, profileImgUrl: item.profileImgUrl, phone: item.phoneNumber,
                            createdOn: item.createdOn, status: item.status, resolvedOn: item.resolvedOn, key: item.id.toString()}});

                this.setState({loading: false, requests: requestsArray, count: responseJson.count});
            }
        })
        .catch((err)=>{
            if (!this._isMounted){
                return null;
            }

            this.setState({loading: false})
            Utilities.showLongToast(UIStrings.GENERIC_ERROR);
            console.log('Error getting the id code: ' + err);
        })
    }

    onTogglePress(sent){
        if (this.state.receivedRequestsPressed == !sent){
            return;
        }

        this.setState({receivedRequestsPressed: !sent}, ()=>{this.getUserRequests()});
    }

    getIconForRequest(status){
        switch (status){
            case Constants.FRIEND_REQUEST_ACCEPTED:
                return Constants.FRIEND_REQUEST_ACCEPTED_ICON;
            case Constants.FRIEND_REQUEST_DECLINED:
                return Constants.FRIEND_REQUEST_DECLINED_ICON;
        }

        return Constants.FRIEND_REQUEST_ACTIVE_ICON;
    }

    getIconColorForRequest(status){
        switch (status){
            case Constants.FRIEND_REQUEST_ACCEPTED:
                return Constants.SUCCESS_COLOR;
            case Constants.FRIEND_REQUEST_DECLINED:
                return Constants.FRIEND_REQUEST_DECLINED_COLOR;
        }

        return Constants.FRIEND_REQUEST_ACTIVE_COLOR;
    }

    getIconNameForRequest(status){
        switch (status){
            case Constants.FRIEND_REQUEST_ACCEPTED:
                return UIStrings.ACCEPTED;
            case Constants.FRIEND_REQUEST_DECLINED:
                return UIStrings.DECLINED;
        }

        return UIStrings.PENDING;
    }

    onRequestPress(item){
        if (item == null){
            return;
        }

        let isUserSender = !this.state.receivedRequestsPressed;
        this.props.navigation.navigate('FriendRequestInfo', {isUserSender: isUserSender, requestId: item.requestId});
    }

    onCirclePress(){
      this.setState((prevState)=> ({showCirclePopup: !prevState.showCirclePopup}));
    }

    render()
    {
        return (
            <View style={{flexDirection: 'column', height: "100%", width: '100%'}}>
            <StatusBar  backgroundColor={Constants.APP_THEME_COLORS[0]} />
            <TouchableOpacity onPress={()=>this.props.navigation.navigate('AddToCircle')} style={{zIndex: 100, position: 'absolute', top: 20, right: 10, borderRadius: 20, width: 40, height: 40, backgroundColor: Constants.SUCCESS_COLOR, justifyContent: 'center'}}>
                <Icon name="plus" type="FontAwesome5" style={{color: 'white', fontSize: 16, textAlign: 'center'}} />
            </TouchableOpacity>

             {/* Banner */}
             <View style={{justifyContent: "center", flexDirection: 'column', position: "absolute", top: 0, height: Constants.SMALL_BANNER_HEIGHT, width: "100%"}}>
              <LinearGradient colors={Constants.APP_THEME_COLORS} style={{alignContent: 'center', justifyContent: "center", flexDirection: 'column', width: '100%', height: '100%'}}>
                <Text style={{textAlign: 'center', marginBottom: 20, fontFamily: Constants.APP_SUBTITLE_FONT, fontSize: 18, color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND}}>{UIStrings.ADD_TO_CIRCLE_REQUESTS}</Text>
                <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                    <TouchableOpacity  onPress={()=>{this.onTogglePress(false)}}
                        style={[styles.leftButton, this.state.receivedRequestsPressed ? styles.buttonHighlighted : styles.buttonInactive]}>
                        <Text style={[styles.toggleButtonText, this.state.receivedRequestsPressed ? styles.toggleButtonTextHighlighted : styles.toggleButtonTextInactive]}>Received</Text>
                    </TouchableOpacity>
                    <TouchableOpacity  onPress={()=>{this.onTogglePress(true)}}
                        style={[styles.rightButton, this.state.receivedRequestsPressed ? styles.buttonInactive : styles.buttonHighlighted]}>
                        <Text style={[styles.toggleButtonText, this.state.receivedRequestsPressed ? styles.toggleButtonTextInactive : styles.toggleButtonTextHighlighted]}>Sent</Text>
                    </TouchableOpacity>
                </View>
              </LinearGradient>
             </View>

             {/* Arch */}
             <View style={{position: "absolute", borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderRadius: 50, bottom: 0, height: Constants.LARGE_ARCH_SCREEN_HEIGHT, width: "100%", backgroundColor: Constants.BACKGROUND_WHITE_COLOR}}>
                <View style={{marginHorizontal: "5%", marginTop: "10%", marginBottom: 60}}>
                    {
                        this.state.loading ? <Text style={styles.requestsLoading}>{UIStrings.LOADING_DOTS}</Text>
                        :
                        <View style={{flexDirection: 'column'}}>
                            <Text style={{textAlign: 'center', fontFamily: Constants.APP_SUBTITLE_FONT, fontSize: 18, padding: 10, color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND}}>{UIStrings.NUM_REQUESTS}{this.state.count}</Text>
                            {this.state.count == 0 ? <Text style={styles.noPostsText}>{UIStrings.TIP_EXPAND_CIRCLE_INCREASE_ACTIVITY}</Text> : null}
                            <FlatList
                                contentContainerStyle={{alignItems: 'center'}}
                                data={this.state.requests}
                                showsVerticalScrollIndicator={false}
                                renderItem={({item})=>
                                    <FriendRequestButton imageSource={item.profileImgUrl} onPress={()=>this.onRequestPress(item)} name={item.name} subtitle={item.phone}
                                    iconName={this.getIconForRequest(item.status)} iconColor={this.getIconColorForRequest(item.status)} status={this.getIconNameForRequest(item.status)}/>
                                }
                            />
                        </View>

                    }
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
    requestsLoading:{
        fontSize: 12,
        color: Constants.APP_LOADING_COLOR,
        fontFamily: Constants.APP_BODY_FONT,
        textAlign: 'center'
    },
    leftButton:{
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: Constants.BACKGROUND_WHITE_COLOR,
        width: 120,
        height: 50,
        borderBottomLeftRadius: 25,
        borderTopLeftRadius: 25
    },
    buttonHighlighted:{
        backgroundColor: Constants.BACKGROUND_WHITE_COLOR,
    },
    buttonInactive:{
        backgroundColor: 'transparent',
    },
    rightButton:{
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: Constants.BACKGROUND_WHITE_COLOR,
        width: 120,
        height: 50,
        borderBottomRightRadius: 25,
        borderTopRightRadius: 25
    },
    toggleButtonText:{
        textAlign: 'center',
        padding: 10,
        fontFamily: Constants.APP_TITLE_FONT,
        fontSize: 18,
        height: '100%'
    },
    toggleButtonTextHighlighted:{
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND
    },
    toggleButtonTextInactive:{
        color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND
    },
    input:{
        padding: 12,
        width: '90%',
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
        fontFamily: Constants.APP_BODY_FONT,
        marginTop: 30,
        alignSelf: 'center',
        backgroundColor: Constants.BACKGROUND_WHITE_COLOR,
        borderRadius: 20,
        elevation: 10
    },
    noPostsText:{
        textAlign: 'center', 
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
        fontFamily: Constants.APP_BODY_FONT,
        fontSize: 13,
        padding: 5 
    }
})