import React from 'react';
import { StatusBar, StyleSheet, Text, SafeAreaView, Dimensions, TextInput, Pressable, ScrollView ,  View} from 'react-native';
import {theme, Block, Input, NavBar, Icon, Button } from 'galio-framework';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('screen');

export default class UpdateFavs extends React.Component {
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
      return geocode[0]["name"] + " " + geocode[0]["street"] + ", " + geocode[0]["subregion"];
    }
    else {return "Address not saved"}
    
  }

  
  async getFavs(){
    var favs = [];
    var i = 0;
    
    while (i < 4){
      var fav_num = "fav" + i;
      var fav = await this.retrieved(fav_num);
      
      
      fav == null ? fav = {key: i} : fav.key = i; 
      favs.push(fav);
      i++;
    }
    this.setState({favs: favs});
    console.log("favorites:", favs)
  }
  
  async retrieved(elem){
    try {
      const jsonValue = await AsyncStorage.getItem(elem)

      return JSON.parse(jsonValue);
    } catch(e) {
      // error reading value
    }
    
  }
  
  return() {
    console.log()
    this.props.route.params.onGoBack();
    this.props.navigation.goBack();


  }
  handleUsername = (text) => { this.setState({ username: text })}
  handlePassword = (text) => { this.setState({ password: text })}
  handleSecondPassword = (text) => { 
    console.info(text); 
    this.setState({validate: true});
    text != this.state.password ? this.setState({ error: true }) : this.setState({ error: false })}


  render(){
    
    return (       
    <SafeAreaView style = {styles.container}>
       <StatusBar animated={true} backgroundColor={theme.COLORS.PRIMARY} hidden={false} />
      <NavBar title="Update Favorites" style = {{width: width, alignSelf: 'flex-start'}}/>
      <Block style = {[styles.container, {justifyContent: 'center'}]}>
      <Text style = {styles.title} >Choose a favorite to update </Text>
        {this.state.favs.length == 0 ? <Text>Loading...</Text>:
        this.state.favs.map((fav) => (
            fav.name == null?
            <Pressable 
            key = {fav.key}
            style = {styles.buttonContainer}
            onPress={() => this.props.navigation.navigate("UpdateFav",  {num: fav.key, previous : "No address saved", onGoBack: () => this.getFavs(),})}>
            <Text style = {{fontWeight: "bold", alignSelf: "flex-start"}}>No Address Saved</Text>
        </Pressable>: 
           <Pressable 
             key = {fav.key}
             style = {styles.buttonContainer}
             onPress={() => this.props.navigation.navigate("UpdateFav",  {num: fav.key, previous : fav.name, onGoBack: () => this.getFavs(),})}>
             <Text style = {{fontWeight: "bold", alignSelf: "flex-start"}}>{fav.name}</Text>
         </Pressable>
        ))}
        
        <Pressable
          onPress={() => this.return()}>
          <Text>Go Back</Text>
        </Pressable>
        
        </Block>
    </SafeAreaView>
  )}
}
          
    

const styles = StyleSheet.create({
  container: {
    // marginTop: statusbar,
    width: width,    
    flex: 1,
    justifyContent: 'space-between',
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
  input:{
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexDirection: "row",
    backgroundColor: theme.COLORS.GREY,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 1,
    marginBottom: 10,
    padding: 5,
    paddingTop: 7,
    paddingBottom: 7,
  
    borderColor: theme.COLORS.BLACK,
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 7,
    margin: 5,
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