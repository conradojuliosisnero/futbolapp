// Registro / inicio de sesión. Las contraseñas las guarda Firebase Auth, nunca Firestore.
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup,
  updateProfile, signOut as fbSignOut,
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

// Mensajes en español para los errores que ve el usuario.
const ERRORS = {
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/email-already-in-use': 'Ese correo ya tiene una cuenta.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/invalid-email': 'El correo no es válido.',
  'auth/too-many-requests': 'Demasiados intentos. Espera un momento.',
  'auth/popup-closed-by-user': 'Cerraste la ventana de Google.',
};
export const authErrorMessage = (e) => ERRORS[e?.code] ?? 'No se pudo iniciar sesión. Intenta de nuevo.';
