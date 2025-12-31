// firebase-config.js
// Configuração única do Firebase

// Importa Firebase via CDN global
const firebaseConfig = {
    apiKey: "AIzaSyD08wjJ9rTqyZrzNWBJHLxsb1ztYElA3z8",
    authDomain: "meu-portifolio-21f88.firebaseapp.com",
    projectId: "meu-portifolio-21f88",
    storageBucket: "meu-portifolio-21f88.appspot.com",
    messagingSenderId: "806930819935",
    appId: "1:806930819935:web:3aa738a18026d925d7e4ea"
};

// Inicializa Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

console.log('✅ Firebase configurado globalmente');