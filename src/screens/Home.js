import React, {useState} from 'react';
// import { StatusBar } from 'expo-status-bar';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import Splash from './Splash';
import {mapStyle} from '../components/mapStyle.js';
// import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';


import { StyleSheet, Dimensions, Pressable, SafeAreaView, View, Alert, StatusBar, Platform } from 'react-native';
import {theme, Block, Accordion, Text, NavBar, Button} from 'galio-framework';
import { Icon } from 'react-native-elements'
import { ScrollView } from 'react-native-gesture-handler';
const { width } = Dimensions.get('screen');
const {height} = Dimensions.get('window').height;
const {statusHeight} = Platform.OS === 'android' ? StatusBar.currentHeight : 0

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      markers: this.getMarkers(),
      favorites: null,
      pickup: this.props.route.params["pickup"],
      dropoff: this.props.route.params["dropoff"],
      pickupIndex: 0,
      dropoffIndex: 0,
      pickupCoords: null,
      dropoffCoords: null,
      hasLocationPermissions: false,
      locationResult: null,
      isPickup: true,
      isOpen: false,
      mapOpen: false,
    };
    this.controller;

    // 42.403635135900295, -71.12350546661803
  }
  
  async reverseGeocode(latlong){
    let geocodeObj = await Location.reverseGeocodeAsync(latlong);
    let geocode = geocodeObj[0];
    // console.log("reverse geocode is: ", geocode);
    return geocode;
  }
  
  async onChosen(selection, isFavorite) {
    let geocode = await this.reverseGeocode(selection.latlong);

    let location = geocode["name"] + " " + geocode["street"] + ", " + geocode["city"];
    var index = 0;
    isFavorite ? index = selection.key : index = selection.key + 4;

    
    if(this.state.isPickup === true){
      this.setState({pickup: location, pickupCoords: selection.latlong, pickupIndex: index});
      console.log("Pickup: ", index);
    }
    else{
      this.setState({dropoff: location, dropoffCoords: selection.latlong, dropoffIndex: index});
      console.log("Dropoff: ", index);

    }
    
    this.setState({
      isPickup: !this.state.isPickup,       
    });
    // console.log(this.state.top_pickup, " ", this.props.top_dropoff)
    
  };
  

  getMarkers = () => {
    return [
    {key: 0, latlong: {latitude: 42.403635, longitude: -71.1235054}},
    {key: 1, latlong: {latitude: 42.412960, longitude: -71.123510}},
    {key: 2, latlong: {latitude: 42.413560, longitude: -71.126610}},
    {key: 3, latlong: {latitude: 42.403510, longitude: -71.114040}}
    ]
  };
  
  async retrieve(num){
    try {
      var fav_num = "fav" + num;
      const jsonValue = await AsyncStorage.getItem(fav_num)
      return JSON.parse(jsonValue);
    } catch(e) {
      // error reading value
    }
  }
  
  async getFavorites () {
    var favs = [];
    var i = 0;
    while(i < 4){
      let latlong = await this.retrieve(i);
      console.log("latlong: ", latlong)
      let this_name = null;
      if (latlong != null){
        this_name  = await this.reverseGeocode(latlong);
      }
      else {this_name = null }
      favs.push({key: i, name: this_name, latlong: latlong});
      console.log(favs);
      i++;
    }
    this.setState({favorites: favs})
  };
    
  async updateFavorite(id){
    await this.getFavorites();
    fetch("https://missit-ridesapi-backend.ue.r.appspot.com/update_favorites", { 
      
      // Adding method type 
      method: "POST", 
        
      // Adding body or contents to send 
      
      body: id === 0 ? JSON.stringify({ 
          userid: 1,
          0: this.state.favs[0].latlong,
        }) : id === 1 ? JSON.stringify({ 
          userid: 1,
          1: this.state.favs[1].latlong,
        }) :  id === 2 ? JSON.stringify({ 
          userid: 1,
          2: this.state.fav[2].latlong,
        }) :  JSON.stringify({ 
          userid: 1,
          3: this.state.favs[3].latlong,
        })
    })
  };


  
  componentDidMount() {
    this.getFavorites();
    this.getLocationAsync();
  }
  
  async getLocationAsync (){
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
    this.setState({ locationResult: location });
  
  }
  updateRegion = () => {
    return {
    latitude : this.state.locationResult["coords"]["latitude"],
    longitude : this.state.locationResult["coords"]["longitude"],
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

  render() {
    const data = [
      { title: "40 Oss"},
      { title: "288 Boston", content: "288 Boston Ave"},
      { title: "87 North", content: "87 North St"},

    ];
      return (
        <View style={styles.container}>
          {
            this.state.locationResult === null ?
              <Splash/>:
              this.state.hasLocationPermissions === false ?
                this.createTwoButtonAlert("Location permissions not granted") :
                this.state.mapRegion === null ?
                  this.createTwoButtonAlert("Map region does not exist") :
                    <Block style={styles.container}>
                      <NavBar 
                          title="Request a Ride" 
                          // titleStyle = {{fontSize: "24pt"}}
                          // title = {JSON.stringify(Dimensions.get('window')["height"])}
                          style = {{border: 1,
                                    borderColor: 'black', marginTop: 40}}
                            // right={this.renderRight()}
                            // leftStyle={{ paddingTop: 3, flex: 0.3 }}
                            // leftIconName= 'sliders'
                            // leftIconFamily="font-awesome"
                            // left={(
                            //   <Button
                            //     color="transparent"
                            //     style={{paddingTop: 3, flex: 0.3}}
                            //     // onPress={() => this.props.navigation.openDrawer()}
                            //   >
                            //     <Icon name="sliders" family="font-awesome" />
                            //   </Button>
                            // )}
                            // right={(
                            //   <Button
                            //     color="transparent"
                            //     style={{paddingTop: 3, flex: 0.3}}
                            //     // onPress={() => this.props.navigation.openDrawer()}
                            //   >
                            //     <Icon name="heartbeat" family="font-awesome" />
                            //   </Button>
                            // )}
                            //       style={Platform.OS === 'android' ? { marginTop: theme.SIZES.BASE } : null}
                          
                          />
                      <Pressable style={styles.topOverlayClosed}
                      onPress = {() => this.setState({mapOpen: false})}>
                        <Text p style = {{padding: 5, textAlign: 'center'}}>Select from Favorites or pick from the map</Text>
                    
                        <Pressable 
                          style = {this.state.isPickup ? styles.activeInput : styles.inactiveInput}
                          onPress = {() => this.setState({isPickup: true})}
                          >
                          <Text style = {styles.greyText}>From:</Text>
                          <Text>{this.state.pickup}</Text>
                          <Button 
                            onlyIcon icon="close" 
                            iconFamily="antdesign" 
                            iconSize={12} 
                            color="transparent" 
                            iconColor="#000" 
                            style={styles.closeButton}
                            onPress = {() => this.setState({pickup: ""})}>
                            </Button>
                        </Pressable>
                        <Pressable 
                          style = {this.state.isPickup ? styles.inactiveInput : styles.activeInput}
                          onPress = {() => this.setState({isPickup: false})}
                          >
                          <Text style = {styles.greyText}>To:</Text>
                          <Text>{this.state.dropoff}</Text>
                          <Button 
                            onlyIcon icon="close" 
                            iconFamily="antdesign" 
                            iconSize={12} 
                            color="transparent" 
                            iconColor="#000" 
                            style={styles.closeButton}
                            onPress = {() => this.setState({dropoff: ""})}>
                            </Button>
                          </Pressable>
                        {this.state.mapOpen ? 
                          <Pressable style = {styles.closeMapButton}
                                     onPress = {() => this.setState({mapOpen: false})}
                            ><Text style = {{color: theme.COLORS.WHITE, margin: 5}}>See Favorites</Text>
                          </Pressable> :
                          <ScrollView style = {{width: width * 0.9, }}>
                            <Text p style = {{textAlign: 'center'}}>Favorites</Text>
                            {this.state.favorites === null ? <Text></Text> :
                              this.state.favorites.map((favorite) => (
                              <Block style = {favorite.name != null ? styles.buttonContainer : [styles.buttonContainer, {borderColor: "grey"}]}>

                                {favorite.name != null ? 

                                <Pressable
                                  key = {favorite.key}
                                  onPress = {() => this.onChosen(favorite, true)}
                                  style = {{flex: 3, alignItems: 'center'}}
                                  // size = "large"
                                >
                                <Text>{favorite.name["name"] + " " + favorite.name["street"] + ", " + favorite.name["city"]}</Text>
                                </Pressable> : 
                                 <Pressable
                                 key = {favorite.key}
                                 disabled = {true}
                                //  size = "large"
                                 style = {{flex: 3,alignItems: 'center'}}
                               >
                               <Text style = {{color: 'grey'}}>No address saved in this slot</Text>
                               </Pressable>}
                               <Button 
                                size = "small"
                                onPress={() => this.props.navigation.navigate("UpdateFav",  {num: favorite.key, previous : favorite.name == null? "No Address Saved": favorite.name["name"] + " " + favorite.name["street"] + ", " + favorite.name["city"], onGoBack: () => this.updateFavorite(favorite.key),})}
                                onlyIcon icon="edit" 
                                iconFamily="antdesign" 
                                iconSize={20} 
                                color="transparent" 
                                style={{width: 20, height: 20}}

                                iconColor="#808080"
                                >
                                </Button>
                               </Block>
                              ))}
                            </ScrollView>
                      }
                        {/* <Button size = "large">Favorite 1</Button>
                        <Button size = "large">Favorite 2</Button>
                        <Button size = "large">Favorite 3</Button>
                        <Button size = "large">Favorite 4</Button> */}

                      </Pressable>
                      {this.state.mapOpen ?
                        <View style = {[styles.mapContainer, {flex: 15, width: width}]}>
                          <MapView
                             style={{flex: 1}} 
                             region={this.updateRegion()}
                             customMapStyle={mapStyle}
                            >
                            {this.state.markers.map((marker) => (
                              <Marker
                                key = {marker.key}
                                coordinate= {marker.latlong}
                                onPress = {() => this.onChosen(marker, false)}
                                image = {require('../assets/icons/tinycar.png')}
                              />
                              ))}
                  
                            </MapView>
                        </View> :
                        <Pressable style = {styles.mapContainer} onPress = {() => this.setState({mapOpen: true})}>
                        <MapView
                           style={{flex: 1}} 
                           region={this.updateRegion()}
                           customMapStyle={mapStyle}
                          >
                          {this.state.markers.map((marker) => (
                            <Marker
                              key = {marker.key}
                              coordinate= {marker.latlong}
                              onPress = {() => this.onChosen(marker, false)}
                              image = {require('../assets/icons/tinycar.png')}
                            />
                            ))}
                    
                        </MapView>
                      </Pressable>
                      }
                      {this.state.pickup === "" || this.state.dropoff === "" ?
                        // <View style = {styles.button}></View> :
                        <View></View> :

                        <Button
                          style = {styles.button}
                          onPress={() => this.props.navigation.navigate('Ride', {pickupCoords: this.state.pickupCoords,
                                                                                 dropoffCoords: this.state.dropoffCoords,
                                                                                 pickupIndex: this.state.pickupIndex,
                                                                                 dropoffIndex: this.state.dropoffIndex})}
                        >
                          <Text h5> Continue</Text>
                        </Button>
                      }
                  </Block>
          }
        </View>
      );
    }
}

const styles = StyleSheet.create({
  container: {
    // marginTop: statusbar,
    width: width,    
    flex: 1,
    alignItems: 'center',
  },
  topOverlayClosed: {
    // position: 'absolute',
    // marginTop: 40, //Dimensions.get('screen').height - Dimensions.get('window').height,
    flex: 4,
    flexDirection: 'column',
    // width: Dimensions.get('screen').width,
    backgroundColor: theme.COLORS.BASE,
    justifyContent: 'center',
    alignItems: 'center',
    width: width * .9,
  },
  topOverlayOpen: {
    // position: 'absolute',
    marginTop: 40, //Dimensions.get('screen').height - Dimensions.get('window').height,
    flex: 4,
    flexDirection: 'column',
    // width: Dimensions.get('screen').width,
    backgroundColor: theme.COLORS.BASE,
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: width * .9,
  },
  mapContainer: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
    flex: 4,
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'space-around', 
    borderColor: theme.COLORS.BLACK,
    marginTop: 10,
    width: width * .9,

  },
  activeInput: {
    alignItems: "center",
    backgroundColor: theme.COLORS.base,
    borderColor: 'black',
    borderWidth: 3,
    borderRadius: 5,
    marginBottom: 10,
    padding: 5,
    borderColor: theme.COLORS.PRIMARY,
    width: width * .9,

  },
  closeMapButton: {
    alignItems: "center",
    backgroundColor: theme.COLORS.PRIMARY,
    borderRadius: 15,
    margin: 5,
    padding: 5,
    // flex: 5,
    width: width * .8,
  },
  inactiveInput: {
    alignItems: "center",
    backgroundColor: theme.COLORS.base,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    padding: 5,
    borderColor: 'black',
    width: width * .9,

  },
  greyText: {
    position: "absolute",
    alignSelf: "flex-start",
    marginLeft: 5,
    marginTop: 5,
    color: "grey",
  },
  closeButton: { 
    width: 30, 
    height: 15, 
    position:'absolute',
    alignSelf: "flex-end",
    // marginHorizontal: 30,
  },
  wrapperCustom: {
    borderRadius: 8,
    padding: 6,
  },
  buttonContainer:{
    flexDirection: 'row',
    borderColor: theme.COLORS.BLACK,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 7,
    padding: 5,
    
  }
});
