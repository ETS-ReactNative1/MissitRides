import React, {useState} from 'react';
// import { StatusBar } from 'expo-status-bar';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import Splash from './Splash';
import {mapStyle} from '../components/mapStyle.js';
import DropDownPicker from 'react-native-dropdown-picker';

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
      pickupCoords: null,
      dropoffCoords: null,
      dropoff: this.props.route.params["dropoff"],
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
    geocode = geocodeObj[0];
    // console.log("reverse geocode is: ", geocode);
    return geocode;
  }
  
  async onChosen(latlong) {
    let geocode = await this.reverseGeocode(latlong);
    // console.log("final geocode is: ", geocode);

    let location = geocode["name"] + " " + geocode["street"] + ", " + geocode["city"]
    if(this.state.isPickup === true){
      this.setState({pickup: location, pickupCoords: latlong})
      // this.props.pickup = location
    }
    else{
      this.setState({dropoff: location, dropoffCoords: latlong})
      // this.props.pickup = location
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
  
  async getFavorites () {
    favs =  [
    {key: 0, latlong: {latitude: 42.403635, longitude: -71.1235054}},
    {key: 1, latlong: {latitude: 42.412960, longitude: -71.123510}},
    {key: 2, latlong: {latitude: 42.413560, longitude: -71.126610}},
    {key: 3, latlong: {latitude: 42.403510, longitude: -71.114040}},
    {key: 4, latlong: {latitude: 40.053530, longitude: -75.187960}}

    ];
    
    for(i = 0; i < favs.length; i++) {
      let name  = await this.reverseGeocode(favs[i].latlong);
      favs[i].name = name;
    }
    // console.log(favs);

    this.setState({favorites: favs})
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
                        <Text>Select from Favorites or pick from the map</Text>
                        {/* <DropDownPicker
                            controller={instance => this.controller = instance}
  
                            items={[
                                {label: '40 Ossipee', value: {latitude: 42.403635, longitude: -71.1235054} },
                                {label: '288 Boston', value: {latitude: 42.412960, longitude: -71.123510},  },
                              ]}
                            defaultValue={this.state.pickup}
                            placeholder= "Select from Favorites"
                            containerStyle={{height: 40, width: width * .9}}
                            // style={{backgroundColor: '#fafafa'}}
                            style = {this.state.isPickup ? styles.activeInput : styles.inactiveInput}
                            itemStyle={{
                                justifyContent: 'flex-start'
                            }}
                            dropDownStyle={{backgroundColor: '#fafafa'}}
                            onChangeItem={ item => this.onChosen(item.value)}
                            onOpen={() => this.setState({isPickup: true})}
                            onClose={}
                          /> */}
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
                              ><Text style = {{color: theme.COLORS.WHITE}}>See Favorites</Text>
                            </Pressable> :
                            <ScrollView>
                              {this.state.favorites === null ? <Text></Text> :
                                this.state.favorites.map((favorite) => (
                                  <Button
                                    key = {favorite.key}
                                    onPress = {() => this.onChosen(favorite.latlong)}
                                    size = "large"
                                  >
                                  {favorite.name["name"] + " " + favorite.name["street"] + ", " + favorite.name["city"]}
                                  </Button>
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
                                onPress = {() => this.onChosen(marker.latlong)}
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
                              onPress = {() => this.onChosen(marker.latlong)}
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
                          onPress={() => this.props.navigation.navigate('Ride', {pickupCoords: this.state.pickupCoords, dropoffCoords: this.state.dropoffCoords})}
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
    marginBottom: 5,
    padding: 5,
    // borderColor: theme.COLORS.PRIMARY,
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
});
