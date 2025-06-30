// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOyLcz7Zl-pRrTmhl6Z_2stGh7-l2MT-w",
  authDomain: "mvillo-853a4.firebaseapp.com",
  projectId: "mvillo-853a4",
  storageBucket: "mvillo-853a4.firebasestorage.app",
  messagingSenderId: "611353702699",
  appId: "1:611353702699:web:94bcf26405678077b6956e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth(app);
export const db=getFirestore(app);
export const storage = getStorage(app);

export default app;