import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyB3Rw8RY84mHu3IoPiMQ6KVaF9keswaxp0",
  authDomain: "freelas-app-e153d.firebaseapp.com",
  databaseURL: "https://freelas-app-e153d-default-rtdb.firebaseio.com",
  projectId: "freelas-app-e153d",
  storageBucket: "freelas-app-e153d.firebasestorage.app",
  messagingSenderId: "100058315779",
  appId: "1:100058315779:web:c76d336ef72ab028412236",
  measurementId: "G-599JPRP5YC"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
