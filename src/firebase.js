import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyCxzPKMTlmEf74bX5vclo1aZHIbp2T2-U4",
  authDomain: "stock-31d4a.firebaseapp.com",
  projectId: "stock-31d4a",
  storageBucket: "stock-31d4a.firebasestorage.app",
  messagingSenderId: "194752642252",
  appId: "1:194752642252:web:38da6fe5276aa0eabc9669",
  databaseURL: "https://stock-31d4a-default-rtdb.firebaseio.com"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const database = getDatabase(app)

export { auth, database } 