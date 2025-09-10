import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

// Chat testnet
// Your web app's Firebase configuration
const firebaseConfig =
  process.env.NETWORK === "mainnet"
    ? {
        apiKey: process.env.VUE_APP_CHAT_FIREBASE_API_KEY,
        authDomain: "nearp2pmainnet.firebaseapp.com",
        projectId: "nearp2pmainnet",
        storageBucket: "nearp2pmainnet.appspot.com",
        messagingSenderId: "253746891899",
        appId: "1:253746891899:web:925b05e946376eb60da6de",
        measurementId: "G-Q54N9T6LFL",
      }
    : {
        apiKey: process.env.VUE_APP_CHAT_FIREBASE_API_KEY,
        authDomain: "nearp2ptestnet.firebaseapp.com",
        projectId: "nearp2ptestnet",
        storageBucket: "nearp2ptestnet.appspot.com",
        messagingSenderId: "347747371227",
        appId: "1:347747371227:web:b4f6e8615632f4e30c64fe",
        measurementId: "G-2YM4CSZZ74",
      };

// const firebaseConfig = {
//   apiKey: "AIzaSyAogyHNNPfawxx22Iphb2cf9Yjtu7fzSgQ",
//   authDomain: "nearp2p-ff014.firebaseapp.com",
//   databaseURL: "https://nearp2p-ff014-default-rtdb.firebaseio.com",
//   projectId: "nearp2p-ff014",
//   storageBucket: "nearp2p-ff014.appspot.com",
//   messagingSenderId: "321404603196",
//   appId: "1:321404603196:web:3645c05b9d1adfe61fac39"
// };

// Chat Mainnet
// const firebaseConfig = {
//   apiKey: "AIzaSyBmNbWX8QFohKYzYGMaie6gmy-Gn5GVtUA",
//   authDomain: "nearp2p-30e5d.firebaseapp.com",
//   databaseURL: "https://nearp2p-30e5d-default-rtdb.firebaseio.com",
//   projectId: "nearp2p-30e5d",
//   storageBucket: "nearp2p-30e5d.appspot.com",
//   messagingSenderId: "860458954942",
//   appId: "1:860458954942:web:f2023cd1400e6841aceeef"
// };

firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();
