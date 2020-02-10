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
import CreditCardWithText from '../components/CreditCardWithText';
import IconWithCaptionButton from '../components/IconWithCaptionButton';
import CirclePopup from '../components/CirclePopup';
import * as VirgilEncryptionHelpers from '../helpers/VirgilEncryptionHelpers';
import RowWithTextLeftAndRight from '../components/RowWithTextLeftAndRight';


const ACCESS_REQUEST_API = "/accessRequests?id="
const RESPOND_TO_REQUEST_API = "/accessRequests/respond"
export default class AccessRequestInfoScreen extends Component<Props>{
    _isMounted = false;
    constructor(props)
    {
        super(props);
        this.state = {
            showCirclePopup: false,
            loading: true,
            partnerName: null,
            partnerId: null, 
            partnerPhoneNumber: null,
            partnerFcmToken: null,
            partnerImgUrl: null,
            cardId: null,
            cardName: null,
            status: null,
            amount: null,
        };

        // Make the view scrollable
        // fix the alignment
        this.isUserSender = this.props.navigation.getParam("isUserSender", true);
        console.log('Sender: ' + this.isUserSender);
        this.requestId = this.props.navigation.getParam("requestId", Constants.NONE);
    }

    componentDidMount(){
        this._isMounted = true;
        firebase.analytics().setCurrentScreen("AccessRequestInfo");
        this.getRequestDetails();
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    onCirclePress(){
        this.setState((prevState)=> ({showCirclePopup: !prevState.showCirclePopup}));
    }

    async getRequestDetails(){
        this.setState({loading: true});
        fetch(Constants.SERVER_ENDPOINT + ACCESS_REQUEST_API + this.requestId, 
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
                    partnerFcmToken: this.isUserSender ? responseJson.recipientFcmToken : responseJson.senderFcmToken,
                    partnerPhoneNumber: this.isUserSender  ? responseJson.recipientPhoneNumber : responseJson.senderPhoneNumber,
                    partnerImgUrl: this.isUserSender  ? responseJson.recipientImgUrl : responseJson.senderImgUrl,
                    status: responseJson.status,
                    amount: responseJson.amount, 
                    cardId: responseJson.cardId,
                    cardName: responseJson.cardName,
                    createdOn: responseJson.createdOn,
                    resolvedOn: responseJson.resolvedOn
                })
            }
        })
        .catch(err=>{
            if (!this._isMounted){
                return null;
            }

            this.setState({loading: false})
            Utilities.showLongToast(UIStrings.GENERIC_ERROR);
            console.log('Error getting access request info: ' + err);
        })
    }

    goToChat(){
        this.props.navigation.replace('Chat', {
            partnerId: this.state.partnerId, 
            requestId: this.requestId, 
            partnerFcmToken: this.state.partnerFcmToken,
            partnerPhoneNumber: this.state.partnerPhoneNumber,
            partnerName: this.state.partnerName,
            partnerImgUrl: this.state.partnerImgUrl,
        })
    }

    async respondToRequest(action, goToChat){
        fetch(Constants.SERVER_ENDPOINT + RESPOND_TO_REQUEST_API, {
            method: Constants.POST_METHOD,
            headers: await AuthHelpers.getRequestHeaders(),
            body: JSON.stringify({action: action, requestId: this.requestId})
        })
        .then((response)=>{
            if (!this._isMounted){
                return null;
            }

            if (response.ok){
                if (goToChat)
                {
                    this.goToChat();
                    return null;
                }

                return null;
            }

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

            Utilities.showLongToast(UIStrings.GENERIC_ERROR);
            console.log('ERROR responding to access request: ' + err);
        })
    }

     onAccept(){
        this.respondToRequest(Constants.ACCESS_REQUEST_ACCEPTED_CODE, true)
    }

    onDecline(){
        this.respondToRequest(Constants.ACCESS_REQUEST_REJECTED_CODE, false);
    }

    getStatusTextFromStatus(status){
        switch(status){
            case Constants.ACCESS_REQUEST_ACCEPTED_CODE:
                return UIStrings.ACCEPTED;
            case Constants.ACCESS_REQUEST_REJECTED_CODE:
                return UIStrings.DECLINED;
        }

        return UIStrings.OPEN;
    }

    render()
    {
        return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor='transparent' />
            {/* The title */}
            <View style={{opacity: this.state.showCirclePopup ? 0.2 : 1, height: "10%", flexDirection: 'row', justifyContent: 'center', alignContent: 'center'}}>
                <Text style={{fontFamily: Constants.APP_TITLE_FONT, fontSize: 18, textAlignVertical:'center', 
                textAlign: 'center', color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND}}>{UIStrings.REQUEST_ACCESS_CARD}</Text>
            </View>

            { this.state.loading ? <ActivityIndicator size="large" color={Constants.APP_LOADING_COLOR} /> : null }
            
            {/* Request details */}
            <View style={{paddingVertical: 15,  width: '100%', flexDirection: "column", justifyContent: 'center'}}>
                    <RowWithTextLeftAndRight leftText={this.isUserSender  ? UIStrings.TO_COLON : UIStrings.FROM_COLON} 
                                            rightText={this.state.partnerName} />
                    <RowWithTextLeftAndRight leftText={UIStrings.AMOUNT_COLON} rightText={UIStrings.RUPEES_SHORT + this.state.amount} />
                    <RowWithTextLeftAndRight leftText={UIStrings.STATUS_COLON} rightText={this.getStatusTextFromStatus(this.state.status)} />
                    <View style={{alignSelf: 'center', alignContent: 'center', marginTop: 10}}>
                        <CreditCardWithText colors={Utilities.getColorForCard(this.state.cardId)} title={this.state.cardName} name={this.state.recipientName} />
                    </View>
            </View>

            {/* Response options */}
            <View style={{width: '100%'}}>
                {/* If request open, show response options to recipient */}
                {
                    this.state.status == Constants.ACCESS_REQUEST_UNACCEPTED_CODE && !this.isUserSender  ?
                    <View style={{marginTop: 20, borderWidth: 2, borderColor: Constants.BACKGROUND_GREY_COLOR, borderRadius: 20, justifyContent: 'center', alignSelf: 'center', width: '90%', height: 160, flexDirection: 'column'}}>
                        <TouchableOpacity onPress={()=>this.onAccept()} style={{flexDirection: 'row', padding: 10}}>
                            <Icon name="rocket" type="FontAwesome5" style={[styles.icon, {color: Constants.SUCCESS_COLOR}]} />
                            <View style={{flexDirection: 'column', alignSelf: 'center'}}>
                                <Text style={styles.responseButtonTitle}>{UIStrings.ACCEPT}</Text>
                                <Text style={styles.responseButtonSubtitle}>{UIStrings.START_ENCRYPTED_CHAT}</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{borderBottomWidth: 1, marginVertical: 8, borderColor: Constants.BACKGROUND_GREY_COLOR, width: '90%', alignSelf: 'center'}} />
                        <TouchableOpacity onPress={()=>this.onDecline()} style={{flexDirection: 'row', padding: 10}}>
                            <Icon name="meteor" type="FontAwesome5" style={[styles.icon, {color: 'red'}]} />
                            <View style={{flexDirection: 'column', alignSelf: 'center'}}>
                                <Text style={styles.responseButtonTitle}>{UIStrings.DECLINE}</Text>
                                <Text style={styles.responseButtonSubtitle}>{UIStrings.NOTIFY_SENDER}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    :
                    null
                }

                {/* If request was accepted, show option to go to chat */}
                {
                    this.state.status == Constants.ACCESS_REQUEST_ACCEPTED_CODE  ?
                    <View style={{marginTop: 20, borderWidth: 2, borderColor: Constants.BACKGROUND_GREY_COLOR, borderRadius: 20, justifyContent: 'center', alignSelf: 'center', width: '90%', height: 80, flexDirection: 'column'}}>
                        <TouchableOpacity onPress={()=>this.goToChat()} style={{flexDirection: 'row', padding: 10}}>
                            <Icon name="comments" type="FontAwesome" style={[styles.icon, {color: Constants.SUCCESS_COLOR}]} />
                            <View style={{flexDirection: 'column', alignSelf: 'center'}}>
                                <Text style={styles.responseButtonTitle}>{UIStrings.CHAT}</Text>
                                <Text style={styles.responseButtonSubtitle}>{UIStrings.RESUME_ENCRYPTED_CHAT}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    :
                    null
                }

                {/* If request is open, show awaiting response */}
                {
                    this.state.status == Constants.ACCESS_REQUEST_UNACCEPTED_CODE && this.isUserSender ?
                    <View style={{justifyContent: 'center', alignSelf: 'center', borderRadius: 20, height: 80, width: '90%', borderWidth: 2, borderColor: Constants.BACKGROUND_GREY_COLOR, marginTop: 5}}>
                        <Text numberOfLines={1} style={{paddingHorizontal: 5, textAlign: 'center', textAlignVertical: 'center', fontFamily: Constants.APP_SUBTITLE_FONT, color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND}}>
                            {UIStrings.AWAITING_RESPONSE_FROM}{this.state.partnerName}
                        </Text>
                    </View>
                    :
                    null
                }
            </View>

            {/* Circle options */}
            { <CirclePopup  onClose={()=>this.onCirclePress()} isVisible={this.state.showCirclePopup} navigate={this.props.navigation.navigate} />  }

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