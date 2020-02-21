import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Image, TouchableOpacity, ScrollView} from 'react-native';
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
import * as VirgilEncryptionHelpers from '../helpers/VirgilEncryptionHelpers';
import RowWithTextLeftAndRight from '../components/RowWithTextLeftAndRight';
import LottieView from 'lottie-react-native'


const ACCESS_REQUEST_API = "/accessRequests?id="
const RESPOND_TO_REQUEST_API = "/accessRequests/respond"
export default class AccessRequestInfoScreen extends Component<Props>{
    _isMounted = false;
    constructor(props)
    {
        super(props);
        this.state = {
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
            shortDescription: null,
            cardholdersName: null,
        };

        this.isUserSender = this.props.navigation.getParam("isUserSender", true);
        this.requestId = this.props.navigation.getParam("requestId", Constants.NONE);
    }

    componentDidMount(){
        this._isMounted = true;
        firebase.analytics().setCurrentScreen("AccessRequestInfo", "AccessRequestInfoScreen");
        this.getRequestDetails();
    }

    componentWillUnmount(){
        this._isMounted = false;
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
                    cardholdersName: responseJson.recipientName,
                    partnerId: this.isUserSender ? responseJson.recipientId : responseJson.senderId,
                    partnerFcmToken: this.isUserSender ? responseJson.recipientFcmToken : responseJson.senderFcmToken,
                    partnerPhoneNumber: this.isUserSender  ? responseJson.recipientPhoneNumber : responseJson.senderPhoneNumber,
                    partnerImgUrl: this.isUserSender  ? responseJson.recipientImgUrl : responseJson.senderImgUrl,
                    status: responseJson.status,
                    amount: responseJson.amount, 
                    shortDescription: responseJson.shortDesc,
                    cardId: responseJson.cardId,
                    cardName: responseJson.cardName,
                    createdOn: responseJson.createdOn,
                    resolvedOn: responseJson.resolvedOn,
                    mutualFriendName: responseJson.mutualFriendName
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
                
                Utilities.showLongToast(UIStrings.DECLINED_REFRESHING_REQUEST);
                this.getRequestDetails();
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
            case Constants.ACCESS_REQUEST_EXPIRED_CODE:
                return UIStrings.EXPIRED;
        }

