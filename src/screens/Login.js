import React from 'react';
import { StyleSheet, Dimensions, Image } from 'react-native';
// import { Button, Block, Text, Input, theme } from 'galio-framework';
import {theme, Block, Button, Input, Text} from 'galio-framework';
// import { Icon, Product } from 'C:/Users/hanke/OneDrive/Documents/Tufts/Senior Fall/ML/missit-rides/MissitRides/src/components';


const { width } = Dimensions.get('screen');
// import products from '../constants/products';

export default class Login extends React.Component {
  render() {
    return (
      <Block style={styles.container}>
        <Block style = {styles.image_container}>
          <Text h2 color = {theme.COLORS.THEME} style = {{marginBottom: 20}}>MissIt Rides</Text>
          <Image
            style={styles.logo}
            source={require('../assets/icons/car.png')}
          />
        </Block>
        <Block style = {styles.input_container}></Block>
        <Block style = {styles.input_container}>
          <Input placeholder="Username" color={theme.COLORS.BASE} style={{ borderColor: theme.COLORS.THEME }} placeholderTextColor={theme.COLORS.THEME} />
          <Input placeholder="Password" password = {true} color={theme.COLORS.BASE} style={{ borderColor: theme.COLORS.THEME }} placeholderTextColor={theme.COLORS.THEME} />
          <Button color= {theme.COLORS.PRIMARY} size = "large" uppercase = {true} >login</Button>

        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: width,    
    flex: 1,
    backgroundColor: theme.COLORS.BASE,
    alignItems: 'center',
  },
  image_container: {
      flexDirection: 'column',
      flex: 2,
      justifyContent: 'center',
      alignItems: 'center',
      },
  input_container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: width * .9,

  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain'
  },    
      
      
//   search: {
//     height: 48,
//     width: width - 32,
//     marginHorizontal: 16,
//     borderWidth: 1,
//     borderRadius: 3,
//   },
//   header: {
//     backgroundColor: theme.COLORS.WHITE,
//     shadowColor: theme.COLORS.BLACK,
//     shadowOffset: {
//       width: 0,
//       height: 2
//     },
//     shadowRadius: 8,
//     shadowOpacity: 0.2,
//     elevation: 4,
//     zIndex: 2,
//   },
//   tabs: {
//     marginBottom: 24,
//     marginTop: 10,
//     elevation: 4,
//   },
//   tab: {
//     backgroundColor: theme.COLORS.TRANSPARENT,
//     width: width * 0.50,
//     borderRadius: 0,
//     borderWidth: 0,
//     height: 24,
//     elevation: 0,
//   },
//   tabTitle: {
//     lineHeight: 19,
//     fontWeight: '300'
//   },
//   divider: {
//     borderRightWidth: 0.3,
//     borderRightColor: theme.COLORS.MUTED,
//   },
//   products: {
//     width: width - theme.SIZES.BASE * 2,
//     paddingVertical: theme.SIZES.BASE * 2,
//   },
});
