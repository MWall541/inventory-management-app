// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB_vIbefKg1QoyHvov0DZZQrdNVypFCDCY",
  authDomain: "pantry-app-515f0.firebaseapp.com",
  projectId: "pantry-app-515f0",
  storageBucket: "pantry-app-515f0.appspot.com",
  messagingSenderId: "343032072270",
  appId: "1:343032072270:web:f1d1554c6e266473511b1f",
  measurementId: "G-SXGE6FT8W6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export { firestore };