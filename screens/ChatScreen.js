/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
  Image,
  PermissionsAndroid,
  NativeModules,
  ImageBackground
} from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import { Picker, TextInput } from "react-native";
import { Button, Icon } from "native-base";
import { createStackNavigator, createAppContainer } from "react-navigation";
import firebase from "react-native-firebase";
import * as Constants from "../helpers/Constants";
import * as Utilities from "../helpers/Utilities";
import * as NavigationHelpers from "../helpers/NavigationHelpers";
import * as UIStrings from "../helpers/UIStrings";
import * as AuthHelpers from "../helpers/AuthHelpers";
import TopLeftButton from "../components/TopLeftButton";
import * as VirgilEncryptionHelpers from "../helpers/VirgilEncryptionHelpers";
import ImagePicker from "react-native-image-picker";
import { GiftedChat, Bubble, Message, SystemMessage } from "react-native-gifted-chat";
import changeNavigationBarColor from "react-native-navigation-bar-color";
import { EThree } from "@virgilsecurity/e3kit-native";
import { StatusBar } from "react-native";

export default class ChatScreen extends Component{
  constructor(props:Props) {
    super(props);
    this.state = {
      messages: [
        {
          _id: 1,
          text:
            "All messages are end-to-end encrypted.",
          createdAt: new Date(),
          system: true
        }
      ],
      title: "",
      loading: true,
      typedText: ""
    };

    this.requestId = this.props.navigation.getParam("requestId");
    this.partnerId = this.props.navigation.getParam("partnerId", Constants.NONE);
    this.partnerName = this.props.navigation.getParam("partnerName", Constants.NONE);
    this.partnerImgUrl = this.props.navigation.getParam('partnerImgUrl', Constants.NONE);
    this.partnerFcmToken = this.props.navigation.getParam("partnerFcmToken");
    this.partnerPhoneNumber = this.props.navigation.getParam("partnerPhoneNumber");
    this.partnerPublicKey = null;
    this.myFCMToken = "";
    this.myPhoneNumber = "";
    this.myId = null;
    this.myFirebaseUID = null;
    this.virgilUser = null;
    const chatKeyPrefix:string = `c_`;
    this.chatKey = chatKeyPrefix + this.requestId;
    this.chatExists = false;
  }

  setChatInfo() {
    let mainTreeRef = firebase.database().ref("users/");
    let myRef = this.myPhoneNumber + "/chats/" + this.chatKey;
    let partnerRef = this.partnerPhoneNumber + "/chats/" + this.chatKey;
    mainTreeRef.update(
      {
        [myRef]: true,
        [partnerRef]: true
      },
      error => {
        console.log("Completed update. Error: " + error);
      }
    );
  }

  createChatIfNew() {
    firebase.database().ref("/chats/" + this.chatKey)
    .transaction(snapshot => {
      if (snapshot == null) {
          // Chat doesn't exist so create one.
          let users = {};
          users[this.partnerPhoneNumber] = true;
          users[this.myPhoneNumber] = true;

          return {
            created: new Date().toISOString(),
            users: users,
            created_by: this.myPhoneNumber
          };
        } else {
          return;
        }
      }
      ,()=>{})
      .then(
        fulfilledValue => {
          if (!fulfilledValue.committed) {
            // Chat already exists
          } else {
            this.setChatInfo();
          }
        },
        rejected => {
            console.error("Error while creating chat: " + rejected);
        }
      ).catch((reason) => {
        console.log("TRANSACTION ERROR: " + reason)
      })
  }


  // createChatIfNew() {
  //   firebase.database().ref("/chats/" + this.chatKey)
  //   .transaction(snapshot => {
  //     if (snapshot == null) {
  //         // Chat doesn't exist so create one.
  //         let users = {};
  //         users[this.partnerPhoneNumber] = true;
  //         users[this.myPhoneNumber] = true;

  //         return {
  //           created: new Date().toISOString(),
  //           users: users,
  //           created_by: this.myPhoneNumber
  //         };
  //       } else {
  //         return;
  //       }
  //     }
  //     ,()=>{})
  //     .then(
  //       fulfilledValue => {
  //         if (!fulfilledValue.committed) {
  //           // Chat already exists
  //         } else {
  //           this.setupMessagesAndUsers();
  //         }

