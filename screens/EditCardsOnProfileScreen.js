import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  Linking,
  FlatList
} from "react-native";
import { ActivityIndicator, Picker, TextInput, ToastAndroid, StatusBar, Image } from "react-native";
import { Button, Icon, InputGroup, Input } from "native-base";
import { createStackNavigator, createAppContainer } from "react-navigation";
import SearchableDropdown from "react-native-searchable-dropdown";
import firebase from "react-native-firebase";
import * as Constants from "../helpers/Constants";
import * as Utilities from "../helpers/Utilities";
import * as UIStrings from "../helpers/UIStrings";
import * as AuthHelpers from "../helpers/AuthHelpers";
import * as NavigationHelpers from "../helpers/NavigationHelpers";
import base64 from "react-native-base64";
import LogInScreen from "./LogInScreen";
import CommonStyles from '../components/CommonStyles';
import LinearGradient from "react-native-linear-gradient";
import CreditCardWithText from "../components/CreditCardWithText";
import CirclePopup from "../components/CirclePopup";
import IconWithCaptionButton from '../components/IconWithCaptionButton';
import GradientButton from "../components/GradientButton";

const REGULAR_CARDS_API = "/card/filter?type=Regular";
const UPDATE_CARDS_API = "/user/updateCards"
export default class EditCardsOnProfileScreen extends Component<Props>{
    _isMounted = false;
    constructor(props){
        super(props);
        this.state = {
            cards: [],
            loading: false,
            selectedCards: [],
            showCirclePopup: false
        }

        this.name = this.props.navigation.getParam("name");
    }

    componentDidMount(){
        this._isMounted = true;
        let cards = JSON.parse(this.props.navigation.getParam("cards"));
        this.setState({
            loading: true, 
            selectedCards: cards.map((item) => { 
              return {name: item.name, id: item.id, key: item.id.toString()}})});

        fetch(Constants.SERVER_ENDPOINT + REGULAR_CARDS_API, { method: "GET" })
        .then(response => {
          if (!this._isMounted){
            return null;
        }

          this.setState({loading: false});
          if (response.ok) {
            return response.json();
          }

          if (response.status == Constants.TOKEN_EXPIRED_STATUS_CODE){
            Utilities.showLongToast(UIStrings.SESSION_EXPIRED);
            return null;
          }

          Utilities.showLongToast(UIStrings.GENERIC_ERROR);
          return null;
        })
        .then(responseJson => {
          if (responseJson != null && this._isMounted) {
            var cardArray = responseJson.cards.map(item => {
              return { name: item.name, id: item.id, key: item.id.toString() };
            });
            this.setState({ cards: cardArray });
          }
        })
        .catch(error => {
          if (!this._isMounted){
            return null;
          }

          this.setState({loading: false});
          ToastAndroid.showWithGravity("Sorry, something went wrong. Please try later.", duration= ToastAndroid.LONG, gravity = ToastAndroid.TOP);
          console.log("Error for allcards is: " + error);
        });
    }

    onSelectCardItem(item) {
        for (j=0; j<this.state.selectedCards.length; j++){
          if (this.state.selectedCards[j].id == item.id){
            return;
          }
        }

        this.setState(prevState => ({
            selectedCards: [item, ...prevState.selectedCards]
          }));
    }

    onCardDelete(item){
        let newArray = this.state.selectedCards;
        let indexOfItem = newArray.indexOf(item)
        if (indexOfItem > -1){
          newArray.splice(indexOfItem, 1);
          this.setState({selectedCards: newArray.length == 0 ? [] : newArray});
        }
    }

    async onSave(){
        this.setState({loading: true});
        let headers = await AuthHelpers.getRequestHeaders();
        fetch(Constants.SERVER_ENDPOINT + UPDATE_CARDS_API, { method: "POST", 
        headers: headers,
        body: JSON.stringify({
            cards: JSON.stringify(this.state.selectedCards),
        })})
        .then(response => {
          this.setState({loading: false});
          if (!this._isMounted){
            return null;
          }

          if (response.ok) {
            ToastAndroid.showWithGravity("Saved!", duration= ToastAndroid.SHORT, gravity = ToastAndroid.TOP);
            return;
          }

          if (response.status == Constants.TOKEN_EXPIRED_STATUS_CODE){
            Utilities.showLongToast(UIStrings.SESSION_EXPIRED);
            return null;
          }

          ToastAndroid.showWithGravity("Sorry, something went wrong. Please try later.", duration= ToastAndroid.LONG, gravity = ToastAndroid.TOP);
          return null;
        })
        .catch(error => {
          this.setState({loading: false});
          if (!this._isMounted) {
            return null;
          }

          ToastAndroid.showWithGravity("Sorry, something went wrong. Please try later.", duration= ToastAndroid.LONG, gravity = ToastAndroid.TOP);
        });
    }

    onCirclePress(){
      this.setState((prevState)=> ({showCirclePopup: !prevState.showCirclePopup}));
    }

