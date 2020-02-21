import AsyncStorage from '@react-native-community/async-storage';
import * as Constants from './Constants';
import * as Utilities from './Utilities';
import * as AuthHelpers from './AuthHelpers';
import * as UIStrings from './UIStrings';
import {EThree } from '@virgilsecurity/e3kit-native';

export async function getJWTToken(){
    try{
      response = await fetch(Constants.SERVER_ENDPOINT + Constants.VIRGIL_JWT_API, { 
        headers: await AuthHelpers.getRequestHeaders(),
        methods: Constants.GET_METHOD });
      if (response.ok){
        json = await response.json();
        if (json != null){
          return json.token;
        }
      }   
      else if (response.status == Constants.TOKEN_EXPIRED_STATUS_CODE){
        Utilities.showLongToast(UIStrings.SESSION_EXPIRED);
        return null;
      }
    }
    catch (err) {
      console.log('ERROR: ' + err)
    }

    return null;
}

export async function registerVirgilForUser(){
  let virgilRegistered = await AuthHelpers.getEncryptionEnabled() != null ? true : false;
  
  if (virgilRegistered){
    return null;
  }

  return getVirgilUser(false);
}

export async function getVirgilUser(isUserRegistered){
  let virgilUser = null;
  isVirgilRegistered = isUserRegistered != null ? isUserRegistered : await AuthHelpers.getEncryptionEnabled() != null;

  try
  {
    virgilUser = await EThree.initialize(getJWTToken, {AsyncStorage});

    if (!isVirgilRegistered){
      await virgilUser.register();
      AuthHelpers.setEncryptionEnabled();
    }

    return virgilUser;
  }
  catch (err){
    if (err.name != null && err.name == Constants.IDENTITY_ALREADY_EXISTS_ERROR){
      rotatePrivateKeyIfNeeded(virgilUser);
      AuthHelpers.setEncryptionEnabled();
      return virgilUser;
    }

    console.log('ERROR: Virgil ' + err);
  }

  return null;
}

export async function rotatePrivateKeyIfNeeded( virgilUser:EThree){
  virgilUser.hasLocalPrivateKey()
  .then((hasKey)=>{
    if (!hasKey){
      console.log('Rotating new keys')
      virgilUser.rotatePrivateKey();
    }
  })
  .catch(err=>{
    console.debug('ERROR checking private key: ' + err);
  })
    
}