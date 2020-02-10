import React, { Component } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
  PermissionsAndroid
} from "react-native";
import { Picker, TextInput, Switch, StatusBar } from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import firebase, { Firebase } from "react-native-firebase";
import type { Notification, NotificationOpen } from "react-native-firebase";
import * as Constants from "./helpers/Constants";
import * as UIStrings from "./helpers/UIStrings";
import { Button, H1 } from "native-base";
import * as AuthHelpers from "./helpers/AuthHelpers";
import * as NavigationHelpers from "./helpers/NavigationHelpers";
import LinearGradient from "react-native-linear-gradient";
import changeNavigationBarColor from "react-native-navigation-bar-color";

// Screens
import ChatScreen from "./screens/ChatScreen";
import ContactUsScreen from "./screens/ContactUsScreen";
import ImagePicker from "react-native-image-picker";
import LogInScreen from "./screens/LogInScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SearchCardScreen from "./screens/SearchCardScreen";
import SignUpScreen from "./screens/SignUpScreen";
import UserHomeScreen from "./screens/UserHomeScreen";
import WaitScreen from "./screens/WaitScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import HowItWorksScreen from "./screens/HowItWorksScreen";
import EditCardsOnProfileScreen from "./screens/EditCardsOnProfileScreen";
import SelectCardsYouOwnScreen from "./screens/SelectCardsYouOwnScreen";
import NotesFromFoundersScreen from "./screens/NotesFromFoundersScreen";
import AddToCircleScreen from "./screens/AddToCircleScreen";
import AccessRequestInfoScreen from "./screens/AccessRequestInfoScreen";
import FriendRequestInfoScreen from "./screens/FriendRequestInfoScreen";
import AllAccessRequestsScreen from "./screens/AllAccessRequestsScreen";
import AllFriendRequestsScreen from "./screens/AllFriendRequestsScreen";
import AllPostsScreen from "./screens/AllPostsScreen";
import PostInfoScreen from "./screens/PostInfoScreen";
import CheckInviteCodeScreen from "./screens/CheckInviteCodeScreen";
import SplashScreen from 'react-native-splash-screen';

type Props = {};

const ANDROID_CHANNEL_ID = "circlesWay";
const ANDROID_VIBRATION_PATTERN = [1000,1000,1000];