    render(){
        return (
            <View style={styles.container}>
              <StatusBar translucent backgroundColor={Constants.APP_STATUS_BAR_COLOR} />
              <View style={{width: "100%", marginTop: 40}}>
                  <Text style={{fontSize: 25, textAlign: 'center', fontFamily: Constants.APP_BODY_FONT, color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND}}>{UIStrings.ADD_OR_DELETE_CARDS}</Text>
              </View>
              <View style={{marginTop: 60, width: '100%'}}>
                {this.state.loading ?  <ActivityIndicator color={Constants.APP_LOADING_COLOR} size="large" />  : null}
                <SearchableDropdown
                  onItemSelect={item => {
                    this.onSelectCardItem(item);
                  }}
                  containerStyle={{ padding: 15, width: "100%"}}
                  textInputStyle={styles.dropdownTextInput}
                  itemStyle={styles.dropdownItem}
                  itemTextStyle={{ color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND, fontFamily: Constants.APP_BODY_FONT}}
                  itemsContainerStyle={{ maxHeight: 140, borderRadius: 15, borderColor: Constants.BACKGROUND_GREY_COLOR, borderWidth: 2, width:'97%', alignSelf: 'center' }}
                  items={this.cards}
                  placeholder={UIStrings.PLACEHOLDER_ENTER_CARD}
                  placeholderTextColor={Constants.APP_PLACEHOLDER_TEXT_COLOR}
                  resetValue={false}
                  filterItems={(item, searchTerm) => Utilities.searchCard(item, searchTerm)}
                  sortItems={(a,b)=> {if (a.hits > b.hits) return -1; return 1;}}
                  textInputProps={{
                    underlineColorAndroid: "transparent",
                    style: {
                    padding: 12,
                    borderRadius: 20,
                    elevation: 4,
                    width: '100%', 
                    color: Constants.TEXT_COLOR_FOR_LIGHT_BACKGROUND,
                    fontFamily: 'Montserrat-Light'
                  }}}
                />
                <Text style={{
                    color: Constants.APP_TEXT_COLOR,
                    textAlign: "center",
                    fontFamily: "Montserrat-Light",
                    fontWeight: 'bold'
                  }}
                >
                  You selected:
                </Text>

                <View >
                  <FlatList showsHorizontalScrollIndicator={false} style={{marginTop: 20}} horizontal={true} data={this.state.selectedCards} 
                    renderItem={({ item })=> (
                                  <CreditCardWithText name={this.name} title={item.name} 
                                  onDeletePress={()=>this.onCardDelete(item)} colors={Utilities.getColorForCard(item.id)} />
                              )} />
                </View>
                
                <View style={{alignSelf: 'center', marginTop: 30}}>
                  <GradientButton title={UIStrings.TITLE_SAVE} onPress={()=>{this.onSave();}} />
                </View>
              </View>

            {/* Circle options */}
            { <CirclePopup  onClose={()=>this.onCirclePress()} isVisible={this.state.showCirclePopup} navigate={this.props.navigation.navigate} />  }

              {/* Bottom menu */}
              <View style={{ backgroundColor:Constants.BACKGROUND_WHITE_COLOR, zIndex: 99, position: 'absolute', bottom: 0, flexDirection: 'row', justifyContent: 'center', height: Constants.BOTTOM_MENU_HEIGHT, width: '100%', padding: 10}}>
                  <IconWithCaptionButton icon="home" iconType="FontAwesome5" caption={UIStrings.HOME} onPress={()=>NavigationHelpers.clearStackAndNavigate('UserHome', this.props.navigation)} />
                  <IconWithCaptionButton icon="user" iconType="FontAwesome5" caption={UIStrings.PROFILE} onPress={()=>{this.props.navigation.navigate('Profile')}} />
                  <TouchableOpacity onPress={()=>this.onCirclePress()} style={{alignContent: 'center', justifyContent: 'center'}}>
                  <View style={{flexDirection: "column", justifyContent: 'center', marginHorizontal: 5, alignContent: 'center'}}>
                    <Image source={require('../assets/logo/logo_tp.png')} style={{width: 34, height: 34, borderRadius: 17, alignSelf: 'center'}} />
                  </View>
                </TouchableOpacity>
                  <IconWithCaptionButton icon="paper-plane" iconType="FontAwesome5" caption={UIStrings.TITLE_CONTACT_US} onPress={()=>{this.props.navigation.navigate('ContactUs')}}/>
                  <IconWithCaptionButton icon="log-out" iconType="Ionicons" caption={UIStrings.SIGN_OUT} onPress={()=>NavigationHelpers.logout(this.props.navigation) } />
              </View>
              </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: '100%', 
      height: '100%'
    },
    welcome: {
      fontSize: Constants.APP_TITLE_SIZE,
      textAlign: "center",
      marginBottom: 30,
      color: Constants.APP_TEXT_COLOR,
      fontFamily: "Montserrat-Regular"
    },
    dropdownTextInput: {
        padding: 12,
        borderWidth: 2,
        borderColor: Constants.APP_TEXT_COLOR,
        borderRadius: 5,
        width: '100%', 
        color: 'white',
        fontFamily: 'Montserrat-Light'
    },
    dropdownItem: {
      padding: 12,
      marginTop: 2,
      borderBottomWidth: 0.5,
      borderBottomColor: 'white'
    },
    selectedCards: {
      borderColor: Constants.SUCCESS_COLOR,
      borderWidth: 2,
      borderRadius: 5,
      width: "90%",
      height: 150,
      alignSelf: "center"
    },
    moreCards:{
      color: Constants.APP_TEXT_COLOR, 
      textAlign: 'center',
      margin: 5,
      fontFamily: "Montserrat-Light"
    },
    dropdownTextInput: {
      padding: 12,
      borderWidth: 2,
      borderColor: Constants.APP_TEXT_COLOR,
      borderRadius: 5,
      width: '100%', 
      fontFamily: 'Montserrat-Light'
  },
  dropdownItem: {
    padding: 12,
    marginTop: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: 'white'
  },
  });