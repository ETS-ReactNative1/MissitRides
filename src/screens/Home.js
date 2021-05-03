import React from 'react';
// import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Overlay, Circle } from 'react-native-maps';
import Splash from './Splash';
import { mapStyle } from '../components/mapStyle.js';
import { homeStyles } from '../styles/homeStyle';
import { allStyles } from '../styles/allStyle';
import { getFavorites, initializeFavorites } from '../components/Favorites'
import { getLocationAsync, getHasLocationPermissions, getLocationResult, getCurrLocation, compareDistance, getDistance } from '../components/Location'
import { initializeRecents, getRecentPickups, getRecentDropoffs } from '../components/Recents'
import { initializeNearby, getNearbyPlaces, getMarkers } from '../components/Nearby'
import { Animated, StyleSheet, Dimensions, Pressable, ScrollView, SafeAreaView, View, Alert, StatusBar, Platform } from 'react-native';
import { theme, Block, Accordion, Text, NavBar, Button } from 'galio-framework';
import { TabView, SceneMap } from 'react-native-tab-view';

const { width } = Dimensions.get('screen');
const { height } = Dimensions.get('window').height;

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      markers: null,
      favorites: null,
      recentPickup: [],
      recentDropoff: [],
      pickup: this.props.route.params["pickup"],
      dropoff: this.props.route.params["dropoff"],
      hasLocationPermissions: false,
      locationResult: null,
      isPickup: false,
      isOpen: false,
      mapOpen: true,
      currLocation: null,
      index: 0,
      routes: [{ key: 'first', title: 'Favorites' },
              { key: 'second', title: 'Recents' },
              { key: 'third', title: 'All' }
      ],
    };
    this.controller;

    // 42.403635135900295, -71.12350546661803
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

    hasLocationPermissions = getHasLocationPermissions();
    currLocation = getCurrLocation();
    locationResult = getLocationResult();

    this.setState({
      favorites: getFavorites(),
      currLocation: getCurrLocation(),
      locationResult: getLocationResult(),
      recentPickup: getRecentPickups(),
      recentDropoff: getRecentDropoffs(),
      markers: getMarkers(),
    });
    
    console.log("recent pickup: ",this.state.recentPickup)
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
      currLocation: selection.latlong,
    });
  };

  updateRegion = () => {
    console.log(this.state.currLocation);
    return {
      latitude: this.state.currLocation.latitude,
      longitude: this.state.currLocation.longitude,
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

  FirstRoute = () => (
    <ScrollView>
      <Text>{console.log(JSON.stringify(this.state.favorites))}</Text>

      {this.state.favorites.length == 0 ?
        <Block style={homeStyles.buttonContainer}>
          <Pressable onPress={() => this.props.navigation.navigate("UpdateFavs")}>
            <Text>You have no saved favorites. Press here to add</Text>
          </Pressable>
        </Block> :

        this.state.favorites.map((favorite) => (
          favorite == null ? null :

            <Block key={favorite["key"]} style={homeStyles.buttonContainer}>
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
                  <Text style={homeStyles.greyText}> {favorite.address}</Text>

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
        style={[homeStyles.buttonContainer, { alignSelf: "flex-start" }]}
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
        onPress={() => this.props.navigation.navigate("UpdateFavs", { onGoBack: () => this.getFavorites() })}
        style={[homeStyles.buttonContainer, { alignSelf: "flex-start" }]}
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

  SecondRoute = () => (
    <ScrollView>
      {this.state.isPickup ?
        this.state.recentPickup.length == 0 ?
          <Block style={styles.buttonContainer}>
            <Text>You have no recent locations.</Text>
          </Block> :
          this.state.recentPickup.map((favorite) => (
            favorite == null ? null :

              <Block key={favorite["key"]} style={homeStyles.buttonContainer}>
                <Button
                  size="small"
                  onlyIcon icon={favorite.favorite ? "favorite" : favorite.key < 16 ? "bolt" : "hourglass-bottom"}
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
                    <Text style={homeStyles.greyText}> {favorite.address}</Text>

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
            favorite == null ? null :

              <Block key={favorite["key"]} style={homeStyles.buttonContainer}>
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
                    {/* <Text style = {homeStyles.greyText}> {favorite.location["street"] + ", " + favorite.location["subregion"]}</Text> */}

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
        style={[homeStyles.buttonContainer, { alignSelf: "flex-start" }]}
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
  
  ThirdRoute = () => (
    <Block style={allStyles.container}>
      <ScrollView style={{ width: width }}>
        {this.state.markers === null ? <Text>Loading...</Text> :

          this.state.markers.map((favorite) => (
            favorite == null ? null :

              <Block key={favorite["key"]} style={homeStyles.buttonContainer}>
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
                    <Text style={homeStyles.greyText}> {favorite.address}</Text>

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
        style={[homeStyles.buttonContainer, { alignSelf: "flex-start" }]}
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

    </Block>
  );
  
  _handleIndexChange = (index) => this.setState({ index });

  _renderTabBar = (props) => {
    const inputRange = props.navigationState.routes.map((x, i) => i);

    return (
      <View style={homeStyles.tabBar}>
        {props.navigationState.routes.map((route, i) => {
          const opacity = props.position.interpolate({
            inputRange,
            outputRange: inputRange.map((inputIndex) =>
              inputIndex === i ? 1 : 0.5
            ),
          });

          return (
            <Pressable
              style={homeStyles.tabItem}
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
      <SafeAreaView style={homeStyles.container}>
        <StatusBar animated={true} backgroundColor={theme.COLORS.GREY} hidden={!this.state.mapOpen} />
        {
          this.state.locationResult === null || this.state.markers === null ?
            <Splash /> :
            getHasLocationPermissions() === false ?
              this.createTwoButtonAlert("Location permissions not granted") :
              this.state.mapRegion === null ?
                this.createTwoButtonAlert("Map region does not exist") :
                <Block style={homeStyles.container}>
                  <Block style={homeStyles.container}>
                    {this.state.mapOpen ?
                      <Block style={[homeStyles.mapContainer, { flex: 14 }]}>
                        <MapView
                          style={{ flex: 1 }}
                          region={this.updateRegion()}
                          customMapStyle={mapStyle}
                        >
                          {this.state.locationResult != null ?
                            <Marker
                              coordinate={this.state.locationResult}
                              image={require('../assets/icons/blue_dot.png')} /> : null}

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
                              fillColor={"rgba(0,255,0,0.3)"}
                              image={require('../assets/icons/to.png')}

                            />
                            : null}
                          {this.state.favorites.map((marker) => (
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
                      
                    <Block style={homeStyles.topOverlayClosed}>
                      <Text style={{ fontSize: 20, fontWeight: "bold", alignSelf: 'flex-start', marginBottom: 5 }}>Please Choose your {this.state.isPickup ? "Pickup Spot" : "Destination"}</Text>
                      <Pressable
                        style={this.state.isPickup ? homeStyles.input : [homeStyles.input, { backgroundColor: "white", borderColor: 'grey' }]}
                        onPress={() => this.setState({ isPickup: true, mapOpen: !this.state.mapOpen })}                     >
                        <Text style={homeStyles.greyText}>From:</Text>
                        <Text style = {{fontSize: 16}}>{this.state.pickup == null ? "" : this.state.pickup.name} <Text style={homeStyles.greyText}>{this.state.pickup != null ? "(" + this.state.pickup.distance.toFixed(1) + " m away)" : ""}</Text></Text>
                        <Button
                          onlyIcon icon="close"
                          iconFamily="antdesign"
                          iconSize={18}
                          color="transparent"
                          iconColor="#000"
                          style={homeStyles.closeButton}
                          onPress={() => this.setState({ pickup: null })}>
                        </Button>
                      </Pressable>

                      <Pressable
                        style={!this.state.isPickup ? homeStyles.input : [homeStyles.input, { backgroundColor: "white", borderColor: 'grey' }]}
                        onPress={() => this.setState({ isPickup: false, mapOpen: !this.state.mapOpen })}
                      >
                        <Text style={homeStyles.greyText}>To: </Text>
                        <Text>{this.state.dropoff == null ? "" : this.state.dropoff.name} <Text style={homeStyles.greyText}>{this.state.dropoff != null ? "(" + this.state.dropoff.distance.toFixed(1) + " m away)" : ""}</Text></Text>
                        <Button
                          onlyIcon icon="close"
                          iconFamily="antdesign"
                          iconSize={18}
                          color="transparent"
                          iconColor="#000"
                          style={homeStyles.closeButton}
                          onPress={() => this.setState({ dropoff: null })}>
                        </Button>
                      </Pressable>
                      {this.state.mapOpen ?
                        <Block style={{ flexDirection: 'row' }}>
                          {/* <Pressable style={[homeStyles.closeMapButton, { flex: 1 }]}
                            onPress={() => this.getNearbyPlaces()}
                          ><Text style={{ color: theme.COLORS.WHITE, margin: 5 }}>Update Locations</Text>
                          </Pressable> */}
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
                      <Pressable style={allStyles.confirmButton}
                        onPress={() => this.navigate()}>
                        <Text h5 style={{ color: theme.COLORS.WHITE }}> Choose Your Ride</Text></Pressable>
                      : null}

                  </Block>
                </Block>
        }
      </SafeAreaView>
    );
  }
}
