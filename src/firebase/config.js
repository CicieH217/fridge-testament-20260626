import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA_Q7Ppoqg6XO2zJJrCXNAW0xy2nquLWbU",
  authDomain: "fridge-testament.firebaseapp.com",
  projectId: "fridge-testament",
  storageBucket: "fridge-testament.firebasestorage.app",
  messagingSenderId: "517310759271",
  appId: "1:517310759271:web:ecbca425380ff7542aefc2",
  measurementId: "G-RW4WDJV7NJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with offline persistence
export const db = getFirestore(app);
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    console.warn("Firestore 离线缓存：多个标签页只能同时开一个");
  } else if (err.code === "unimplemented") {
    console.warn("Firestore 离线缓存：当前浏览器不支持");
  }
});

export default app;
