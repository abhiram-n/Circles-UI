import AsyncStorage from '@react-native-community/async-storage';
import * as Constants from './Constants';
import base64 from 'react-native-base64';
import { ToastAndroid, Linking } from 'react-native';

export function comparePhoneNumbers(phone1, phone2){
    if (phone1== null || phone2 == null){
        return false;
    }

    if (phone1 == phone2 || phone1.endsWith(phone2) || phone2.endsWith(phone1)){
        return true;
    }

    return false;
}

export function searchCard(item, searchTerm){
      var tokens = searchTerm.split(" ");
      item.hits = 0;
      for (i = 0; i < tokens.length; i++){
        var token = tokens[i].toLowerCase();
        if (i > 0 && (token == 'bank' || token == 'banks' || token =='card' || token =='cards' || token == ""))
        {
          continue;
        }

        if (item.name.toLowerCase().indexOf(token) > -1)
        {
          item.hits++;
        }
      }
      
      return item.hits > 0;
  }

export function showLongToast(message, position, isDurationLong){
  ToastAndroid.showWithGravity(message, ToastAndroid.LONG, ToastAndroid.TOP);
}

export function showShortToast(message){
  ToastAndroid.showWithGravity(message, ToastAndroid.SHORT, ToastAndroid.TOP);
}

export function goToDialScreen(phoneNumber){
  phoneNumberString = Constants.DIAL_SCREEN_LINK_TEMPLATE.replace('%', phoneNumber);
  Linking.openURL(phoneNumberString);
}

export function getColorForCard(itemId){
  numColors = Constants.CARDS_COLORS.length;
  colorId = itemId % numColors;
  console.debug('ColorID: '  + colorId + ' num: ' + numColors + ' id: ' + itemId)
  return Constants.CARDS_COLORS[colorId];
}