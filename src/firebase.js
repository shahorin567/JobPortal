import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8fv1grcnCiAss_gQM-IUhjA5g-x3z008",
  authDomain: "jobportaldiu.firebaseapp.com",
  databaseURL: "https://jobportaldiu-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "jobportaldiu",
  storageBucket: "jobportaldiu.firebasestorage.app",
  messagingSenderId: "729545986060",
  appId: "1:729545986060:web:4d2fcb4e956bffe50f9e29"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;