import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyCbTAU50HyhJp7gObz2KEaqtV4pRTpqhDM",
  authDomain: "clandestinediary.firebaseapp.com",
  projectId: "clandestinediary",
  storageBucket: "clandestinediary.firebasestorage.app",
  messagingSenderId: "709540928458",
  appId: "1:709540928458:web:20236dc213ac9235dacd33"
};

const app = initializeApp(firebaseConfig);

alert("FIREBASE WORKS");
