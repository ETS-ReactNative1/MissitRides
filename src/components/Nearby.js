import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDistance, compareDistance } from './Location';

let markers = null;


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
  if (markers == null) {
    refreshMarkers();
  }
  else {
    // console.log(markers);  

    markers.map((marker) => (marker == null ? null : marker.distance = getDistance(marker.latlong)));
    markers.sort(compareDistance);
  }
}

async function refreshMarkers() {
  this.setState({ markers: null });
  var userid = 1;
  var lat = this.state.locationResult["coords"]["latitude"];
  var long = this.state.locationResult["coords"]["longitude"];
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
  // console.log(data);
  markers = data;
  // console.log(data);
  try {
    const jsonValue = JSON.stringify(markers);
    await AsyncStorage.setItem("markers", jsonValue);
  } catch (e) {
    // saving error
  }
}
