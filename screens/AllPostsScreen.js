import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, PermissionsAndroid, Modal, TouchableOpacity, Image} from 'react-native';
import { Picker, TextInput, StatusBar } from 'react-native';
import {Button, Fab, Icon, Segment, Input} from 'native-base';
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
import CommonStyles from '../components/CommonStyles';
import TopRightButton from '../components/TopRightButton';
import { FlatList } from 'react-native-gesture-handler';
import FriendRequestButton from '../components/FriendRequestButton';
import GradientButton from '../components/GradientButton';
import LottieView from 'lottie-react-native'
import BottomMenu from '../components/BottomMenu';

const GET_USER_POSTS = "/posts/all"
const RECEIVED_POSTS_SUFFIX = "?type=received"
const SENT_POSTS_SUFFIX = "?type=sent"
const NEW_POST_API = "/posts/new"
export default class AllPostsScreen extends Component<Props>{
    _isMounted = false;
    constructor(props)
    {
        super(props);
        this.state = {
            receivedPostsPressed: true,
            posts: null,
            loading: false,
            count: 0,
            showPostPopup: false,
            newPostText: null,
            submitPostButtonText: UIStrings.TITLE_SEND,
            submitPostButtonColors: Constants.BUTTON_COLORS
        };

    }

    componentDidMount(){
        this._isMounted = true;
        firebase.analytics().setCurrentScreen("AllPosts", "AllPostsScreen");
        this.getUserPosts();
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    async getUserPosts(){
        this.setState({loading: true});
        suffix = this.state.receivedPostsPressed ? RECEIVED_POSTS_SUFFIX : SENT_POSTS_SUFFIX;
        fetch(Constants.SERVER_ENDPOINT + GET_USER_POSTS + suffix, {
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
                var postsArray = responseJson.posts == null ? [] : responseJson.posts.map((item) =>{
                    return {creatorName: item.creatorName, id: item.id, creatorId: item.creatorId, profileImgUrl: item.creatorImgUrl, 
                            text: item.text, createdOn: item.createdOn, key: item.id.toString()}});
                
                this.setState({loading: false, posts: postsArray, count: responseJson.count});
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
        if (this.state.receivedPostsPressed == !sent){
            return;
        }

        this.setState({receivedPostsPressed: !sent}, ()=>{this.getUserPosts()});
    }

    onPostPress(item){
        if (item == null){
            return;
        }

        let isUserSender = !this.state.receivedPostsPressed;
        this.props.navigation.navigate('PostInfo', {isUserSender: isUserSender, postId: item.id});
    }

    async onCreateNewPostPress(){
        if (this.state.newPostText == null || this.state.newPostText == "" || this.state.newPostText.length < Constants.MIN_POST_LENGTH_SIZE){
            Utilities.showLongToast(UIStrings.ENTER_VALID_TEXT);
            return;
        }

        this.setState({submitPostButtonText: UIStrings.SENDING});
        fetch(Constants.SERVER_ENDPOINT + NEW_POST_API, {
            method: Constants.POST_METHOD,
            headers: await AuthHelpers.getRequestHeaders(),
            body: JSON.stringify({ text: this.state.newPostText }),
        })
        .then((response)=>{
            if (!this._isMounted){
                return null;
            }

            if (response.ok){
                this.setState({submitPostButtonColors: Constants.SUCCESS_COLORS, submitPostButtonText: UIStrings.SENT})
                setTimeout(() => this.setState({showPostPopup: false}), 1000);
                Utilities.showLongToast(UIStrings.POST_SUBMITTED);
                return null;
            }

            this.setState({submitPostButtonText: UIStrings.TITLE_SEND})
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
            
            this.setState({submitPostButtonText: UIStrings.TITLE_SEND})
            Utilities.showLongToast(UIStrings.GENERIC_ERROR);
            console.log('Error posting: ' + err);
        })
    }

    openPostPopup(){
        this.setState({showPostPopup: true, submitPostButtonColors: Constants.BUTTON_COLORS, submitPostButtonText: UIStrings.TITLE_SEND});
    }

    render()
    {
        return (
            <View style={{flexDirection: 'column', height: "100%", width: '100%'}}>
            <StatusBar  translucent backgroundColor={Constants.APP_STATUS_BAR_COLOR} />
            <TouchableOpacity onPress={()=>this.openPostPopup()} style={{zIndex: 100, position: 'absolute', top: 30, right: 10, borderRadius: 20, width: 40, height: 40, backgroundColor: Constants.SUCCESS_COLOR, justifyContent: 'center'}}>
                <Icon name="notification" type="AntDesign" style={{color: 'white', fontSize: 16, textAlign: 'center'}} />
            </TouchableOpacity>

            {/* The post popup */}
            {
                <Modal visible={this.state.showPostPopup} transparent={true} onRequestClose={()=>{this.setState({showPostPopup: false})}}>
                  <View style={CommonStyles.popupContainer}>
                    <View style={CommonStyles.popup}>
                      <TopRightButton color={Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND} iconName="times" onPress={()=>{this.setState({showPostPopup: false})}} height={50}/>
                      <LottieView style={{alignSelf: 'center', width: '70%', height: 125, marginHorizontal: 10}} 
                        source={require("../assets/resources/post.json")} autoPlay loop />
                      <Text style={[CommonStyles.popupTitle, {marginBottom: 0}]}>{UIStrings.NEW_POST}</Text>
                      <Text style={CommonStyles.popupSubtitle}>{UIStrings.ONLY_USERS_CIRCLE_NOTIFIED}</Text>
                      <View style={{ marginBottom: 20, alignSelf: 'center', justifyContent: 'center', alignContent: 'center', width: '100%', height: 100}}>
                        <Input onChangeText={(val)=>this.setState({newPostText: val})} style={{backgroundColor: Constants.BACKGROUND_GREY_COLOR,borderRadius: 10, borderWidth: 2, borderColor: Constants.BACKGROUND_GREY_COLOR, width: '100%', height: 100, fontSize: 13, color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND, fontFamily: "Montserrat-Light" }}
                                placeholderTextColor={Constants.APP_PLACEHOLDER_TEXT_COLOR} maxLength={Constants.MAX_POST_LENGTH_SIZE}
                                placeholder={UIStrings.FIRE_AWAY} multiline={true} />
                      </View>
                      <GradientButton colors={this.state.submitPostButtonColors} isLarge={false} onPress={()=>this.onCreateNewPostPress()} title={this.state.submitPostButtonText} />
                    </View>
                    </View>
                  </Modal>
            }

             {/* Banner */}
             <View style={{justifyContent: "center", flexDirection: 'column', position: "absolute", top: 0, height: Constants.EXTRA_SMALL_BANNER_HEIGHT, width: "100%"}}>
              <LinearGradient colors={Constants.APP_THEME_COLORS} style={{alignContent: 'center', justifyContent: "center", flexDirection: 'column', width: '100%', height: '100%'}}>
                <Text style={{textAlign: 'center', marginBottom: 5, fontFamily: Constants.APP_SUBTITLE_FONT, fontSize: 18, color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND}}>{UIStrings.BROADCASTS}</Text>
                <Text style={{textAlign: 'center', marginBottom: 20, fontFamily: Constants.APP_BODY_FONT, fontSize: 12, color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND}}>Announce something that helps your Circle save</Text>
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
                                    style={[styles.leftButton, this.state.receivedPostsPressed ? styles.buttonHighlighted : styles.buttonInactive]}>
                                    <Text style={[styles.toggleButtonText, this.state.receivedPostsPressed ? styles.toggleButtonTextHighlighted : styles.toggleButtonTextInactive]}>Received</Text>
                                </TouchableOpacity>
                                <TouchableOpacity  onPress={()=>{this.onTogglePress(true)}}
                                    style={[styles.rightButton, this.state.receivedPostsPressed ? styles.buttonInactive : styles.buttonHighlighted]}>
                                    <Text style={[styles.toggleButtonText, this.state.receivedPostsPressed ? styles.toggleButtonTextInactive : styles.toggleButtonTextHighlighted]}>Sent</Text>
                                </TouchableOpacity>
                            </View>

                            {this.state.count == 0 ? <Text style={styles.noPostsText}>{this.state.receivedPostsPressed ? UIStrings.TIP_EXPAND_CIRCLE_INCREASE_ACTIVITY : UIStrings.TIP_ANNOUNCE_NEW_CARD}</Text> : null}
                            {this.state.count == 0  ? 
                                <View style={{marginTop: 30, alignSelf: 'center', alignContent: 'center'}}>
                                    <RoundIconWithBackgroundAndCaptionButton iconParams={{icon:"notification",type:"AntDesign", size: 28}} 
                                    colors={Constants.APP_THEME_COLORS} onPress={()=>{this.openPostPopup()}} 
                                    textColor={Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND} caption={UIStrings.NEW} />
                                </View>
                                : 
                                null
                            }
                            <FlatList 
                                contentContainerStyle={{alignItems: 'center'}}
                                data={this.state.posts}
                                showsVerticalScrollIndicator={false}
                                renderItem={({item})=>
                                    <FriendRequestButton imageSource={item.profileImgUrl} iconName="chevron-right" iconColor="black" 
                                    onPress={()=>this.onPostPress(item)} name={item.creatorName} subtitle={item.text}  />
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
    postsLoading:{
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