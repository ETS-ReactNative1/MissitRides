import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Login from './src/screens/Login'
import Home from './src/screens/Home'
import Ride from './src/screens/Ride'
import Confirm from './src/screens/Confirm'

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


const Stack = createStackNavigator();

export default class App extends React.Component {
      
    render(){
        return (
          <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false }}/>
            <Stack.Screen name="Home" component={Home} options={{ headerShown: false }}/>
            <Stack.Screen name="Ride" component={Ride} options={{ headerShown: false }}/>
            <Stack.Screen name="Confirm" component={Confirm} options={{ headerShown: false }}/>

          </Stack.Navigator>
        </NavigationContainer>
        );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 