  //         this.listenForMessages();
  //         this.setState({loading: false});
  //       },
  //       rejected => {
  //           this.setState({loading: false});
  //           console.error("Error while creating chat: " + rejected);
  //       }
  //     ).catch((reason) => {
  //       this.setState({loading: false});
  //       console.log("TRANSACTION ERROR: " + reason)
  //     })
  // }

  listenForMessages() {
    firebase.database().ref("messages/" + this.chatKey + "/").on("child_added", async (snapshot) =>  {
        let newMessage = {
          _id: snapshot.key,
          text: await this.decryptMessage(snapshot.val().text, snapshot.val().sent_by),
          createdAt: snapshot.val().created,
          user: {
            _id: snapshot.val().sent_by,
            avatar: null
          },
          image: snapshot.val().image
        };

        this.setState(prevState => ({
          messages: GiftedChat.append(prevState.messages, [newMessage])
        }));
      });

      this.setState({loading: false})
  }

  componentWillMount() {
    firebase.database().goOnline();
  }

  async componentDidMount() {
    firebase.analytics().setCurrentScreen("Chat");
    AuthHelpers.getTokenIdPhone().then((result)=>{
      this.myFCMToken = result[0][1];
      this.myId = result[1][1];
      this.myPhoneNumber = result[2][1];
    })

    if (this.virgilUser == null){
      VirgilEncryptionHelpers.initializeVirgilForUser()
      .then((virgilUser)=>{
        this.virgilUser = virgilUser;

        if (this.virgilUser == null){
          Utilities.showLongToast(UIStrings.FAILED_TO_CREATE_CHAT);
          return;
        }

        firebase.auth().signInAnonymously().then((value)=>{
          this.myFirebaseUID = value.user.uid;
          this.listenForMessages();
          this.createChatIfNew();
      })
      })
      .catch(err=>{
        Utilities.showLongToast(UIStrings.FAILED_TO_CREATE_CHAT);
        NavigationHelpers.clearStackAndNavigate('UserHome');
      })
    }

  }

  componentWillUnmount() {
    firebase.database().ref("messages/" + this.chatKey + "/").off();
  }

  async sendNotification() {
    // let headers = new Headers();
    // headers.append(
    //   "Authorization",
    //   "key=" + Constants.FIREBASE_MESSAGING_KEY
    // );
    console.log('Sending notification');
    fetch(Constants.SERVER_ENDPOINT + "/user/sendChatNotification", {
      method: Constants.POST_METHOD,
      headers: await AuthHelpers.getRequestHeaders(),
      body: JSON.stringify({
        to: this.partnerFcmToken,
        data: {
          type: "chat",
          requestId: this.requestId.toString(),
          partnerPhoneNumber: this.myPhoneNumber.toString(), // this user becomes partner when notification is sent out.
          partnerFcmToken: this.myFCMToken.toString(),
          partnerId: this.myId.toString(),
        }
      })
    }).catch(reason =>
      console.log("Chat notification error is: " + JSON.stringify(reason))
    );
  }

  async encryptMessage(text){
    if (text == null){
      return;
    }

    if (this.partnerPublicKey == null){
      partnerIds = [this.partnerId.toString()]
      this.partnerPublicKey = await this.virgilUser.findUsers(partnerIds);
    }

    console.log('Encryption: Start')
    encrypted = await this.virgilUser.encrypt(text, this.partnerPublicKey);
    console.log('Encryption: End')
    return encrypted;
  }

  async decryptMessage(text, sentBy){
    if (text == null){
      return;
    }

    if (sentBy == this.myPhoneNumber){
      return this.virgilUser.decrypt(text);
    }

    if (this.partnerPublicKey == null){
      this.partnerPublicKey = await this.virgilUser.findUsers(identity=this.partnerId.toString());
    }

    console.log('Decryption: Start')
    decrypted = await this.virgilUser.decrypt(text, this.partnerPublicKey);
    console.log('Decryption: End')
    return decrypted;
  }

