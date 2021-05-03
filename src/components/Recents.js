import AsyncStorage from '@react-native-async-storage/async-storage';

let recentDropoffs = [];
let recentPickups = [];


export async function initializeRecents () {
  try {
    var jsonValue = await AsyncStorage.getItem('pickupList')
    var pickupList = JSON.parse(jsonValue)
    var jsonValue = await AsyncStorage.getItem('dropoffList')
    var dropoffList = JSON.parse(jsonValue)

    recentPickups = pickupList == null? [] : pickupList;
    dropoffList = dropoffList == null? [] : dropoffList;
  } catch(e) {
    // error reading value
  }
}

export async function setRecents (pickupLocation, dropoffLocation) {
  recentPickups.unshift(pickupLocation);
  recentDropoffs.unshift(dropoffLocation);
  if(recentDropoffs.length() > 4){
    recentDropoffs.push();
  }
  if(recentPickups.length() > 4){
    recentPickups.push();
  }
  
  try {
    const recentDropoffsJson = JSON.stringify(recentDropoffs);
    const recentPickupsJson = JSON.stringify(recentPickups);
    await AsyncStorage.setItem('pickupList', recentPickupsJson);
    await AsyncStorage.setItem('dropoffList', recentDropoffsJson);

  } catch(e) {
  
  }
}

export function getRecentDropoffs(){
  return recentDropoffs;
}

export function getRecentPickups(){
  return recentPickups;
}


