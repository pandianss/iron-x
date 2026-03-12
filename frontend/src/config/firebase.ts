import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCX9IruooFr3yAnr6m55whAIQItE_FoCjI",
    authDomain: "ironx-640b2.firebaseapp.com",
    projectId: "ironx-640b2",
    storageBucket: "ironx-640b2.firebasestorage.app",
    messagingSenderId: "328614818720",
    appId: "1:328614818720:web:d1dadcc2d44c44237e2ac5",
    measurementId: "G-M48YB84C8K"
};

console.log('Firebase Config loaded:', firebaseConfig);

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
