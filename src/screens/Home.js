import React, {useState} from 'react';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import Splash from './Splash';
import {mapStyle} from '../components/mapStyle.js';
import DropDownPicker from 'react-native-dropdown-picker';

import { StyleSheet, Dimensions, Pressable, SafeAreaView, View, Alert} from 'react-native';
import {theme, Block, Accordion, Text, NavBar, Button} from 'galio-framework';
import { Icon } from 'react-native-elements'
const { width } = Dimensions.get('screen');
const {height} = Dimensions.get('window').height;


export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      region: null,
      markers: this.getMarkers(),
      pickup: "",
      dropoff: "",
      hasLocationPermissions: false,
      locationResult: null,
      isPickup: true,
      isOpen: false,
    };
    
    // 42.403635135900295, -71.12350546661803
  }
  switchState = () => {
   
  }
  async onChosen(latlong) {
    let geocode = await Location.reverseGeocodeAsync(latlong);
    geocode = geocode[0];
    if(this.state.isPickup === true){
      this.setState({pickup: geocode["name"] + " " + geocode["street"] + ", " + geocode["city"]})
    }
    else{this.setState({dropoff: geocode["name"] + " " + geocode["street"] + ", " + geocode["city"]})}
    
    this.setState({
      isPickup: !this.state.isPickup,       
    });
    console.log(this.state.pickup, " ", this.state.dropoff)
    
  };
  

  getMarkers = () => {
    return [
    {"key": 0, latlong: {latitude: 42.403635, longitude: -71.1235054}},
    {"key": 1, latlong: {latitude: 42.412960, longitude: -71.123510}},
    {"key": 2, latlong: {latitude: 42.413560, longitude: -71.126610}},
    {"key": 3, latlong: {latitude: 42.403510, longitude: -71.114040}}
    ]
  };
  componentDidMount() {
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
                    <SafeAreaView style={styles.container}>
                      <Block style={this.state.isOpen ? styles.topOverlayOpen : styles.topOverlayClosed}>
                      <NavBar 
                        title="Request a Ride" 
                        style = {{border: 1,
                                  borderColor: 'black'}}
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
                        <DropDownPicker
                          items={[
                              {label: '40 Ossipee', value: {latitude: 42.403635, longitude: -71.1235054} },
                              {label: '288 Boston', value: {latitude: 42.412960, longitude: -71.123510},  },
                            ]}
                          defaultValue={null}
                          placeholder= "Select from Favorites"
                          containerStyle={{height: 40, width: width * .9}}
                          style={{backgroundColor: '#fafafa'}}
                          itemStyle={{
                              justifyContent: 'flex-start'
                          }}
                          dropDownStyle={{backgroundColor: '#fafafa'}}
                          onChangeItem={ item => this.onChosen(item.value)}
                          onOpen={() => this.setState({isOpen: true})}
                          onClose={() => this.setState({isOpen: false})}

                        />
                      </Block>
                    <MapView
                       style={styles.map} 
                       region={this.updateRegion()}
                       customMapStyle={mapStyle}
                      >
                      {this.state.markers.map((marker) => (
                        <Marker
                          coordinate= {marker.latlong}
                          onPress = {() => this.onChosen(marker.latlong)}
                          image = {require('../assets/icons/tinycar.png')}
                        />
                        ))}
                
                      
                    </MapView>
                      {this.state.pickup === "" || this.state.dropoff === "" ?
                        null :
                        <Pressable>
                          <Text h5> Continue</Text>
                        </Pressable>
                      }
                  </SafeAreaView>
          }
        </View>
      );
    }
}

const styles = StyleSheet.create({
  container: {
    // marginTop: 88 ,
    // Dimensions.get('screen').height - Dimensions.get('window').height,
    width: width,    
    flex: 1,
    alignItems: 'center',
  },
  topOverlayClosed: {
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
  topOverlayOpen: {
    // position: 'absolute',
    marginTop: 40, //Dimensions.get('screen').height - Dimensions.get('window').height,
    flex: 7,
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
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 10
  },
  map: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
    flex: 9,
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'space-around',    
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
