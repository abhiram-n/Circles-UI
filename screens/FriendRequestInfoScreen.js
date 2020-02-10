import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import { ActivityIndicator, Picker, TextInput, StatusBar } from 'react-native';
import {Button, Fab, Icon} from 'native-base';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import firebase from 'react-native-firebase';
import * as Constants from '../helpers/Constants';
import * as UIStrings from '../helpers/UIStrings';
import * as Utilities from '../helpers/Utilities';
import * as AuthHelpers from '../helpers/AuthHelpers';
import * as NavigationHelpers from '../helpers/NavigationHelpers';
import LinearGradient from 'react-native-linear-gradient';
import CommonStyles from '../components/CommonStyles';
import TopLeftButton from '../components/TopLeftButton';
import RoundImageWithCaptionButton from '../components/RoundImageWithCaptionButton';
import CreditCardWithText from '../components/CreditCardWithText';
import IconWithCaptionButton from '../components/IconWithCaptionButton';
import CirclePopup from '../components/CirclePopup';
import RowWithTextLeftAndRight from '../components/RowWithTextLeftAndRight';

const GET_FRIEND_REQUEST_INFO_API = "/friendRequests?id=";
const RESPOND_TO_REQUEST_API = "/friendRequests/respond"

export default class FriendRequestInfoScreen extends Component<Props>{
    _isMounted = false;
    constructor(props)
    {
        super(props);
        this.state = {
            showCirclePopup: false,
            loading: true,
            partnerName: null,
            partnerId: null, 
            partnerImgUrl: null,
            partnerPhoneNumber: null,
            partnerNumCards: null,
            status: null,
            createdOn: null,
            resovledOn: null,
        };

        this.requestId = this.props.navigation.getParam("requestId", Constants.NONE);
        this.isUserSender = this.props.navigation.getParam("isUserSender", true);

    }

    componentDidMount(){
        this._isMounted = true;
        firebase.analytics().setCurrentScreen("FriendRequestInfo");
        this.getRequestDetails();
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    onCirclePress(){
        this.setState((prevState)=> ({showCirclePopup: !prevState.showCirclePopup}));
    }

    async getRequestDetails(){
        this.setState({loading: true})
        fetch(Constants.SERVER_ENDPOINT + GET_FRIEND_REQUEST_INFO_API + this.requestId, 
        {
            method: Constants.GET_METHOD,
            headers: await AuthHelpers.getRequestHeaders()
        })
        .then((response)=>{
            if (!this._isMounted){
                return null;
            }

            this.setState({loading: false})
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
                this.setState({
                    partnerName: this.isUserSender ? responseJson.recipientName : responseJson.senderName,
                    partnerId: this.isUserSender ? responseJson.recipientId : responseJson.senderId,
                    partnerPhoneNumber: this.isUserSender ? responseJson.recipientPhone : responseJson.senderPhone,
                    partnerImgUrl: this.isUserSender ? responseJson.recipientImgUrl : responseJson.senderImgUrl,
                    partnerNumCards: this.isUserSender ? responseJson.numRecipientCards: responseJson.numSenderCards,
                    status: responseJson.status,
                    createdOn: responseJson.createdOn,
                    resolvedOn: responseJson.resolvedOn
                })
            }
        })
        .catch(err=>{
            if (!this._isMounted){
                return null;
            }

            this.setState({loading: false});

            Utilities.showLongToast(UIStrings.GENERIC_ERROR);
            console.log('Error getting access request info: ' + err);
        })
    }

    async respondToRequest(action){
        this.setState({loading: true})
        fetch(Constants.SERVER_ENDPOINT + RESPOND_TO_REQUEST_API, {
            method: Constants.POST_METHOD,
            headers: await AuthHelpers.getRequestHeaders(),
            body: JSON.stringify({action: action, requestId: this.requestId, limit: Constants.MAX_NUMBER_IN_CIRCLE})
        })
        .then((response)=>{
            if (!this._isMounted){
                return null;
            }

            if (response.ok){
                Utilities.showLongToast(UIStrings.ACTION_COMPLETED);
                this.getRequestDetails();
                return null;
            }

            if (response.status == Constants.PRECONDITION_FAILED_STATUS_CODE){
                Utilities.showLongToast(UIStrings.TOO_MANY_IN_CIRCLE);
                return null;
            }

            this.setState({loading: false})
            if (response.status == Constants.TOKEN_EXPIRED_STATUS_CODE){
                Utilities.showLongToast(UIStrings.SESSION_EXPIRED);
                return null;
            }

            Utilities.showLongToast(UIStrings.GENERIC_ERROR);
            return null;
        })
        .catch((err)=>{
            if (!this._isMounted){
                return null;
            }

            this.setState({loading: false})
            Utilities.showLongToast(UIStrings.GENERIC_ERROR);
            console.log('ERROR responding to access request: ' + err);
        })
    }


    getStatusTextFromStatus(status){
        switch(status){
            case Constants.FRIEND_REQUEST_ACCEPTED:
                return UIStrings.ACCEPTED
            case Constants.FRIEND_REQUEST_DECLINED:
                return UIStrings.DECLINED
        }

        return UIStrings.OPEN;
    }

