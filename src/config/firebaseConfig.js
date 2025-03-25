import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getDocs, where, addDoc, query, getFirestore, collection, doc, FieldValue, getDoc, setDoc, updateDoc, onSnapshot, arrayUnion, arrayRemove, serverTimestamp,orderBy} from "firebase/firestore";
import messaging from '@react-native-firebase/messaging';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { ScrollView } from 'react-native';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9RIwWfhqW_9l6Hpbk5CfM7NWhbxP9VEU",
  authDomain: "arrahmantourapp.firebaseapp.com",
  projectId: "arrahmantourapp",
  storageBucket: "arrahmantourapp.firebasestorage.app",
  messagingSenderId: "269446727510",
  appId: "1:269446727510:android:30342ab5a0e8c4e80b78f7",
};

// Ensure Firebase is initialized only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getFirestore(app);

export { ScrollView, uuidv4, getDocs, where,addDoc, query, messaging, auth, db, collection, doc, getDoc, setDoc, updateDoc, onSnapshot, arrayUnion, arrayRemove, serverTimestamp,orderBy};
