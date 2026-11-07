// Registro / inicio de sesión. Las contraseñas las guarda Firebase Auth, nunca Firestore.
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup,
  updateProfile, sendPasswordResetEmail, signOut as fbSignOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './client';

// Crea users/{uid} la primera vez que entra (con email o con Google).
async function ensureUserDoc(user) {
  const ref = doc(db, 'users', user.uid);
  if ((await getDoc(ref)).exists()) return;
  await setDoc(ref, {
    displayName: user.displayName ?? '',
    email: user.email,
    photoURL: user.photoURL ?? null,
    follows: { teams: {}, leagues: {}, matches: {} },
    createdAt: serverTimestamp(),
  });
}

export async function signUp({ name, email, password }) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: name });
  await ensureUserDoc(user);
  return user;
}

export async function signIn({ email, password }) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function signInWithGoogle() {
  const { user } = await signInWithPopup(auth, googleProvider);
  await ensureUserDoc(user);
  return user;
}

export const signOut = () => fbSignOut(auth);

// Firebase envía el correo con el enlace para crear una contraseña nueva.
export const resetPassword = ({ email }) => sendPasswordResetEmail(auth, email);

// Mensajes para el usuario: claros pero sin detalles internos (proveedor, configuración, códigos)
// y sin revelar si un correo tiene cuenta (evita que alguien averigüe qué correos están registrados).
const SAME = 'Correo o contraseña incorrectos.';
const UNAVAILABLE = 'No pudimos iniciar sesión en este momento. Intenta más tarde.';
const ERRORS = {
  'auth/invalid-credential': SAME,
  'auth/invalid-login-credentials': SAME,
  'auth/user-not-found': SAME,
  'auth/wrong-password': SAME,
  'auth/email-already-in-use': 'No pudimos crear la cuenta con ese correo. Si ya tienes una, entra o recupera tu contraseña.',
  'auth/account-exists-with-different-credential': 'No pudimos entrar con ese método. Prueba con tu correo y contraseña.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/invalid-email': 'El correo no es válido.',
  'auth/missing-email': 'Escribe tu correo.',
  'auth/missing-password': 'Escribe tu contraseña.',
  'auth/too-many-requests': 'Demasiados intentos. Espera un momento.',
  'auth/popup-closed-by-user': 'Se cerró la ventana antes de terminar.',
  'auth/cancelled-popup-request': 'Se cerró la ventana antes de terminar.',
  'auth/popup-blocked': 'El navegador bloqueó la ventana. Permite ventanas emergentes e intenta de nuevo.',
  'auth/network-request-failed': 'Sin conexión. Revisa tu internet e intenta de nuevo.',
  'auth/user-disabled': 'Esta cuenta está desactivada.',
  // Errores de configuración: al usuario solo un mensaje genérico; el detalle va a la consola.
  'auth/operation-not-allowed': UNAVAILABLE,
  'auth/unauthorized-domain': UNAVAILABLE,
  'auth/invalid-api-key': UNAVAILABLE,
  'auth/configuration-not-found': UNAVAILABLE,
};
export function authErrorMessage(e) {
  if (e?.code) console.warn('Inicio de sesión:', e.code); // solo para depurar, no se muestra en pantalla
  return ERRORS[e?.code] ?? 'No se pudo completar la acción. Intenta de nuevo.';
}

/** Recuperar contraseña: si el correo no existe se responde igual (no revela qué correos tienen cuenta). */
export async function requestPasswordReset(form) {
  try { await resetPassword(form); }
  catch (e) { if (!['auth/user-not-found', 'auth/invalid-credential'].includes(e?.code)) throw e; }
}
