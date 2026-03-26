import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // TODO: Replace these values with your Firebase web app configuration
  // You can find these values in your Firebase Console:
  // 1. Go to https://console.firebase.google.com/
  // 2. Select your project (vets-34211)
  // 3. Click the gear icon -> Project settings
  // 4. Scroll down to "Your apps" section
  // 5. Click the "</>" icon to add a web app or copy config from existing web app
  apiKey: "AIzaSyC__NULbjT39R5AKg9Vg71-8nZh8wxTb60",
  authDomain: "vets-34211.firebaseapp.com",
  projectId: "vets-34211",
  storageBucket: "vets-34211.firebasestorage.app",
  messagingSenderId: "869951873820",
  appId: "1:869951873820:web:f182756eaa249e654250d9",
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
