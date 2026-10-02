/**
 * Firebase Realtime Database and Auth Configuration.
 * Safely reads from Vite environment variables.
 */

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export const getFirebaseConfig = (): FirebaseConfig => {
  const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  return {
    apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyBaNjHmi-VlW8aFDDVN38OJkQCShYY2sFg',
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'dominos-ftw.firebaseapp.com',
    databaseURL: env.VITE_FIREBASE_DATABASE_URL || 'https://dominos-ftw-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: env.VITE_FIREBASE_PROJECT_ID || 'dominos-ftw',
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'dominos-ftw.firebasestorage.app',
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '476741872461',
    appId: env.VITE_FIREBASE_APP_ID || '1:476741872461:web:3dc979b05a6175eadda504',
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || 'G-1TBL91595F',
  };
};

export const isFirebaseConfigured = (): boolean => {
  const cfg = getFirebaseConfig();
  return Boolean(cfg.apiKey && cfg.databaseURL && !cfg.apiKey.includes('your_api_key'));
};
