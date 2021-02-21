import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Login from './src/screens/Login'
import Splash from './src/screens/Splash'
import Home from './src/screens/Home'
import Test from './src/screens/Test'


export default class App extends React.Component {
    constructor(props) {
        super(props);
        // this.theme.main_color = '#3657FF';
        this.state = { screen: Home };
      }
    render(){
        return (
            <this.state.screen></this.state.screen>
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