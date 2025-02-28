import React, {Component} from 'react';
import {ActivityIndicator, ToastAndroid, StyleSheet, Text, View, ScrollView, TextInput} from 'react-native';
import { FlatList, Image, TouchableOpacity, StatusBar, ImageBackground, Modal} from 'react-native';
import * as Constants from '../helpers/Constants';
import * as UIStrings from '../helpers/UIStrings';
import {Button, Fab, Icon, Left, Right, Input} from 'native-base';
import * as AuthHelpers from '../helpers/AuthHelpers';
import * as Utilities from '../helpers/Utilities';
import CommonStyles from '../components/CommonStyles';
import * as NavigationHelpers from '../helpers/NavigationHelpers';
import * as VirgilEncryptionHelpers from '../helpers/VirgilEncryptionHelpers';
import LinearGradient from 'react-native-linear-gradient';
import firebase from 'react-native-firebase';
import IconWithCaptionButton from '../components/IconWithCaptionButton'
import CreditCardWithText from '../components/CreditCardWithText'
import BottomMenu from '../components/BottomMenu'
import TopRightButton from '../components/TopRightButton';
import CreditCardWithButton from '../components/CreditCardWithButtons';
import GradientButton from '../components/GradientButton';
import LottieView from 'lottie-react-native';

const PROFILE_API = "/user/profile"
const ID_SUFFIX = "?id="
const NEW_ACCESS_REQUEST_API = "/accessRequests/new"

export default class ProfileScreen extends Component<Props>{
    _isMounted = false;
    constructor(props){
        super(props);
        this.state = {
            floatActive: false,
            loading: true,
            name: "",
            phoneNumber: "",
            upiID: "",
            suspended: "",
            cards: [],
            imageUri: null,
            showNoCardsOnProfile: false,
            showPopup: false,
            requestAmount: null,
            selectedCardId: null,
            shortDescription: null,
            requestSubmitButtonColors: Constants.BUTTON_COLORS,
            requestSubmitButtonText: UIStrings.TITLE_SEND
        }

        this.userId = this.props.navigation.getParam("userId");
    }

    componentDidMount()
    {
       this._isMounted = true;
       this.init();
    }

    async init(){
        firebase.analytics().setCurrentScreen(this.userId == null ? "MyProfile" : "FriendProfile", "ProfileScreen");
        let headers = await AuthHelpers.getRequestHeaders();
        let apiEndpoint = this.userId == null ? Constants.SERVER_ENDPOINT + Constants.PROFILE_API :
                            Constants.SERVER_ENDPOINT + Constants.PROFILE_API + ID_SUFFIX + this.userId;
        fetch(apiEndpoint, { method: 'GET', headers: headers })
        .then((response) => {
          if (!this._isMounted){return null;}
          this.setState({loading: false});
          if (response.ok) { 
            return response.json();
          }
    
          if(response.status == Constants.TOKEN_EXPIRED_STATUS_CODE){
            Utilities.showLongToast(UIStrings.SESSION_EXPIRED);
            return null;
          }
          
          Utilities.showLongToast(UIStrings.GENERIC_ERROR);
          return null;
        })
        .then((responseJson) => {
          if (!this._isMounted){return null;}          
          if (responseJson != null){
            this.setState({
                name: responseJson.name,
                phoneNumber: responseJson.phoneNumber,
                upiID: responseJson.upiID,
                cards: responseJson.cards.map((item) => { return {name: item.name, id:item.id, key: item.id.toString()}}),
                imageUri: responseJson.profileImgUrl,
                showNoCardsOnProfile: responseJson.cards == null || responseJson.cards.length == 0
            });
          }
          else {
            ToastAndroid.showWithGravity("Sorry, something went wrong. Please try later.", duration= ToastAndroid.LONG, gravity = ToastAndroid.TOP);
          }
        })
        .catch((error) => { 
          if (!this._isMounted) {return null;}
          this.setState({loading: false});
          console.log('The error message for Profile is: ' + error); 
          ToastAndroid.showWithGravity("Sorry, something went wrong. Please try later.", duration= ToastAndroid.LONG, gravity = ToastAndroid.TOP);
        })
    }

