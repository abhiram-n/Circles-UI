import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, PermissionsAndroid} from 'react-native';
import { Picker, TextInput, StatusBar } from 'react-native';
import {Button, Fab, Icon} from 'native-base';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import SearchableDropdown from 'react-native-searchable-dropdown';
import firebase from 'react-native-firebase';
import * as Constants from '../helpers/Constants';
import * as UIStrings from '../helpers/UIStrings';
import * as NavigationHelpers from '../helpers/NavigationHelpers';
import * as AuthHelpers from '../helpers/AuthHelpers';
import * as Utilities from '../helpers/Utilities';
import LinearGradient from 'react-native-linear-gradient';
import { FlatList } from 'react-native-gesture-handler';
import CreditCardWithText from '../components/CreditCardWithText';
import RoundIconWithBackgroundAndCaptionButton from '../components/RoundIconWithBackgroundAndCaptionButton';
import GradientButton from '../components/GradientButton';

const SIGN_UP_API = "/auth/signup";
const REGULAR_CARDS_API = "/card/filter?type=Regular";

export default class SelectCardsYouOwnScreen extends Component<Props>{
    _isMounted = false;
    constructor(props)
    {
        super(props);
        this.state = {
            selectedCards: [],
            showCardsAddedLabel: false,
            allCards: this.props.navigation.getParam("cards", Constants.NONE),
            submitButtonLabel: UIStrings.SKIP_AND_SUBMIT
        };

        this.phoneNumber = this.props.navigation.getParam("phoneNumber", Constants.NONE);
        this.profileImgUrl = this.props.navigation.getParam("profileImgUrl", Constants.NONE);
        this.name = this.props.navigation.getParam("name", Constants.NONE);
        this.inviteCode = this.props.navigation.getParam("inviteCode", Constants.NONE);
    }

    componentDidMount(){
        this._isMounted = true;
        if (this.state.allCards == Constants.NONE || this.state.allCards == null || this.state.allCards == []){
          this.getListOfCards();
        }
    }

    componentWillUnMount(){
      this._isMounted = false;
    }

    getListOfCards(){
      fetch(Constants.SERVER_ENDPOINT + REGULAR_CARDS_API, { method: "GET" })
      .then(response => {
        if (!this._isMounted) {
          return null;
        }

        if (response.ok) {
          return response.json();
        }

        Utilities.showLongToast(UIStrings.SERVER_CONNECTION_ERROR);
        return null;
      })
      .then(responseJson => {
        if (responseJson != null) {
          var cardArray = responseJson.cards.map(item => {
            return { name: item.name, id: item.id, key: item.id.toString() };
          });

          this.setState({allCards: cardArray});
          Utilities.showShortToast(UIStrings.PICK_CARDS_YOU_OWN);
        }
      })
      .catch(error => {
        if (!this._isMounted) {
          return null;
        }

        Utilities.showLongToast(UIStrings.SERVER_CONNECTION_ERROR);
        console.log("Error for allcards is: " + error);
      });
    }

    async onSignUpSubmit() {
      this.setState({ loading: true });
      const jsonSelectedCards = JSON.stringify(this.state.selectedCards);
      let fcmToken = await AuthHelpers.getDeviceToken();
      
      fetch(Constants.SERVER_ENDPOINT + SIGN_UP_API, {
        method: Constants.POST_METHOD,
        headers: {
          "Content-Type": Constants.APPLICATION_JSON
        },
        body: JSON.stringify({
          name: this.name,
          phoneNumber: this.phoneNumber,
          phoneAuth: "true",
          cards: jsonSelectedCards,
          fcmToken: fcmToken,
          profileImgUrl: this.profileImgUrl,
          inviteCode: this.inviteCode
        })
      })
        .then(response => {
          if (!this._isMounted) {
            return null;
          }

          this.setState({ loading: false });
          if (response.ok) {
            return response.json();
          }
  
          if (response.status == Constants.CONFLICT_ERROR_STATUS_CODE) {
            Utilities.showLongToast(UIStrings.PHONE_ALREADY_EXISTS)
            return null;
          }
  
          Utilities.showLongToast(UIStrings.GENERIC_ERROR);
          return null;
        })
        .then(responseJson => {
          if (responseJson != null) {
            this.onSignUpComplete(responseJson.access_token, responseJson.id, responseJson.phoneNumber);
          }
        })
        .catch(error => {
          console.log("The error message is: " + error);
          if (!this._isMounted) {
            return null;
          }

          Utilities.showLongToast(UIStrings.GENERIC_ERROR);
        });
    }

    onSignUpComplete(access_token, id, phoneNumber) {
      AuthHelpers.setTokenIdPhone(access_token, id, phoneNumber).then(()=>{
        let params = { initializeEncryption: true, askNotification: true }
        NavigationHelpers.clearStackAndNavigateWithParams("UserHome", this.props.navigation, params);
      })

    }

