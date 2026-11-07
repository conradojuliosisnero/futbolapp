// Firebase del lado del navegador. La config pública NO es secreta: la seguridad está en firestore.rules.
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// shortcut: sin .env.local la app corre solo con datos de prueba y sin login; cuando haya credenciales esto queda en true solo.
export const firebaseReady = Boolean(config.apiKey);

const app = firebaseReady ? (getApps()[0] ?? initializeApp(config)) : null;
export const auth = app && getAuth(app);
export const db = app && getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
