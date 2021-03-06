import React from 'react';
import {Text, View, TouchableOpacity, StyleSheet, TextInput, Image, KeyboardAvoidingView, Alert, ToastAndroid, FlatList} from 'react-native';
import firebase from "firebase";
import db from "../config";

export default class SearchScreen extends React.Component{
  constructor(){
    super()
    this.state = {
      allTransactions : [],
      lastVisibleTransactions : null,
      search : ""
    }

  }
  componentDidMount = async()=>{
    const query = await db.collection("transactions").limit(10).get()
    query.docs.map((doc)=>{
      this.setState({allTransactions:[], lastVisibleTransactions:doc})
    })
  }

  searchTransaction = async(text)=>{
    var enteredText = text.split("")
    if(enteredText[0].toUpperCase()==="B"){
      const transaction = await db.collection("transactions").where("bookId","==",text).get()
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions : [...this.state.allTransactions,doc.data()],
          lastVisibleTransactions : doc
        })
      })
    }
    else if(enteredText[0].toUpperCase()==="S"){
      const transaction = await db.collection("transactions").where("studentId","==",text).get()
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions : [...this.state.allTransactions,doc.data()],
          lastVisibleTransactions : doc
        })
      })
    }
  }

  fetchMoreTransactions = async()=>{
    var text = this.state.search.toUpperCase()
    var enteredText = text.split("")
    if(enteredText[0].toUpperCase()==="B"){
      const transaction = await db.collection("transactions").where("bookId","==",text).startAfter(this.state.lastVisibleTransactions).limit(10).get()
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions : [...this.state.allTransactions,doc.data()],
          lastVisibleTransactions : doc
        })
      })
    }
    else if(enteredText[0].toUpperCase()==="S"){
      const transaction = await db.collection("transactions").where("studentId","==",text).startAfter(this.state.lastVisibleTransactions).limit(10).get()
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions : [...this.state.allTransactions,doc.data()],
          lastVisibleTransactions : doc
        })
      })
    }
  }

  render(){
    return(
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <TextInput style={styles.bar} placeholder = "Enter Book ID/Student ID" onChangeText = {(text)=>{
            this.setState({search:text})
          }}>
          </TextInput>
          <TouchableOpacity styles = {styles.searchButton} onPress = {()=>{
            this.searchTransaction(this.state.search)
          }}>
            <Text>
              Search
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList data = {this.state.allTransactions} renderItem = {({item})=>(
          <View style={{
            borderBottomWidth : 2
          }}>
              <Text>
                {"Book Id:" + item.bookId}
              </Text>
              <Text>
                {"Student Id:" + item.studentId}
              </Text>
              <Text>
                {"Transaction Type:" + item.transactionType}
              </Text>
              <Text>
                {"Date:" + item.date.toDate()}
              </Text>
          </View>
        )}keyExtractor = {(item,index)=>{
          index.toString()
        }}onEndReached = {this.fetchMoreTransactions}
        onEndReachedThreshold = {0.7}
        >
          
        </FlatList>
      </View>
    )
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20
  },
  searchBar:{
    flexDirection:'row',
    height:40,
    width:'auto',
    borderWidth:0.5,
    alignItems:'center',
    backgroundColor:'grey',
    marginTop : 100

  },
  bar:{
    borderWidth:2,
    height:30,
    width:300,
    paddingLeft:10,
  },
  searchButton:{
    borderWidth:1,
    height:30,
    width:50,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'green'
  }
})