    getCardsAddedText(){
      return UIStrings.CARDS_ADDED_PREFIX + this.state.selectedCards.length + UIStrings.CARDS_ADDED_SUFFIX;
    }

    onSelectCardItem(item) {
      if (this.state.selectedCards.length == 0){
        this.setState({showCardsAddedLabel: true, submitButtonLabel: UIStrings.TITLE_SUBMIT});
      }

        if (!this.state.selectedCards.includes(item)) {
          this.setState(prevState => ({
            selectedCards: [item, ...prevState.selectedCards]
          }));
        }
    }

    onCardDelete(item){
      let newArray = this.state.selectedCards;
      let indexOfItem = newArray.indexOf(item)
      if (indexOfItem > -1){
        newArray.splice(indexOfItem, 1);
        this.setState({selectedCards: newArray.length == 0 ? [] : newArray});
      }
    }
 
    render(){
        return(
        <View style={{backgroundColor: Constants.BRAND_BACKGROUND_COLOR, height: '100%', width: '100%'}}>
        <StatusBar  translucent backgroundColor={Constants.APP_STATUS_BAR_COLOR} />
            <View style={{width: "100%", marginTop: 40}}>
                <Text style={{fontSize: 25, textAlign: 'center', fontFamily: Constants.APP_THIN_FONT, color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND}}>{UIStrings.TITLE_CARDS_SCREEN}</Text>
                <Text style={{marginTop: 20, fontSize: 16, textAlign: "center", fontFamily: Constants.APP_THIN_FONT, color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND}}>{UIStrings.SUBTITLE_CARDS_SCREEN}</Text>
            </View>
            <View style={{marginTop: 25}}>
              <SearchableDropdown
                  onItemSelect={item => {
                    this.onSelectCardItem(item);
                  }}
                  containerStyle={{ padding: 15, width: "100%"}}
                  textInputStyle={styles.dropdownTextInput}
                  itemStyle={styles.dropdownItem}
                  itemTextStyle={{ color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND, fontFamily: Constants.APP_THIN_FONT}}
                  itemsContainerStyle={{maxHeight: 180, borderRadius: 10, borderWidth: 0.5, borderColor: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND, width:'97%', alignSelf: 'center' }}
                  items={this.state.allCards}
                  placeholder={UIStrings.PLACEHOLDER_ENTER_CARD}
                  placeholderTextColor={Constants.APP_PLACEHOLDER_TEXT_COLOR}
                  resetValue={false}
                  filterItems={(item, searchTerm) => Utilities.searchCard(item, searchTerm)}
                  sortItems={(a,b)=> {if (a.hits > b.hits) return -1; return 1;}}
                  textInputProps={{
                    underlineColorAndroid: "transparent",
                    style: {
                      padding: 12,
                      width: '100%', 
                      color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND,
                      fontFamily: 'Montserrat-Thin',
                      marginTop: 8, 
                      alignSelf: 'center',
                      borderRadius: 15,
                      borderColor: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND,
                      borderWidth: 0.5
                  }}}
                />
            </View>

            <View style={{marginTop: 25, paddingHorizontal: 15}}>
              {this.state.showCardsAddedLabel ? 
               <Text style={{fontSize: 12, fontFamily: Constants.APP_BODY_FONT, color: Constants.TEXT_COLOR_FOR_DARK_BACKGROUND}}>{this.getCardsAddedText()}</Text>
              : null
              }
              <FlatList showsHorizontalScrollIndicator={false} style={{marginTop: 20}} horizontal={true} data={this.state.selectedCards} 
                renderItem={({ item })=> (
                    <CreditCardWithText name={this.name} title={item.name} 
                    onDeletePress={()=>this.onCardDelete(item)} colors={Utilities.getColorForCard(item.id)} />
                )} />
            </View>

            <View style={{position: 'absolute', width: '100%', backgroundColor: Constants.BRAND_BACKGROUND_COLOR ,bottom: 0, paddingTop: 8, paddingBottom: 30, alignSelf: 'center'}}>
                <GradientButton isLight colors={Constants.DEFAULT_GRADIENT} title={this.state.submitButtonLabel} onPress={()=>this.onSignUpSubmit()} />
            </View>
        </View>
        )
    }
}

const styles = StyleSheet.create({
    dropdownTextInput: {
        padding: 12,
        borderWidth: 2,
        borderColor: Constants.APP_TEXT_COLOR,
        borderRadius: 5,
        width: '100%', 
        fontFamily: Constants.APP_THIN_FONT
    },
    dropdownItem: {
      padding: 12,
      borderBottomWidth: 0.2,
      borderBottomColor: Constants.APP_PLACEHOLDER_TEXT_COLOR,
    },
})
