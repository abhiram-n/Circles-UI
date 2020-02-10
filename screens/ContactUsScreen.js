import React, {Component} from 'react';
import {Image, Linking, StyleSheet, Text, View,TouchableOpacity, PermissionsAndroid, StatusBar} from 'react-native';
import * as Constants from '../helpers/Constants';
import * as AuthHelpers from '../helpers/AuthHelpers';
import * as Utilities from '../helpers/Utilities';
import * as UIStrings from '../helpers/UIStrings';
import LinearGradient from 'react-native-linear-gradient';
import firebase from 'react-native-firebase';
import CirclePopup from "../components/CirclePopup";
import CommonStyles from "../components/CommonStyles";
import IconWithCaptionButton from '../components/IconWithCaptionButton';
import * as NavigationHelpers from "../helpers/NavigationHelpers";

export default class ContactUsScreen extends Component<Props>{

    constructor(props)
    {
        super(props);
        this.state = {
            floatActive: false,
            showCirclePopup: false
        }
        this.emailId = "support@circlesway.com"
        this.anchalPhone = "7704000453"
        this.abhiramPhone = "8128829358"
        this.myPhone = ""
    }

    componentDidMount(){
        firebase.analytics().setCurrentScreen("ContactUs");
        AuthHelpers.getPhoneNumber().then((value)=> {this.myPhone = value});
    }

    onNumberPress(number, founderName){
        firebase.analytics().logEvent("contactus", {phoneNum: this.myPhone, approach: "phone"});
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

    onCirclePress(){
        this.setState((prevState)=> ({showCirclePopup: !prevState.showCirclePopup}));
    }

    onImagePress(name){
        if (name == "anchal"){
            Utilities.showLongToast("Hey! He spends his spare time traveling or hiking.")
        }
        else{
            Utilities.showLongToast("Well, this guy loves watching football and reading books!")
        }
    }

    render()
    {
        return(
            <View style={{flexDirection: 'column', height: "100%", width: '100%'}}>
            <StatusBar  backgroundColor={Constants.APP_THEME_COLORS[0]} />

            {/* Banner with contact pictures */}
            <View style={{alignItems: "center", position: "absolute", top: 0, height: Constants.LARGE_BANNER_HEIGHT, width: "100%"}}>
              <LinearGradient colors={Constants.APP_THEME_COLORS} style={{ width: '100%', height: '100%', justifyContent: 'center', flex:1,}} >
              <View style={{width: '100%', flexDirection: 'row', justifyContent:'center'}}>
                   <View style={{width: '50%', flexDirection: 'column'}}>
                       <TouchableOpacity onPress={()=>this.onImagePress("anchal")}>
                           <Image  source={require("../assets/logo/Small_Anchal.jpg")} style={{alignSelf: 'center', width:50, height: 50, borderRadius: 25, overflow: 'hidden'}} />
                       </TouchableOpacity>
                       <Text style={ styles.founderContacts}>{UIStrings.ANCHAL}</Text>
                       <Text style={ styles.founderContacts}>{UIStrings.CO_FOUNDER}</Text>
                       <TouchableOpacity onPress={()=>this.onNumberPress(this.anchalPhone, "Anchal")} style={{marginTop: 10}}>
                            <Image  source={require("../assets/logo/whatsapp.png")} style={{alignSelf: 'center', width: 25, height: 25}}/>
                        </TouchableOpacity>
                   </View>
                   <View style={{width: '50%', flexDirection: 'column'}}>
                       <TouchableOpacity  onPress={()=>this.onImagePress("abhiram")}>
                           <Image source={require("../assets/logo/Small_Abhiram.jpg")} style={{alignSelf: 'center', width:50, height: 50, borderRadius: 25, overflow: 'hidden'}} />
                       </TouchableOpacity>
                       <Text style={ styles.founderContacts}>{UIStrings.ABHIRAM}</Text>
                       <Text style={ styles.founderContacts}>{UIStrings.CO_FOUNDER}</Text>
                       <TouchableOpacity onPress={()=>this.onNumberPress(this.abhiramPhone, "Abhiram")} style={{marginTop: 10}}>
                            <Image  source={require("../assets/logo/whatsapp.png")} style={{alignSelf: 'center', width: 25, height: 25}}/>
                        </TouchableOpacity>
                   </View>
                </View>
              </LinearGradient>
             </View>

            {/* Text about the app */}
            <View style={{ position: "absolute", borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderRadius: 80, bottom: 0, height: Constants.SMALL_ARCH_SCREEN_HEIGHT, width: "100%", backgroundColor: Constants.BACKGROUND_WHITE_COLOR}}>
               <View style={{marginHorizontal: "5%", marginTop: "15%", marginBottom: 60}}>
               <Text style={styles.title}>{UIStrings.CONTACT_US}</Text>
                <Text style={[styles.body, {marginTop: 30}]}>{UIStrings.CONTACT_US_TEXT_1}{UIStrings.CONTACT_US_TEXT_2}</Text>
                {/* <Text style={styles.body}>{UIStrings.CONTACT_US_TEXT_2}</Text> */}
                <Text style={styles.body}>{UIStrings.CONTACT_US_TEXT_3}</Text>      
               </View>
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
                    <IconWithCaptionButton icon="paper-plane" iconType="FontAwesome5" caption={UIStrings.TITLE_CONTACT_US}/>
                    <IconWithCaptionButton icon="log-out" iconType="Ionicons" caption={UIStrings.SIGN_OUT} onPress={()=>NavigationHelpers.logout(this.props.navigation) } />
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
    },
    body:{
        fontSize: 16, 
        color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
        marginTop: 10, 
        fontFamily: 'Montserrat-Light',
        textAlign: 'center',
        padding: 10
    },
    founderContacts:{
        fontSize: 16,
        marginTop: 5,
        color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND,
        fontFamily: 'Montserrat-Light',
        padding: 5,
        textAlign: 'center'
    },
    underline: {
        textDecorationLine: "underline",
    }
})