  async send(messages:Object) {
    // Integer IDs are added as strings because adding ('1', 'v') to dictionary
    // gets associated to an array => 'v' is in index 1 of array.
    if (messages == null) {
      console.log("New messages are not in a valid format.");
      return;
    }

    // todo : if null, assign
    console.log('Coming here1')
    var messagesReference = firebase.database().ref("messages/" + this.chatKey);
    for (let i = 0; i < messages.length; i++) {
      messagesReference.push({
          text: await this.encryptMessage(messages[i].text),
          sent_by: this.myPhoneNumber,
          created: new Date(),
          image: messages[i].image
        })
        .catch(error => {
          console.log("Error updating the list of messages: " + error);
        });
    }

    console.log('COming here2');
    this.sendNotification();
  }

  onTypedTextChange(newText){
    if (newText !== undefined){
      this.setState({typedText: newText})
    }
  }

  renderSystemMessage(props) {
    return (
      <SystemMessage
        {...props}
        containerStyle={{
          marginBottom: 15,
        }}
        textStyle={{
          color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
        }}
      />
    );
  }

  render() {
    return (
    <View style={{width: '100%', height: '100%'}}>
      <StatusBar translucent backgroundColor={Constants.BUTTON_COLORS[0]} />
      <TopLeftButton color={Constants.TEXT_COLOR_FOR_DARK_BACKGROUND} iconName="home" onPress={()=>this.props.navigation.navigate('UserHome')} />
      <View style={{ flexDirection: 'column', position: "absolute", top: 0, height: "28%", width: "100%"}}>
        <LinearGradient colors={Constants.BUTTON_COLORS} style={{justifyContent: "center", flexDirection: 'column', width: '100%', height: '100%'}}>
          <Image source={{uri: this.partnerImgUrl}} style={{width: 50, height: 50, borderRadius: 25, alignSelf: 'center'}}  resizeMethod="resize"/>
          {
            this.state.loading ? 
              <Text numberOfLines={1} style={{marginBottom: 15, fontFamily: Constants.APP_BODY_FONT, fontSize: 16, color: Constants.APP_LOADING_COLOR, textAlign: 'center', paddingVertical: 10, paddingHorizontal: 5}}>{UIStrings.SETTING_UP_YOUR_CHAT}</Text>
              :
              <Text numberOfLines={1} style={{marginBottom: 15, fontFamily: Constants.APP_SUBTITLE_FONT, fontSize: 16, color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND, textAlign: 'center', paddingVertical: 10, paddingHorizontal: 5}}>Chat with {this.partnerName}</Text>
          }
        </LinearGradient>
      </View>
      <View style={{overflow:"hidden" ,position: "absolute", borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderRadius: 50, bottom: 0, height: "80%", width: "100%", backgroundColor: Constants.BACKGROUND_WHITE_COLOR}}>
        <ImageBackground source={require("../assets/logo/chat_bg.png")} style={{  paddingTop: 10, width: '100%', height: '100%'}}>
        {this.state.loading ? <ActivityIndicator color={Constants.APP_LOADING_COLOR} size="large" /> : null }
        <GiftedChat
          isLoadingEarlier={true}
          messages={this.state.messages}
          showUserAvatar={false}
          alwaysShowSend={true}
          text={this.state.typedText}
          renderSystemMessage={this.renderSystemMessage}
          onInputTextChanged={(text) => this.onTypedTextChange(text)}
          onSend={messages => { this.send(messages); }}
          user={{ _id: this.myPhoneNumber, avatar: null  }}
        />
        </ImageBackground>
        </View>
      </View>
    );
  }

  async onImagePickerPress() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const options:Object = {};
        ImagePicker.launchImageLibrary(options, response => {
          if (!(response.didCancel || response.error || response.customButton) && response.uri != null) {
            this.uploadToAWSAndSend(response);
          }
        });
      }
    } catch (err) {
      console.warn(err);
    }
  }
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 22,
    padding: 6,
    marginRight: 0,
    color: "white"
  }
});
