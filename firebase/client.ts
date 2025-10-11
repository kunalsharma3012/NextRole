
import {initializeApp ,getApp , getApps} from "firebase/app"
import {getAuth} from "firebase/auth"

import {getFirestore} from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  // apiKey: "AIzaSyA5lzfe9lgn5ysQPjUfD6Ys4xgWz3LQCb4",
  // authDomain: "nextrole-a14db.firebaseapp.com",
  // projectId: "nextrole-a14db",
  // storageBucket: "nextrole-a14db.firebasestorage.app",
  // messagingSenderId:"158822598317",
  // appId:"1:158822598317:web:909d7d19a47631f5686824",
  // measurementId: "G-8T8DYYLCQZ"
};

// Initialize Firebase
const app = !getApps.length ?  initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);