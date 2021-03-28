import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import {theme, Block, Input, Text, NavBar, Icon, Button } from 'galio-framework';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default class Test extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wordIn: "",
      wordOut: "",
    };
  }
  
  async setWord(text){
    
    try {
      await AsyncStorage.setItem('test', text)
      
    } catch (e) {
      // saving error
    }
  }
  handleWord = (text) => { this.setState({ wordIn: text })}

  
  async retrieve(){
    try {
      const jsonValue = await AsyncStorage.getItem('fav')
      console.log(JSON.stringify(jsonValue))
      let word = "Hello";
      console.log(word)

      jsonValue != null ? word = jsonValue : word = null;
      return word;
    } catch(e) {
      // error reading value
    }
  }
  
  async getWord() {
    let word = await this.retrieve();
    console.log(word);
    this.setState({wordOut: word})
  }
  
  componentDidMount() {
  }
  
    render() {
      return (
        <View style={styles.container}>
          <Input onChangeText = {this.handleWord} placeholder = "set word"></Input>
          <Button onPress = {() => this.setWord(this.state.wordIn)}>Set word</Button>
          <Text>Word set to: {this.state.wordIn}</Text>
          <Button onPress = {() => this.getWord()}>Get word</Button>
          <Text>{this.state.wordOut}</Text>
  
        </View>
          
      );
    }
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ecf0f1',
      // paddingTop: Constants.statusBarHeight,
    },
    paragraph: {
      margin: 24,
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#34495e',
    },
  });
  
