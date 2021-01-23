import * as React from 'react';
import { Text, View, StyleSheet, Image } from 'react-native';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import {createAppContainer} from 'react-navigation';
import TransactionScreen from './screens/TransactionScreen';
import SearchScreen from './screens/SearchScreen';

export default function App() {
  return (
    
      <AppContainer/>
    
  );
}
const TabNavigator = createBottomTabNavigator({
  Transaction : {screen:TransactionScreen},
  Search : {screen:SearchScreen}
},
{
  defaultNavigationOptions : ({navigation})=>({
    tabBarIcon : ()=>{
      const routename = navigation.state.routeName
      if(routename === "Transaction"){
        return(
          <Image style = {{
            width : 40,
            height : 40
          }} source = {require("./assets/book.png")}></Image>
        )
      }
      else if(routename === "Search"){
        return(
          <Image style = {{
            width : 40,
            height : 40
          }} source = {require("./assets/searchingbook.png")}></Image>
        )
      }
    }
  })
  
}
)
const AppContainer = createAppContainer(TabNavigator)


