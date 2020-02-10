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
import GradientButton from '../components/GradientButton';
import TopLeftButton from '../components/TopLeftButton';
import RoundImageWithCaptionButton from '../components/RoundImageWithCaptionButton';
import CreditCardWithText from '../components/CreditCardWithText';
import IconWithCaptionButton from '../components/IconWithCaptionButton';
import CirclePopup from '../components/CirclePopup';
import RowWithTextLeftAndRight from '../components/RowWithTextLeftAndRight';

const GET_POST_API = "/posts?id=";
export default class PostInfoScreen extends Component<Props>{
    _isMounted = false;
    constructor(props)
    {
        super(props);
        this.state = {
            showCirclePopup: false,
            loading: true,
            creatorName: null,
            creatorId: null, 
            creatorImgUrl: null,
            createdOn: null,
            text: null
        };

        this.postId = this.props.navigation.getParam("postId", Constants.NONE);
        this.isUserSender = this.props.navigation.getParam("isUserSender", true);

    }

    componentDidMount(){
        this._isMounted = true;
        firebase.analytics().setCurrentScreen("PostInfo");
        this.getPostDetails();
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    onCirclePress(){
        this.setState((prevState)=> ({showCirclePopup: !prevState.showCirclePopup}));
    }

    async getPostDetails(){
        fetch(Constants.SERVER_ENDPOINT + GET_POST_API + this.postId, 
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
                    creatorName: responseJson.creatorName,
                    creatorId: responseJson.creatorId,
                    creatorImgUrl: responseJson.creatorImgUrl,
                    text: responseJson.text,
                    createdOn: responseJson.createdOn,
                })
            }
        })
        .catch(err=>{
            if (!this._isMounted){
                return null;
            }

            this.setState({loading: false});

            Utilities.showLongToast(UIStrings.GENERIC_ERROR);
            console.log('Error getting access post info: ' + err);
        })
    }

    render()
    {
        return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor='transparent' />
            {/* The title */}
            <View style={{height: "7%", flexDirection: 'row', justifyContent: 'center', alignContent: 'center', backgroundColor: Constants.BACKGROUND_WHITE_COLOR}}>
                <Text style={{fontFamily: Constants.APP_TITLE_FONT, fontSize: 18, textAlignVertical:'center', textAlign: 'center', color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND}}>{UIStrings.REQUEST_ADD_TO_CIRCLE}</Text>
            </View>

            { this.state.loading ? <ActivityIndicator size="large" color={Constants.APP_LOADING_COLOR} /> : null }
           
            {/* Request details */}
            <View style={{flex:1, height: "93%", borderTopLeftRadius: 40, borderTopRightRadius: 40, width: '100%', backgroundColor: Constants.BACKGROUND_GREY_COLOR}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-evenly', width: '100%'}}>
                    <RoundImageWithCaptionButton isLarge={true}  imgUri={this.state.creatorImgUrl} />
                </View>

                <View style={{overflow: 'hidden', padding: 5, backgroundColor: Constants.BACKGROUND_WHITE_COLOR, marginVertical: 20, elevation: 2, borderRadius: 20, justifyContent: 'center', alignSelf: 'center', width: '90%', height: 160, flexDirection: 'column'}}>
                    <Text numberOfLines={1} style={{textAlign: 'center', paddingHorizontal: 10, paddingVertical: 5, fontFamily: Constants.APP_BODY_FONT, color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND, fontSize: 11}}>{this.state.creatorName} says:</Text>
                    <Text style={{textAlign: 'center', padding: 10, fontFamily: Constants.APP_BODY_FONT, color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND, fontSize: 14}}>{this.state.text}</Text>
                </View>
                
                <View style={{alignSelf: 'center', alignContent: 'center'}}>
                    <RowWithTextLeftAndRight leftText={UIStrings.NAME_COLON} rightText={this.state.creatorName} />
                    <RowWithTextLeftAndRight leftText={UIStrings.DATE_COLON} rightText={this.state.createdOn} />
                </View>

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