class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      cardInfo: ""
    };
    
    console.log('Entered app')
  }

  handleOnNotificationOpened(notificationOpen) {
    // Get information about the notification that was opened
    const notification: Notification = notificationOpen.notification;
    
    const data = notification.data;
    if (data == null || data.type == null) {
      alert("Sorry, there was an error opening the notification.");
      return;
    }

    if (data.type == "chat") {
      let params = {
        requestId: data.requestId,
        partnerPhoneNumber: data.partnerPhoneNumber,
        partnerFcmToken: data.partnerFcmToken,
        partnerId: data.partnerId,
        partnerName: data.partnerName
      };

      NavigationHelpers.clearStackAndNavigateWithParams('Chat', this.props.navigation, params);
    } else if (data.type == "update") {
      let params = {
        title: data.title,
        body: data.body
      };
      NavigationHelpers.clearStackAndNavigateWithParams(
        "Wait",
        this.props.navigation,
        params
      );
    }
    else if (data.type == Constants.ACCESS_REQUEST_NOTIFICATION_TYPE){
      let params = {
        requestId: data.requestId,
        isUserSender: data.isUserSender != null ? true : false
      }

      NavigationHelpers.clearStackAndNavigateWithParams("AccessRequestInfo", this.props.navigation, params)
    }
    else if (data.type == Constants.FRIEND_REQUEST_NOTIFICATION_TYPE){
      let params = {
        requestId: data.requestId, 
        isUserSender: data.isUserSender != null ? true : false
      }

      NavigationHelpers.clearStackAndNavigateWithParams("FriendRequestInfo", this.props.navigation, params)
    }
  }

  componentDidMount() {
    this.init();
    changeNavigationBarColor(Constants.HEADING_COLOR);
  }

  async init() {
    firebase.analytics().setAnalyticsCollectionEnabled(true);
    const notificationOpen: NotificationOpen = await firebase.notifications().getInitialNotification();
    console.log('After getting notification')
    
    if (notificationOpen) {
      this.handleOnNotificationOpened(notificationOpen);
    }

    // When app in foreground, handle showing the notification.
    this.notificationListener = firebase
      .notifications()
      .onNotification(notification => {

        const localNotification = new firebase.notifications.Notification({
          show_in_foreground: true,
          smallIcon:"ic_stat_name",
          largeIcon:"ic_stat_name"
        })
          .setNotificationId(notification.notificationId)
          .setTitle(notification.title)
          .setBody(notification.body)
          .setData(notification.data)
          .setSound("notification")
          .android.setAutoCancel(true)
          .android.setCategory(firebase.notifications.Android.Category.Alarm)
          .android.setChannelId(ANDROID_CHANNEL_ID)
          .android.setGroupAlertBehaviour(firebase.notifications.Android.GroupAlert.All)
          .android.setLights(0xFF00FF00, 200, 200)
          .android.setPriority(firebase.notifications.Android.Priority.Max)
          .android.setVibrate(ANDROID_VIBRATION_PATTERN)
          .android.setVisibility(firebase.notifications.Android.Visibility.Public)
          .android.setColor('#000')
          .android.setDefaults(firebase.notifications.Android.Defaults.All);
          
          localNotification.android.setSmallIcon('ic_stat_name')
          localNotification.android.setColor("#113c55")
        firebase
          .notifications()
          .displayNotification(localNotification)
          .catch(err => console.error(err)); 
      });
      console.log('Stage 2')

    // When notification is opened, handle the actions.
    this.notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened((notificationOpen: NotificationOpen) => {
        this.handleOnNotificationOpened(notificationOpen);
      });
      
      console.log('Stage 3')

    if (!notificationOpen) {
        AuthHelpers.getToken()
        .then(value => {
          if (value != null) {
            NavigationHelpers.clearStackAndNavigate("UserHome", this.props.navigation);
          } else {
            NavigationHelpers.clearStackAndNavigate("Welcome", this.props.navigation);
          }
        })
        .catch(reason => {
          NavigationHelpers.clearStackAndNavigate("Welcome", this.props.navigation);
        });
    }
  }

  componentWillUnmount() {
    changeNavigationBarColor(Constants.BACKGROUND_WHITE_COLOR);
    this.notificationOpenedListener;
    this.notificationListener;
  }

  render() {
    return (
      <LinearGradient
        colors={Constants.APP_THEME_COLORS}
        style={{ width: "100%", height: "100%" }}
      >
        <View style={styles.container}>
          <StatusBar backgroundColor={Constants.HEADING_COLOR} translucent />
          <Text style={styles.welcome}>One moment...</Text>
        </View>
      </LinearGradient>
    );
  }
}

const AppStackNavigator = createStackNavigator(
  {
    AccessRequestInfo: AccessRequestInfoScreen,
    AddToCircle: AddToCircleScreen,
    AllAccessRequests: AllAccessRequestsScreen,
    AllPosts: AllPostsScreen,
    Chat: ChatScreen,
    CheckInviteCode: CheckInviteCodeScreen,
    ContactUs: ContactUsScreen,
    EditCardsOnProfile: EditCardsOnProfileScreen,
    FriendRequestInfo: FriendRequestInfoScreen,
    HowItWorks: HowItWorksScreen,
    Landing: App,
    LogIn: LogInScreen,
    NotesFromFounders: NotesFromFoundersScreen,
    PostInfo: PostInfoScreen,
    Profile: ProfileScreen,
    SearchCard: SearchCardScreen,
    SelectCardsYouOwn: SelectCardsYouOwnScreen,
    SignUp: SignUpScreen,
    AllFriendRequests: AllFriendRequestsScreen,
    UserHome: UserHomeScreen,
    Wait: WaitScreen,
    Welcome: WelcomeScreen
  },
  {
    initialRouteName: "Landing",
    headerMode: "none"
    /* The header config from HomeScreen is now here */
  }
);

export default createAppContainer(AppStackNavigator);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Constants.APP_BKGD_COLOR
  },
  welcome: {
    textAlign: "center",
    color: Constants.APP_TEXT_COLOR,
    fontSize: 36,
    fontFamily: "Montserrat-Bold"
  },
  accountAccess: {
    position: "absolute",
    bottom: 0,
    flexDirection: "column",
    flex: 1,
    width: "100%",
    alignItems: "center",
    alignContent: "center"
  },
  headerRightButtonsView: {
    flexDirection: "row"
  },
  horizontalLine: {
    borderBottomColor: Constants.APP_TEXT_COLOR,
    borderBottomWidth: 1,
    width: "90%"
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    height: "10%",
    justifyContent: "space-around"
  },
  accessButtons: {
    width: "48%"
  },
  verticalLine: {
    backgroundColor: Constants.APP_TEXT_COLOR,
    width: 1.5,
    margin: 12
  }
});