    render()
    {
        return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor={Constants.BACKGROUND_WHITE_COLOR} />
            {/* The title */}
            <View style={{height: "7%", flexDirection: 'row', justifyContent: 'center', alignContent: 'center', }}>
                <Text style={{fontFamily: Constants.APP_TITLE_FONT, fontSize: 18, textAlignVertical:'center', textAlign: 'center', color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND}}>{UIStrings.REQUEST_ADD_TO_CIRCLE}</Text>
            </View>

            { this.state.loading ? <ActivityIndicator size="large" color={Constants.APP_LOADING_COLOR} /> : null }
           
            {/* Request details */}
            <View style={{flex:1, height: "93%", borderTopLeftRadius: 40, borderTopRightRadius: 40, width: '100%'}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-evenly', width: '100%'}}>
                    <RoundImageWithCaptionButton isLarge={true}  imgUri={this.state.partnerImgUrl} />
                </View>
                <View style={{alignSelf: 'center', alignContent: 'center'}}>
                    <RowWithTextLeftAndRight leftText={UIStrings.NAME_COLON} rightText={this.state.partnerName} />
                    <RowWithTextLeftAndRight leftText={UIStrings.PHONE_COLON} rightText={this.state.partnerPhoneNumber} />
                    <RowWithTextLeftAndRight leftText={UIStrings.STATUS_COLON} rightText={this.getStatusTextFromStatus(this.state.status)} />
                    {
                        this.state.status != Constants.FRIEND_REQUEST_ACTIVE && !this.state.loading ?
                        <RowWithTextLeftAndRight leftText={UIStrings.LAST_UPDATED_COLON} rightText={this.state.resolvedOn} />
                        : null 
                    }
                    <RowWithTextLeftAndRight leftText={UIStrings.CARDS_COLON} rightText={this.state.partnerNumCards} />
                </View>

                {/* Response options */}
                {/* If the request is active, present the options to recipient */}
                { 
                    this.state.status == Constants.FRIEND_REQUEST_ACTIVE && !this.isUserSender ? 
                      <View style={{backgroundColor: Constants.BACKGROUND_WHITE_COLOR, marginTop: 20, borderWidth: 2, borderColor: Constants.BACKGROUND_GREY_COLOR, borderRadius: 20, justifyContent: 'center', alignSelf: 'center', width: '90%', height: 160, flexDirection: 'column'}}>
                        <TouchableOpacity onPress={()=>this.respondToRequest(Constants.FRIEND_REQUEST_ACCEPTED)} style={{flexDirection: 'row', padding: 10}}>
                            <Icon name="rocket" type="FontAwesome5" style={[styles.icon, {color: Constants.SUCCESS_COLOR}]} />
                            <View style={{flexDirection: 'column', alignSelf: 'center'}}>
                                <Text style={styles.responseButtonTitle}>{UIStrings.ACCEPT}</Text>
                                <Text style={styles.responseButtonSubtitle}>{UIStrings.ADDED_TO_CIRCLES}</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{borderBottomWidth: 1, marginVertical: 8, borderColor: Constants.BACKGROUND_GREY_COLOR, width: '90%', alignSelf: 'center'}} />
                        <TouchableOpacity onPress={()=>this.respondToRequest(Constants.FRIEND_REQUEST_DECLINED)} style={{flexDirection: 'row', padding: 10}}>
                            <Icon name="meteor" type="FontAwesome5" style={[styles.icon, {color: 'red'}]} />
                            <View style={{flexDirection: 'column', alignSelf: 'center'}}>
                                <Text style={styles.responseButtonTitle}>{UIStrings.DECLINE}</Text>
                                <Text style={styles.responseButtonSubtitle}>{UIStrings.OUTSIDE_CIRCLES}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    : 
                    null 
                }  

            {/* Circle options */}
            { <CirclePopup  onClose={()=>this.onCirclePress()} isVisible={this.state.showCirclePopup} navigate={this.props.navigation.navigate} />  }
            </View>

            {/* Bottom menu */}
            <View style={{backgroundColor:Constants.BACKGROUND_WHITE_COLOR, zIndex: 100, position: 'absolute', bottom: 0, flexDirection: 'row', justifyContent: 'center', height: 60, width: '100%', padding: 10}}>
                <IconWithCaptionButton icon="home" iconType="FontAwesome5" caption={UIStrings.HOME} onPress={()=>NavigationHelpers.clearStackAndNavigate('UserHome', this.props.navigation)}/>
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
        width: '100%',
        height: '100%',
        backgroundColor: Constants.BACKGROUND_WHITE_COLOR
    },
    icon:{
        width: 50, 
        alignSelf: 'center', 
        justifyContent: 'center',
        padding: 10,
        fontSize: 24, 
      },
      responseButtonTitle:{
        fontFamily: Constants.APP_SUBTITLE_FONT,
        fontSize: 17,
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
        paddingBottom: 5
      },
      responseButtonSubtitle:{
        fontFamily: Constants.APP_BODY_FONT,
        fontSize: 12,
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND
      },
})