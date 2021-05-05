import React from 'react';
import { StyleSheet, ScrollView, Dimensions, Image, Pressable, StatusBar } from 'react-native';
import {theme, Block, Card, Text, NavBar, Button} from 'galio-framework';
import {rideStyles} from '../styles/rideStyle'
import {submitReq} from '../components/RideConfirm'
const dims = Dimensions.get('window');
import Login from './Login'
import { SafeAreaView } from 'react-native-safe-area-context';
import { allStyles } from '../styles/allStyle';
import MapView, { Marker, Overlay, Circle } from 'react-native-maps';
import { mapStyle } from '../components/mapStyle.js';
import {getDistanceInDegs} from '../components/Location'

export default class Ride extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        pickup: this.props.route.params["pickup"],
        dropoff: this.props.route.params["dropoff"],
        navtype: this.props.route.params["navtype"],
        company_name: "",
        company_phone: "",
        company_site: "",
        company_rating: 0,
        options: [],
        countdown: true,
        timer: 0,
        ride: "",
        submit: false,

      };
    }
        
    bitCount (n) {
      var x = 0;
      while (n > 0){
        n = Math.floor(n / 2);
        x = x + 1;
      }
      return x
    }
    
    
    async getRates() {
      var userid = 1;
      var navtype = this.state.navtype;
      var pickup = this.props.route.params["pickup"].key;
      var dropoff = this.props.route.params["dropoff"].key;
      var req_string = "https://missit-ridesapi-backend.ue.r.appspot.com/estimate" + "?bitstring=" + navtype + userid + pickup +dropoff
      console.log(req_string)
      fetch(req_string, { 

          // Adding method type 
          method: "POST", 
            
          // Adding body or contents to send 
          body: null,
            
          // Adding headers to the request 
          headers: { 
              "Content-type": "application/json; charset=UTF-8"
          } 
      }) 
        
      // Converting to JSON 
      .then(response => response.json()) 
        
      // Displaying results to console 
      .then(json => this.handleResponse(json))
      
      
    }
  
  handleResponse(data){
    for(var i =0; i < data["options"].length; i++){
      data["options"][i]["key"] = i;
    }
    console.log(data);
    this.setState({
      company_name: data["company_data"]["company_name"],
      company_phone: data["company_data"]["company_phone"],
      company_site:  data["company_data"]["company_site"],
      company_rating: data["company_data"]["score"],
      options: data["options"]
    }); 
  }
  
  componentDidMount() {
      console.log(this.state.pickup.key, this.state.dropoff.key)
      // this.setState({timer: this.bitCount(1) + this.bitCount(this.state.pickup.key) + this.bitCount(this.state.dropoff.key) + 2})
      this.getRates();
      this.interval = setInterval(
        () => this.setState((prevState)=> ({ timer: prevState.timer - 1 })),
        1000
      );
      console.log(this.state.pickup);
      console.log(this.state.dropoff);
    }
    
    componentDidUpdate(){
      if(this.state.timer <= 0){ 
        clearInterval(this.interval);
      }
    }
    
    componentWillUnmount(){
     clearInterval(this.interval);
    }
    
    onChosen(choice){
      this.setState({
        ride: choice,
      })
      
    }
    
    updateRegion = () => {
      const delta =  getDistanceInDegs(this.state.pickup.latlong.latitude,this.state.pickup.latlong.longitude, this.state.dropoff.latlong.latitude, this.state.dropoff.latlong.longitude );
      return {
        latitude: (this.state.pickup.latlong.latitude + this.state.dropoff.latlong.latitude) / 2,
        longitude: (this.state.pickup.latlong.longitude + this.state.dropoff.latlong.longitude) / 2,
        // latitude: 51.511894,
        // longitude: -0.205779,
        latitudeDelta: delta,
        longitudeDelta: delta,
      }
    }
   
    render() {
      
      return (
        <SafeAreaView style={rideStyles.container}>
        <StatusBar animated={true} backgroundColor={theme.COLORS.PRIMARY} hidden={false} />
        <NavBar 
              back = {true}
              title="Select Your Ride" />
        {
          // this.state.timeLeft > 0 ?
          //   <Block style = {[rideStyles.container, {backgroundColor: theme.COLORS.PRIMARY}]}>
          //     <Image style={rideStyles.logo} source={require('../assets/icons/car.png')}/>
          //     <Text style = {rideStyles.smallerText}>Please wait</Text>
          //     <Text style = {rideStyles.bigText}>{Math.floor(this.state.timeLeft)} Seconds.</Text>
          //     <Text style = {rideStyles.smallerText}>We need to check the cost of your ride!</Text>
          // </Block>:

         
          // : <Block/> :
            
          <Block style={allStyles.container}>
            
            <Block style = {rideStyles.topContainer}>
              <Block style = {{flex: 15, alignItems: 'center'}}>
                <Text style = {{textAlign: 'center'}} >{this.props.route.params["pickup"].address}</Text>
              </Block>
              <Block style = {{flex: 1, alignItems: 'center'}}>
                <Button 
                  onlyIcon icon="right" 
                  iconFamily="antdesign" 
                  iconSize={12} 
                  color="transparent" 
                  iconColor="#000" 
                  style={rideStyles.closeButton}>
                </Button>
              </Block>
              <Block style = {{flex: 15, alignItems: 'center'}}>
              <Text style = {{textAlign: 'center'}} >{this.props.route.params["dropoff"].address}</Text>
              </Block>
            </Block>
            <ScrollView style = {{flex: 10}}>

           {this.state.timer > 0 ?
               <Block style = {rideStyles.container}>
                 <Text>Please wait </Text>
                 <Text> {this.state.timer} </Text>
                 <Text> seconds </Text>

              </Block> :
            
              this.state.options.map((ride) => (
                
                <Pressable key = {ride["key"]} style = {[rideStyles.card, this.state.ride === ride["key"] ? {backgroundColor: '#d9d9d9'} : null]}
                           onPress = {() => this.onChosen(ride["key"])}>
                     <Block style = {{justifyContent: 'center', alignItems: 'center'}}>
                       <Image
                        style={rideStyles.logo}
                        source={ride["passengers"] > 4 ? require('../assets/icons/big.png') : ride["class"] == "Standard" ? require('../assets/icons/std.png') : require('../assets/icons/fancy.png')}
                      />
                    </Block>
                    <Block style = {{flex: 2}}>
                      <Text style = {{fontWeight: 'bold', fontSize: 18}}>{ride["name"]}</Text>
                      <Text>{ride["passengers"]} Passengers</Text>

                    </Block>
                    <Block style = {{flex: 1, justifyContent: "center", alignItems: "center"}}>
                      <Text style = {{fontSize: 18}}>£{ride["price"].toFixed(2)}</Text>
                    </Block>
                </Pressable> 
            ))}
            </ScrollView>
            <Block style = {{width: dims["width"] * .9, flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style = {{color: "grey"}}>{this.state.company_name}</Text>
            <Text style = {{color: "grey"}}>{this.state.company_phone}</Text>
            </Block>
            {this.state.ride === "" && !this.state.submit?
                <Block style = {rideStyles.button}><Text h5 style = {{color : "transparent"}}> Continue</Text></Block> :
                <Pressable
                  style = {[rideStyles.button, {backgroundColor: theme.COLORS.PRIMARY}]}
                  // onPress={() => this.props.navigation.navigate('Confirm', {pickupCoords: this.state.pickupCoords, dropoffCoords: this.state.dropoffCoords, ride: this.state.ride})}
                  onPress = {() => this.setState({submit: true})}>
                  <Text h5 style = {{color: theme.COLORS.WHITE}}> Continue</Text>
                </Pressable>
                }
                {this.state.submit ? 
                  
                  <Pressable style = {rideStyles.toastContainer}  onPress = {() => {console.log('go back'); this.setState({submit: false})}}>
                    <Block style = {rideStyles.confirm}>
                      <Block style = {rideStyles.mapContainer}>
                        <MapView
                            style={{ flex: 1 }}
                            region={this.updateRegion()}
                            customMapStyle={mapStyle}>
                            
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
                            
                        </MapView>
                      </Block>
                      <Text h5>Complete Ride Request</Text>
                      <Block style = {rideStyles.optionsTable}>
                      <Pressable 
                        style = {rideStyles.input}
                        onPress = {() => this.props.navigation.navigate('Home')}
                        >                        
                        <Text>From: {this.props.route.params["pickup"].address}</Text>
                      </Pressable>
                      <Pressable 
                        style = {rideStyles.input}
                        onPress = {() => this.props.navigation.navigate('Home')}
                        >
                        <Text>To: {this.props.route.params["dropoff"].address}</Text>
                      </Pressable>
                      <Block style = {{flexDirection: 'row', justifyContent: "space-around", alignItems: "center", width: dims["width"] * .7}}>
                        {/* <Pressable 
                          style = {[rideStyles.smallInput, {flex: 4, marginRight: 5,} ]}
                          onPress = {() => this.props.navigation.navigate('Ride')}
                          >
                          <Text >{this.state.options[this.state.ride]["name"]}</Text>
                        </Pressable> */}
                        <Pressable 
                          style = {rideStyles.input}
                          onPress = {() => this.props.navigation.navigate('Ride')}
                          >
                          <Text style = {{fontSize: 20}}>Price: £{this.state.options[this.state.ride]["price"].toFixed(2)}</Text>
                        </Pressable>
                        </Block>
                      </Block>
                      
                      <Block style = {{display: 'flex', flexDirection: 'row'}}>
                      
                        <Pressable 
                          style = {[rideStyles.button, {flex : 3, backgroundColor: theme.COLORS.PRIMARY, margin: 2, padding: 2}]}
                          onPress = {() => submitReq()}>
                          <Text style = {{color: 'white', fontSize: 18}}>Confirm</Text>
                        </Pressable>
                        <Pressable 
                          style = {[rideStyles.button, {flex : 1, backgroundColor: theme.COLORS.PRIMARY,margin: 2, padding: 2}]} 
                          onPress = {() => this.setState({submit: false})}>
                           <Button
                              size="small"
                              onlyIcon icon={"chevron-left"}
                              iconFamily="material"
                              iconSize={24}
                              iconColor={"white"}
                              color="transparent"
                              style={{ width: 20, height: 20 }}
            
                            // iconColor="#808080"
                            >
                         </Button>
                        </Pressable>
                      </Block>
                    </Block>
                </Pressable> : null}
          </Block>
        }
        </SafeAreaView>
      );
    }
  }