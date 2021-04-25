import React, {useState} from 'react';
// import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Overlay, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import Splash from './Splash';
import {mapStyle} from '../components/mapStyle.js';
// import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';


import { Animated, StyleSheet, Dimensions, Pressable, ScrollView, SafeAreaView, View, Alert, StatusBar, Platform} from 'react-native';
import {theme, Block, Accordion, Text, NavBar, Button} from 'galio-framework';
import { TabView, SceneMap } from 'react-native-tab-view';
import Constants from 'expo-constants';

const { width } = Dimensions.get('screen');
const {height} = Dimensions.get('window').height;
const {statusHeight} = Platform.OS === 'android' ? StatusBar.currentHeight : 0
const range = 0.00434782608696

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      markers: null,
      favorites: null,
      recentPickup: null,
      recentDropoff: null,
      pickup: this.props.route.params["pickup"],
      dropoff: this.props.route.params["dropoff"], 
      hasLocationPermissions: false,
      locationResult: null,
      isPickup: false,
      isOpen: false,
      mapOpen: true,
      currLocation: null,
      index: 0,
      routes: [ { key: 'first', title: 'Favorites' },
                { key: 'second', title: 'Recents' },
                { key: 'third', title: 'All' }
              ],
    };
    this.controller;

    // 42.403635135900295, -71.12350546661803
  }
  
  componentDidMount() {
    // this.getLocationAsync();
    this.initializeNearbyPlaces();
  }
  
  async initializeNearbyPlaces(){
    await this.getLocationAsync();
    await this.getFavorites();
    await this.getRecents();
    var markers = null;
    try {
      var jsonValue = await AsyncStorage.getItem('markers')
      markers = JSON.parse(jsonValue)
      // markers = null
    } catch(e) {
      // error reading value
    }
    if(markers == null){
      this.getNearbyPlaces();
    }
    else{
      // console.log(markers);  

      markers.map((marker) => (marker == null ? null : marker.distance = this.getDistance(marker.latlong)));
      markers.sort(this.compareDistance);
      this.setState({markers: markers, pickup: this.state.pickup == null ? markers[0]: this.state.pickup})
    }
  }
  async getNearbyPlaces(){
    this.setState({markers: null});
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

    .then(json => this.handleNearby(json))
  }
      
  async handleNearby(data) {
    for(var i = 0; i < data.length; i++){ 
      let location_info = await Location.reverseGeocodeAsync({latitude: data[i]["lat"], longitude: data[i]["lng"]})
      data[i].latlong = {latitude:  data[i]["lat"], longitude: data[i]["lng"]}
      data[i].name = location_info[0]
      data[i].distance = this.getDistance(data[i].latlong);
      data.favorite = false
      }      
    data.sort(this.compareDistance);
    // console.log(data);
    this.setState({markers: data});
    // console.log(data);
    try {
      const jsonValue = JSON.stringify(data)
      await AsyncStorage.setItem("markers", jsonValue);
    } catch (e) {
      // saving error
    }
  } 
    
  async reverseGeocode(latlong){
    let geocodeObj = await Location.reverseGeocodeAsync(latlong);
    let geocode = geocodeObj[0];
    // console.log("reverse geocode is: ", geocode);
    return geocode;
  }
  
  onChosen(selection) {
    console.log(selection)
    if(this.state.isPickup === true){
      this.setState({pickup: selection});   
    }
    else{
      this.setState({dropoff: selection});
    }
    this.setState({
      isPickup: !this.state.isPickup,       
    });   
  };
  
  
  async retrieve(num){
    try {
      var fav_num = "fav" + num;
      const jsonValue = await AsyncStorage.getItem(fav_num)
      // console.log("latlong: ",JSON.parse(jsonValue));

      return JSON.parse(jsonValue);
    } catch(e) {
      // error reading value
    }
  }
  
  async getRecents () {

    try {
      var jsonValue = await AsyncStorage.getItem('pickupList')
      var pickupList = JSON.parse(jsonValue)
      var jsonValue = await AsyncStorage.getItem('dropoffList')
      var dropoffList = JSON.parse(jsonValue)

      this.setState({recentPickup: pickupList == null? [] : pickupList, recentDropoff: dropoffList == null? [] : dropoffList});
    } catch(e) {
      // error reading value
    }
  }
  
  async getFavorites () {
    var favs = [];
    var i = 0;
    var distance = null;
    while(i < 4){
      let latlong = await this.retrieve(i);
      let this_name = null;
      if (latlong != null){
        this_name  = await this.reverseGeocode(latlong);
        var distance = this.getDistance(latlong)
        favs.push({"key": i, name: this_name, latlong: latlong, favorite: true, distance: distance});

      }
      i++;
    }
    this.setState({favorites: favs})
  };
    
  async updateFavorite(id){
    await this.getFavorites();
    var userid = 1;
    console.log("id is ", id)
    var fav = this.state.favorites[id].latlong == null? "null" : JSON.stringify(this.state.favorites[id].latlong.latitude) + ',' + JSON.stringify(this.state.favorites[id].latlong.longitude)
    var req_string = "https://missit-ridesapi-backend.ue.r.appspot.com/update_favorites?userid=" + userid + "&" + id + "=" + fav
    console.log(req_string);
    fetch(req_string, {
      
      // Adding method type 
      method: "POST", 
        
      // Adding body or contents to send 
      
      body: null
    })
    .then(response => response.json()) 
  
    // Displaying results to console 
    .then(json => console.log(json)); 
  };
  
  async getLocationAsync (){
    console.log("getting location")

    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    // let isMounted = true; // note this flag denote mount status

    if (status !== 'granted') {
      this.setState({
        locationResult: 'Permission to access location was denied',
      });
    } else {
      this.setState({ hasLocationPermissions: true });
    }
 
    let location = await Location.getCurrentPositionAsync({});
    location["coords"]["latitude"] = 51.511894;
    location["coords"]["longitude"] = -0.205779;
    this.setState({ locationResult: location, currLocation: {latitude: location["coords"]["latitude"], longitude: location["coords"]["longitude"]} });
  
  }
  
  getDistance(latlong){
    console.log(this.state.currLocation)
    var lat = this.state.currLocation["latitude"];
    var long = this.state.currLocation["longitude"];
    // console.log(lat, long, latlong["latitude"], latlong["longitude"])
    var dist = Math.sqrt((lat-latlong["latitude"])**2 + (long-latlong["longitude"])**2) * 69.09;
    // console.log(dist);
    return dist;
  }
  
  compareDistance(a,b){
    if(a == null){return 0}
    else if (b == null){return 0}
    else return a.distance - b.distance
  } 
  
  updateRegion = () => {
    return {
    latitude : this.state.currLocation.latitude,
    longitude : this.state.currLocation.longitude,
    // latitude: 51.511894,
    // longitude: -0.205779,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
    }
  }
  
  createTwoButtonAlert = (title) =>
    Alert.alert(
      "Error",
      title,
      [
        // { text: "OK", onPress: () => console.log("OK Pressed") }
      ],
      { cancelable: false }
    );

  async navigate (){
    var navtype = 0;
    if(!this.state.dropoff.favorite){ navtype = navtype + 2};
    if(!this.state.pickup.favorite) { navtype = navtype + 1 };
    
    try {
      this.state.recentPickup.unshift(this.state.pickup);
      this.state.recentDropoff.unshift(this.state.dropoff);
      console.log("recent pickup: ", this.state.recentPickup, " recent dropoff: ", this.state.recentDropoff);

      this.state.recentPickup.length > 3 ? this.state.recentPickup.pop(): null;
      this.state.recentDropoff.length > 3 ? this.state.recentDropoff.pop(): null;

      await AsyncStorage.setItem('pickupList', JSON.stringify(this.state.recentPickup));
      await AsyncStorage.setItem('dropoffList', JSON.stringify(this.state.recentDropoff));
    } catch(e) {
      // error reading value
    }
    
    console.log("navtype: ", navtype);

    this.props.navigation.navigate('Ride', 
    {pickup: this.state.pickup,
      dropoff: this.state.dropoff,
      navtype: navtype})
  }
  
  FirstRoute = () => (
     <ScrollView >
      <Text>{console.log(JSON.stringify(this.state.favorites))}</Text>

      {this.state.favorites.length == 0 ? 
        <Block style = {styles.buttonContainer}>
          <Pressable onPress = {() => this.props.navigation.navigate("UpdateFavs")}>
            <Text>You have no saved favorites. Press here to add</Text>
          </Pressable>
        </Block> :
        
        this.state.favorites.map((favorite) => (
          favorite == null? null : 
        
        <Block key = {favorite["key"]} style = {styles.buttonContainer}>
         <Button 
          size = "small"
          // onPress={() => this.props.navigation.navigate("UpdateFav",  {num: favorite["key"], previous : favorite.name == null? "No Address Saved": favorite.name["name"] + " " + favorite.name["street"] + ", " + favorite.name["subregion"], onGoBack: () => this.updateFavorite(favorite["key"]),})}
          onlyIcon icon= {"favorite"}
          iconFamily="material" 
          iconSize={20} 
          iconColor = {"grey"}
          color="transparent" 
          style={{width: 20, height: 20}}
  
          // iconColor="#808080"
          >
          </Button>
          {favorite != null ? 
          
          <Pressable
            key = {favorite["key"]}
            onPress = {() => this.onChosen(favorite)}
            style = {{flex: 3}}
            // size = "large"
          >
          <Text style = {{fontWeight: 'bold'}}> {favorite.name["name"] + " " + favorite.name["street"]}</Text>
          <Text style = {styles.greyText}> {favorite.name["subregion"] + ", " + favorite.name["country"]}</Text>

          </Pressable> : 
           <Pressable
           key = {favorite["key"]}
           disabled = {true}
          //  size = "large"
           style = {{flex: 3,alignItems: 'center'}}
         >
         <Text style = {{color: 'grey'}}>No address saved in this slot</Text>
         </Pressable>}
         <Text>{favorite.distance.toFixed(1)}m</Text>
        
         </Block>
        ))}
       
          <Pressable
            onPress = {() => this.setState({mapOpen: true})}
            style = {[styles.buttonContainer, {alignSelf: "flex-start"}]}
            // size = "large"
          >
            <Button 
              size = "small"
              onlyIcon icon= {"map"}
              iconFamily="material" 
              iconSize={20} 
              iconColor = {"grey"}
              color="transparent" 
              style={{width: 20, height: 20}}
      
              // iconColor="#808080"
              >
            </Button>
            <Text style = {{fontWeight: 'bold'}}>Choose from map</Text>

          </Pressable>
          <Pressable
            onPress = {() => this.props.navigation.navigate("UpdateFavs")}
            style = {[styles.buttonContainer, {alignSelf: "flex-start"}]}
            // size = "large"
          >
           <Button 
            size = "small"
            // onPress={() => this.props.navigation.navigate("UpdateFav",  {num: favorite["key"], previous : favorite.name == null? "No Address Saved": favorite.name["name"] + " " + favorite.name["street"] + ", " + favorite.name["subregion"], onGoBack: () => this.updateFavorite(favorite["key"]),})}
            onlyIcon icon= {"update"}
            iconFamily="material" 
            iconSize={20} 
            iconColor = {"grey"}
            color="transparent" 
            style={{width: 20, height: 20}}
    
            // iconColor="#808080"
            >
            </Button>
            <Text style = {{fontWeight: 'bold'}}>Add/Update Favorites</Text>

          </Pressable>
          
      </ScrollView>
  );
  
  SecondRoute = () => (
    <ScrollView >
    {this.state.isPickup ? 
       this.state.recentPickup.length == 0 ?  
       <Block style = {styles.buttonContainer}>
         <Text>You have no recent locations.</Text>
     </Block> :
       this.state.recentPickup.map((favorite) => (
        favorite == null? null : 

        <Block key = {favorite["key"]} style = {styles.buttonContainer}>
        <Button 
         key = {favorite["key"]}
         size = "small"
         // onPress={() => this.props.navigation.navigate("UpdateFav",  {num: favorite["key"], previous : favorite.name == null? "No Address Saved": favorite.name["name"] + " " + favorite.name["street"] + ", " + favorite.name["subregion"], onGoBack: () => this.updateFavorite(favorite["key"]),})}
         onlyIcon icon= {favorite.favorite? "favorite": favorite.key < 16 ? "bolt" : "hourglass-full"}
         iconFamily="material" 
         iconSize={20} 
         iconColor = {"grey"}
         color="transparent" 
         style={{width: 20, height: 20}}
 
         // iconColor="#808080"
         >
         </Button>
         {favorite != null ? 
         
         <Pressable
           key = {favorite["key"]}
           onPress = {() => this.onChosen(favorite)}
           style = {{flex: 3}}
           // size = "large"
         >
         <Text style = {{fontWeight: 'bold'}}> {favorite.name["name"] + " " + favorite.name["street"]}</Text>
         <Text style = {styles.greyText}> {favorite.name["subregion"] + ", " + favorite.name["country"]}</Text>

         </Pressable> : 
          <Pressable
          key = {favorite["key"]}
          disabled = {true}
         //  size = "large"
          style = {{flex: 3,alignItems: 'center'}}
        >
        <Text style = {{color: 'grey'}}>No address saved in this slot</Text>
        </Pressable>}
        <Text>{favorite.distance.toFixed(1)}m</Text>
       
        </Block>
        )): 
      this.state.recentDropoff == [] ? <Text>No recent locations</Text> :

      this.state.recentDropoff.map((favorite) => (
        favorite == null? null : 

        <Block key = {favorite["key"]} style = {styles.buttonContainer}>
        <Button 
         size = "small"
         // onPress={() => this.props.navigation.navigate("UpdateFav",  {num: favorite["key"], previous : favorite.name == null? "No Address Saved": favorite.name["name"] + " " + favorite.name["street"] + ", " + favorite.name["subregion"], onGoBack: () => this.updateFavorite(favorite["key"]),})}
         onlyIcon icon= {favorite.favorite? "favorite": favorite.key < 16 ? "bolt" : "hourglass-full"}
         iconFamily="material" 
         iconSize={20} 
         iconColor = {"grey"}
         color="transparent" 
         style={{width: 20, height: 20}}
 
         // iconColor="#808080"
         >
         </Button>
         {favorite != null ? 
         
         <Pressable
           key = {favorite["key"]}
           onPress = {() => this.onChosen(favorite)}
           style = {{flex: 3}}
           // size = "large"
         >
         <Text style = {{fontWeight: 'bold'}}> {favorite.name["name"] + " " + favorite.name["street"]}</Text>
         <Text style = {styles.greyText}> {favorite.name["subregion"] + ", " + favorite.name["country"]}</Text>

         </Pressable> : 
          <Pressable
          key = {favorite["key"]}
          disabled = {true}
         //  size = "large"
          style = {{flex: 3,alignItems: 'center'}}
        >
        <Text style = {{color: 'grey'}}>No address saved in this slot</Text>
        </Pressable>}
        <Text>{favorite.distance.toFixed(1)}m</Text>
       
        </Block>
      ))}
       <Pressable
          onPress = {() => this.setState({mapOpen: true})}
          style = {[styles.buttonContainer, {alignSelf: "flex-start"}]}
          // size = "large"
        >
      
        <Button 
           size = "small"
           // onPress={() => this.props.navigation.navigate("UpdateFav",  {num: favorite["key"], previous : favorite.name == null? "No Address Saved": favorite.name["name"] + " " + favorite.name["street"] + ", " + favorite.name["subregion"], onGoBack: () => this.updateFavorite(favorite["key"]),})}
           onlyIcon icon= {"map"}
           iconFamily="material" 
           iconSize={20} 
           iconColor = {"grey"}
           color="transparent" 
           style={{width: 20, height: 20}}
   
           // iconColor="#808080"
           >
          </Button>
          <Text style = {{fontWeight: 'bold'}}>Choose from map</Text>

        </Pressable>
    </ScrollView>
  );
  ThirdRoute = () => (
    <Block style = {styles.container}>
    <ScrollView style = {{width: width}}>
      {this.state.markers === null ? <Text>Loading...</Text> :
        
        this.state.markers.map((favorite) => (
          favorite == null? null : 

          <Block key = {favorite["key"]} style = {styles.buttonContainer}>
          <Button 
           size = "small"
           // onPress={() => this.props.navigation.navigate("UpdateFav",  {num: favorite["key"], previous : favorite.name == null? "No Address Saved": favorite.name["name"] + " " + favorite.name["street"] + ", " + favorite.name["subregion"], onGoBack: () => this.updateFavorite(favorite["key"]),})}
           onlyIcon icon= {favorite.favorite? "favorite": favorite.key < 16 ? "bolt" : "hourglass-full"}
           iconFamily="material" 
           iconSize={20} 
           iconColor = {"grey"}
           color="transparent" 
           style={{width: 20, height: 20}}
   
           // iconColor="#808080"
           >
           </Button>
           {favorite != null ? 
           
           <Pressable
             key = {favorite["key"]}
             onPress = {() => this.onChosen(favorite)}
             style = {{flex: 3}}
             // size = "large"
           >
           <Text style = {{fontWeight: 'bold'}}> {favorite.name["name"] + " " + favorite.name["street"]}</Text>
           <Text style = {styles.greyText}> {favorite.name["subregion"] + ", " + favorite.name["country"]}</Text>
 
           </Pressable> : 
            <Pressable
            key = {favorite["key"]}
            disabled = {true}
           //  size = "large"
            style = {{flex: 3,alignItems: 'center'}}
          >
          <Text style = {{color: 'grey'}}>No address saved in this slot</Text>
          </Pressable>}
          <Text>{favorite.distance.toFixed(1)}m</Text>
         
          </Block>
         ))}
        
          {/* <Button 
           size = "small"
           onPress={() => this.props.navigation.navigate("UpdateFav",  {num: favorite["key"], previous : favorite.name == null? "No Address Saved": favorite.name["name"] + " " + favorite.name["street"] + ", " + favorite.name["subregion"], onGoBack: () => this.updateFavorite(favorite["key"]),})}
           onlyIcon icon="edit" 
           iconFamily="antdesign" 
           iconSize={20} 
           color="transparent" 
           style={{width: 20, height: 20}}
 
           iconColor="#808080"
           >
           </Button> */}           
       </ScrollView>
        <Pressable
          onPress = {() => this.setState({mapOpen: true})}
          style = {[styles.buttonContainer, {alignSelf: "flex-start"}]}
          // size = "large"
        >
      
        <Button 
           size = "small"
           // onPress={() => this.props.navigation.navigate("UpdateFav",  {num: favorite["key"], previous : favorite.name == null? "No Address Saved": favorite.name["name"] + " " + favorite.name["street"] + ", " + favorite.name["subregion"], onGoBack: () => this.updateFavorite(favorite["key"]),})}
           onlyIcon icon= {"map"}
           iconFamily="material" 
           iconSize={20} 
           iconColor = {"grey"}
           color="transparent" 
           style={{width: 20, height: 20}}
   
           // iconColor="#808080"
           >
          </Button>
          <Text style = {{fontWeight: 'bold'}}>Choose from map</Text>

        </Pressable>

       </Block>
  );
  _handleIndexChange = (index) => this.setState({ index });

  _renderTabBar = (props) => {
    const inputRange = props.navigationState.routes.map((x, i) => i);

    return (
      <View style={styles.tabBar}>
        {props.navigationState.routes.map((route, i) => {
          const opacity = props.position.interpolate({
            inputRange,
            outputRange: inputRange.map((inputIndex) =>
              inputIndex === i ? 1 : 0.5
            ),
          });

          return (
            <Pressable
              style={styles.tabItem}
              onPress={() => this.setState({ index: i })}>
              <Animated.Text style={{ opacity }}>{route.title}</Animated.Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  _renderScene = SceneMap({
    first: this.FirstRoute,
    second: this.SecondRoute,
    third: this.ThirdRoute,
  });
  
  render() {
      return (
        <Block style={styles.container}>
        <StatusBar animated={true} backgroundColor={theme.COLORS.GREY} hidden={!this.state.mapOpen} />
          {
            this.state.locationResult === null || this.state.markers === null ?
              <Splash/>:
              this.state.hasLocationPermissions === false ?
                this.createTwoButtonAlert("Location permissions not granted") :
                this.state.mapRegion === null ?
                  this.createTwoButtonAlert("Map region does not exist") :
                    <Block style={styles.container}>
                      <Block style = {styles.container}>
                      {this.state.mapOpen ? 
                      <Block style = {[styles.mapContainer, {flex: 14}]}>
                        <MapView
                           style={{flex: 1}} 
                           region={this.updateRegion()}
                           customMapStyle={mapStyle}
                          >
                          {this.state.currLocation != null?  
                          <Marker 
                            coordinate = {this.state.currLocation}
                            image = {require('../assets/icons/FA_star.png')}/> : null}
                            
                          {this.state.pickup != null ? 
                          <Overlay 
                            bounds = {[[this.state.pickup.latlong["latitude"] + range, this.state.pickup.latlong["longitude"] - range],[this.state.pickup.latlong["latitude"] - range, this.state.pickup.latlong["longitude"] + range]]}
                            image = {require('../assets/icons/blue-circle.png')}
                            tappable = {true}
                            opacity = {0.1}
                            /> : null}
                          {this.state.dropoff != null? 
                          <Marker 
                            coordinate = {this.state.dropoff.latlong}
                            image = {require('../assets/icons/FA_star.svg')}/> : null}
                          {this.state.markers.map((marker) => (
                            marker == null? null : 
                            <Circle
                              key = {marker.key}
                              center = {marker.latlong}
                              radius = {500}
                              strokeColor = {"transparent"}
                              opacity = {0.5}
                              fillColor = {"rgba(255,0,0,0.3)"}
                              tappable = {true}
                              onPress = {() => this.onChosen(marker)}
                              // image = {marker.favorite ? require('../assets/icons/greenpin.png') : marker.key < 16 ? require('../assets/icons/greenpin.png') : require('../assets/icons/redpin.png')}
                            />
                            ))}
                        </MapView>
                      </Block> : null}
                      <Block style={styles.topOverlayClosed}>
                        <Text style = {{fontSize: 20, fontWeight: "bold", alignSelf: 'flex-start', marginBottom: 5}}>Please Choose your {this.state.isPickup ? "Pickup Spot" : "Destination" }</Text>
                        <Pressable 
                          style = {this.state.isPickup ? styles.input : [styles.input, {backgroundColor: "white", borderColor: 'grey'}]}
                          onPress = {() => this.setState({isPickup: true, mapOpen: false})}                     >
                          <Text style = {styles.greyText}>From:</Text>
                          <Text>{this.state.pickup == null ? "" : this.state.pickup.name["street"]} <Text style = {styles.greyText}>{this.state.pickup != null? "(" + this.state.pickup.distance.toFixed(1) + " m away)": ""}</Text></Text>
                          <Button 
                            onlyIcon icon="close" 
                            iconFamily="antdesign" 
                            iconSize={12} 
                            color="transparent" 
                            iconColor="#000" 
                            style={styles.closeButton}
                            onPress = {() => this.setState({pickup: null})}>
                            </Button>
                        </Pressable>
                      
                        <Pressable 
                          style = {!this.state.isPickup ? styles.input : [styles.input, {backgroundColor: "white", borderColor: 'grey'}]}
                          onPress = {() => this.setState({isPickup: false, mapOpen: false})}
                          >
                          <Text style = {styles.greyText}>To: </Text>
                          <Text>{this.state.dropoff == null ? "" : this.state.dropoff.name["street"]} <Text style = {styles.greyText}>{this.state.dropoff != null? "(" + this.state.dropoff.distance.toFixed(1) + " m away)": ""}</Text></Text>
                          <Button 
                            onlyIcon icon="close" 
                            iconFamily="antdesign" 
                            iconSize={12} 
                            color="transparent" 
                            iconColor="#000" 
                            style={styles.closeButton}
                            onPress = {() => this.setState({dropoff: null})}>
                            </Button>
                          </Pressable>
                        {this.state.mapOpen ? 
                        <Block style = {{flexDirection: 'row'}}>
                          <Pressable style = {[styles.closeMapButton, {flex: 1}]}
                                     onPress = {() => this.getNearbyPlaces()}
                            ><Text style = {{color: theme.COLORS.WHITE, margin: 5}}>Update Locations</Text>
                          </Pressable> 
                          </Block>:
                           <TabView
                           style = {{width: width}}
                           navigationState={this.state}
                           renderScene={this._renderScene}
                           renderTabBar={this._renderTabBar}
                           onIndexChange={this._handleIndexChange}
                           swipeEnabled = {false}
                         />
                        }
        
                      </Block>
                      
                       {this.state.pickup !== null && this.state.dropoff !== null ?
                      <Pressable style = {styles.button} 
                          onPress={() => this.navigate()}>
                                 <Text h5 style = {{color: theme.COLORS.WHITE}}> Choose Your Ride</Text></Pressable> 
                                 : null}                        
                      
                  </Block>
                  </Block>
          }
        </Block>
      );
    }
}

const styles = StyleSheet.create({
  container: {
    // marginTop: statusbar,
    width: width,    
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white'
  },
  topOverlayClosed: {
    // position: 'absolute',
    // marginTop: 40, //Dimensions.get('screen').height - Dimensions.get('window').height,
    flex: 4,
    flexDirection: 'column',
    // width: Dimensions.get('screen').width,
    backgroundColor: theme.COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    width: width * .9,
    marginTop: 20
  },
  topOverlayOpen: {
    // position: 'absolute',
    marginTop: 40, //Dimensions.get('screen').height - Dimensions.get('window').height,
    flex: 4,
    flexDirection: 'column',
    // width: Dimensions.get('screen').width,
    // backgroundColor: theme.COLORS.BASE,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: width * .9,
  },
  bottomOverlay: {
    flex: 1,
    width: Dimensions.get('screen').width,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.COLORS.PRIMARY,
  },
  button: {
    alignItems: 'center',
    // justifyContent: 'flex-end',
    // width: width * .9,
    // borderRadius: 5,
    width: width,
    padding: 10,
    marginTop: 10,

    backgroundColor: theme.COLORS.DARK_PRIMARY
  },
  mapContainer: {
    height: Dimensions.get('screen').height,
    flex: 2,
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'space-around', 
    borderColor: theme.COLORS.BLACK,
    width: width,
    // backgroundColor: "red"

  },
  input: {
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexDirection: "row",
    backgroundColor: theme.COLORS.GREY,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 1,
    marginBottom: 10,
    padding: 5,
    paddingTop: 7,
    paddingBottom: 7,

    borderColor: theme.COLORS.PRIMARY,
    width: width * .9,
  },
  
  closeMapButton: {
    alignItems: "center",
    backgroundColor: theme.COLORS.PRIMARY,
    borderRadius: 5,
    flex: 2,
    padding: 1,
    margin: 5,
    width: width * .8,
  },

  greyText: {
    // position: "absolute",
    // alignSelf: "flex-start",
    // marginLeft: 5,
    // marginTop: 5,
    color: "grey",
  },
  closeButton: { 
    width: 15, 
    height: 15, 
    // position:'absolute',
    alignSelf: "flex-end",
    margin: 0,
    // marginHorizontal: 30,
  },
  wrapperCustom: {
    borderRadius: 8,
    padding: 6,
  },
  buttonContainer:{
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 7,
    margin: 5,
  },
  tabBar: {
    flexDirection: 'row',
    // paddingTop: Constants.statusBarHeight,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
});
