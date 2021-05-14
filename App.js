import React from 'react';
import Login from './src/screens/Login'

import Home from './src/screens/Home'
import UpdateFav from './src/screens/UpdateFav'
import UpdateFavs from './src/screens/UpdateFavs'
import Ride from './src/screens/Ride'
import Registration from './src/screens/Registration'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


const Stack = createStackNavigator();

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pickup: null,
      dropoff: null
    };
  }

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="Registration" component={Registration} options={{ headerShown: false }} />
          <Stack.Screen name="UpdateFavs" component={UpdateFavs} options={{ headerShown: false }} />
          <Stack.Screen name="UpdateFav" component={UpdateFav} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
          <Stack.Screen name="Ride" component={Ride} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}