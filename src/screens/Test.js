import * as React from 'react';
import { Animated, View, TouchableOpacity, StyleSheet, ScrollView, Text } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import Constants from 'expo-constants';

import CountDown from 'react-native-countdown-component';


export default class TabViewExample extends React.Component {

  FirstRoute = () => (
    <ScrollView style={[styles.container, { backgroundColor: '#ff4081' }]}>
      <Text>{this.state.stuff == null? "null" : this.state.stuff}</Text>
    </ScrollView>
  );
  SecondRoute = () => (
    <View style={[styles.container, { backgroundColor: '#673ab7' }]} />
  );
  
  state = {
    index: 0,
    stuff : null,
    done: false,
    routes: [
      { key: 'first', title: 'First' },
      { key: 'second', title: 'Second' },
    ],
  };

  async seeStorage () {
    try{
      await AsyncStorage.getAllKeys((err, keys) => {
        this.setState({stuff: keys, done: true})
        });
    }
    catch(e){
    
    }
  }
  
  componentDidMount(){
    this.seeStorage;
  }
  _handleIndexChange = (index) => this.setState({ index });

  _renderTabBar = (props) => {
    const inputRange = props.navigationState.routes.map((x, i) => i);

    return (
      <View style={styles.tabBar}>
        {props.navigationState.routes.map((route, i) => {
          const opacity = props.position.interpolate({
            inputRange,
            outputRange: inputRange.map((inputIndex) =>
              inputIndex === i ? 1 : 0.5
            ),
          });

          return (
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => this.setState({ index: i })}>
              <Animated.Text style={{ opacity }}>{route.title}</Animated.Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  _renderScene = SceneMap({
    first: this.FirstRoute,
    second: this.SecondRoute,
  });

  render() {
    return (
      <CountDown
                    until={10}
                    onFinish={() => alert('finished')}
                    onPress={() => alert('hello')}
                    size={20}
                  />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: Constants.statusBarHeight,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
});
