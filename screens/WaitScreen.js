import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, PermissionsAndroid} from 'react-native';
import { Picker, TextInput, StatusBar } from 'react-native';
import {Button, Fab, Icon} from 'native-base';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import firebase from 'react-native-firebase';
import * as Constants from '../helpers/Constants';
import * as UIStrings from '../helpers/UIStrings';
import * as NavigationHelpers from '../helpers/NavigationHelpers';
import LinearGradient from 'react-native-linear-gradient';
import GradientButton from '../components/GradientButton';


export default class WaitScreen extends Component<Props>{
    constructor(props)
    {
        super(props);
        this.state = {
            floatActive: false,
        };

        this.type = this.props.navigation.getParam("type", Constants.NONE);
        this.title = this.props.navigation.getParam("title", Constants.NONE);
        this.body = this.props.navigation.getParam("body", Constants.NONE);
    }

    componentDidMount(){
        firebase.analytics().setCurrentScreen("Wait");
    }

    render()
    {
        return (
        <LinearGradient colors={Constants.APP_THEME_COLORS} style={{width: '100%', height: '100%'}} >
        <View style={styles.container}>
            <StatusBar translucent backgroundColor={Constants.APP_THEME_COLORS[0]}/>
            <Text style={styles.title}>{this.title}</Text>
            <Text style={styles.body}>{this.body}</Text>
            <GradientButton text={"HOME"} onPress={()=>NavigationHelpers.clearStackAndNavigate('UserHome', this.props.navigation)}/>
        </View>
        </LinearGradient>
        );
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
        color: Constants.APP_TEXT_COLOR, 
        textAlign: 'center',
        fontFamily: 'Montserrat-Regular'
    },
    body:{
        fontSize: 15, 
        color: Constants.APP_TEXT_COLOR, 
        marginTop: 30, 
        textAlign: 'center',
        padding: 10,
        fontFamily: 'Montserrat-Light'
    },
    button:{
        backgroundColor: Constants.APP_BUTTON_COLOR, 
        alignSelf: 'center', 
        marginTop: 50
    },
    buttonText:{
        color: Constants.APP_BUTTON_TEXT_COLOR, 
        padding: 30,
        fontWeight:'bold'
    }
})