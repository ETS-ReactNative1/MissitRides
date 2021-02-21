import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

export default class Test extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasLocationPermissions: false,
      locationResult: null
    };
  }
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
  
    render() {
      return (
        <View style={styles.container}>
          {
            this.state.locationResult === null ?
            <Text>Finding your current location...</Text> :
            this.state.hasLocationPermissions === false ?
              <Text>Location permissions are not granted.</Text> :
              this.state.mapRegion === null ?
              <Text>Map region doesn't exist.</Text> :
              <Text>
              Latitude: {this.state.locationResult["coords"]["latitude"]} Longitude: {this.state.locationResult["coords"]["longitude"]}
            </Text>
          }
          
  
        </View>
          
      );
    }
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ecf0f1',
      // paddingTop: Constants.statusBarHeight,
    },
    paragraph: {
      margin: 24,
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#34495e',
    },
  });
  
