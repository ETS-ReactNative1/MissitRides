import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';

let locationResult = null;
let currLocation = null;
let hasLocationPermissions = false;

export async function getLocationAsync (){
  console.log("getting location")

  let { status } = await Permissions.askAsync(Permissions.LOCATION);
  // let isMounted = true; // note this flag denote mount status

  if (status !== 'granted') {
      console.log("denied");
      locationResult = 'Permission to access location was denied';
      hasLocationPermissions = false;
  } else {
    hasLocationPermissions = true;
  }

  let location = await Location.getCurrentPositionAsync({});
  // location["coords"]["longitucoords"]["latitude"] = 51.511894;
  // location["de"] = -0.205779;
  currLocation = {latitude: location["coords"]["latitude"], longitude: location["coords"]["longitude"]};
  locationResult = currLocation;
}

export function getHasLocationPermissions() {
  return hasLocationPermissions;
}

export function getCurrLocation() {
  return currLocation;
}

export function setCurrLocation(latlong){
  currLocation = latlong;
  return currLocation;
}

export function getLocationResult() {
  return locationResult;
}

export async function selectNearestPin(coordinate) {
  let tapLatitude = coordinate["latitude"];
  let tapLongitude = coordinate["longitude"];
  console.log(tapLatitude);
  try {
    var jsonValue = await AsyncStorage.getItem('markers');
    markers = JSON.parse(jsonValue);

    markers.map((marker) => (marker == null ? null : marker.distance = getDistance(marker.latlong["latitude"], marker.latlong["longitude"], tapLatitude, tapLongitude)));
    markers.sort(compareDistance);
    console.log(markers[0]);
    return markers[0];
  } catch (e) {
    console.log(e)
  }
  
}

export function getDistanceFromCurr(latlong){
  // console.log(this.state.currLocation)
  var lat = currLocation["latitude"];
  var long = currLocation["longitude"];
  // console.log(lat, long, latlong["latitude"], latlong["longitude"])
  var dist = Math.sqrt((lat-latlong["latitude"])**2 + (long-latlong["longitude"])**2) * 69.09;
  // console.log(dist);
  return dist;
}

export function getDistance(startLat, startLng, endLat, endLng){
  return Math.sqrt((startLat-endLat)**2 + (startLng-endLng)**2) * 69.09;
}

export function getDistanceInDegs(startLat, startLng, endLat, endLng){
  return Math.sqrt((startLat-endLat)**2 + (startLng-endLng)**2);
}

export function compareDistance(a,b){
  if(a == null){return 0}
  else if (b == null){return 0}
  else return a.distance - b.distance
} 

export async function reverseGeocode(latlong){
  let geocodeObj = await Location.reverseGeocodeAsync(latlong);
  let geocode = geocodeObj[0];
  // console.log("reverse geocode is: ", geocode);
  return geocode;
}