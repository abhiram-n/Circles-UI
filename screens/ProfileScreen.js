import React, {Component} from 'react';
import {ActivityIndicator, ToastAndroid, StyleSheet, Text, View, ScrollView} from 'react-native';
import { FlatList, Image, TouchableOpacity, StatusBar, ImageBackground, Modal} from 'react-native';
import * as Constants from '../helpers/Constants';
import * as UIStrings from '../helpers/UIStrings';
import {Button, Fab, Icon, Left, Right, Input} from 'native-base';
import * as AuthHelpers from '../helpers/AuthHelpers';
import * as Utilities from '../helpers/Utilities';
import CommonStyles from '../components/CommonStyles';
import * as NavigationHelpers from '../helpers/NavigationHelpers';
import LinearGradient from 'react-native-linear-gradient';
import firebase from 'react-native-firebase';
import IconWithCaptionButton from '../components/IconWithCaptionButton'
import CreditCardWithText from '../components/CreditCardWithText'
import TopRightButton from '../components/TopRightButton';
import CirclePopup from '../components/CirclePopup';
import CreditCardWithButton from '../components/CreditCardWithButtons';
import GradientButton from '../components/GradientButton';

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
            showCirclePopup: false,
            showNoCardsOnProfile: false,
            showPopup: false,
            requestAmount: null,
            selectedCardId: null,
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
        firebase.analytics().setCurrentScreen("Profile");
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

    onCirclePress(){
      this.setState((prevState)=> ({showCirclePopup: !prevState.showCirclePopup}));
    }

    onRequestPress(item){
      this.setState({ recipientName: this.state.name, selectedCardName: item.name, selectedCardId: item.id, showPopup: true,
                    requestSubmitButtonColors: Constants.BUTTON_COLORS, requestSubmitButtonText: UIStrings.TITLE_SEND });
    }
  
    async onRequestSubmit(){
      const {requestAmount, selectedCardId} = this.state
      if (requestAmount < 1){
        Utilities.showLongToast(UIStrings.ENTER_VALID_AMOUNT);
        return;
      }
  
      this.setState({requestSubmitButtonText: UIStrings.SENDING});
      fetch(Constants.SERVER_ENDPOINT + NEW_ACCESS_REQUEST_API, 
        {
          method: Constants.POST_METHOD, 
          body: JSON.stringify({ to: this.userId, cardId: selectedCardId, amount: requestAmount }),
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
            <StatusBar  backgroundColor={Constants.APP_THEME_COLORS[0]} />
            {
              this.userId == null ? 
                <TopRightButton color={Constants.BACKGROUND_WHITE_COLOR} iconName="pencil-alt" onPress={()=>this.editCards()}/>
                : 
                null
            }

            {/* Popup view */}
            {
                <Modal visible={this.state.showPopup} transparent={true} onRequestClose={()=>{this.setState({showPopup: false})}}>
                  <View style={CommonStyles.popupContainer}>
                    <View style={CommonStyles.popup}>
                      <TopRightButton color={Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND} iconName="times" onPress={()=>{this.setState({showPopup: false})}} height={50}/>
                      <Text style={CommonStyles.popupTitle}>{UIStrings.TITLE_NEW_REQUEST}</Text>
                      <Text numberOfLines={1} style={CommonStyles.popupText}>
                        {UIStrings.TO_COLON}{this.state.recipientName}
                      </Text>
                      <Text numberOfLines={1} style={[{marginTop: 30}, CommonStyles.popupText ]}>
                        {UIStrings.CARD_COLON}{this.state.selectedCardName}
                      </Text>
                      <View style={{flexDirection: 'row', marginTop: 13, marginBottom: 30, justifyContent: 'center', alignContent: 'center'}}>
                        <Text style={CommonStyles.popupText}>{UIStrings.AMOUNT_COLON}</Text>
                        <Input onChangeText={(val)=>this.setState({requestAmount: val})} style={{ fontSize: 16, color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND, fontFamily: "Montserrat-Light" }}
                                placeholderTextColor={Constants.APP_PLACEHOLDER_TEXT_COLOR}
                                placeholder={UIStrings.PLACEHOLDER_REQUEST_AMOUNT}
                                keyboardType="number-pad" />
                      </View>
                      <GradientButton colors={this.state.requestSubmitButtonColors} onPress={()=>this.onRequestSubmit()} title={this.state.requestSubmitButtonText} />
                    </View>
                    </View>
                  </Modal>
            }

             {/* Banner with Image */}
             <View style={{ position: "absolute", top: 0, height: Constants.SMALL_BANNER_HEIGHT, width: "100%"}}>
              <LinearGradient colors={Constants.APP_THEME_COLORS} style={{width: '100%', height: '100%'}} >
                <Image resizeMethod="resize" source={{uri: this.state.imageUri}} style={{ alignSelf: 'center', marginTop: '11%', width:110, height: 110, borderRadius: 55, overflow: 'hidden'}}/>
              </LinearGradient>
             </View>

             {/* Arch */}
             <View style={{position: "absolute", borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderRadius: 50, bottom: 0, height: Constants.LARGE_ARCH_SCREEN_HEIGHT, width: "100%", backgroundColor: Constants.BACKGROUND_WHITE_COLOR}}>
               <ScrollView scrollEnabled={true} style={{flex: 1, marginHorizontal: "8%", marginTop: "15%", marginBottom: Constants.BOTTOM_MENU_HEIGHT}}>
                  {this.state.loading ? <ActivityIndicator size="large" color={Constants.APP_LOADING_COLOR}/> : null}
                  <View style={{flexDirection: 'row', padding: 10}}>
                      <Icon name="user" type="FontAwesome5" style={styles.icon} />
                      <Text numberOfLines={1} style={styles.infoTitle}>{this.state.name}</Text>
                  </View>
                  <View style={styles.line} />
                  <View style={{flexDirection: 'row', padding: 10}}>
                      <Icon name="phone" type="FontAwesome5" style={styles.icon} />
                      <Text style={styles.infoTitle}>{this.state.phoneNumber}</Text>
                  </View>
                  <View style={styles.line} />
                  {
                    this.state.showNoCardsOnProfile ? 
                      <Text style={[styles.infoTitle, {padding: 10, textAlign: 'center'}]}>{UIStrings.NO_CARDS_ON_PROFILE}</Text>
                      :
                      <View>
                        {
                          this.userId == null ?
                          <FlatList showsHorizontalScrollIndicator={false} style={{marginTop: 20}} horizontal={true} data={this.state.cards} 
                          renderItem={({ item })=> (
                                      <CreditCardWithText name={this.state.name} title={item.name} colors={Utilities.getColorForCard(item.id)} />
                                  )} />
                          :
                          <FlatList showsHorizontalScrollIndicator={false} style={{marginTop: 20}} horizontal={true} data={this.state.cards} 
                          renderItem={({ item })=> (
                                        <CreditCardWithButton title={item.name} colors={Utilities.getColorForCard(item.id)}
                                        leftButtonParams={{caption: UIStrings.REQUEST, icon: "paper-plane", type: "FontAwesome", onPress: ()=> this.onRequestPress(item)}} 
                                        rightButtonParams={{caption: UIStrings.CALL, icon: "phone", onPress: ()=> Utilities.goToDialScreen(this.state.phoneNumber)}} />
                                    )} />
                        }

                      </View>
                  }
                  
               </ScrollView>
             </View>

            {/* Circle popup */}
            { <CirclePopup  onClose={()=>this.onCirclePress()} isVisible={this.state.showCirclePopup} navigate={this.props.navigation.navigate} />  }

            {/* Bottom menu */}
            <View style={{backgroundColor:Constants.BACKGROUND_WHITE_COLOR, zIndex: 100, position: 'absolute', bottom: 0, flexDirection: 'row', justifyContent: 'center', height: Constants.BOTTOM_MENU_HEIGHT, width: '100%', padding: 10}}>
                <IconWithCaptionButton icon="home" iconType="FontAwesome5" caption={UIStrings.HOME}  onPress={()=>NavigationHelpers.clearStackAndNavigate('UserHome', this.props.navigation)} />
                <IconWithCaptionButton icon="user" iconType="FontAwesome5" caption={UIStrings.PROFILE} onPress={()=>{if (this.userId != null){this.props.naviation.navigate('Profile')}}} />
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
      marginVertical: 8, 
      borderColor: Constants.BACKGROUND_GREY_COLOR, 
      width: '90%', 
      alignSelf: 'center'
    },
    icon:{
      width: 50, 
      alignSelf: 'center', 
      justifyContent: 'center',
      padding: 10,
      fontSize: 24, 
    },
    infoTitle:{
      fontFamily: Constants.APP_SUBTITLE_FONT,
      fontSize: 17,
      color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
      paddingBottom: 5,
      overflow: 'hidden',
      textAlignVertical: 'center',
    }
});