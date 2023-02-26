// const { initializeApp, cert } = require('firebase-admin/app')
// const { getFirestore } = require('firebase-admin/firestore')

// const serviceAccount = require('./creds.json')

// initializeApp({
//     credential: cert(serviceAccount)
// })

// const db = getFirestore()

// module.exports = { db }

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDkxVlkRRL39qDXJ7ItnQGwlFnTlDprLoo",
  authDomain: "zenox-back-end.firebaseapp.com",
  projectId: "zenox-back-end",
  storageBucket: "zenox-back-end.appspot.com",
  messagingSenderId: "378003593903",
  appId: "1:378003593903:web:0fe0e4844886f17839525a",
  measurementId: "G-J3YPZTS193"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);