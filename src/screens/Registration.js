import React from 'react';
import { StyleSheet, Text, SafeAreaView, Dimensions, TextInput, Pressable, ScrollView ,  View} from 'react-native';
import {theme, Block, Input, NavBar, Icon, Button } from 'galio-framework';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('screen');

export default class Registration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name : "",
      favs: [],
      error: false,
      validate: false,
 
    };
  }
  
  componentDidMount(){
    this.getFavs();
  }
   
  async runGeocode(latlong){
    if (latlong != null){
      let geocode = await Location.reverseGeocodeAsync(latlong);  
      // console.log("geocode is: ", geocode[0]);
      return geocode[0]["name"] + " " + geocode[0]["street"] + ", " + geocode[0]["subregion"];
    }
    else {return "Address not saved"}
    
  }

  
  async getFavs(){
    var favs = [];
    var i = 0;
    
    while (i < 4){
      var fav_num = "fav" + i;
      var latlong = await this.retrieved(fav_num);
      var fav = await this.runGeocode(latlong);
      favs.push({name: fav, key: i, latlong: latlong});
      i++;
    }
    this.setState({favs: favs});
    // this.setState({fav0: fav0, fav1: fav1, fav2: fav2, fav3: fav3});
  }

  async setInfo(){ 
    console.log( JSON.stringify({ 
      userid: 1,
      0: this.state.favs[0].latlong,
      1: this.state.favs[1].latlong,
      2: this.state.favs[2].latlong,
      3: this.state.favs[3].latlong,
  }), );
    await this.getFavs();
    var userid = 1;
    var latlong0 = this.state.favs[0].latlong == null? "null" : JSON.stringify(this.state.favs[0].latlong.latitude) + ',' + JSON.stringify(this.state.favs[0].latlong.longitude)
    var latlong1 = this.state.favs[1].latlong == null? "null" : JSON.stringify(this.state.favs[1].latlong.latitude) + ',' + JSON.stringify(this.state.favs[1].latlong.longitude)
    var latlong2 = this.state.favs[2].latlong == null? "null" : JSON.stringify(this.state.favs[2].latlong.latitude) + ',' + JSON.stringify(this.state.favs[2].latlong.longitude)
    var latlong3 = this.state.favs[3].latlong == null? "null" : JSON.stringify(this.state.favs[3].latlong.latitude) + ',' + JSON.stringify(this.state.favs[3].latlong.longitude)

    var req_string = "https://missit-ridesapi-backend.ue.r.appspot.com/new_user" + "?userid=" + userid + 
      "&0=" + latlong0 + "&1=" + latlong1 + "&2=" + latlong2 + "&3=" + latlong3
    console.log(req_string)

    fetch(req_string, { 
      
      // Adding method type 
      method: "POST", 
        
      // Adding body or contents to send 
      // body: JSON.stringify({ 
      //     userid: 1,
      //     0: this.state.favs[0].latlong == null? null : JSON.stringify(this.state.favs[0].latlong.latitude) + ',' + JSON.stringify(this.state.favs[0].latlong.longitude),
      //     1: this.state.favs[1].latlong == null? null : JSON.stringify(this.state.favs[1].latlong.latitude) + ',' + JSON.stringify(this.state.favs[1].latlong.longitude),
      //     2: this.state.favs[2].latlong == null? null : JSON.stringify(this.state.favs[2].latlong.latitude) + ',' + JSON.stringify(this.state.favs[2].latlong.longitude),
      //     3: this.state.favs[3].latlong == null? null : JSON.stringify(this.state.favs[3].latlong.latitude) + ',' + JSON.stringify(this.state.favs[3].latlong.longitude),
      // }), 
        
      // Adding headers to the request 
      headers: { 
          "Content-type": "application/json; charset=UTF-8"
      } 
  }) 
  // Converting to JSON 
  .then(response => response.json()) 
  
  // Displaying results to console 
  .then(json => console.log(json)); 
  
    try {
      await AsyncStorage.setItem('username', this.state.username)
      await AsyncStorage.setItem('password', this.state.password)
      this.props.navigation.navigate('Home', {'pickup': null, 'dropoff': null})
    } catch(e){}
  }
  
  async retrieved(elem){
    try {
      const jsonValue = await AsyncStorage.getItem(elem)
      // console.log(JSON.stringify(jsonValue))
      // console.log(elem, ",", jsonValue)

      return JSON.parse(jsonValue);
    } catch(e) {
      // error reading value
    }
  }
  handleUsername = (text) => { this.setState({ username: text })}
  handlePassword = (text) => { this.setState({ password: text })}
  handleSecondPassword = (text) => { 
    console.info(text); 
    this.setState({validate: true});
    text != this.state.password ? this.setState({ error: true }) : this.setState({ error: false })}


  render(){
    
    return (
    
    <View style = {styles.container}>
      <NavBar title="Register"
       style = {{marginTop: 40, width: width}}/>
      <ScrollView style = {styles.scrollContainer}>
        <Block style = {styles.container}>
          <Text style = {styles.title}>Enter your data to set up your account</Text>
          
          <TextInput style = {styles.input} placeholder="Username" placeholderTextColor = "grey" onChangeText = {this.handleUsername}/>
          <TextInput secureTextEntry={true} style = {[styles.input, {marginBottom: 0} ]} placeholder="Password" placeholderTextColor = "grey" onChangeText = {this.handlePassword}/>
          <Text style = {[styles.error, this.state.error ? {color: "red"} : {color: "transparent"}]}>Error: Passwords don't match</Text>
          <TextInput secureTextEntry={true} style = {styles.input} placeholder="Re-Enter Password" placeholderTextColor = "grey" onChangeText = {this.handleSecondPassword}/>
        </Block>
        
        <Block style = {styles.container}>
  
          <Text style = {styles.title} >Add your Favorites {"\n"} (You can update them later)</Text>
          {this.state.favs.length == 0 ? <Block style = {[styles.container, {margin: 100}]}><Text>Loading...</Text></Block>:
          this.state.favs.map((fav) => (
             <Pressable 
             key = {fav.key}
             style = {styles.buttonContainer}
             onPress={() => this.props.navigation.navigate("UpdateFav",  {num: fav.key, previous : fav.name, onGoBack: () => this.getFavs(),})}>
             <Text style = {{color: "white"}}>{fav.name}</Text>
           </Pressable>
          ))}
        </Block>
          
      </ScrollView >
      {/* <Button onPress = {this.sendData()}>Submit</Button> */}
          {(this.state.validate && !this.state.error) ?
          <Pressable style = {[styles.button]} onPress = {() => this.setInfo()}><Text style = {{color: "white"}}>Create Account</Text></Pressable>
           : <Block style = {[styles.button, {backgroundColor: "transparent"}]}><Text style = {{color: "transparent"}}>Create Account</Text></Block>}
    </View>
  )};
}

const styles = StyleSheet.create({
  container: {
    // marginTop: statusbar,
    width: width,    
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // flexhrink: 0
    
  },
  scrollContainer: {
    // marginTop: statusbar,
    width: width,    
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    // flexhrink: 0
    
  },
  input: {
    alignItems: "center",
    backgroundColor: theme.COLORS.WHITE,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    padding: 10,
    borderColor: theme.COLORS.PRIMARY,
    width: width * .9,
  },
  button: {
    alignItems: 'center',
    // justifyContent: 'flex-end',
    width: width * .9,
    borderRadius: 5,
    padding: 10,
    margin:5,

    backgroundColor: theme.COLORS.DARK_PRIMARY
  },
  buttonContainer:{
    flexDirection: 'row',
    // borderColor: theme.COLORS.BLACK,
    backgroundColor: theme.COLORS.PRIMARY,
    width: width * .9,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 18,
    justifyContent: 'center',
    margin: 5,
    textAlign: 'center',
  },
  error: {
    margin: 0,
    // alignSelf: 'flex-start',
  }
});