import {StyleSheet, Dimensions} from 'react-native';
import {theme} from 'galio-framework';

const { width } = Dimensions.get('screen');
const {height} = Dimensions.get('window').height;


export const allStyles = StyleSheet.create({
  container: {
    width: width,    
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  confirmButton: {
    alignItems: 'center',
    width: width,
    padding: 10,
    marginTop: 10,
    backgroundColor: theme.COLORS.DARK_PRIMARY
  },
});