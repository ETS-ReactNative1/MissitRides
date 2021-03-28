import React from 'react';
import { StyleSheet, ScrollView, Dimensions, TextInput, Pressable, LogBox,  } from 'react-native';
import {theme, Block, Input, Text, NavBar, Icon, Button } from 'galio-framework';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('screen');

export default class Registration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name : "",
 
    };
  }
  
  componentDidMount(){
    this.getFavs();
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
  
  async runGeocode(latlong){
    if (latlong != null){
      let geocode = await Location.reverseGeocodeAsync(latlong);  
      console.log("geocode is: ", geocode[0]);
      return geocode[0]["name"] + " " + geocode[0]["street"] + ", " + geocode[0]["city"];
    }
    else {return "Address not saved"}
    
  }

  
  async getFavs(){
    // var i = 0;
    let latlong0 = await this.retrieved('fav0');
    var latlong1 = await this.retrieved('fav1');
    var latlong2 = await this.retrieved('fav2');
    var latlong3 = await this.retrieved('fav3');
    console.log(typeof(latlong0));
    var fav0 = await this.runGeocode(latlong0);
    var fav1 = await this.runGeocode(latlong1);
    var fav2 = await this.runGeocode(latlong2);
    var fav3 = await this.runGeocode(latlong3);
    this.setState({fav0: fav0,fav1: fav1,fav2: fav2,fav3: fav3});
    // this.setState({fav0: fav0, fav1: fav1, fav2: fav2, fav3: fav3});
  }

  async setInfo(){ 
    try {
      await AsyncStorage.setItem('username', this.state.username)
      await AsyncStorage.setItem('password', this.state.password)
      this.props.navigation.navigate('Home', {'pickup': "", 'dropoff': ""})
    } catch(e){}
  }
  
  async retrieved(elem){
    try {
      const jsonValue = await AsyncStorage.getItem(elem)
      // console.log(JSON.stringify(jsonValue))
      console.log(elem, ",", jsonValue)

      return JSON.parse(jsonValue);
    } catch(e) {
      // error reading value
    }
  }
  handleUsername = (text) => { this.setState({ username: text })}
  handlePassword = (text) => { this.setState({ password: text })}

  render(){
    
    return (
    
    <Block style = {styles.container}>
      <NavBar title="Register"
       style = {{marginTop: 40, width: width}}
         left={(
            <Button
              color="transparent"
              style={{paddingTop: 3, position: 'absolute', width: width/3}}
              onPress={() => this.props.navigation.navigate("Test")}
            >
              <Icon name="arrow-left" family="font-awesome" />
            </Button>
          )}
          right={(
            <Button
              color="transparent"
              style={{paddingTop: 3, position: 'absolute', width: width/3}}
              onPress={() => this.props.navigation.navigate("Home",  {pickup: "", dropoff: ""})}
            >
              <Icon name="home" family="font-awesome" />
            </Button>
          )}
      />
      <Block style = {styles.container}>

      <Text>Enter your data to set up your account</Text>
      
      <Input style = {styles.input} placeholder="Username" placeholderTextColor = "grey" onChangeText = {this.handleUsername}/>
      <Input style = {styles.input} placeholder="Password" placeholderTextColor = "grey"/>
      <Input style = {styles.input} placeholder="Re-Enter Password" placeholderTextColor = "grey" onChangeText = {this.handlePassword}/>


      <Text>Add your Favorites (You can update them later)</Text>
      <Button size = "large" onPress={() => this.props.navigation.navigate("UpdateFav",  {num: 0, previous : this.state.fav0, onGoBack: () => this.getFavs(),})}>{this.state.fav0}</Button>
      <Button size = "large" onPress={() => this.props.navigation.navigate("UpdateFav",  {num: 1,previous:this.state.fav1, onGoBack: () => this.getFavs(),})}>{this.state.fav1}</Button>
      <Button size = "large" onPress={() => this.props.navigation.navigate("UpdateFav",  {num: 2,previous:this.state.fav2, onGoBack: () => this.getFavs(),})}>{this.state.fav2}</Button>
      <Button size = "large" onPress={() => this.props.navigation.navigate("UpdateFav",  {num: 3,previous:this.state.fav3, onGoBack: () => this.getFavs(),})}>{this.state.fav3}</Button>


      {/* <Button onPress = {this.sendData()}>Submit</Button> */}
      {/* {(this.state.username != null && this.state.password != null) ?
        <Pressable style = {styles.button} onPress = {() => this.setInfo()}><Text>Create Account</Text></Pressable>
        : <Block/>} */}
        <Pressable style = {styles.button} onPress = {() => this.setInfo()}><Text>Create Account</Text></Pressable>
      
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
  },
  input: {
    alignItems: "center",
    backgroundColor: theme.COLORS.WHITE,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    padding: 5,
    borderColor: theme.COLORS.PRIMARY,
    width: width * .9,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * .9,
    borderRadius: 5,
    padding: 5,

    backgroundColor: theme.COLORS.SUCCESS
  }
});