        return UIStrings.OPEN;
    }

    getNameToDisplay(partnerName, mutualFriendName){
        if (mutualFriendName == null || mutualFriendName.length < 1){
            return partnerName;
        }

        return this.getSecondDegreeCardholderDisplayName(partnerName, mutualFriendName);
    }

    getSecondDegreeCardholderDisplayName(secondDegreeFriendName, mutualFriendName){
        withCardholderName = UIStrings.SECOND_DEGREE_CARDHOLDER_NAME.replace("%0", secondDegreeFriendName);
        return withCardholderName.replace("%1", mutualFriendName);
    }

    render()
    {
        return (
        <View style={styles.container}>
        <ScrollView contentContainerStyle={{flexGrow: 1, paddingBottom: 40}} style={styles.scrollContainer}>
            <StatusBar translucent backgroundColor={Constants.APP_STATUS_BAR_COLOR} />
            {/* The title */}
            <View style={{ height: "10%", flexDirection: 'column', justifyContent: 'center', alignContent: 'center'}}>
                <Text style={{fontFamily: Constants.APP_TITLE_FONT, fontSize: 18, textAlignVertical:'center', 
                textAlign: 'center', color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND}}>{UIStrings.REQUEST_ACCESS_CARD}</Text>
                <Text style={{textAlign: 'center', fontSize: 11, fontFamily: Constants.APP_BODY_FONT, color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND}}>Requests expire in 24 hours</Text>
            </View>

            { this.state.loading ? 
                <LottieView style={{alignSelf: 'center', width: '70%', height: 80, marginVertical: 20, marginHorizontal: 10}} 
                  source={require("../assets/resources/loading.json")} autoPlay loop />
                : null }
            
            {/* Request details */}
            <View style={{paddingBottom: 15, paddingTop: 8, width: '100%', flexDirection: "column", justifyContent: 'center'}}>
                    <View style={{alignSelf: 'center', alignContent: 'center', marginBottom: 15}}>
                        {this.state.cardId != null ? 
                            <CreditCardWithText imgName={Utilities.getCardTemplateForCard(this.state.cardId)} title={this.state.cardName} name={this.state.cardholdersName} />
                            :
                            null
                        }
                    </View>     
                    <RowWithTextLeftAndRight leftText={this.isUserSender  ? UIStrings.TO_COLON : UIStrings.FROM_COLON} 
                                rightText={this.getNameToDisplay(this.state.partnerName, this.state.mutualFriendName)}
                                onPress={()=>Utilities.showLongToast(this.getNameToDisplay(this.state.partnerName, this.state.mutualFriendName))} />
                    <RowWithTextLeftAndRight leftText={UIStrings.STATUS_COLON} rightText={this.getStatusTextFromStatus(this.state.status)} />
                    <RowWithTextLeftAndRight leftText={UIStrings.WHAT_FOR_COLON} rightText={this.state.shortDescription} onPress={()=>{if (this.state.shortDescription != null) {Utilities.showLongToast(this.state.shortDescription)}}} />
                    <RowWithTextLeftAndRight leftText={UIStrings.AMOUNT_COLON} rightText={UIStrings.RUPEES_SHORT + this.state.amount} />
            </View>

            {/* Response options */}
            <View style={{width: '100%'}}>
                {/* If request open, show response options to recipient */}
                {
                    this.state.status == Constants.ACCESS_REQUEST_UNACCEPTED_CODE && !this.isUserSender  ?
                    <View style={{marginTop: 10, borderWidth: 2, borderColor: Constants.APP_THEME_COLORS[1], borderRadius: 20, justifyContent: 'center', alignSelf: 'center', width: '90%', height: 160, flexDirection: 'column'}}>
                        <TouchableOpacity onPress={()=>this.onAccept()} style={{flexDirection: 'row', padding: 10}}>
                            <Icon name="rocket" type="FontAwesome5" style={[styles.icon, {color: Constants.SUCCESS_COLOR}]} />
                            <View style={{flexDirection: 'column', alignSelf: 'center'}}>
                                <Text style={styles.responseButtonTitle}>{UIStrings.ACCEPT}</Text>
                                <Text style={styles.responseButtonSubtitle}>{UIStrings.START_ENCRYPTED_CHAT}</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{borderBottomWidth: 1, marginVertical: 8, borderColor: Constants.APP_THEME_COLORS[1], width: '90%', alignSelf: 'center'}} />
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
                    <View style={{marginTop: 10, borderWidth: 2, borderColor: Constants.APP_THEME_COLORS[1], borderRadius: 20, justifyContent: 'center', alignSelf: 'center', width: '90%', height: 80, flexDirection: 'column'}}>
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
                    <View style={{justifyContent: 'center', alignSelf: 'center', borderRadius: 20, height: 80, width: '90%', borderWidth: 2, borderColor: Constants.APP_THEME_COLORS[1], marginTop: 10}}>
                        <Text numberOfLines={1} style={{paddingHorizontal: 5, textAlign: 'center', textAlignVertical: 'center', fontFamily: Constants.APP_SUBTITLE_FONT, color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND}}>
                            {UIStrings.AWAITING_RESPONSE_FROM}{this.state.partnerName}
                        </Text>
                    </View>
                    :
                    null
                }

                {/* If request is expired, show expired text */}
                {
                    this.state.status == Constants.ACCESS_REQUEST_EXPIRED_CODE ?
                    <View style={{justifyContent: 'center', alignSelf: 'center', borderRadius: 20, height: 80, width: '90%', borderWidth: 2, borderColor: Constants.APP_THEME_COLORS[1], marginTop: 10}}>
                        <Text numberOfLines={1} style={{paddingHorizontal: 5, textAlign: 'center', textAlignVertical: 'center', fontFamily: Constants.APP_SUBTITLE_FONT, color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND}}>
                            {UIStrings.SORRY_REQUEST_EXPIRED}
                        </Text>
                    </View>
                    :
                    null
                }                
            </View>


        </ScrollView>
        {/* Bottom menu */}
        <View style={{backgroundColor:Constants.BACKGROUND_WHITE_COLOR,  flexDirection: 'row', justifyContent: 'space-between', height: Constants.BOTTOM_MENU_HEIGHT, width: '100%', padding: 10}}>
                <IconWithCaptionButton icon="circle-thin" iconType="FontAwesome" caption={UIStrings.CIRCLE} onPress={()=>{this.props.navigation.navigate('UserHome')}} />
                <IconWithCaptionButton icon="credit-card" iconType="SimpleLineIcons" caption={UIStrings.REQUESTS} onPress={()=>{this.props.navigation.navigate('AllAccessRequests')}} />
                <IconWithCaptionButton icon="notification" iconType="AntDesign" caption={UIStrings.BROADCASTS} onPress={()=>{this.props.navigation.navigate('AllPosts')}} />
                <IconWithCaptionButton icon="team" iconType="AntDesign" caption={UIStrings.INVITES} onPress={()=>{this.props.navigation.navigate('AllFriendRequests')}} />
        </View>
        </View>
        );
    }
}

const styles = StyleSheet.create({
    container:{
        flex: 1
    },
    scrollContainer:{
        width: '100%',
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