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
import CirclePopup from "../components/CirclePopup";
import CommonStyles from '../components/CommonStyles';
import TopRightButton from '../components/TopRightButton';
import { FlatList } from 'react-native-gesture-handler';
import FriendRequestButton from '../components/FriendRequestButton';
import GradientButton from '../components/GradientButton';


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
            showCirclePopup: false,
            showPostPopup: false,
            newPostText: null,
            submitPostButtonText: UIStrings.TITLE_SUBMIT,
            submitPostButtonColors: Constants.BUTTON_COLORS
        };

    }

    componentDidMount(){
        this._isMounted = true;
        firebase.analytics().setCurrentScreen("AllPosts");
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

    onCirclePress(){
      this.setState((prevState)=> ({showCirclePopup: !prevState.showCirclePopup}));
    }

    async onCreateNewPostPress(){
        if (this.state.newPostText == null || this.state.newPostText == "" || this.state.newPostText.length < Constants.MIN_POST_LENGTH_SIZE){
            Utilities.showLongToast(UIStrings.ENTER_VALID_TEXT);
            return;
        }

        this.setState({submitPostButtonText: UIStrings.TITLE_SUBMITTING});
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
                this.setState({submitPostButtonColors: Constants.SUCCESS_COLORS, submitPostButtonText: UIStrings.SUBMITTED})
                setTimeout(() => this.setState({showPostPopup: false}), 1000);
                Utilities.showLongToast(UIStrings.POST_SUBMITTED);
                return null;
            }

            this.setState({submitPostButtonText: UIStrings.TITLE_SUBMIT})
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
            
            this.setState({submitPostButtonText: UIStrings.TITLE_SUBMIT})
            Utilities.showLongToast(UIStrings.GENERIC_ERROR);
            console.log('Error posting: ' + err);
        })
    }

    openPostPopup(){
        this.setState({showPostPopup: true, submitPostButtonColors: Constants.BUTTON_COLORS, submitPostButtonText: UIStrings.TITLE_SUBMIT});
    }

    render()
    {
        return (
            <View style={{flexDirection: 'column', height: "100%", width: '100%'}}>
            <StatusBar  backgroundColor={Constants.APP_THEME_COLORS[0]} />
            <TouchableOpacity onPress={()=>this.openPostPopup()} style={{zIndex: 100, position: 'absolute', top: 20, right: 10, borderRadius: 20, width: 40, height: 40, backgroundColor: Constants.SUCCESS_COLOR, justifyContent: 'center'}}>
                <Icon name="microphone-alt" type="FontAwesome5" style={{color: 'white', fontSize: 16, textAlign: 'center'}} />
            </TouchableOpacity>
            {/* The post popup */}
            {
                <Modal visible={this.state.showPostPopup} transparent={true} onRequestClose={()=>{this.setState({showPostPopup: false})}}>
                  <View style={CommonStyles.popupContainer}>
                    <View style={CommonStyles.popup}>
                      <TopRightButton color={Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND} iconName="times" onPress={()=>{this.setState({showPostPopup: false})}} height={50}/>
                      <Text style={[CommonStyles.popupTitle, {marginBottom: 0}]}>{UIStrings.NEW_POST}</Text>
                      <Text style={CommonStyles.popupSubtitle}>{UIStrings.ONLY_USERS_CIRCLE_NOTIFIED}</Text>
                      <View style={{ marginTop: 13, marginBottom: 30, alignSelf: 'center', justifyContent: 'center', alignContent: 'center', width: '90%', height: 100}}>
                        <Input onChangeText={(val)=>this.setState({newPostText: val})} style={{borderRadius: 10, borderWidth: 1, borderColor: Constants.BACKGROUND_GREY_COLOR, width: '100%', height: 100, fontSize: 13, color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND, fontFamily: "Montserrat-Light" }}
                                placeholderTextColor={Constants.APP_PLACEHOLDER_TEXT_COLOR} maxLength={Constants.MAX_POST_LENGTH_SIZE}
                                placeholder={UIStrings.FIRE_AWAY} multiline={true} />
                      </View>
                      <GradientButton colors={this.state.submitPostButtonColors} isLarge={false} onPress={()=>this.onCreateNewPostPress()} title={this.state.submitPostButtonText} />
                    </View>
                    </View>
                  </Modal>
            }

             {/* Banner */}
             <View style={{justifyContent: "center", flexDirection: 'column', position: "absolute", top: 0, height: Constants.SMALL_BANNER_HEIGHT, width: "100%"}}>
              <LinearGradient colors={Constants.APP_THEME_COLORS} style={{alignContent: 'center', justifyContent: "center", flexDirection: 'column', width: '100%', height: '100%'}}>
                <Text style={{textAlign: 'center', marginBottom: 20, fontFamily: Constants.APP_SUBTITLE_FONT, fontSize: 18, color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND}}>{UIStrings.POSTS_IN_CIRCLE}</Text>
                <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                    <TouchableOpacity  onPress={()=>{this.onTogglePress(false)}}
                        style={[styles.leftButton, this.state.receivedPostsPressed ? styles.buttonHighlighted : styles.buttonInactive]}>
                        <Text style={[styles.toggleButtonText, this.state.receivedPostsPressed ? styles.toggleButtonTextHighlighted : styles.toggleButtonTextInactive]}>Received</Text>
                    </TouchableOpacity>
                    <TouchableOpacity  onPress={()=>{this.onTogglePress(true)}}
                        style={[styles.rightButton, this.state.receivedPostsPressed ? styles.buttonInactive : styles.buttonHighlighted]}>
                        <Text style={[styles.toggleButtonText, this.state.receivedPostsPressed ? styles.toggleButtonTextInactive : styles.toggleButtonTextHighlighted]}>Sent</Text>
                    </TouchableOpacity>
                </View>
              </LinearGradient>
             </View>

             {/* Arch */}
             <View style={{position: "absolute", borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderRadius: 50, bottom: 0, height: Constants.LARGE_ARCH_SCREEN_HEIGHT, width: "100%", backgroundColor: Constants.BACKGROUND_WHITE_COLOR}}>
                <View style={{marginHorizontal: "5%", marginTop: "10%", marginBottom: 60}}>
                    {
                        this.state.loading ? <Text style={styles.postsLoading}>{UIStrings.LOADING_DOTS}</Text>
                        :
                        <View style={{flexDirection: 'column'}}>
                            <Text style={{textAlign: 'center', fontFamily: Constants.APP_SUBTITLE_FONT, fontSize: 18, padding: 10, color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND}}>{UIStrings.NUM_POSTS}{this.state.count}</Text>
                            {this.state.count == 0 ? <Text style={styles.noPostsText}>{UIStrings.TIP_EXPAND_CIRCLE_INCREASE_ACTIVITY}</Text> : null}
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

            {/* Circle options */}
            { <CirclePopup  onClose={()=>this.onCirclePress()} isVisible={this.state.showCirclePopup} navigate={this.props.navigation.navigate} />  }

              {/* Bottom menu */}
              <View style={{ backgroundColor:Constants.BACKGROUND_WHITE_COLOR, zIndex: 99, position: 'absolute', bottom: 0, flexDirection: 'row', justifyContent: 'center', height: Constants.BOTTOM_MENU_HEIGHT, width: '100%', padding: 10}}>
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
    postsLoading:{
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