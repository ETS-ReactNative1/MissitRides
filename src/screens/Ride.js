import React from 'react';
import { StyleSheet, ScrollView, Dimensions, Image, Pressable, StatusBar } from 'react-native';
import {theme, Block, Card, Text, NavBar, Button} from 'galio-framework';
import {rideStyles} from '../styles/rideStyle'
import * as Location from 'expo-location';
import CountDown from 'react-native-countdown-component';
// import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'

const dims = Dimensions.get('window');
import Login from './Login'
import { SafeAreaView } from 'react-native-safe-area-context';


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
        timer: 10,
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
      this.setState({timer: this.bitCount(1) + this.bitCount(this.state.pickup.key) + this.bitCount(this.state.dropoff.key) + 2})
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

    submitReq(){
      var userid = 1;
      try{
      var req_string = "https://missit-ridesapi-backend.ue.r.appspot.com/confirm" + "?bitstring=" + userid
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
      .catch(error => {
        console.error(error)
      })
      
      .then(response => response.json()) 
        
      // Displaying results to console 
      .then(json => this.handleResponse(json))
  
      }catch(e) {
        logMyErrors(e);
      }
    }
   
    render() {
      
      return (
        <SafeAreaView style={rideStyles.container}>
        <StatusBar animated={true} backgroundColor={theme.COLORS.PRIMARY} hidden={false} />
        <NavBar 
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
            
          <Block style={rideStyles.container}>
            
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
            {this.state.ride === "" ?
                <Block style = {rideStyles.button}><Text h5 style = {{color : "transparent"}}> Continue</Text></Block> :
                <Pressable
                  style = {[rideStyles.button, {backgroundColor: theme.COLORS.PRIMARY}]}
                  // onPress={() => this.props.navigation.navigate('Confirm', {pickupCoords: this.state.pickupCoords, dropoffCoords: this.state.dropoffCoords, ride: this.state.ride})}
                  onPress = {() => this.setState({submit: true})}>
                  <Text h5 style = {{color: theme.COLORS.WHITE}}> Continue</Text>
                </Pressable>
                }
                {this.state.submit ? 
                  <Pressable style = {rideStyles.toastContainer}  onPress = {() => this.setState({submit: false})}>
                    <Block style = {rideStyles.confirm}>
                      <Text h5>Confirm Your Ride</Text>
                      <Pressable 
                        style = {rideStyles.input}
                        onPress = {() => this.props.navigation.navigate('Home')}
                        >
                        <Text style = {rideStyles.greyText}>From:</Text>
                        <Text>{this.props.route.params["pickup"].address}</Text>
                      </Pressable>
                      <Pressable 
                        style = {rideStyles.input}
                        onPress = {() => this.props.navigation.navigate('Home')}
                        >
                        <Text style = {rideStyles.greyText}>To:</Text>
                        <Text>{this.props.route.params["dropoff"].address}</Text>
                      </Pressable>
                      <Block style = {{flexDirection: 'row', justifyContent: "space-around", alignItems: "center", width: dims["width"] * .7}}>
                        <Pressable 
                          style = {[rideStyles.smallInput, {flex: 4, marginRight: 5,} ]}
                          onPress = {() => this.props.navigation.navigate('Ride')}
                          >
                          <Text >{this.state.options[this.state.ride]["name"]}</Text>
                        </Pressable>
                        <Pressable 
                          style = {[rideStyles.smallInput, {flex: 1}]}
                          onPress = {() => this.props.navigation.navigate('Ride')}
                          >
                          <Text >£{this.state.options[this.state.ride]["price"]}</Text>
                        </Pressable>
                      </Block>
                      
                      <Block style = {{flexDirection: 'row'}}>
                        <Button size="small" onPress = {() => this.setState({submit: false})}>Go Back</Button>
                        <Button size="small" onPress = {() => this.submitReq()}>Confirm</Button>
                      </Block>
                    </Block>
                </Pressable> : null}
          </Block>
        }
        </SafeAreaView>
      );
    }
  }