    editCards(){
        this.props.navigation.replace('EditCardsOnProfile', {name: this.state.name, cards: JSON.stringify(this.state.cards)});
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    onRequestPress(item){
      this.setState({ recipientName: this.state.name, selectedCardName: item.name, selectedCardId: item.id, showPopup: true,
                    requestSubmitButtonColors: Constants.BUTTON_COLORS, requestSubmitButtonText: UIStrings.TITLE_SEND, requestAmount: null });
    }
  
    async onRequestSubmit(){
      const {requestAmount, selectedCardId, shortDescription} = this.state
      if (requestAmount < 1){
        Utilities.showLongToast(UIStrings.ENTER_VALID_AMOUNT);
        return;
      }
  
      this.setState({requestSubmitButtonText: UIStrings.SENDING});
      fetch(Constants.SERVER_ENDPOINT + NEW_ACCESS_REQUEST_API, 
        {
          method: Constants.POST_METHOD, 
          body: JSON.stringify({ to: this.userId, cardId: selectedCardId, amount: requestAmount, shortDesc: shortDescription }),
          headers: await AuthHelpers.getRequestHeaders()
        })
      .then((response)=>{
        if (!this._isMounted){
          return null;
        }
  
        if (response.ok){
          this.setState({requestSubmitButtonText: UIStrings.SENT, requestSubmitButtonColors: Constants.SUCCESS_COLORS})
          setTimeout(()=>{this.setState({showPopup: false})}, 1000);
          Utilities.showLongToast(UIStrings.REQUEST_SENT);
          VirgilEncryptionHelpers.registerVirgilForUser(); // make sure user is registered on virgil
          return null;
        }
  
        this.setState({requestSubmitButtonText: UIStrings.TITLE_SEND});
        if (response.status == Constants.TOKEN_EXPIRED_STATUS_CODE){
          Utilities.showLongToast(UIStrings.SESSION_EXPIRED);
          return null;
        }
  
        Utilities.showLongToast(UIStrings.GENERIC_ERROR);
        return null;
      })
      .catch(err=>{
        console.log('Error submitting access request: ' + err);
        if (!this._isMounted){
          return null;
        }
        
        this.setState({requestSubmitButtonText: UIStrings.TITLE_SEND});
        Utilities.showLongToast(UIStrings.GENERIC_ERROR);
      })
    }

    render()
    {
        return(
          <View style={{flexDirection: 'column', height: "100%", width: '100%'}}>
            <StatusBar  translucent backgroundColor={Constants.APP_STATUS_BAR_COLOR} />

            {/* Popup view */}
            {
                <Modal visible={this.state.showPopup} transparent={true} onRequestClose={()=>{this.setState({showPopup: false})}}>
                  <View style={CommonStyles.popupContainer}>
                    <View style={CommonStyles.popup}>
                      <TopRightButton color={Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND} iconName="times" onPress={()=>{this.setState({showPopup: false})}} height={50}/>
                      <LottieView style={{alignSelf: 'center', width: '70%', height: 90}}  source={require("../assets/resources/unlock.json")} autoPlay loop />
                      <Text numberOfLines={1} style={[CommonStyles.popupTitle, {marginBottom: 20}]}>{UIStrings.TITLE_NEW_REQUEST_TO}{Utilities.getFirstName(this.state.recipientName)}</Text>

                      <View style={{flexDirection:'row', justifyContent: 'space-between', marginBottom: 20, overflow: 'hidden'}}>
                        <Text style={styles.arPopupTextName}>{UIStrings.CARD_COLON}</Text>
                        <Text numberOfLines={2} style={styles.arPopupTextValue}>{this.state.selectedCardName}</Text>
                      </View>
                      <View style={{flexDirection:'row', justifyContent: 'space-between', marginBottom: 15}}>
                        <Text style={styles.arPopupTextName}>{UIStrings.AMOUNT_COLON}</Text>
                        <TextInput onChangeText={(val)=>this.setState({requestAmount: val})} style={styles.arInput}
                                  placeholderTextColor={Constants.APP_PLACEHOLDER_TEXT_COLOR} placeholder={UIStrings.PLACEHOLDER_ENTER_AMOUNT}
                                  keyboardType="number-pad" />
                      </View>
                      <View style={{flexDirection:'row', justifyContent: 'space-between', marginBottom: 15}}>
                        <Text style={styles.arPopupTextName}>{UIStrings.WHAT_FOR_COLON}</Text>
                        <TextInput onChangeText={(val)=>this.setState({shortDescription: val})} 
                                  style={styles.arInput}
                                  placeholderTextColor={Constants.APP_PLACEHOLDER_TEXT_COLOR} 
                                  maxLength={Constants.SHORT_DESCRIPTION_MAX_LENGTH}
                                  placeholder={UIStrings.PLACEHOLDER_SHORT_DESCRIPTION} />
                      </View>
                      <GradientButton colors={this.state.requestSubmitButtonColors} onPress={()=>this.onRequestSubmit()} title={this.state.requestSubmitButtonText} />
                    </View>
                    </View>
                  </Modal>
            }

             {/* Banner with Image */}
             <View style={{ position: "absolute", top: 0, height: Constants.SMALL_BANNER_HEIGHT, width: "100%"}}>
              <LinearGradient colors={Constants.APP_THEME_COLORS} style={{width: '100%', height: '100%'}} >
                <Image resizeMethod="resize" source={{uri: this.state.imageUri}} style={{backgroundColor: Constants.IMAGE_DEFAULT_BKGD_COLOR, alignSelf: 'center', marginTop: '11%', width:110, height: 110, borderRadius: 55, overflow: 'hidden'}}/>
              </LinearGradient>
             </View>

             {/* Arch */}
             <View style={{position: "absolute", borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderRadius: 50, bottom: 0, height: Constants.LARGE_ARCH_SCREEN_HEIGHT, width: "100%", backgroundColor: Constants.BACKGROUND_WHITE_COLOR}}>
               <ScrollView scrollEnabled={true} style={{flex: 1, marginHorizontal: "8%", marginTop: "10%", marginBottom: Constants.BOTTOM_MENU_HEIGHT}}>
                  {this.state.loading ? 
                    <LottieView style={{alignSelf: 'center', width: '70%', height: 90, marginVertical: 20, marginHorizontal: 10}} 
                      source={require("../assets/resources/loading.json")} autoPlay loop />
                    :
                    null}
                  <View style={{flexDirection: 'row', padding: 10, paddingVertical: 3}}>
                      <Icon name="user" type="FontAwesome5" style={styles.icon} />
                      <Text numberOfLines={1} style={styles.infoTitle}>{this.state.name}</Text>
                  </View>
                  <View style={styles.line} />
                  <View style={{flexDirection: 'row', padding: 10, paddingVertical: 3}}>
                      <Icon name="phone" type="FontAwesome" style={styles.icon} />
                      <Text style={styles.infoTitle}>{this.state.phoneNumber}</Text>
                  </View>
                  <View style={styles.line} />

                  {/* Show the cards */}
                  {
                    this.state.showNoCardsOnProfile ? 
                      <View style={{flexDirection: 'row', justifyContent: 'center', marginVertical: 20}}>
                        <Text style={[styles.infoTitle, {padding: 10, textAlign: 'center'}]}>{UIStrings.NO_CARDS_ON_PROFILE}</Text>
                      </View>
                      :
                      <View style={{marginBottom: 20, marginTop: 10}}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                          <Text style={{paddingLeft: '5%', fontFamily: Constants.APP_BODY_FONT, fontSize: 12, color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND}}>{UIStrings.CARDS_COLON}{this.state.cards.length}</Text>
                        </View>
                        {
                          this.userId == null ?
                          <FlatList showsHorizontalScrollIndicator={false} style={{marginTop: 10}} horizontal={true} data={this.state.cards} 
                          renderItem={({ item })=> (
                                      <CreditCardWithText name={this.state.name} title={item.name} imgName={Utilities.getCardTemplateForCard(item.id)} />
                                  )} />
                          :
                          <FlatList showsHorizontalScrollIndicator={false} style={{marginTop: 20}} horizontal={true} data={this.state.cards} 
                          renderItem={({ item })=> (
                                        <CreditCardWithButton title={item.name} imgName={Utilities.getCardTemplateForCard(item.id)}
                                        leftButtonParams={{caption: UIStrings.REQUEST, icon: Constants.CARD_REQUEST_ICON_NAME, type: Constants.CARD_REQUEST_ICON_TYPE, onPress: ()=> this.onRequestPress(item)}} 
                                        rightButtonParams={{caption: UIStrings.CALL, icon: "phone", onPress: ()=> Utilities.goToDialScreen(this.state.phoneNumber)}} />
                                    )} />
                        }

                      </View>
                  }
                  {
                      this.userId == null ?
                      <GradientButton title={UIStrings.ADD_CARDS} onPress={()=>this.editCards()} />
                      :
                      null
                  }
                  
               </ScrollView>
             </View>
            {/* Bottom menu */}
            <BottomMenu navigation={this.props.navigation} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    name: {
      marginTop: 10, 
      width: 210,
      paddingHorizontal: 8, 
      color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND, 
      fontSize:14, 
      fontFamily: 'Montserrat-Regular', 
      textAlign: "center"
    },
    cardsList:{
        width: 300, 
        height: 150, 
        alignSelf: 'center', 
        marginTop: 10,
        marginBottom: 20,
        borderColor: Constants.APP_TEXT_COLOR, 
        borderWidth: 1,
        borderRadius: 10
    },
    line:{
      borderBottomWidth: 1, 
      marginVertical: 3, 
      borderColor: Constants.BACKGROUND_GREY_COLOR, 
      width: '90%', 
      alignSelf: 'center'
    },
    icon:{
      width: 50, 
      alignSelf: 'center', 
      justifyContent: 'center',
      padding: 8,
      fontSize: 18, 
    },
    infoTitle:{
      fontFamily: Constants.APP_SUBTITLE_FONT,
      fontSize: 15,
      color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
      paddingVertical: 5,
      overflow: 'hidden',
      textAlignVertical: 'center',
    },
    arPopupTextValue:{
      fontFamily: Constants.APP_BODY_FONT, 
      fontSize: 14,
      textAlign: 'left',
      width: 180,
      color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
    },
    arPopupTextName:{
      fontFamily: Constants.APP_BODY_FONT, 
      fontSize: 12,
      textAlign: 'center',
      textAlignVertical: 'center',
      color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
    },
    arInput:{
      backgroundColor: Constants.BACKGROUND_GREY_COLOR, 
      height: 40, 
      marginLeft: 10, 
      width: 180, 
      alignSelf: 'center', 
      borderRadius: 8, 
      fontSize: 14, 
      color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND, 
      fontFamily: "Montserrat-Light" 
    }
});