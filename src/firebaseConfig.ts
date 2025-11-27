import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Hardcoded for debugging
const firebaseConfig = {
  apiKey: "AIzaSyCQHkcIIc1eUicMXTcVZuDOSTXey2RfVRU",
  authDomain: "crossover-bottleflip.firebaseapp.com",
  projectId: "crossover-bottleflip",
  storageBucket: "crossover-bottleflip.firebasestorage.app",
  messagingSenderId: "765583122408",
  appId: "1:765583122408:web:5dcc45948a359d68f2ce5d",
};

console.log("Firebase Config Init:", {
  projectId: firebaseConfig.projectId,
  hasApiKey: !!firebaseConfig.apiKey,
});

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// Standard initialization - easiest for debugging
export const firestore = getFirestore(app);
