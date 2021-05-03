import {StyleSheet, Dimensions} from 'react-native';
import {theme} from 'galio-framework';
const { width } = Dimensions.get('screen');
const {height} = Dimensions.get('window').height;
export const homeStyles = StyleSheet.create({
  container: {
    // marginTop: statusbar,
    width: width,    
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white'
  },
  topOverlayClosed: {
    // position: 'absolute',
    // marginTop: 40, //Dimensions.get('screen').height - Dimensions.get('window').height,
    flex: 4,
    flexDirection: 'column',
    // width: Dimensions.get('screen').width,
    backgroundColor: theme.COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    width: width * .9,
    marginTop: 20
  },
  topOverlayOpen: {
    // position: 'absolute',
    marginTop: 40, //Dimensions.get('screen').height - Dimensions.get('window').height,
    flex: 4,
    flexDirection: 'column',
    // width: Dimensions.get('screen').width,
    // backgroundColor: theme.COLORS.BASE,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: width * .9,
  },
  bottomOverlay: {
    flex: 1,
    width: Dimensions.get('screen').width,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.COLORS.PRIMARY,
  },
  button: {
    alignItems: 'center',
    // justifyContent: 'flex-end',
    // width: width * .9,
    // borderRadius: 5,
    width: width,
    padding: 10,
    marginTop: 10,

    backgroundColor: theme.COLORS.DARK_PRIMARY
  },
  mapContainer: {
    height: Dimensions.get('screen').height,
    flex: 2,
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'space-around', 
    borderColor: theme.COLORS.BLACK,
    width: width,
    // backgroundColor: "red"

  },
  input: {
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexDirection: "row",
    backgroundColor: theme.COLORS.GREY,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 1,
    marginBottom: 10,
    padding: 5,
    paddingTop: 7,
    paddingBottom: 7,

    borderColor: theme.COLORS.PRIMARY,
    width: width * .9,
  },
  
  closeMapButton: {
    alignItems: "center",
    backgroundColor: theme.COLORS.PRIMARY,
    borderRadius: 5,
    flex: 2,
    padding: 1,
    margin: 5,
    width: width * .8,
  },

  greyText: {
    // position: "absolute",
    // alignSelf: "flex-start",
    // marginLeft: 5,
    // marginTop: 5,
    color: "grey",
  },
  closeButton: { 
    width: 15, 
    height: 15, 
    // position:'absolute',
    alignSelf: "flex-end",
    margin: 0,
    // marginHorizontal: 30,
  },
  wrapperCustom: {
    borderRadius: 8,
    padding: 6,
  },
  buttonContainer:{
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 7,
    margin: 5,
  },
  tabBar: {
    flexDirection: 'row',
    // paddingTop: Constants.statusBarHeight,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
});