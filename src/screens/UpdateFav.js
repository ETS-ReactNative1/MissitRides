import React from 'react';
import { StyleSheet, ScrollView, Dimensions, TextInput, Pressable, LogBox,  } from 'react-native';
import {theme, Block, Input, Text, NavBar, Icon, Button } from 'galio-framework';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

LogBox.ignoreLogs([
 'Non-serializable values were found in the navigation state',
]);
const { width } = Dimensions.get('screen');

export default class UpdateFav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name : "",
      address: "",
      city: "",
      state: "",
      zip: "",
      fav: {},
      num: this.props.route.params["num"],
      prev: this.props.route.params["previous"],
      // fav1geocode: {}
    };
  }
  sendData = () => {
    fetch("https://missit-ridesapi-backend.ue.r.appspot.com/new_user", { 
      
      // Adding method type 
      method: "POST", 
        
      // Adding body or contents to send 
      body: JSON.stringify({ 
          userid: "Nikhil Bhatia-Poop",
          fav1: "example coords",
      }), 
        
      // Adding headers to the request 
      headers: { 
          "Content-type": "application/json; charset=UTF-8"
      } 
  }) 
    
    // Converting to JSON 
    // .then(response => response.json()) 
      
    // // Displaying results to console 
    // .then(json => console.log(json)); 
  }
  
  async runGeocode(address){
    
    let geocodeObj = await Location.geocodeAsync(address);  
    console.log("geocode is: ", geocodeObj[0]);
    let latlong = {latitude: geocodeObj[0]["latitude"], longitude: geocodeObj[0]["longitude"]};
    console.log(latlong);
    try {
      let fav_num = "fav" + this.state.num;
      const jsonValue = JSON.stringify(latlong)
      await AsyncStorage.setItem(fav_num, jsonValue);
      this.props.route.params.onGoBack();
      this.props.navigation.goBack();
      return latlong;
    } catch (e) {
      // saving error
    }
  }
  
  async setFav(address) {
    let fav = await this.runGeocode(address);
    console.log(fav);
    this.setState({fav1: fav})
  }
  
  handleName = (text) => { this.setState({ name: text })}
  handleAddress = (text) => { this.setState({ address: text })}
  handleCity = (text) => { this.setState({ city: text })}
  handleState = (text) => { this.setState({ state: text })}
  handleZip = (text) => { this.setState({ zip: text })}

  async retrieved(){
    try {
      const jsonValue = await AsyncStorage.getItem('fav1')
      console.log(JSON.stringify(jsonValue))
      return jsonValue != null ? JSON.stringify(jsonValue) : "Blank";
    } catch(e) {
      // error reading value
    }
  }
  render(){
    
    return (
    
    <Block style = {styles.container}>
      <NavBar title="Update Favorite"
       style = {{marginTop: 40, width: width}}
         left={(
            <Button
              color="transparent"
              style={{paddingTop: 3,}}
              onPress={() => this.props.navigation.goBack()}
            >
              <Icon name="arrow-left" family="font-awesome" />
            </Button>
          )}
      />
      <Block style = {styles.container}>
      <Text> Your previous favorite: {this.state.prev} </Text>
      <Text>Enter new address information</Text>
      {/* <Text>Name</Text>
      <Input onChangeText = {this.handleName} placeholder = "Enter your name"/> */}
      <Text>Address</Text>

      <Input onChangeText = {this.handleAddress} placeholder = "address"/>
      <Text>City</Text>

      <Input onChangeText = {this.handleCity} placeholder = "city"/>
      <Text>State</Text>
      <Input onChangeText = {this.handleState} placeholder = "state"/>
      <Text>Zip Code</Text>
      <Input onChangeText = {this.handleZip} placeholder = "zip code"/>


      {/* <Button onPress = {this.sendData()}>Submit</Button> */}
      {(this.state.address != "" && this.state.city != "" && this.state.state != "" && this.state.zip != "") ?
        <Pressable onPress = {() => this.setFav(this.state.address + " " + this.state.city + " " + this.state.state + " " + this.state.zip)}><Text>Submit</Text></Pressable>
        : <Block/>}
      </Block>
    </Block>
    )};
}

const styles = StyleSheet.create({
  container: {
    // marginTop: statusbar,
    width: width,    
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});