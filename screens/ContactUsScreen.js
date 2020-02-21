import React, {Component} from 'react';
import {Image, Linking, StyleSheet, Text, View,TouchableOpacity, PermissionsAndroid, StatusBar} from 'react-native';
import * as Constants from '../helpers/Constants';
import * as AuthHelpers from '../helpers/AuthHelpers';
import * as Utilities from '../helpers/Utilities';
import * as UIStrings from '../helpers/UIStrings';
import LinearGradient from 'react-native-linear-gradient';
import firebase from 'react-native-firebase';
import CommonStyles from "../components/CommonStyles";
import IconWithCaptionButton from '../components/IconWithCaptionButton';
import * as NavigationHelpers from "../helpers/NavigationHelpers";
import LottieView from 'lottie-react-native'

export default class ContactUsScreen extends Component<Props>{

    constructor(props)
    {
        super(props);
        this.state = {
            floatActive: false,
        }
        this.emailId = "support@circlesway.com"
        this.anchalPhone = "7704000453"
        this.abhiramPhone = "8128829358"
        this.myPhone = ""
    }

    componentDidMount(){
        firebase.analytics().setCurrentScreen("ContactUs", "ContactUsScreen");
        AuthHelpers.getPhoneNumber().then((value)=> {this.myPhone = value});
    }

    onNumberPress(number, founderName){
        let whatsapp_url = "https://wa.me/91" + number + "/?text=Hi " + founderName + ", I'm a user of the Circles app.";
        Linking.canOpenURL(whatsapp_url)
        .then((isSupported) => {
          if (!isSupported){
            alert('Oops, looks like you do not have Whatsapp. You can always text/call us!');
          }
          else{
            Linking.openURL(whatsapp_url);
          }});
    }

    onMailPress(){
        firebase.analytics().logEvent("contactus", {phoneNum: this.myPhone, approach: "mail"});
        let mailUrl = "mailto:" + this.emailId
        Linking.canOpenURL(mailUrl)
        .then((isSupported) => {
          if (!isSupported){
            alert('Please install an email client to send out emails.');
          }
          else{
            Linking.openURL(mailUrl);
          }});
    }

    onImagePress(name){
        firebase.analytics().logEvent("founderDesc", {name: name});
        if (name == "anchal"){
            Utilities.showLongToast("Hmm.. he spends his spare time traveling or hiking.")
        }
        else{
            Utilities.showLongToast("Well, this guy loves watching football and reading books!")
        }
    }

    render()
    {
        return(
            <View style={{flexDirection: 'column', height: "100%", width: '100%'}}>
            <StatusBar  translucent backgroundColor={Constants.APP_STATUS_BAR_COLOR} />

            {/* Banner with contact pictures */}
            <View style={{ position: "absolute", top: 0, height: Constants.LARGE_BANNER_HEIGHT, width: "100%"}}>
              <LinearGradient colors={Constants.APP_THEME_COLORS} style={{ width: '100%', height: '100%', flex:1,}} >
                <Text style={[styles.body, {marginTop: 80}]}>{UIStrings.CONTACT_US_TEXT_1}</Text>
                <Text style={styles.body}>{UIStrings.CONTACT_US_TEXT_2}</Text>
                <Text style={styles.body}>{UIStrings.CONTACT_US_TEXT_3}</Text>  
              </LinearGradient>
             </View>

            {/* Text about the app */}
            <View style={{ position: "absolute", borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderRadius: 80, bottom: 0, height: Constants.SMALL_ARCH_SCREEN_HEIGHT, width: "100%", backgroundColor: Constants.BACKGROUND_WHITE_COLOR}}>
               <View style={{marginHorizontal: "5%", marginTop: "10%", marginBottom: 60}}>
                <Text style={styles.title}>{UIStrings.CONTACT_US}</Text>
               <View style={{width: '100%', flexDirection: 'row', justifyContent:'center'}}>
                   <View style={{width: '50%', flexDirection: 'column'}}>
                       <TouchableOpacity onPress={()=>this.onImagePress("anchal")}>
                           <Image  source={require("../assets/resources/Small_anchal.png")} style={{alignSelf: 'center', width:50, height: 50, borderRadius: 25, overflow: 'hidden'}} />
                       </TouchableOpacity>
                       <Text style={ styles.founderContacts}>{UIStrings.ANCHAL}</Text>
                       <Text style={[styles.founderContacts, {fontSize: 13}]}>{UIStrings.CO_FOUNDER}</Text>
                       <TouchableOpacity onPress={()=>this.onNumberPress(this.anchalPhone, "Anchal")} style={{marginTop: 10}}>
                            <LottieView style={{alignSelf: 'center', width: 50, height: 50}}  source={require("../assets/resources/whatsapp.json")} autoPlay loop />
                        </TouchableOpacity>
                   </View>
                   <View style={{width: '50%', flexDirection: 'column'}}>
                       <TouchableOpacity  onPress={()=>this.onImagePress("abhiram")}>
                           <Image source={require("../assets/resources/Small_Abhiram.jpg")} style={{alignSelf: 'center', width:50, height: 50, borderRadius: 25, overflow: 'hidden'}} />
                       </TouchableOpacity>
                       <Text style={ styles.founderContacts}>{UIStrings.ABHIRAM}</Text>
                       <Text style={[styles.founderContacts, {fontSize: 13}]}>{UIStrings.CO_FOUNDER}</Text>
                       <TouchableOpacity onPress={()=>this.onNumberPress(this.abhiramPhone, "Abhiram")} style={{marginTop: 10}}>
                            <LottieView style={{alignSelf: 'center', width: 50, height: 50}}  source={require("../assets/resources/whatsapp.json")} autoPlay loop />
                        </TouchableOpacity>
                   </View>
                </View>    
               </View>

             </View>

                {/* Bottom menu */}
                <View style={{backgroundColor:Constants.BACKGROUND_WHITE_COLOR, zIndex: 100, position: 'absolute', bottom: 0, flexDirection: 'row', justifyContent: 'space-between', height: 60, width: '100%', padding: 10}}>
                    <IconWithCaptionButton icon="circle-thin" iconType="FontAwesome" caption={UIStrings.CIRCLE} onPress={()=>{this.props.navigation.navigate('UserHome')}} />
                    <IconWithCaptionButton icon="credit-card" iconType="SimpleLineIcons" caption={UIStrings.REQUESTS} onPress={()=>{this.props.navigation.navigate('AllAccessRequests')}} />
                    <IconWithCaptionButton icon="notification" iconType="AntDesign" caption={UIStrings.BROADCASTS} onPress={()=>{this.props.navigation.navigate('AllPosts')}} />
                    <IconWithCaptionButton icon="team" iconType="AntDesign" caption={UIStrings.INVITES} onPress={()=>{this.props.navigation.navigate('AllFriendRequests')}} />
                </View>
             </View>
        )
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1, 
        flexDirection: 'column', 
        justifyContent: 'center'
    },
    title:{
        fontSize: 30, 
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND, 
        fontFamily: 'Montserrat-Regular',
        textAlign: 'center',
        marginBottom: 40,
    },
    body:{
        fontSize: 14, 
        color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND,
        fontFamily: 'Montserrat-Light',
        textAlign: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    founderContacts:{
        fontSize: 16,
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
        fontFamily: 'Montserrat-Light',
        padding: 3,
        textAlign: 'center'
    },
    underline: {
        textDecorationLine: "underline",
    }
})