
import React, {Component} from 'react';
import {Alert, Platform, StyleSheet, Text, View, PermissionsAndroid, Linking, FlatList, Modal} from 'react-native';
import { ActivityIndicator, Image, Picker, TextInput, ToastAndroid, TouchableOpacity, StatusBar } from 'react-native';
import { Button, Fab, Icon, Input, InputGroup } from 'native-base';
import {createStackNavigator, createAppContainer, ScrollView} from 'react-navigation';
import SearchableDropdown from 'react-native-searchable-dropdown';
import firebase from 'react-native-firebase';
import * as Constants from '../helpers/Constants';
import * as Utilities from '../helpers/Utilities';
import * as UIStrings from '../helpers/UIStrings';
import * as AuthHelpers from '../helpers/AuthHelpers';
import * as NavigationHelpers from '../helpers/NavigationHelpers';
import * as VirgilEncryptionHelpers from '../helpers/VirgilEncryptionHelpers';
import CommonStyles from '../components/CommonStyles';
import LogInScreen from './LogInScreen';
import LinearGradient from 'react-native-linear-gradient';
import IconWithCaptionButton from "../components/IconWithCaptionButton";
import CreditCardWithButton from '../components/CreditCardWithButtons';
import TopRightButton from '../components/TopRightButton';
import GradientButton from '../components/GradientButton';
import LottieView from 'lottie-react-native'

const GET_ALL_CARDS_API = "/card/all"
const FIND_CARD_HOLDERS_API = '/user/search/cardholders?cardId='
const NEW_ACCESS_REQUEST_API = "/accessRequests/new"
class SearchCardScreen extends Component
{
  _isMounted = false;
  constructor(props)
  {
    super(props);
    this.state = {
      allCards: [],
      usersWithCards: -1,
      cardIdToSearch: 0,
      cardNameToSearch: "",
      selectedCardId: 0,
      selectedCardName: "",
      cardHoldersText: "",
      floatActive: false,
      loading: false,
      numCardholdersInCircle: -1,
      numCardholdersOutsideCircle: -1,
      cardholdersInCircle: [],
      cardholdersOutsideCircle: [],
      allCardHolders: [],
      recipientName: null,
      recipientId: null,
      requestAmount: 0,
      shortDescription: null,
      showPopup: false,
      requestSubmitButtonText: UIStrings.TITLE_SEND,
      requestSubmitButtonColors: Constants.BUTTON_COLORS,
      mutualFriendName: null 
    };

    this.myPhoneNumber = AuthHelpers.getPhoneNumber();
  }

  componentDidMount()
  {
    this._isMounted = true;
    this.setState({loading: true});
    
    firebase.analytics().setCurrentScreen("Search", "SearchCardScreen");
    fetch(Constants.SERVER_ENDPOINT + GET_ALL_CARDS_API, { method: 'GET' })
    .then((response) => {
      if (!this._isMounted){return null;}
      if(response.ok) { return response.json() }
      Utilities.showLongToast(UIStrings.CANNOT_GET_CARDS);
      return null;
    })
    .then((responseJson) => {
                            if(responseJson != null){
                             var cardArray = responseJson.cards.map((item) =>  {return {name: item.name, id: item.id, key:  item.id.toString()}});
                             this.setState({allCards: cardArray, loading: false});
                            }})
    .catch((error) => { 
      if (!this._isMounted) {return null;}
      this.setState({loading: false});
      console.debug('The error message for allCards is: ' + error);
      Utilities.showLongToast(UIStrings.CANNOT_GET_CARDS);
    });
  }

  componentWillUnmount(){
    this._isMounted = false;
  }

