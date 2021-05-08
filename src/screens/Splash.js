import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View, Button, Dimensions, Image, Text } from 'react-native';
import {theme, withGalio, GalioProvider} from 'galio-framework';

const { width } = Dimensions.get('screen');
import Login from './Login'
import { SafeAreaView } from 'react-native-safe-area-context';


export default class Splash extends React.Component {
    render() {
      return (
        <SafeAreaView style={styles.container}>
          <Image
            style={styles.logo}
            source={require('../assets/icons/car.png')}
          />
          <Text>Please wait, locations updating...</Text>
        </SafeAreaView>
      );
    }
  }
  
 const styles = StyleSheet.create({
    container: {
        width: width,    
        flex: 1,
        backgroundColor: theme.COLORS.PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
      },
    viewStyles: {
        backgroundColor: '#5dacba'
    },
    textStyles: {
        color: 'white',
        fontSize: 40,
        fontWeight: 'bold'
    },
    tab: {
        // backgroundColor: theme.COLORS.TRANSPARENT,
        width: width * 0.50,
        borderRadius: 0,
        borderWidth: 0,
        height: 24,
        elevation: 0,
      },
    divider: {
        borderRightWidth: 0.3,
        // borderRightColor: theme.COLORS.MUTED,
      },
    logo: {
        width: '40%',
        height: '40%',
        resizeMode: 'contain'
      },
});