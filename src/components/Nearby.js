import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDistance, compareDistance, locationResult } from './Location';

export default markers = null;


export function getMarkers() {
  return markers;
}

export async function initializeNearby() {
  try {
    var jsonValue = await AsyncStorage.getItem('markers')
    markers = JSON.parse(jsonValue)
    // markers = null
  } catch (e) {
    // error reading value
  }
  if (markers === null) {
    refreshMarkers();
  }
  else {
    markers.map((marker) => (marker == null ? null : marker.distance = getDistance(marker.latlong)));
    markers.sort(compareDistance);
    // if(markers[0].distance > 10){
    //   refreshMarkers();
    // }
  }
}

async function refreshMarkers() {
  console.log("locations refreshing")
  markers = null;
  var userid = 1;
  var lat = locationResult["coords"]["latitude"];
  var long = locationResult["coords"]["longitude"];
  var req_string = "https://missit-ridesapi-backend.ue.r.appspot.com/fetch_places?userid=" + userid + "&location=" + lat + "," + long
  // var req_string = "https://missit-ridesapi-backend.ue.r.appspot.com/fetch_places?userid=1&location=52.2075,0.146521"
  console.log(req_string);
  fetch(req_string, {

    method: "POST",

    body: null
  })
    .then(response => response.json())

    .then(json => handleMarkers(json))
}

async function handleMarkers(data) {
  for (var i = 0; i < data.length; i++) {
    data[i].latlong = { latitude: data[i]["lat"], longitude: data[i]["lng"] }
    data[i].distance = getDistance(data[i].latlong);
    data.favorite = false;
  }
  data.sort(compareDistance);
  console.log("markers updated");
  markers = data;
  // console.log(data);
  try {
    const jsonValue = JSON.stringify(markers);
    await AsyncStorage.setItem("markers", jsonValue);
  } catch (e) {
    // saving error
  }
}
