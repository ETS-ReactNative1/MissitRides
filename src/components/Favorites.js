
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getDistance} from './Location'

favorites = null;

async function retrieve(num){
  try {
    var fav_num = "fav" + num;
    const jsonValue = await AsyncStorage.getItem(fav_num)
    // console.log("latlong: ",JSON.parse(jsonValue));

    return JSON.parse(jsonValue);
  } catch(e) {
    // error reading value
  }
}

export async function initializeFavorites () {
  var favs = [];
  var i = 0;
  var distance = null;
  while(i < 4){
    let fav = await retrieve(i);
    if (fav != null){
      console.log(fav);
      fav.latlong = {latitude: fav.latitude, longitude: fav.longitude}
      fav.distance = getDistance(fav.latlong)
      fav.favorite = true;
      favs.push(fav);
    }
    i++;
  }
  // console.log("favorites: ", favs)
  favorites = favs;
};

export function getFavorites() {
  return favorites;
}
export async function setFavorite(address, userid, favoriteid) {
  // let fav = await this.runGeocode(address);
  var userid = 1;
  var req_string = "https://missit-ridesapi-backend.ue.r.appspot.com/update_fav" + "?userid=" + userid + "&favoriteid=" + favoriteid + "&address=" + address
  console.log(req_string)

  fetch(req_string, {

    // Adding method type 
    method: "POST",


    // Adding headers to the request 
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
    // Converting to JSON 
    .then(response => response.json())

    // Displaying results to console 
    // .then(json => console.log(json))

    .then(json => handleData(json, userid, favoriteId, address));
};

async function handleData(data, favoriteId, address) {

  data.name = address;
  data.key = favoriteId;
  data.address = address;
  // console.log("new favorite: ", data)
  try {
    let fav_num = "fav" + favoriteId;
    const jsonValue = JSON.stringify(data)
    await AsyncStorage.setItem(fav_num, jsonValue);
    favorites[favoriteId] = data;
  } catch (e) {
    // saving error
  }

}