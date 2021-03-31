import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, ScrollView, Dimensions, Image, Pressable, LogBox } from 'react-native';
import {theme, Block, Card, Text, NavBar, Button} from 'galio-framework';
import * as Location from 'expo-location';

const dims = Dimensions.get('window');
import Login from './Login'


export default class Ride extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        pickupCoords: this.props.route.params["pickupCoords"],
        dropoffCoords: this.props.route.params["dropoffCoords"],
        pickupIndex: this.props.route.params["pickupIndex"],
        dropoffIndex: this.props.route.params["dropoffIndex"],
        finalTime: Date.now() / 1000 + 10,
        currentTime: Date.now() /1000,
        pickup: {
          "city": " ",
          "country": " ",
          "district": null,
          "isoCountryCode": " ",
          "name": " ",
          "postalCode": " ",
          "region": " ",
          "street": " ",
          "subregion": " ",
          "timezone": null,
        },
        dropoff: {
          "city": " ",
          "country": " ",
          "district": null,
          "isoCountryCode": " ",
          "name": " ",
          "postalCode": " ",
          "region": " ",
          "street": " ",
          "subregion": " ",
          "timezone": null,
        },
        // pickup: "40 Ossipee Rd, Somerville",
        // dropoff: "288 Boston Ave, Medford",
        ride: "",
        submit: false,
      };
    }
    
    async reverseGeocode(latlong){
      let geocodeObj = await Location.reverseGeocodeAsync(latlong);
      geocode = geocodeObj[0];
      return geocode;
    }
    
    bitCount (n) {
      n = n - ((n >> 1) & 0x55555555)
      n = (n & 0x33333333) + ((n >> 2) & 0x33333333)
      return ((n + (n >> 4) & 0xF0F0F0F) * 0x1010101) >> 24
    }
    
    async getEndpoints () {
      let pickupName  = await this.reverseGeocode(this.state.pickupCoords);
      let dropoffName = await this.reverseGeocode(this.state.dropoffCoords);    
  
      this.setState({pickup: pickupName, dropoff: dropoffName})
      console.log(this.state.pickup);

    };
    
    async setFinalTime() {
      console.log(this.state.pickup, this.state.dropoff, this.state.ride);
      fetch("https://missit-ridesapi-backend.ue.r.appspot.com/estimate", { 
      
          // Adding method type 
          method: "POST", 
            
          // Adding body or contents to send 
          body: JSON.stringify({ 
              data: this.state.dropoff 
          }), 
            
          // Adding headers to the request 
          headers: { 
              "Content-type": "application/json; charset=UTF-8"
          } 
      }) 
        
      // Converting to JSON 
      .then(response => response.json()) 
        
      // Displaying results to console 
      .then(json => console.log(json)); 
    }
  
  componentDidMount() {
      this.getEndpoints();
      this.setFinalTime();
      this.getRates();
      this.timer = setInterval(() => {
        this.setState({ currentTime: this.state.currentTime + 1});
        // console.log(this.state.currentTime, this.state.finalTime);

      }, 500);
    }
  
    componentWillUnMount() {
      clearInterval(this.timer);
    }

    
    onChosen(choice){
      this.setState({
        ride: choice,
      })
      
    }
    
    submitReq(){
      
    }
    
    timeLeft = () => {
      // this.setState({currentTime: currentTime + 1});
      return <Text>Time left: {this.state.finalTime - this.state.currentTime}</Text>;
    }
    render() {
      
      return (
        <Block style={styles.container}>
        {
          this.state.finalTime - this.state.currentTime > 0 ?
            <Block style = {[styles.container, {backgroundColor: theme.COLORS.PRIMARY}]}>
              <Image style={styles.logo} source={require('../assets/icons/car.png')}/>
              <Text style = {styles.smallerText}>Please wait</Text>
              <Text style = {styles.bigText}>{Math.floor(this.state.finalTime - this.state.currentTime)} Seconds.</Text>
              <Text style = {styles.smallerText}>We need to check the cost of your ride!</Text>
            
            </Block>:
            
          <Block style={styles.container}>
            <NavBar 
              title="Select Your Ride" 
              // title = {this.state.finalTime, this.state.currentTime}
              style = {{border: 1,
                        borderColor: 'black',
                        marginTop: 30}}/>
            <Block style = {styles.topContainer}>
              <Text >{this.state.pickup["name"], this.state.pickup["street"]}</Text>
              <Button 
                onlyIcon icon="right" 
                iconFamily="antdesign" 
                iconSize={12} 
                color="transparent" 
                iconColor="#000" 
                style={styles.closeButton}>
              </Button>
              <Text>{this.state.dropoff["name"], this.state.dropoff["street"]}</Text>
            </Block>
            <Pressable style = {[styles.card, this.state.ride === "Uber X" ? {borderWidth: 1, borderColor: theme.COLORS.PRIMARY} : null]}
                       onPress = {() => this.onChosen("Uber X")}>
              <Image
                style={styles.logo}
                source={require('../assets/icons/car.png')}s
              />
              <Block style = {styles.textBlock}>
                <Text>Uber X</Text>
                <Text>Price Pending</Text>
              </Block>
            </Pressable>
            <Pressable style = {[styles.card, this.state.ride === "Uber XL" ? {borderWidth: 1, borderColor: theme.COLORS.PRIMARY} : null]}
                       onPress = {() => this.onChosen("Uber XL")}>
              <Image
                style={styles.logo}
                source={require('../assets/icons/car.png')}
              />
              <Block style = {styles.textBlock}>
                <Text>Uber XL</Text>
                <Text>Price Pending</Text>
              </Block>
            </Pressable>
            <Pressable style = {[styles.card, this.state.ride === "Uber Black" ? {borderWidth: 1, borderColor: theme.COLORS.PRIMARY} : null]}
                       onPress = {() => this.onChosen("Uber Black")}>
              <Image
                style={styles.logo}
                source={require('../assets/icons/car.png')}
              />
              <Block style = {styles.textBlock}>
                <Text>Uber Black</Text>
                <Text>Price Pending</Text>
              </Block>
            </Pressable>
            <Pressable style = {[styles.card, this.state.ride === "Uber Blue" ? {borderWidth: 1, borderColor: theme.COLORS.PRIMARY} : null]}
                       onPress = {() => this.onChosen("Uber Blue")}>
              <Image
                style={styles.logo}
                source={require('../assets/icons/car.png')}
              />
              <Block style = {styles.textBlock}>
                <Text>Uber Blue</Text>
                <Text>Price Pending</Text>
              </Block>
            </Pressable>
            {this.state.ride === "" ?
                <Block style = {styles.button}></Block> :
                <Button
                  style = {styles.button}
                  // onPress={() => this.props.navigation.navigate('Confirm', {pickupCoords: this.state.pickupCoords, dropoffCoords: this.state.dropoffCoords, ride: this.state.ride})}
                  onPress = {() => this.setState({submit: true})}>
                  <Text h5> Continue</Text>
                </Button>
                }
                {this.state.submit ? 
                  <Pressable style = {styles.toastContainer}  onPress = {() => this.setState({submit: false})}>
                    <Block style = {styles.confirm}>
                      <Text h5>Confirm Your Ride</Text>
                      <Pressable 
                        style = {styles.input}
                        onPress = {() => this.props.navigation.navigate('Home')}
                        >
                        <Text style = {styles.greyText}>From:</Text>
                        <Text>{this.state.pickup["name"] + " " + this.state.pickup["street"] + ", " + this.state.pickup["city"]}</Text>
                      </Pressable>
                      <Pressable 
                        style = {styles.input}
                        onPress = {() => this.props.navigation.navigate('Home')}
                        >
                        <Text style = {styles.greyText}>To:</Text>
                        <Text>{this.state.dropoff["name"] + " " + this.state.dropoff["street"] + ", " + this.state.dropoff["city"]}</Text>
                      </Pressable>
                      <Pressable 
                        style = {styles.input}
                        onPress = {() => this.props.navigation.navigate('Ride')}
                        >
                        <Text style = {styles.greyText}>Ride:</Text>
                        <Text >{this.state.ride}</Text>
                      </Pressable>
                      <Block style = {{flexDirection: 'row'}}>
                        <Button size="small" onPress = {() => this.setState({submit: false})}>Go Back</Button>
                        <Button size="small" onPress = {() => this.submitReq()}>Confirm</Button>
                      </Block>
                    </Block>
                </Pressable> : null}
          </Block>
        }
        </Block>
      );
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
      width:  dims["width"] *.8,
      position: 'absolute',
      backgroundColor: theme.COLORS.WHITE,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 10,
    },
    greyText: {
      position: "absolute",
      alignSelf: "flex-start",
      marginLeft: 5,
      marginTop: 5,
      color: "grey",
    },
  topContainer: {
    width:  dims["width"] * .9,
    flex: .3,
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
    backgroundColor: theme.COLORS.WHITE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.COLORS.BLACK,
    margin: 5,
  },
    bodyContainer: {
      width:  dims["width"],    
      flex: 8,
      backgroundColor: theme.COLORS.BASE,
      // alignItems: 'center',
      // justifyContent: 'center',
      flexDirection: 'column',
    },
    card: {
      width:  dims["width"] *.9,
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignContent: 'center',
      backgroundColor: '#d9d9d9',
      margin: 10,
      borderRadius: 3,
      borderWidth: 1,
      borderColor: theme.COLORS.TRANSPARENT,
    },
    toastContainer : {
      position: 'absolute',
      width:  dims["width"],
      height:  dims["height"],
      backgroundColor: theme.COLORS.TRANSPARENT,
      justifyContent: 'center',
      alignItems: 'center',
    },
    textBlock: {
      justifyContent: 'center',
      flexDirection: 'column',
      alignContent: 'center',
    },
    viewStyles: {
        backgroundColor: '#5dacba'
    },
    logo: {
      width: 150,
      height: 100,
      // backgroundColor: theme.COLORS.PRIMARY,
      resizeMode: 'contain',
      margin: 7,
    },  
    button: {
      flex: 0.5,
      alignItems: 'center',
      justifyContent: 'center',
      width:  dims["width"] * .9,
    },
    return: {
      alignItems: "center",
      backgroundColor: theme.COLORS.PRIMARY,
      borderRadius: 15,
      marginBottom: 5,
      padding: 5,
      // borderColor: theme.COLORS.PRIMARY,
      width:  dims["width"] * .8,
    },
    closeButton: { 
      width: 30, 
      height: 15, 
      // marginHorizontal: 30,
    },
    smallerText: {
      color: theme.COLORS.WHITE,
      fontSize: 18,

      
    },
    bigText: {
      color: theme.COLORS.WHITE,
      fontSize: 36,
    },
    input: {
      alignItems: "center",
      backgroundColor: theme.COLORS.base,
      borderColor: 'black',
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: 10,
      padding: 5,
      borderColor: 'black',
      width: dims["width"] * .7,
  
    },
});