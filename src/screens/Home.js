import React, { useState } from 'react';
// import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Overlay, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import Splash from './Splash';
import { mapStyle } from '../components/mapStyle.js';
// import DropDownPicker from 'react-native-dropdown-picker';

import { getCurrLocation, getLocationAsync, getHasLocationPermissions, getLocationResult, selectNearestPin, getDistance, compareDistance, getDistanceFromCurr } from '../components/Location.js'
import { initializeNearby, getMarkers, refreshMarkers } from '../components/Nearby.js'
import { initializeFavorites, getFavorites } from '../components/Favorites.js'
import { initializeRecents, getRecentPickups, getRecentDropoffs } from '../components/Recents.js'
import { Animated, StyleSheet, Dimensions, Pressable, ScrollView, SafeAreaView, View, Alert, StatusBar, Platform } from 'react-native';
import { theme, Block, Accordion, Text, NavBar, Button } from 'galio-framework';
import { TabView, SceneMap } from 'react-native-tab-view';
import AsyncStorage from '@react-native-async-storage/async-storage';


const { width } = Dimensions.get('screen');
const { height } = Dimensions.get('window').height;
const { statusHeight } = Platform.OS === 'android' ? StatusBar.currentHeight : 0
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
      routes: [{ key: 1, title: 'All' },
      { key: 2, title: 'Favorites' },
      { key: 3, title: 'Recent' }
      ],
    };
    this.controller;
  }

  componentDidMount() {
    // this.getLocationAsync();
    this.setup();
  }

  async setup() {
    await getLocationAsync();
    await initializeFavorites();
    await initializeRecents();
    await initializeNearby();
    // await refreshMarkers();


    // console.log(hasLocationPermissions, currLocation, locationResult);
    var markers = getMarkers();
    // console.log(markers[0]);

    var distanceFromCurr = getDistanceFromCurr(markers[0].latlong);
    if (distanceFromCurr > 10) {
      markers = null;
      // console.log("refreshing markers");
      await refreshMarkers();
      markers = getMarkers();
      // console.log("refreshed markers");

      // markers = getMarkers();
      console.log(markers[0]);
    }
    this.setState({
      hasLocationPermissions: getHasLocationPermissions(),
      favorites: getFavorites(),
      currLocation: getCurrLocation(),
      locationResult: getLocationResult(),
      recentPickup: getRecentPickups(),
      recentDropoff: getRecentDropoffs(),
      markers: markers,
      pickup: markers[0]

    });
  }

  async refreshMarkers() {
    this.setState({markers : null});
    await refreshMarkers();
    this.setState({ markers: getMarkers() });
  }

  async chooseNearestPin(coords) {
    let closestMarker = await selectNearestPin(coords);
    this.onChosen(closestMarker);
  }

  onChosen(selection) {
    console.log(selection)
    if (this.state.isPickup === true) {
      this.setState({ pickup: selection });
    }
    else {
      this.setState({ dropoff: selection });
    }
    this.setState({
      isPickup: !this.state.isPickup,
      currLocation: selection.latlong
    });
  };

  updateRegion = () => {
    return {
      latitude: this.state.currLocation.latitude,
      longitude: this.state.currLocation.longitude,
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

  navigate() {
    var navtype = 0;
    if (!this.state.dropoff.favorite) { navtype = navtype + 2 };
    if (!this.state.pickup.favorite) { navtype = navtype + 1 };

    this.props.navigation.navigate('Ride',
      {
        pickup: this.state.pickup,
        dropoff: this.state.dropoff,
        navtype: navtype
      })
  }

  SecondRoute = () => (
    <ScrollView >
      <Text>{console.log(JSON.stringify(this.state.favorites))}</Text>

      {this.state.favorites.length === 0 ?
        <Block style={styles.buttonContainer}>
          <Pressable onPress={() => this.props.navigation.navigate("UpdateFavs")}>
            <Text>You have no saved favorites. Press here to add</Text>
          </Pressable>
        </Block> :

        this.state.favorites.map((favorite) => (
          favorite === null ? <Block key={favorite.key} /> :

            <Block key={favorite.key} style={styles.buttonContainer}>
              <Button
                size="small"
                onlyIcon icon={"favorite"}
                iconFamily="material"
                iconSize={20}
                iconColor={"grey"}
                color="transparent"
                style={{ width: 20, height: 20 }}

              // iconColor="#808080"
              >
              </Button>
              {favorite != null ?

                <Pressable
                  onPress={() => this.onChosen(favorite)}
                  style={{ flex: 3 }}
                // size = "large"
                >
                  <Text style={{ fontWeight: 'bold' }}> {favorite.name}</Text>
                  <Text style={styles.greyText}> {favorite.address}</Text>

                </Pressable> :
                <Pressable
                  disabled={true}
                  //  size = "large"
                  style={{ flex: 3, alignItems: 'center' }}
                >
                  <Text style={{ color: 'grey' }}>No address saved in this slot</Text>
                </Pressable>}
              <Text>{favorite.distance.toFixed(1)}m</Text>

            </Block>
        ))}

      <Pressable
        onPress={() => this.setState({ mapOpen: true })}
        style={[styles.buttonContainer, { alignSelf: "flex-start" }]}
      // size = "large"
      >
        <Button
          size="small"
          onlyIcon icon={"map"}
          iconFamily="material"
          iconSize={20}
          iconColor={"grey"}
          color="transparent"
          style={{ width: 20, height: 20 }}

        // iconColor="#808080"
        >
        </Button>
        <Text style={{ fontWeight: 'bold' }}>Choose from map</Text>

      </Pressable>
      <Pressable
        onPress={() => this.props.navigation.navigate("UpdateFavs", { onGoBack: () => this.setState({favorites: getFavorites() })})}
        style={[styles.buttonContainer, { alignSelf: "flex-start" }]}
      // size = "large"
      >
        <Button
          size="small"
          onlyIcon icon={"update"}
          iconFamily="material"
          iconSize={20}
          iconColor={"grey"}
          color="transparent"
          style={{ width: 20, height: 20 }}

        // iconColor="#808080"
        >
        </Button>
        <Text style={{ fontWeight: 'bold' }}>Add/Update Favorites</Text>

      </Pressable>

    </ScrollView>

  );

  ThirdRoute = () => (
    <ScrollView >
      {this.state.isPickup ?
        this.state.recentPickup.length == 0 ?
          <Block style={styles.buttonContainer}>
            <Text>You have no recent locations.</Text>
          </Block> :
          this.state.recentPickup.map((favorite) => (
            favorite == null ? <Block key={favorite.key} /> :

              <Block key={favorite["key"]} style={styles.buttonContainer}>
                <Button
                  size="small"
                  onlyIcon icon={favorite.favorite ? "favorite" : favorite.key < 16 ? "bolt" : "hourglass-full"}
                  iconFamily="material"
                  iconSize={20}
                  iconColor={"grey"}
                  color="transparent"
                  style={{ width: 20, height: 20 }}

                // iconColor="#808080"
                >
                </Button>
                {favorite != null ?

                  <Pressable
                    onPress={() => this.onChosen(favorite)}
                    style={{ flex: 3 }}
                  // size = "large"
                  >
                    <Text style={{ fontWeight: 'bold' }}> {favorite.name}</Text>
                    <Text style={styles.greyText}> {favorite.address}</Text>

                  </Pressable> :
                  <Pressable
                    disabled={true}
                    //  size = "large"
                    style={{ flex: 3, alignItems: 'center' }}
                  >
                    <Text style={{ color: 'grey' }}>No address saved in this slot</Text>
                  </Pressable>}
                <Text>{favorite.distance.toFixed(1)}m</Text>

              </Block>
          )) :
        this.state.recentDropoff == [] ? <Text>No recent locations</Text> :

          this.state.recentDropoff.map((favorite) => (
            favorite == null ? <Block key={favorite.key} /> :

              <Block key={favorite["key"]} style={styles.buttonContainer}>
                <Text>{console.log("curr" + favorite)}</Text>
                <Button
                  size="small"
                  onlyIcon icon={favorite.favorite ? "favorite" : favorite.key < 16 ? "bolt" : "hourglass-full"}
                  iconFamily="material"
                  iconSize={20}
                  iconColor={"grey"}
                  color="transparent"
                  style={{ width: 20, height: 20 }}

                // iconColor="#808080"
                >
                </Button>
                {favorite != null ?

                  <Pressable
                    onPress={() => this.onChosen(favorite)}
                    style={{ flex: 3 }}
                  // size = "large"
                  >
                    {/* <Text style = {{fontWeight: 'bold'}}> {favorite.name}</Text> */}
                    {/* <Text style = {styles.greyText}> {favorite.location["street"] + ", " + favorite.location["subregion"]}</Text> */}

                  </Pressable> :
                  <Pressable
                    disabled={true}
                    //  size = "large"
                    style={{ flex: 3, alignItems: 'center' }}
                  >
                    <Text style={{ color: 'grey' }}>No address saved in this slot</Text>
                  </Pressable>}
                <Text>{favorite.distance.toFixed(1)}m</Text>

              </Block>
          ))}
      <Pressable
        onPress={() => this.setState({ mapOpen: true })}
        style={[styles.buttonContainer, { alignSelf: "flex-start" }]}
      // size = "large"
      >

        <Button
          size="small"
          onlyIcon icon={"map"}
          iconFamily="material"
          iconSize={20}
          iconColor={"grey"}
          color="transparent"
          style={{ width: 20, height: 20 }}

        // iconColor="#808080"
        >
        </Button>
        <Text style={{ fontWeight: 'bold' }}>Choose from map</Text>

      </Pressable>
    </ScrollView>
  );

  FirstRoute = () => (
    <Block style={styles.container}>
      <ScrollView style={{ width: width }}>
        {this.state.markers === null ? <Text>Loading...</Text> :

          this.state.markers.map((favorite) => (
            favorite == null ? <Block key={favorite.key} /> :

              <Block key={favorite["key"]} style={styles.buttonContainer}>
                <Button
                  size="small"
                  onlyIcon icon={favorite.favorite ? "favorite" : favorite.key < 16 ? "bolt" : "hourglass-full"}
                  iconFamily="material"
                  iconSize={20}
                  iconColor={"grey"}
                  color="transparent"
                  style={{ width: 20, height: 20 }}

                // iconColor="#808080"
                >
                </Button>
                {favorite != null ?

                  <Pressable
                    onPress={() => this.onChosen(favorite)}
                    style={{ flex: 3 }}
                  // size = "large"
                  >
                    <Text style={{ fontWeight: 'bold' }}> {favorite.name}</Text>
                    <Text style={styles.greyText}> {favorite.address}</Text>

                  </Pressable> :
                  <Pressable
                    disabled={true}
                    //  size = "large"
                    style={{ flex: 3, alignItems: 'center' }}
                  >
                    <Text style={{ color: 'grey' }}>No address saved in this slot</Text>
                  </Pressable>}
                <Text>{favorite.distance.toFixed(1)}m</Text>

              </Block>
          ))}

        {/* <Button 
           size = "small"
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
        onPress={() => this.setState({ mapOpen: true })}
        style={[styles.buttonContainer, { alignSelf: "flex-start" }]}>
        <Button
          size="small"
          onlyIcon icon={"map"}
          iconFamily="material"
          iconSize={20}
          iconColor={"grey"}
          color="transparent"
          style={{ width: 20, height: 20 }}
        >
        </Button>
        <Text style={{ fontWeight: 'bold' }}>Choose from map</Text>
      </Pressable>
      <Pressable
        onPress={() => this.refreshMarkers()}
        style={[styles.buttonContainer, { alignSelf: "flex-start" }]}>
        <Button
          size="small"
          onlyIcon icon={"update"}
          iconFamily="material"
          iconSize={20}
          iconColor={"grey"}
          color="transparent"
          style={{ width: 20, height: 20 }}
        >
        </Button>
        <Text style={{ fontWeight: 'bold' }}>Refresh Locations</Text>
      </Pressable>

    </Block>

  );

  _handleIndexChange = (index) => this.setState({ index: index });

  _renderTabBar = (props) => {
    const inputRange = [0, 1, 2]
    console.log(inputRange);
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
              key={route.title}
              style={styles.tabItem}
              onPress={() => this.setState({ index: i })}>
              <Animated.Text style={{ opacity }}>{route.title}</Animated.Text>
            </Pressable>
          );
        })}
      </View>
    );
  };
  _renderScene = ({ route, jumpTo }) => {
    switch (route.key) {
      case 1:
        return this.FirstRoute();
      case 2:
        return this.SecondRoute();
      default:
        return this.ThirdRoute();

    }
  };
  // _renderScene = SceneMap({
  //   first: this.FirstRoute,
  //   second: this.SecondRoute,
  //   third: this.ThirdRoute,
  // });

  render() {
    return (
      <Block style={styles.container}>
        <StatusBar animated={true} backgroundColor={theme.COLORS.GREY} hidden={!this.state.mapOpen} />
        {
          this.state.locationResult === null || this.state.markers === null ?
            <Splash /> :
            this.state.hasLocationPermissions === false ?
              this.createTwoButtonAlert("Location permissions not granted") :
              this.state.mapRegion === null ?
                this.createTwoButtonAlert("Map region does not exist") :
                <Block style={styles.container}>
                  <Block style={styles.container}>
                    {this.state.mapOpen ?
                      <Block style={[styles.mapContainer, { flex: 14 }]}>
                        <MapView
                          style={{ flex: 1 }}
                          region={this.updateRegion()}
                          customMapStyle={mapStyle}
                          onLongPress={(event) => this.chooseNearestPin(event.nativeEvent.coordinate)}
                          ref={ref => (this.mapView = ref)}
                        >
                          {this.state.locationResult != null ?
                            <Marker
                              coordinate={this.state.locationResult}
                              image={require('../assets/icons/blue_dot.png')} /> :
                            null}

                          {this.state.pickup != null ?
                            <Marker
                              coordinate={this.state.pickup.latlong}
                              fillColor={"rgba(0,255,0,0.3)"}
                              image={require('../assets/icons/from.png')}
                            />
                            : null}

                          {this.state.dropoff != null ?
                            <Marker
                              coordinate={this.state.dropoff.latlong}
                              image={require('../assets/icons/to.png')}
                            />
                            : null}

                          {this.state.favorites.map((favorite) => (
                            favorite == this.state.pickup || favorite == this.state.dropoff ? null :
                              <Marker
                                key={favorite.key}
                                coordinate={favorite.latlong}
                                title={favorite.name}
                                // center = {marker.latlong}
                                opacity={0.7}
                                // fillColor = {marker.favorite? "rgba(,0,255,0.3)" : "rgba(255,0,0,0.3)"}
                                tappable={true}
                                onPress={() => this.onChosen(favorite)}
                                image={require('../assets/icons/favorite.png')}
                              />
                          ))}

                          {this.state.markers.map((marker) => (
                            marker == this.state.pickup || marker == this.state.dropoff ? null :
                              <Marker
                                key={marker.key}
                                coordinate={marker.latlong}
                                title={marker.name}
                                // center = {marker.latlong}
                                radius={500}
                                strokeColor={"transparent"}
                                opacity={0.7}
                                // fillColor = {marker.favorite? "rgba(,0,255,0.3)" : "rgba(255,0,0,0.3)"}
                                tappable={true}
                                onPress={() => this.onChosen(marker)}
                                image={marker.key < 16 ? require('../assets/icons/fast.png') : require('../assets/icons/slow.png')}
                              />
                          ))}
                        </MapView>
                      </Block> : null}

                    <Block style={styles.topOverlayClosed}>
                      <Text style={{ fontSize: 20, fontWeight: "bold", alignSelf: 'flex-start', marginBottom: 5 }}>Please Choose your {this.state.isPickup ? "Pickup Spot" : "Destination\n"}
                      <Text style = {{fontSize: 10, fontWeight: "normal"}}>Press and hold on the map to select the nearest available pin</Text>

                      </Text>

                      <Pressable
                        style={this.state.isPickup ? styles.input : [styles.input, { backgroundColor: "white", borderColor: 'grey' }]}
                        onPress={() => {
                          if (this.state.isPickup) {
                            this.setState({ mapOpen: !this.state.mapOpen });
                          } else {
                            this.setState({ isPickup: true })
                          }
                        }}>
                        <Text style={styles.greyText}>From:</Text>
                        <Block style={{ flexDirection: 'column', width: width * .7 }}>
                          <Text>{this.state.pickup == null ? "" : this.state.pickup.name}
                            < Text style={styles.greyText}>{this.state.pickup != null ? " (" + this.state.pickup.distance.toFixed(1) + " m away)" : ""}</Text>

                          </Text>
                        </Block>
                        <Button
                          onlyIcon icon="close"
                          iconFamily="antdesign"
                          iconSize={20}
                          color="transparent"
                          iconColor="#000"
                          style={styles.closeButton}
                          onPress={() => this.setState({ pickup: null })}>
                        </Button>
                      </Pressable>

                      <Pressable
                        style={!this.state.isPickup ? styles.input : [styles.input, { backgroundColor: "white", borderColor: 'grey' }]}
                        onPress={() => {
                          if (!this.state.isPickup) {
                            this.setState({ mapOpen: !this.state.mapOpen });
                          } else {
                            this.setState({ isPickup: false })
                          }
                        }}
                      >
                        <Text style={styles.greyText}>To: </Text>
                        <Text style={{ flexDirection: 'column', width: width * .7 }} >{this.state.dropoff == null ? "" : this.state.dropoff.name} <Text style={styles.greyText}>{this.state.dropoff != null ? "(" + this.state.dropoff.distance.toFixed(1) + " m away)" : ""}</Text></Text>
                        <Button
                          onlyIcon icon="close"
                          iconFamily="antdesign"
                          iconSize={20}
                          color="transparent"
                          iconColor="#000"
                          style={styles.closeButton}
                          onPress={() => this.setState({ dropoff: null })}>
                        </Button>
                      </Pressable>
                      {this.state.mapOpen ?
                        <Block style={{ flexDirection: 'row' }}>
                          <Pressable style={[styles.closeMapButton, { flex: 1 }]}
                            onPress={() => this.setState({ mapOpen: false })}
                          ><Text style={{ color: theme.COLORS.WHITE, margin: 3 }}>Choose from List</Text>
                          </Pressable>
                        </Block> :
                        <TabView
                          style={{ width: width }}
                          navigationState={this.state}
                          renderScene={this._renderScene}
                          renderTabBar={this._renderTabBar}
                          onIndexChange={this._handleIndexChange}
                          swipeEnabled={false}
                        />
                      }

                    </Block>

                    {this.state.pickup !== null && this.state.dropoff !== null ?
                      <Pressable style={styles.button}
                        onPress={() => this.navigate()}>
                        <Text h5 style={{ color: theme.COLORS.WHITE }}> Choose Your Ride</Text></Pressable>
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
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    backgroundColor: theme.COLORS.GREY,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 1,
    marginBottom: 10,
    padding: 2,

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
    // fontSize: 
  },
  closeButton: {
    width: 20,
    height: 20,
    // position:'absolute',
    // alignSelf: "flex-end",
    margin: 0,
    // backgroundColor: 'red',
    // marginHorizontal: 30,
  },
  wrapperCustom: {
    borderRadius: 8,
    padding: 6,
  },
  buttonContainer: {
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