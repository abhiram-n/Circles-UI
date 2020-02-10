import React, {Component} from 'react';
import { Image, Linking, StyleSheet, Text, View, PermissionsAndroid, StatusBar} from 'react-native';
import * as Constants from '../helpers/Constants';
import * as AuthHelpers from '../helpers/AuthHelpers';
import * as UIStrings from '../helpers/UIStrings';
import LinearGradient from 'react-native-linear-gradient';
import firebase from 'react-native-firebase';
import IconWithCaptionButton from '../components/IconWithCaptionButton';
import TopLeftButton from '../components/TopLeftButton';
import changeNavigationBarColor from "react-native-navigation-bar-color";

export default class NotesFromFoundersScreen extends Component<Props>{

    constructor(props)
    {
        super(props);
        this.state = {
            floatActive: false,
        }

        this.blueColor = "#0000BD"

    }

    componentDidMount(){
        firebase.analytics().setCurrentScreen("NotesFromFounders");
        changeNavigationBarColor(this.blueColor);
    }

    render()
    {
        return(
            <View style={{flexDirection: 'column', height: "100%", width: '100%' }}>
                <StatusBar translucent backgroundColor='transparent' />
                <View style={{height: '20%', borderBottomRightRadius: 50, backgroundColor: '#0000BD'}} />
                <TopLeftButton iconName={Constants.ICON_BACK_BUTTON} color={Constants.TEXT_COLOR_FOR_DARK_BACKGROUND} onPress={()=>this.props.navigation.goBack()} />
                <View style={{height: '90%', flexDirection: 'column'}} >
                    <View style={{height: '70%',   backgroundColor: this.blueColor }} >
                        <View style={{height: '100%', backgroundColor: Constants.BACKGROUND_WHITE_COLOR, borderBottomRightRadius: 50 }} >
                            <Text style={{marginTop: 20, fontFamily: Constants.APP_TITLE_FONT, textAlign: 'center', fontSize: 20, color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND}}>A Note from Founders</Text>
                            <Text style={{paddingHorizontal: 10, marginTop: 30, fontFamily: Constants.APP_BODY_FONT, textAlign: 'center', color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND}}>
                                Here is a sample text. Here is a sample text.Here is a sample text.Here is a sample text.Here is a sample text.Here is a sample text.Here is a sample text.Here is a sample text.Here is a sample text.Here is a sample text.
                            </Text>
                            <View style={{flexDirection: 'row', justifyContent:'center', marginTop: 20}}>
                                <View style={{flexDirection: 'column', justifyContent: 'center', marginRight: 20}}>
                                    <Image source={require("../assets/logo/Small_Anchal.jpg")} style={{marginBottom: 10, alignSelf: 'center', width:50, height: 50, borderRadius: 25, overflow: 'hidden'}} />
                                    <Text style={{color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND, textAlign: 'center', fontFamily: Constants.APP_BODY_FONT}}>{UIStrings.ANCHAL}</Text>
                                </View>
                                <View style={{flexDirection: 'column', justifyContent: 'center'}}>
                                    <Image source={require("../assets/logo/Small_Abhiram.jpg")} style={{marginBottom: 10, alignSelf: 'center', width:50, height: 50, borderRadius: 25, overflow: 'hidden'}} />
                                    <Text style={{color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND, textAlign: 'center', fontFamily: Constants.APP_BODY_FONT}}>{UIStrings.ABHIRAM}</Text>
                                </View>

                            </View>
                        </View>   
                    </View>
                    <View style={{height:'40%', backgroundColor: this.blueColor}} />
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