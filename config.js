import firebase from 'firebase';
require('@firebase/firestore');

var firebaseConfig = {
    apiKey: "AIzaSyAEiQk8-oXmZNo5Pb52rYnzi8Myv9qdlPg",
    authDomain: "e-library-wily.firebaseapp.com",
    projectId: "e-library-wily",
    storageBucket: "e-library-wily.appspot.com",
    messagingSenderId: "1096873714141",
    appId: "1:1096873714141:web:d3517cc2607be8c2e39634"
  };
  
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore()