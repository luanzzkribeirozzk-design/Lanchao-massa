import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDt0wXutZGnuNdmOR8eZUM5r-iHX-DHAzA",
  authDomain: "lanchao-98527.firebaseapp.com",
  projectId: "lanchao-98527",
  storageBucket: "lanchao-98527.firebasestorage.app",
  messagingSenderId: "320966596540",
  appId: "1:320966596540:web:d91270ab980ab257e1fdb9",
};

export const publicDb = getFirestore(initializeApp(firebaseConfig));
