// Firebase del lado del navegador. La config pública NO es secreta: la seguridad está en firestore.rules.
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

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

// Solo para pruebas de punta a punta: con NEXT_PUBLIC_FIREBASE_EMULATORS=1 la app usa los emuladores locales
// (npm run test:e2e), nunca el proyecto real. En uso normal esta variable no existe.
if (app && process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === '1' && !globalThis.__minuto90Emulators) {
  globalThis.__minuto90Emulators = true;
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8085);
}
export const googleProvider = new GoogleAuthProvider();