  async searchCardholders(item)
  {
    // Reset everything
    this.setState({cardIdToSearch: item.id, 
                    cardNameToSearch: item.name, 
                    loading: true,
                    numCardholdersInCircle: -1, 
                    numCardholdersOutsideCircle: -1,
                    cardholdersInCircle: null,
                    cardholdersOutsideCircle: null})
    let headers = await AuthHelpers.getRequestHeaders();

    fetch(Constants.SERVER_ENDPOINT + FIND_CARD_HOLDERS_API + this.state.cardIdToSearch, { method: 'GET', headers: headers })
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

      Utilities.showLongToast(UIStrings.ERROR_SEARCHING_CARDHOLDERS);
      return null;
    })
    .then((responseJson) => {
      if (responseJson != null){
        cardholdersInCircle = responseJson.first.map(item => {
          return { name: item.name, id: item.id, key: item.id.toString(), phoneNumber: item.phoneNumber, cardId: item.cardId, cardName: item.cardName };
        });

        cardholdersOutsideCircle = responseJson.second.map(item => {
          return { name: item.name, id: item.id, key: item.id.toString(), cardId: item.cardId, cardName: item.cardName, friendName: item.friendName };
        });

        this.setState({
          numCardholdersInCircle: responseJson.numFirst, 
          numCardholdersOutsideCircle: responseJson.numSecond,
          cardholdersInCircle: cardholdersInCircle,
          cardholdersOutsideCircle: cardholdersOutsideCircle,
        })

        firebase.analytics().logEvent("Search", {card: item.name, first: responseJson.numFirst, second: responseJson.numSecond});
      }
    })
    .catch((error) => { 
      console.log('The error message for searchCardholders is: ' + error); 
      if (!this._isMounted) {return null;}
      Utilities.showLongToast(UIStrings.ERROR_SEARCHING_CARDHOLDERS);
    })
  }

  onRequestPress(item, friendName){
    this.setState({ recipientName: item.name, recipientId: item.id, showPopup: true, selectedCardId: item.cardId, requestAmount: null,
      selectedCardName: item.cardName, requestSubmitButtonText: UIStrings.TITLE_SEND, requestSubmitButtonColors: Constants.BUTTON_COLORS,
      mutualFriendName: friendName ?? null });
  }

  async onRequestSubmit(){
    const {recipientId, requestAmount, selectedCardId, shortDescription, mutualFriendName } = this.state
    if (requestAmount < 1){
      Utilities.showLongToast(UIStrings.ENTER_VALID_AMOUNT);
      return;
    }

    this.setState({requestSubmitButtonText: UIStrings.SENDING});
    fetch(Constants.SERVER_ENDPOINT + NEW_ACCESS_REQUEST_API, 
      {
        method: Constants.POST_METHOD, 
        body: JSON.stringify({ to: recipientId, cardId: selectedCardId, amount: requestAmount, shortDesc: shortDescription, mutualFriendName: mutualFriendName }),
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

  getSecondDegreeCardholderDisplayName(secondDegreeFriendName, friendName){
    withCardholderName = UIStrings.SECOND_DEGREE_CARDHOLDER_NAME.replace("%0", secondDegreeFriendName);
    return withCardholderName.replace("%1", friendName);
  }

  render(){
    let { navigate } = this.props.navigation;
    return (
      <View style={{ backgroundColor: Constants.BACKGROUND_GREY_COLOR, flexDirection: 'column', width: '100%', height: '100%'}}>
      <StatusBar  translucent backgroundColor={Constants.APP_STATUS_BAR_COLOR} />

        {/* Popup view */}
        {
            <Modal visible={this.state.showPopup} transparent={true} onRequestClose={()=>{this.setState({showPopup: false})}}>
              <View style={CommonStyles.popupContainer}>
                <View style={CommonStyles.popup}>
                  <TopRightButton height={50} color={Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND} iconName="times" onPress={()=>{this.setState({showPopup: false})}} />
                  <LottieView style={{alignSelf: 'center', width: '70%', height: 90}}  source={require("../assets/resources/unlock.json")} autoPlay loop />
                  <Text numberOfLines={1} style={[CommonStyles.popupTitle, {marginBottom: 20}]}>{UIStrings.TITLE_NEW_REQUEST_TO}{Utilities.getFirstName(this.state.recipientName)}</Text>
                  <View style={{flexDirection:'row', justifyContent: 'space-between', marginBottom: 20, overflow: 'hidden'}}>
                        <Text style={styles.arPopupTextName}>{UIStrings.CARD_COLON}</Text>
                        <Text numberOfLines={2} style={styles.arPopupTextValue}>{this.state.selectedCardName} </Text>
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

        {/* The title */}
        <View style={{ height: "12%", flexDirection: 'row', justifyContent: 'center', alignContent: 'center', backgroundColor: Constants.BACKGROUND_GREY_COLOR}}>
          <Text style={{fontFamily: Constants.APP_TITLE_FONT, fontSize: 18, textAlignVertical:'center', textAlign: 'center', color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND}}>{UIStrings.FIND_CARD}</Text>
        </View>

        {/* Search input dropdown and results */}
        <View  style={{flex:1, height: "88%", backgroundColor: Constants.BACKGROUND_WHITE_COLOR, borderTopLeftRadius: 50, borderTopRightRadius: 50, marginBottom: 60}}>
          <Text style={{fontSize: 12, fontFamily: Constants.APP_BODY_FONT, padding: 5, marginTop: 22, color: Constants.BRAND_BACKGROUND_COLOR, textAlign: 'center'}}>{UIStrings.SEARCH_EXPLAINER}</Text>
              <SearchableDropdown
                  placeholderTextColor={Constants.APP_PLACEHOLDER_TEXT_COLOR}
                  onItemSelect={ async (item) => {await this.searchCardholders(item)}}
                  containerStyle={{ padding: 15, width: '100%' }}
                  itemStyle={{
                    padding: 12,
                    marginTop: 2,
                    borderBottomWidth: 0.5,
                    borderBottomColor: Constants.BACKGROUND_GREY_COLOR
                  }}
                  itemTextStyle={{ color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND, fontFamily: 'Montserrat-Light'}}
                  itemsContainerStyle={{ maxHeight: 140, borderRadius: 5, borderColor: Constants.BACKGROUND_GREY_COLOR, borderWidth: 2, width:'90%', alignSelf: 'center' }}
                  items={this.state.allCards}
                  resetValue={false}
                  placeholder= {UIStrings.PLACEHOLDER_ENTER_CARD}
                  filterItems={(item, searchTerm) => Utilities.searchCard(item, searchTerm)}
                  sortItems={(a,b)=> {if (a.hits > b.hits) return -1; return 1;}}
                  textInputProps={{
                    underlineColorAndroid: "transparent",
                    style: {
                    padding: 12,
                    width: '90%', 
                    color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
                    fontFamily: 'Montserrat-Light',
                    marginTop: 8, 
                    alignSelf: 'center',
                    backgroundColor: Constants.BACKGROUND_WHITE_COLOR,
                    borderRadius: 20,
                    elevation: 10 
                  }}}
                />
                { 
                  this.state.loading ? 
                  <LottieView style={{alignSelf: 'center', width: '70%', height: 100, marginVertical: 20, marginHorizontal: 10}} 
                  source={require("../assets/resources/loading.json")} autoPlay loop />
                  : 
                  null
                }
                <ScrollView style={{flex: 1}} scrollEnabled={true} horizontal={false}>

                {/* Card holders in user's circle */}
                {this.state.numCardholdersInCircle >= 0 ?
                  <View style={{ marginTop: 30}}>
                    <Text style={styles.inYourCircleText}>{UIStrings.IN_YOUR_CIRCLE}{this.state.numCardholdersInCircle}</Text>
                    <FlatList 
                        style={{alignSelf: 'center', padding: 10}}
                        data={this.state.cardholdersInCircle}
                        renderItem={({item})=>
                          <CreditCardWithButton imgName={Utilities.getCardTemplateForCard(item.cardId)} title={item.name} subtitle={item.cardName}
                          leftButtonParams={{caption: UIStrings.REQUEST, icon: Constants.CARD_REQUEST_ICON_NAME, type: Constants.CARD_REQUEST_ICON_TYPE, onPress: ()=> this.onRequestPress(item)}} 
                          rightButtonParams={{caption: UIStrings.CALL, icon: "phone", onPress: ()=> Utilities.goToDialScreen(item.phoneNumber)}} />
                        }
                    /> 
                  </View>        
                  :
                  null       
                }
                
                {/* Card holders in user's friends' circles */}
                {
                  this.state.numCardholdersOutsideCircle >= 0 ?
                    <View style={{ marginTop: 30}}>
                      <Text style={styles.inYourCircleText}>{UIStrings.IN_YOUR_FRIENDS_CIRCLE}{this.state.numCardholdersOutsideCircle}</Text>
                      <FlatList 
                          style={{alignSelf: 'center', padding: 10}}
                          data={this.state.cardholdersOutsideCircle}
                          renderItem={({item})=>
                            <CreditCardWithButton imgName={Utilities.getCardTemplateForCard(item.cardId)} title={this.getSecondDegreeCardholderDisplayName(item.name, item.friendName)} subtitle={item.cardName}
                            leftButtonParams={{caption: UIStrings.REQUEST, icon: Constants.CARD_REQUEST_ICON_NAME, type: Constants.CARD_REQUEST_ICON_TYPE, onPress: () => this.onRequestPress(item, item.friendName)}} 
                            rightButtonParams={{caption: UIStrings.CALL, icon: "phone"}} />
                          }
                      /> 
                    </View>        
                    :
                    null       
                }

                {/* No cardholders found so ask user to expand circle */}
                {this.state.numCardholdersOutsideCircle == 0 && this.state.numCardholdersInCircle == 0 ? 
                    <Text style={styles.noPostsText}>{UIStrings.TIP_EXPAND_CIRCLE_INCREASE_CARDHOLDERS}</Text> 
                  : null}

                </ScrollView>
            </View>

            {/* Bottom menu */}
            <View style={styles.bottomMenu }>
                <IconWithCaptionButton icon="circle-thin" iconType="FontAwesome" caption={UIStrings.CIRCLE} onPress={()=>{this.props.navigation.navigate('UserHome')}} />
                <IconWithCaptionButton icon="credit-card" iconType="SimpleLineIcons" caption={UIStrings.REQUESTS} onPress={()=>{this.props.navigation.navigate('AllAccessRequests')}} />
                <IconWithCaptionButton icon="notification" iconType="AntDesign" caption={UIStrings.BROADCASTS} onPress={()=>{this.props.navigation.navigate('AllPosts')}} />
                <IconWithCaptionButton icon="team" iconType="AntDesign" caption={UIStrings.INVITES} onPress={()=>{this.props.navigation.navigate('AllFriendRequests')}} />
            </View>
        </View>
    );
  }
}

export default SearchCardScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    welcome: {
      fontSize: Constants.APP_TITLE_SIZE,
      textAlign: 'center',
      margin: 20,
      marginBottom: 5,
      color: Constants.APP_TEXT_COLOR,
      fontFamily: 'Montserrat-Regular',
    },
    bottomMenu:{
      backgroundColor: Constants.BACKGROUND_WHITE_COLOR, 
      zIndex: 100, 
      position: 'absolute', 
      bottom: 0, 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      height: 60, 
      width: '100%', 
      padding: 10
    },
    requestButton:{
      alignSelf:'center',
      marginTop: 40,
      backgroundColor: Constants.APP_BUTTON_COLOR
    },
    message:{
      fontSize: 20, 
      paddingHorizontal: 10,
      textAlign: 'center',
      color: Constants.APP_TEXT_COLOR,
      fontFamily: 'Montserrat-Light',
    },
    marginBtnComponent:{
      marginTop: 40
    },
    inYourCircleText:{
      marginBottom: 10, 
      textAlign: 'center', 
      fontFamily: Constants.APP_BODY_FONT, 
      color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND
    },
    noPostsText:{
      textAlign: 'left', 
      color: Constants.SUCCESS_COLOR,
      fontFamily: Constants.APP_BODY_FONT,
      fontSize: 13,
      paddingVertical: 8,
      paddingHorizontal: 30
  },
  arPopupTextValue:{
    fontFamily: Constants.APP_BODY_FONT, 
    fontSize: 14,
    textAlign: 'left',
    width: 180,
    color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
    textAlignVertical: 'center',
  },
  arPopupTextName:{
    fontFamily: Constants.APP_BODY_FONT, 
    fontSize: 12,
    textAlign: 'center',
    color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
    textAlignVertical: 'center',
    paddingBottom: 3,
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