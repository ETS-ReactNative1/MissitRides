import React from 'react';
import { StyleSheet, ScrollView, Dimensions, TextInput, Pressable, LogBox,  StatusBar} from 'react-native';
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
      country: "",
      fav: {},
      num: this.props.route.params["num"],
      prev: this.props.route.params["previous"],
      // fav1geocode: {}
    };
  }

  
  async runGeocode(address){
    
    let geocodeObj = await Location.geocodeAsync(address);
    let reverseGeocodeObj = await Location.reverseGeocodeAsync({latitude: geocodeObj[0]["latitude"], longitude: geocodeObj[0]["longitude"]})
    // console.log("geocode is: ", geocodeObj[0]);
    let latlong = {latitude: geocodeObj[0]["latitude"], longitude: geocodeObj[0]["longitude"], data: reverseGeocodeObj[0]};
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
  handleCountry = (text) => { this.setState({ country: text })}


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
      <StatusBar animated={true} backgroundColor={theme.COLORS.PRIMARY} hidden={false} />

      <NavBar title="Update Favorite"
       style = {{width: width}}
      />
      <ScrollView style = {styles.scroll}>
        <Block style = {styles.container}>
        <Block style = {styles.topContainer}>
          <Text> Your previous favorite:  </Text>
          <Text>{this.state.prev}</Text>
        </Block>
      
      <Block style = {styles.form}> 
        <Text style = {{fontSize: 18, margin: 5}}>Enter your new address location</Text>
        <Text>Address</Text>
  
        <Input style = {styles.input} onChangeText = {this.handleAddress} placeholder = "address"/>
        <Text>City</Text>
  
        <Input style = {styles.input} onChangeText = {this.handleCity} placeholder = "city"/>
        <Text>State/Region <Text style = {{color: 'grey'}}>(Optional) </Text></Text>
        <Input style = {styles.input} onChangeText = {this.handleState} placeholder = "state"/>
        <Text>Zip Code</Text>
        <Input style = {styles.input} onChangeText = {this.handleZip} placeholder = "zip code"/>
        <Text>Country</Text>
        <Input style = {styles.input} onChangeText = {this.handleCountry} placeholder = "country"/>
      </Block>

      {/* <Button onPress = {this.sendData()}>Submit</Button> */}
      {(this.state.address != "" && this.state.city != "" && this.state.zip != "" && this.state.country != "") ?
        <Pressable onPress = {() => this.setFav(this.state.address + " " + this.state.city + " " + this.state.zip + " " + this.state.country)}><Text>Submit</Text></Pressable>
        : <Block/>}
        </Block>
      </ScrollView>
    </Block>
    )};
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "white",
    width: width,    
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topContainer: {
    // alignSelf: 'flex-start',
    flex: .1,
    alignItems: 'center',
    justifyContent: 'center',
    // flexDirection: 'row',
    backgroundColor: theme.COLORS.BASE,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: theme.COLORS.BLACK,
    margin: 5,
    width: width,
    padding: 7,
  },
  form: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * .9,
  },
  scroll: {
    width: width,    
    flex: 1,
  },
  input: {
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexDirection: "row",
    backgroundColor: theme.COLORS.WHITE,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 1,
    marginBottom: 10,
    padding: 5,
    paddingTop: 7,
    paddingBottom: 7,

    borderColor: theme.COLORS.BLACK,
    width: width * .9,
  }
});