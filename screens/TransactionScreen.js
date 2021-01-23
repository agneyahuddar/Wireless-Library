import React from 'react';
import {Text, View, TouchableOpacity, StyleSheet, TextInput, Image, KeyboardAvoidingView, Alert, ToastAndroid} from 'react-native';
import * as Permissions from "expo-permissions";
import {BarCodeScanner} from "expo-barcode-scanner";
import firebase from "firebase";
import db from "../config";

export default class TransactionScreen extends React.Component{
    constructor(){
        super()
        this.state = {
            hasCameraPermissions : null,
            scanned : false,
            scannedBookId : "",
            buttonState : "normal",
            scannedStudentId : "",
            transactionMessage : ""
        }
    }

    checkBookEligibility = async()=>{
        const bookRef = await db.collection("books").where("bookId","==", this.state.scannedBookId).get()
        var transactionType = ""
        if(bookRef.docs.length === 0){
            transactionType = false}
        else{
            bookRef.docs.map((doc)=>{
                var book = doc.data()
                if(book.bookAvailability){
                    transactionType = "Issue"
                }
                else{
                    transactionType = "Return"
                }
            })
        }
        return transactionType;
        
    }

    checkStudentEligibilityForBookIssue = async()=>{
        const studentRef = await db.collection("students").where("studentId","==",this.state.scannedStudentId).get()
        var isStudentEligible = ""
        if(studentRef.docs.length == 0){
            isStudentEligible = false
            this.setState({
                scannedBookId : "",
                scannedStudentId : ""
            })
            Alert.alert("StudentId does not exist")
        }
        else{
            studentRef.docs.map((doc)=>{
                var student = doc.data()
                if(student.booksIssued < 2){
                    isStudentEligible = true
                }
                else{
                    isStudentEligible = false
                    this.setState({
                    scannedBookId : "",
                    scannedStudentId : ""
                    })
                    Alert.alert("Student has already issued 2 books")
                }
            })
        }
        return isStudentEligible;

    }

    checkStudentEligibilityForBookReturn = async()=>{
        const transactionRef = await db.collection("transactions").where("bookId","==",this.state.scannedBookId).limit(1).get()
        var isStudentEligible = ""
        transactionRef.docs.map((doc)=>{
            var lastBookTransaction = doc.data()
            if(lastBookTransaction.studentId === this.state.scannedStudentId){
                isStudentEligible = true
            }
            else{
                isStudentEligible = false
                Alert.alert("The Book was not Issued by the student. Cannot be returned")
                this.setState({
                    scannedBookId : "",
                    scannedStudentId : ""
                })
            }
        })
        return isStudentEligible;
    }

    getCameraPermissions=async(id)=>{
        const {status} = await Permissions.askAsync(Permissions.CAMERA)
        this.setState({
            hasCameraPermissions : status === 'granted',
            buttonState : id,
            scanned : false
        })
    }
    handleBarCodeScanned=async({type,data})=>{
        const buttonState = this.state.buttonState
        if(buttonState === "bookId"){
            this.setState({
                scanned : true,
                scannedBookId : data,
                buttonState : "normal"
            }) 
        
        }else if(buttonState === "studentId"){

        this.setState({
            scanned : true,
            scannedStudentId : data,
            buttonState : "normal"
        })}
    }
    initiateBookIssue = async()=>{
        db.collection("transactions").add({
            studentId : this.state.scannedStudentId,
            bookId : this.state.scannedBookId,
            date : firebase.firestore.Timestamp.now().toDate(),
            transactionType : "Issue"
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            bookAvailability : false
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            booksIssued : firebase.firestore.FieldValue.increment(1)
        })
        this.setState({
            scannedBookId : "",
            scannedStudentId : ""
        })
    }
    initiateBookReturn = async()=>{
        db.collection("transactions").add({
            studentId : this.state.scannedStudentId,
            bookId : this.state.scannedBookId,
            date : firebase.firestore.Timestamp.now().toDate(),
            transactionType : "Return"
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            bookAvailability : true
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            booksIssued : firebase.firestore.FieldValue.increment(-1)
        })
        this.setState({
            scannedBookId : "",
            scannedStudentId : ""
        })
    }
    handleTransaction = async()=>{
        var transactionType = await this.checkBookEligibility()
        if(!transactionType){
            Alert.alert("Book does not exist")
            this.setState({
                scannedBookId : "",
                scannedStudentId : ""
            })
        }
        else if(transactionType === "Issue"){
            var isStudentEligible = await this.checkStudentEligibilityForBookIssue()
            if(isStudentEligible){
                this.initiateBookIssue()
                Alert.alert("Book Issued to the Student")
            }
            
        }
        else{
            var isStudentEligible = await this.checkStudentEligibilityForBookReturn()
            if(isStudentEligible){
                this.initiateBookReturn()
                Alert.alert("Book Returned to the Library")
            }
        }
        
    }

