import AsyncStorage from '@react-native-community/async-storage';
import * as Constants from './Constants';
import base64 from 'react-native-base64';


export function getLoginRequestHeaders(phoneNumber, password)
{
  let encoded_credentials = base64.encode(phoneNumber + ":" + password);
  let headers = new Headers();
  headers.append('Authorization', 'Basic ' + encoded_credentials);
  headers.append('Content-Type', 'application/json');
  return headers;
}

export async function getRequestHeaders()
{
    let encoded_credentials = base64.encode(await getToken() + ":");
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + encoded_credentials);
    headers.append('Content-Type', 'application/json');
    return headers;
}

export async function setTokenIdPhone(access_token, id, phoneNumber)
{
  try
  {
      await AsyncStorage.multiSet([
        [Constants.STORAGE_TOKEN_KEY, access_token],
        [Constants.STORAGE_USER_ID, String(id)],
        [Constants.STORAGE_PHONE_NUMBER, phoneNumber]
      ])
      return true;
  }
  catch (error)
  {
    console.log('The error for setTokenIdPhone is: ' + error)
  }
  
  return false;
}

export async function getToken()
{
  access_token = null;
  try
  {
      access_token = await AsyncStorage.getItem(Constants.STORAGE_TOKEN_KEY);
  }
  catch (error)
  {
    alert('There was a problem authenticating your account.');
    console.log('The error while getting token is: ' + error)
  }

  return access_token;
}

export async function setDeviceToken(device_token)
{
  try
  {
      await AsyncStorage.setItem(Constants.STORAGE_DEVICE_TOKEN_KEY, device_token)
      return true;
  }
  catch (error)
  {
    alert('There was a problem with your notification settings.');
    console.log('The error while setting device token is: ' + error)
  }
  
  return false;
}

export async function getDeviceToken(){
  device_token = null;
  try
  {
      device_token = await AsyncStorage.getItem(Constants.STORAGE_DEVICE_TOKEN_KEY);
  }
  catch (error)
  {
    console.log('The error while getting device token is: ' + error)
  }

  return device_token;
}

export async function getPhoneNumber()
{
  phoneNumber = ""
  try
  {
    phoneNumber = await AsyncStorage.getItem(Constants.STORAGE_PHONE_NUMBER);
  }
  catch (error)
  {
    alert('There was a problem getting details of account.');
    console.log('The error while getting phoneNumber is: ' + error)
  }

  return phoneNumber;
}


export async function setFirstRunComplete()
{
  try
  {
      await AsyncStorage.setItem(Constants.STORAGE_FIRST_RUN, "true")
      return true;
  }
  catch (error)
  {
    console.log('The error while setting the first run key is: ' + error)
  }
  
  return false;
}


export async function getFirstRun(){
  let returnValue = null;
  try
  {
    returnValue = await AsyncStorage.getItem(Constants.STORAGE_FIRST_RUN);
  }
  catch (error)
  {
    console.log('The error while getting first run key is: ' + error);
  }

  return returnValue;
}

export async function setEncryptionEnabled()
{
  try
  {
      await AsyncStorage.setItem(Constants.STORAGE_ENCRYPTION_ENABLED, "true")
      return true;
  }
  catch (error)
  {
    console.log('The error while setting encryption enabled is: ' + error)
  }
  
  return false;
}

export async function getEncryptionEnabled(){
  let returnValue = null;
  try
  {
    returnValue = await AsyncStorage.getItem(Constants.STORAGE_ENCRYPTION_ENABLED);
  }
  catch (error)
  {
    console.log('The error while getting encryption enabled is: ' + error);
  }

  return returnValue;
}

export async function getTokenIdPhone(){
  let returnValue = null;
  try{
    returnValue = await AsyncStorage.multiGet([Constants.STORAGE_TOKEN_KEY, Constants.STORAGE_USER_ID, Constants.STORAGE_PHONE_NUMBER])
  }
  catch (err){
    console.log("ERROR while retrieving items from AsyncStorage: " + err)
  }

  return returnValue;
}

export async function clearTokens()
{
  try
  {
    await AsyncStorage.multiRemove([Constants.STORAGE_TOKEN_KEY,
                                     Constants.STORAGE_PHONE_NUMBER, 
                                     Constants.STORAGE_USER_ID, 
                                     Constants.STORAGE_ENCRYPTION_ENABLED])
  }
  catch (error)
  {
    console.log('The error while clearing tokens is: ' + error)
  }
}
