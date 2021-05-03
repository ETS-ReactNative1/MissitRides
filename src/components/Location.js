import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

let locationResult = null;
let currLocation = null;
let hasLocationPermissions = null;

export async function getLocationAsync (){
  console.log("getting location")

  let { status } = await Permissions.askAsync(Permissions.LOCATION);
  // let isMounted = true; // note this flag denote mount status

  if (status !== 'granted') {
      locationResult = 'Permission to access location was denied';
      hasLocationPermissions = false;
  } else {
    hasLocationPermissions = true;
  }

  let location = await Location.getCurrentPositionAsync({});
  location["coords"]["latitude"] = 51.511894;
  location["coords"]["longitude"] = -0.205779;
  locationResult = location;
  currLocation = {latitude: location["coords"]["latitude"], longitude: location["coords"]["longitude"]};
  console.log("curr location:", currLocation);
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

export function getDistance(latlong){
  // console.log(this.state.currLocation)
  var lat = currLocation["latitude"];
  var long = currLocation["longitude"];
  // console.log(lat, long, latlong["latitude"], latlong["longitude"])
  var dist = Math.sqrt((lat-latlong["latitude"])**2 + (long-latlong["longitude"])**2) * 69.09;
  // console.log(dist);
  return dist;
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