  render(){
      const hasCameraPermissions = this.state.hasCameraPermissions
      const scanned = this.state.scanned
      const buttonState = this.state.buttonState
      if(buttonState!=="normal" && hasCameraPermissions){
          return(
              <BarCodeScanner style = {StyleSheet.absoluteFillObject} onBarCodeScanned = {scanned ? undefined : this.handleBarCodeScanned}/>
          )
      }
      else if(buttonState === "normal"){

        return(
        <KeyboardAvoidingView behaviour = "padding" enabled style={styles.container}> 
            <View>
                <Image style={{
                    width : 200,
                    height : 200
                }}source = {require("../assets/booklogo.jpg")}>
                    </Image>
                <Text style={{
                    textAlign : "center",
                    fontSize : 30
                }}>
                    Wily
                </Text>
                
            </View>
        <View style={styles.inputview}>
                <TextInput onChangeText = {(text)=>{
                    this.setState({
                        scannedBookId : text
                    })
                }} value = {this.state.scannedBookId} placeholder = "bookId" style={styles.inputbox}>

                </TextInput>
                <TouchableOpacity onPress={()=>{
                    this.getCameraPermissions("bookId")
                }} style={styles.styleButton}>
                    <Text style={styles.buttonText}>
                        Scan
                    </Text>
                </TouchableOpacity>
        </View>
        <View style={styles.inputview}>
                <TextInput onChangeText = {(text)=>{
                    this.setState({
                        scannedStudentId : text
                    })
                }} value = {this.state.scannedStudentId} placeholder = "studentId" style={styles.inputbox}>

                </TextInput>
                <TouchableOpacity onPress={()=>{
                    this.getCameraPermissions("studentId")
                }} style={styles.styleButton}>
                    <Text style={styles.buttonText}>
                        Scan
                    </Text>
                </TouchableOpacity>
        </View>
        <TouchableOpacity onPress = {async()=>{
            var transactionMessage = await this.handleTransaction()
        }}style={styles.submitButton}>
            <Text style={styles.submitButtonText}>
                Submit
            </Text>
        </TouchableOpacity>
        </KeyboardAvoidingView>
        )

      }
  }
}

const styles = StyleSheet.create({

    container : {
        flex : 1,
        justifyContent : "center",
        alignItems : "center"
    },

    displayText : {
        fontSize : 20,
        //add
    },

    inputview : {
        flexDirection : "row",
        margin : 20
    },

    inputbox : {
        width: 200,
        height : 40,
        borderWidth : 1.5,
        borderRightWidth : 0,
        fontSize : 20
    },

    submitButtonText : {

        padding : 10,
        textAlign : "center",
        fontSize : 20,
        fontWeight : "bold",
        color : "white"
    },

    submitButton : {

        backgroundColor : "blue",
        width : 100,
        height : 50

    },

    styleButton : {
        backgroundColor : "blue",
        width : 60,
        borderWidth : 1.5,
        borderLeftWidth : 0,
        
    },

    buttonText : {
        fontWeight : "bold",
        fontSize : 20,
        textAlign : "center",
        marginTop : 10,
        color : "white"
    }

})