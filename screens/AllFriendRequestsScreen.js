import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, PermissionsAndroid, TouchableOpacity, Image} from 'react-native';
import {Picker, TextInput, StatusBar } from 'react-native';
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
import BottomMenu from '../components/BottomMenu';
import CommonStyles from '../components/CommonStyles';
import { FlatList } from 'react-native-gesture-handler';
import FriendRequestButton from '../components/FriendRequestButton';
import TopRightButton from '../components/TopRightButton';
import LottieView from 'lottie-react-native'

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
        };

    }

    componentDidMount(){
        this._isMounted = true;
        firebase.analytics().setCurrentScreen("AllFriendRequests", "AllFriendRequestsScreen");
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

    render()
    {
        return (
            <View style={{flexDirection: 'column', height: "100%", width: '100%'}}>
            <StatusBar  translucent backgroundColor={Constants.APP_STATUS_BAR_COLOR} />
            <TouchableOpacity onPress={()=>this.props.navigation.navigate('AddToCircle')} style={{zIndex: 100, position: 'absolute', top: 30, right: 10, borderRadius: 20, width: 40, height: 40, backgroundColor: Constants.SUCCESS_COLOR, justifyContent: 'center'}}>
                <Icon name="adduser" type="AntDesign" style={{color: 'white', fontSize: 16, textAlign: 'center'}} />
            </TouchableOpacity>

             {/* Banner */}
             <View style={{justifyContent: "center", flexDirection: 'column', position: "absolute", top: 0, height: Constants.EXTRA_SMALL_BANNER_HEIGHT, width: "100%"}}>
              <LinearGradient colors={Constants.APP_THEME_COLORS} style={{alignContent: 'center', justifyContent: "center", flexDirection: 'column', width: '100%', height: '100%'}}>
                <Text style={{textAlign: 'center', marginBottom: 5, fontFamily: Constants.APP_SUBTITLE_FONT, fontSize: 18, color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND}}>{UIStrings.CIRCLE_INVITES}</Text>
                <Text style={{textAlign: 'center', marginBottom: 20, fontFamily: Constants.APP_BODY_FONT, fontSize: 12, color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND}}>{UIStrings.MANAGE_CIRCLE_INVITES}</Text>
              </LinearGradient>
             </View>

             {/* Arch */}
             <View style={{position: "absolute", borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderRadius: 50, bottom: 0, height: Constants.EXTRA_LARGE_ARCH_SCREEN_HEIGHT, width: "100%", backgroundColor: Constants.BACKGROUND_WHITE_COLOR}}>
                <View style={{marginHorizontal: "5%", marginTop: "5%", marginBottom: 60}}>
                    {
                        this.state.loading ? 
                        <LottieView style={{alignSelf: 'center', width: '70%', height: 100, marginVertical: 20, marginHorizontal: 10}} 
                        source={require("../assets/resources/loading.json")} autoPlay loop />
                        :
                        <View style={{flexDirection: 'column'}}>
                            {/* The toggle button */}
                            <View style={{flexDirection: 'row', alignSelf: 'center', marginBottom: 5}}>
                                    <TouchableOpacity  onPress={()=>{this.onTogglePress(false)}}
                                        style={[styles.leftButton, this.state.receivedRequestsPressed ? styles.buttonHighlighted : styles.buttonInactive]}>
                                        <Text style={[styles.toggleButtonText, this.state.receivedRequestsPressed ? styles.toggleButtonTextHighlighted : styles.toggleButtonTextInactive]}>Received</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity  onPress={()=>{this.onTogglePress(true)}}
                                        style={[styles.rightButton, this.state.receivedRequestsPressed ? styles.buttonInactive : styles.buttonHighlighted]}>
                                        <Text style={[styles.toggleButtonText, this.state.receivedRequestsPressed ? styles.toggleButtonTextInactive : styles.toggleButtonTextHighlighted]}>Sent</Text>
                                    </TouchableOpacity>
                            </View>

                            {this.state.count == 0 ? <Text style={styles.noPostsText}>{this.state.receivedRequestsPressed ? UIStrings.ADD_PEOPLE_COMFORTABLE_SHARING : UIStrings.TIP_EXPAND_CIRCLE_INCREASE_ACTIVITY}</Text> : null}
                            {this.state.count == 0 ? 
                                <View style={{marginTop: 30, alignSelf: 'center', alignContent: 'center'}}>
                                    <RoundIconWithBackgroundAndCaptionButton iconParams={{icon:"adduser", type:"AntDesign", size: 28}} 
                                    colors={Constants.APP_THEME_COLORS} onPress={()=>{this.props.navigation.navigate('AddToCircle')}} 
                                    textColor={Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND} caption={UIStrings.NEW} />
                                </View>
                                : 
                                null
                            }
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

              {/* Bottom menu */}
              <BottomMenu navigation={this.props.navigation} />            
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
        borderWidth: 0.5,
        borderColor: Constants.BRAND_BACKGROUND_COLOR,
        width: 100,
        height: 40,
        borderBottomLeftRadius: 25,
        borderTopLeftRadius: 25
    },
    buttonHighlighted:{
        backgroundColor: Constants.BRAND_BACKGROUND_COLOR,
    },
    buttonInactive:{
        backgroundColor: 'transparent',
    },
    rightButton:{
        alignSelf: 'center',
        borderWidth: 0.5,
        borderColor: Constants.BRAND_BACKGROUND_COLOR,
        width: 100,
        height: 40,
        borderBottomRightRadius: 25,
        borderTopRightRadius: 25
    },
    toggleButtonText:{
        textAlign: 'center',
        padding: 10,
        fontFamily: Constants.APP_TITLE_FONT,
        fontSize: 14,
        height: '100%'
    },
    toggleButtonTextHighlighted:{
        color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND
    },
    toggleButtonTextInactive:{
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND
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
        fontSize: 11,
        padding: 5 
    }
})