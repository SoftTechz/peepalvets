import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Firebase configuration for the live environment
const firebaseConfig = {
  apiKey: "AIzaSyCILWuBAiHkQ-4QkPsqzcxSdkKj_xTcYgE",
  authDomain: "peepalvets.firebaseapp.com",
  projectId: "peepalvets",
  storageBucket: "peepalvets.firebasestorage.app",
  messagingSenderId: "66582335763",
  appId: "1:66582335763:web:b18e4e83fba629ffffcae6",
};

// Initialize Firebase
let app;
let storage;

try {
  app = initializeApp(firebaseConfig);
  storage = getStorage(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

export { storage };
export default app;
