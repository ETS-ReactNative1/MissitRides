import {StyleSheet, Dimensions} from 'react-native'
import {theme} from 'galio-framework';

const { width } = Dimensions.get('screen');
const {height} = Dimensions.get('window').height;

export const rideStyles = StyleSheet.create({
  container: {
      width: width,    
      flex: 1,
      backgroundColor: theme.COLORS.WHITE,
      justifyContent: 'center',
      alignItems: 'center',
  },
  confirm: {
    // height: dims["height"] / 2,
    width:  width *.8,
    position: 'absolute',
    backgroundColor: theme.COLORS.WHITE,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderColor: 'black',
    borderWidth: 5,
  },
  greyText: {
    position: "absolute",
    alignSelf: "flex-start",
    marginLeft: 5,
    marginTop: 5,
    color: "grey",
  },
  topContainer: {
    flex: .1,
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
    backgroundColor: theme.COLORS.WHITE,
    borderBottomWidth: 1,
    borderColor: theme.COLORS.BLACK,
    margin: 5,
  },
  card: {
    width: width,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    padding: 7,
    margin: 5,
  },

  toastContainer : {
    position: 'absolute',
    width:  width,
    height:  height,
    backgroundColor: theme.COLORS.TRANSPARENT,
    justifyContent: 'center',
    alignItems: 'center',

  },
  logo: {
    width: 25,
    height: 18,
    // backgroundColor: theme.COLORS.PRIMARY,
    resizeMode: 'contain',
    alignSelf: 'flex-start',
    margin: 10,
  },  
  button: {
    flex: 0.1,
    alignItems: 'center',
    justifyContent: 'center',
    width:  width * .9,
    // backgroundColor: "red"
  },
  return: {
    alignItems: "center",
    backgroundColor: theme.COLORS.PRIMARY,
    borderRadius: 15,
    marginBottom: 5,
    padding: 5,
    // borderColor: theme.COLORS.PRIMARY,
    width:  width * .8,
  },
  closeButton: { 
    width: 30, 
    height: 15, 
    flex: .1,
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
    width: width * .7,

  },
  smallInput: {
    alignItems: "center",
    backgroundColor: theme.COLORS.base,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 5,
    padding: 5,
    borderColor: 'black',
    // width: dims["width"] * .7,

  },
});