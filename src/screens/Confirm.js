import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, ScrollView, Dimensions, Image, Pressable } from 'react-native';
import {theme, Block, Card, Text, NavBar, Button} from 'galio-framework';

const dims = Dimensions.get('window');
import Login from './Login'

export default class Ride extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pickup: this.props.route.params["pickup"],
      dropoff: this.props.route.params["dropoff"],
      ride: this.props.route.params["ride"]
      // pickup: "40 Ossipee Rd",
      // dropoff: "288 Boston Ave",
      // ride: "Uber XL"
    };
  }
  
  submitReq(){
  
  };
  
  render() {
    
    return (
    
    <Block style = {styles.container}>
     <NavBar 
        title="Confirm" 
        style = {{
                  marginTop: 30}}/>
      <Block style = {styles.container}>
        <Block style = {styles.confirm}>
          <Text h5>Confirm Your Ride</Text>
          <Pressable 
            style = {styles.input}
            onPress = {() => this.props.navigation.navigate('Home')}
            >
            <Text style = {styles.greyText}>From:</Text>
            <Text>{this.state.pickup}</Text>
          </Pressable>
          <Pressable 
            style = {styles.input}
            onPress = {() => this.props.navigation.navigate('Home')}
            >
            <Text style = {styles.greyText}>To:</Text>
            <Text>{this.state.dropoff}</Text>
          </Pressable>
          <Pressable 
            style = {styles.input}
            onPress = {() => this.props.navigation.navigate('Ride')}
            >
            <Text style = {styles.greyText}>Ride:</Text>
            <Text>{this.state.ride}</Text>
          </Pressable>
            <Block style = {{flexDirection: 'row'}}>
            <Button size="small" onPress = {() => this.props.navigation.goBack()}>Go Back</Button>
            <Button size="small" onPress = {() => this.submitReq()}>Confirm</Button>
            </Block>
        </Block>
      </Block>
    </Block>
    )
  }
}

const styles = StyleSheet.create({
  container: {
      width: dims["width"],    
      flex: 1,
      backgroundColor: theme.COLORS.BASE,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
    },
  confirm: {
    // height: dims["height"] / 2,
    width: dims["width"] *.8,
    backgroundColor: theme.COLORS.WHITE,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  input: {
    alignItems: "center",
    backgroundColor: theme.COLORS.base,
    borderColor: 'black',
    borderWidth: 3,
    borderRadius: 5,
    margin: 5,
    padding: 5,
    borderColor: theme.COLORS.PRIMARY,
    width: (dims["width"] *.8) *.9

  },
  greyText: {
    position: "absolute",
    alignSelf: "flex-start",
    marginLeft: 5,
    marginTop: 5,
    color: "grey",
  },
});