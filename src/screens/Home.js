import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import Splash from './Splash';
import { mapStyle } from '../components/mapStyle.js';
import { homeStyles } from '../styles/homeStyle'
import { getCurrLocation, getLocationAsync, getHasLocationPermissions, getLocationResult, selectNearestPin, getDistanceFromCurr } from '../components/Location.js'
import { initializeNearby, getMarkers, refreshMarkers } from '../components/Nearby.js'
import { initializeFavorites, getFavorites } from '../components/Favorites.js'
import { initializeRecents, getRecentPickups, getRecentDropoffs } from '../components/Recents.js'
import { Animated, Dimensions, Pressable, ScrollView, View, StatusBar, Alert } from 'react-native';
import { theme, Block, Text, Button } from 'galio-framework';
import { TabView } from 'react-native-tab-view';

const { width } = Dimensions.get('screen');

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
      isPickup: false,
      isOpen: false,
      mapOpen: true,
      index: 0,
      routes: [{ key: 1, title: 'All' },
      { key: 2, title: 'Favorites' },
      { key: 3, title: 'Recent' }
      ],
    };
    this.controller;
  }

  componentDidMount() {
    this.setup();
  }

  async setup() {
    await getLocationAsync();
    await initializeFavorites();
    await initializeRecents();
    await initializeNearby();

    var markers = getMarkers();

    var distanceFromCurr = getDistanceFromCurr(markers[0].latlong);
    if (distanceFromCurr > 10) {
      markers = null;
      await refreshMarkers();
      markers = getMarkers();
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
    this.setState({ markers: null });
    await refreshMarkers();
    this.setState({ markers: getMarkers() });
  }

  async chooseNearestPin(coords) {
    let closestMarker = await selectNearestPin(coords);
    this.onChosen(closestMarker);
  }

  onChosen(selection) {
    this.setState({
      currLocation: selection.latlong
    });
    this.state.isPickup === true ? this.setState({ pickup: selection }) : this.setState({ dropoff: selection });
  };

  updateRegion = () => {
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

  // Makes a block holding address information in scroll view 
  locationBlock = (marker) => (
    marker == null ? <Block key={marker.key} /> :
      <Block key={marker["key"]} style={homeStyles.buttonContainer}>
        <Button
          size="small"
          onlyIcon icon={marker.favorite ? "favorite" : marker.key < 16 ? "bolt" : "hourglass-full"}
          iconFamily="material"
          iconSize={20}
          iconColor={"grey"}
          color="transparent"
          style={{ width: 20, height: 20 }}
        >
        </Button>

        {marker != null ?
          <Pressable onPress={() => this.onChosen(marker)} style={{ flex: 3 }}>
            <Text style={{ fontWeight: 'bold' }}> {marker.name}</Text>
            <Text style={homeStyles.greyText}> {marker.address}</Text>
          </Pressable> :
          <Pressable disabled={true} style={{ flex: 3, alignItems: 'center' }}>
            <Text style={{ color: 'grey' }}>No address saved in this slot</Text>
          </Pressable>}
        <Text>{marker.distance.toFixed(1)}m</Text>
      </Block>
  );

  // creates list of all locations in database
  FirstRoute = () => (
    <Block style={homeStyles.container}>
      <ScrollView style={{ width: width }}>
        {this.state.markers === null ? <Text>Loading...</Text> :
          this.state.markers.map((marker) => (this.locationBlock(marker)))}
      </ScrollView>
      <Pressable
        onPress={() => this.setState({ mapOpen: true })}
        style={[homeStyles.buttonContainer, { alignSelf: "flex-start" }]}>
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
        style={[homeStyles.buttonContainer, { alignSelf: "flex-start" }]}>
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

  // creates list of favorite locations
  SecondRoute = () => (
    <ScrollView >
      {this.state.favorites.length === 0 ?
        <Block style={homeStyles.buttonContainer}>
          <Pressable onPress={() => this.props.navigation.navigate("UpdateFavs")}>
            <Text>You have no saved favorites. Press here to add</Text>
          </Pressable>
        </Block> :
        this.state.favorites.map((favorite) => (this.locationBlock(favorite)))}

      <Pressable
        onPress={() => this.setState({ mapOpen: true })}
        style={[homeStyles.buttonContainer, { alignSelf: "flex-start" }]}
      >
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
        onPress={() => this.props.navigation.navigate("UpdateFavs", { onGoBack: () => this.setState({ favorites: getFavorites() }) })}
        style={[homeStyles.buttonContainer, { alignSelf: "flex-start" }]}
      >
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
        <Text style={{ fontWeight: 'bold' }}>Add/Update Favorites</Text>
      </Pressable>
    </ScrollView>

  );

  // creates list of favorite locations
  ThirdRoute = () => (
    <ScrollView >
      {this.state.isPickup ?
        this.state.recentPickup.length == 0 ?
          <Block style={homeStyles.buttonContainer}>
            <Text>You have no recent locations.</Text>
          </Block> :
          this.state.recentPickup.map((marker) => (this.locationBlock(marker)))
        :
        this.state.recentDropoff == [] ? <Text>You have no recent recent locations</Text> :
          this.state.recentDropoff.map((marker) => (this.locationBlock(marker)))}
      <Pressable
        onPress={() => this.setState({ mapOpen: true })}
        style={[homeStyles.buttonContainer, { alignSelf: "flex-start" }]}
      >
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
    </ScrollView>
  );

  // used for tab view
  _handleIndexChange = (index) => this.setState({ index: index });

  // used for tab view

  _renderTabBar = (props) => {
    const inputRange = [0, 1, 2]
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
              key={route.title}
              style={homeStyles.tabItem}
              onPress={() => this.setState({ index: i })}>
              <Animated.Text style={{ opacity }}>{route.title}</Animated.Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  // used for tab view

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

  render() {
    return (
      <Block style={homeStyles.container}>
        <StatusBar animated={true} backgroundColor={theme.COLORS.GREY} hidden={!this.state.mapOpen} />
        {
          this.state.locationResult === null || this.state.markers === null ?
            <Splash /> :
            this.state.hasLocationPermissions === false ?
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
                                opacity={0.7}
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
                                radius={500}
                                strokeColor={"transparent"}
                                opacity={0.7}
                                tappable={true}
                                onPress={() => this.onChosen(marker)}
                                image={marker.key < 16 ? require('../assets/icons/fast.png') : require('../assets/icons/slow.png')}
                              />
                          ))}
                        </MapView>
                      </Block> : null}

                    <Block style={homeStyles.topOverlayClosed}>
                      <Text
                        style={{ fontSize: 20, fontWeight: "bold", alignSelf: 'flex-start', marginBottom: 5 }}>
                        Please Choose your {this.state.isPickup ? "Pickup Spot\n" : "Destination\n"}
                        <Text style={{ fontSize: 10, fontWeight: "normal" }}>Press and hold on the map to select the nearest available pin</Text>
                      </Text>

                      <Pressable
                        style={this.state.isPickup ? homeStyles.input : [homeStyles.input, { backgroundColor: "white", borderColor: 'grey' }]}
                        onPress={() => {
                          if (this.state.isPickup) {
                            this.setState({ mapOpen: !this.state.mapOpen });
                          } else {
                            this.setState({ isPickup: true })
                          }
                        }}>
                        <Text style={homeStyles.greyText}>From:</Text>
                        <Block style={{ flexDirection: 'column', width: width * .7 }}>
                          <Text>{this.state.pickup == null ? "" : this.state.pickup.name}
                            < Text style={homeStyles.greyText}>{this.state.pickup != null ? " (" + this.state.pickup.distance.toFixed(1) + " m away)" : ""}</Text>

                          </Text>
                        </Block>
                        <Button
                          onlyIcon icon="close"
                          iconFamily="antdesign"
                          iconSize={20}
                          color="transparent"
                          iconColor="#000"
                          style={homeStyles.closeButton}
                          onPress={() => this.setState({ pickup: null })}>
                        </Button>
                      </Pressable>

                      <Pressable
                        style={!this.state.isPickup ? homeStyles.input : [homeStyles.input, { backgroundColor: "white", borderColor: 'grey' }]}
                        onPress={() => {
                          if (!this.state.isPickup) {
                            this.setState({ mapOpen: !this.state.mapOpen });
                          } else {
                            this.setState({ isPickup: false })
                          }
                        }}
                      >
                        <Text style={homeStyles.greyText}>To: </Text>
                        <Text style={{ flexDirection: 'column', width: width * .7 }} >{this.state.dropoff == null ? "" : this.state.dropoff.name} <Text style={homeStyles.greyText}>{this.state.dropoff != null ? "(" + this.state.dropoff.distance.toFixed(1) + " m away)" : ""}</Text></Text>
                        <Button
                          onlyIcon icon="close"
                          iconFamily="antdesign"
                          iconSize={20}
                          color="transparent"
                          iconColor="#000"
                          style={homeStyles.closeButton}
                          onPress={() => this.setState({ dropoff: null })}>
                        </Button>
                      </Pressable>
                      {this.state.mapOpen ?
                        <Block style={{ flexDirection: 'row' }}>
                          <Pressable style={[homeStyles.closeMapButton, { flex: 1 }]}
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
                      <Pressable style={homeStyles.button}
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