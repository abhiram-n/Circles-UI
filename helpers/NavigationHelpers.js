import AsyncStorage from '@react-native-community/async-storage';
import * as Constants from './Constants';
import {NavigationActions, StackActions} from 'react-navigation';
import base64 from 'react-native-base64';
import {Alert} from 'react-native';
import * as AuthHelpers from './AuthHelpers';


export function proceedWithLogout(navigation)
{
  AuthHelpers.clearTokens()
  .then((value) => {clearStackAndNavigate('Welcome', navigation)})
  .catch((reason)=> {alert('Sorry, something went wrong. \nPlease try again later');});
}

export function logout(navigation)
{
  Alert.alert('Logout', 'Are you sure you want to logout?', [{text: 'Cancel', style: "cancel"}, {text: 'Yes', onPress: ()=> proceedWithLogout(navigation)} ]);
}

export function clearStackAndNavigate(screenName, navigation){
  const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({routeName: screenName})]
  });
  navigation.dispatch(resetAction);
}

export function clearStackAndNavigateWithParams(screenName, navigation, params){
  const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({routeName: screenName, params: params})]
  });
  navigation.dispatch(resetAction);
}