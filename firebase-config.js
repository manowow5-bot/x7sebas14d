// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoMnlTZVdd9ulkZlGjGUwXzKtmlnUCfXc",
  authDomain: "x7sebaspanel.firebaseapp.com",
  projectId: "x7sebaspanel",
  storageBucket: "x7sebaspanel.firebasestorage.app",
  messagingSenderId: "11380640205",
  appId: "1:11380640205:web:abf1fa3bba3a6b631b5c84"
};

// Variables globales
let auth = null;
let db = null;
let firebaseReady = false;

// Initialize Firebase
async function initializeFirebase() {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
      console.log("✅ Firebase inicializado correctamente");
    }
    
    // Get references
    auth = firebase.auth();
    db = firebase.firestore();
    
    console.log("✅ Referencias de Firebase obtenidas");
    
    // Habilitar offline persistence
    try {
      await db.enablePersistence({ synchronizeTabs: true });
      console.log("✅ Firestore offline persistence habilitada");
    } catch (err) {
      if (err.code === 'failed-precondition') {
        console.log("⚠️ Múltiples pestañas - persistence limitada");
      } else if (err.code === 'unimplemented') {
        console.log("⚠️ Private browsing - persistence no disponible");
      }
    }
    
    // Marcar como listo
    firebaseReady = true;
    console.log("✅ Firebase completamente listo - EN LÍNEA ✔️");
    
    return true;
  } catch (error) {
    console.error("❌ Error inicializando Firebase:", error);
    firebaseReady = true;
    return false;
  }
}

// Iniciar Firebase
initializeFirebase().catch(err => console.error("Error:", err));
