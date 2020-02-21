import React, {Component} from 'react';
import { Image, Linking, StyleSheet, Text, View, PermissionsAndroid, StatusBar, TouchableOpacity} from 'react-native';
import * as Constants from '../helpers/Constants';
import * as AuthHelpers from '../helpers/AuthHelpers';
import * as UIStrings from '../helpers/UIStrings';
import LinearGradient from 'react-native-linear-gradient';
import firebase from 'react-native-firebase';
import IconWithCaptionButton from '../components/IconWithCaptionButton';
import GradientButton from '../components/GradientButton';
import TopLeftButton from '../components/TopLeftButton';
import * as Utilities from '../helpers/Utilities';
import changeNavigationBarColor from "react-native-navigation-bar-color";

export default class NotesFromFoundersScreen extends Component<Props>{

    constructor(props)
    {
        super(props);
        this.state = {
            floatActive: false,
        }

        this.blueColor = "#001689"

    }

    componentDidMount(){
        firebase.analytics().setCurrentScreen("NotesFromFounders", "NotesFromFoundersScreen");
        changeNavigationBarColor(this.blueColor);
    }

    onImagePress(name){
        firebase.analytics().logEvent("founderInfo", {name: name});
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
            <View style={{flexDirection: 'column', height: "100%", width: '100%' }}>
            <StatusBar  translucent backgroundColor={Constants.APP_STATUS_BAR_COLOR} />
                <View style={{height: '23%', borderBottomRightRadius: 50, backgroundColor: '#001689'}}>
                <View style={{flexDirection: 'row', justifyContent:'center', marginTop: '10%'}}>
                                <View style={{flexDirection: 'column', justifyContent: 'center', marginRight: 20}}>
                                    <TouchableOpacity onPress={()=>this.onImagePress("anchal")}>
                                        <Image source={require("../assets/resources/Small_anchal.png")} style={{marginBottom: 10, alignSelf: 'center', width:60, height: 60, borderRadius: 30, overflow: 'hidden'}} />
                                    </TouchableOpacity>
                                    <Text style={{color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND, textAlign: 'center', fontFamily: Constants.APP_BODY_FONT}}>{UIStrings.ANCHAL}</Text>
                                </View>
                                <View style={{flexDirection: 'column', justifyContent: 'center'}}>
                                    <TouchableOpacity onPress={()=>this.onImagePress("abhiram")}>
                                        <Image source={require("../assets/resources/Small_Abhiram.jpg")} style={{marginBottom: 10, alignSelf: 'center', width:60, height: 60, borderRadius: 30, overflow: 'hidden'}} />
                                    </TouchableOpacity>
                                    <Text style={{color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND, textAlign: 'center', fontFamily: Constants.APP_BODY_FONT}}>{UIStrings.ABHIRAM}</Text>
                                </View>
                </View> 
                </View>
                <TopLeftButton iconName={Constants.ICON_BACK_BUTTON} color={Constants.TEXT_COLOR_FOR_DARK_BACKGROUND} onPress={()=>this.props.navigation.goBack()} />
                <View style={{height: '90%', flexDirection: 'column'}} >
                    <View style={{height: '67%',   backgroundColor: this.blueColor }} >

                        <View style={{height: '100%', backgroundColor: Constants.BACKGROUND_WHITE_COLOR, borderBottomRightRadius: 50, }} >
                            <Text style={{marginTop: 20, fontFamily: Constants.APP_TITLE_FONT, textAlign: 'center', fontSize: 20, color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND}}>A Note from Founders</Text>
                            <Text style={{fontSize: 12.5, paddingHorizontal: 15, marginTop: 30, fontFamily: Constants.APP_BODY_FONT, textAlign: 'left', color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND}}>
                                {UIStrings.NOTE_FROM_FOUNDERS}
                            </Text>
                        </View>   
                    </View>
                    <View style={{height:'40%', backgroundColor: this.blueColor, paddingTop: 20}}>
                        <GradientButton colors={Constants.BUTTON_COLORS_REVERSE} title={UIStrings.TITLE_BACK} onPress={()=>this.props.navigation.goBack()} />
                    </View>
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