import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, collection, setDoc, getDoc, onSnapshot, deleteDoc, getDocs, runTransaction } from 'firebase/firestore';
import aiStudioConfig from '../../firebase-applet-config.json';

const isCustomConfig = !!import.meta.env.VITE_FIREBASE_PROJECT_ID;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || aiStudioConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || aiStudioConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || aiStudioConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || aiStudioConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || aiStudioConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || aiStudioConfig.appId,
};

const rawDatabaseId = isCustomConfig 
  ? import.meta.env.VITE_FIREBASE_DATABASE_ID 
  : aiStudioConfig.firestoreDatabaseId;

// If a Google Analytics Measurement ID (G-XXXXX) was accidentally provided 
// as the Database ID, ignore it to prevent Firestore connection errors.
const firestoreDatabaseId = rawDatabaseId?.startsWith('G-') 
  ? aiStudioConfig.firestoreDatabaseId 
  : rawDatabaseId;

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = firestoreDatabaseId ? getFirestore(app, firestoreDatabaseId) : getFirestore(app);

const withTimeout = (promise: Promise<any>, timeoutMs: number = 3000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs))
  ]);
};

// Safe database operation wrappers that work with Firestore but have a local-first fallback
export class SmartDBService {
  private static useFallback = false;
  private static fallbackData: Record<string, any> = JSON.parse(localStorage.getItem('family_expenses_fallback_db') || '{}');

  private static saveFallback() {
    localStorage.setItem('family_expenses_fallback_db', JSON.stringify(this.fallbackData));
  }

  static enableFallbackMode(reason: string) {
    if (!this.useFallback) {
      if (!reason.includes('auth-emulation')) {
        console.warn('Switching to local-first fallback database mode due to:', reason);
      }
      this.useFallback = true;
    }
  }

  static isFallbackActive() {
    return this.useFallback;
  }

  // Set data at path
  static async set(path: string, data: any): Promise<void> {
    if (this.useFallback) {
      const parts = path.split('/');
      let current = this.fallbackData;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = data;
      this.saveFallback();
      this.triggerListeners(parts[0], this.fallbackData[parts[0]]);
      return;
    }

    try {
      const parts = path.split('/');
      if (parts.length === 1) {
        if (!data) { // Used for clearing collections
          const snapshot = await withTimeout(getDocs(collection(db, path)));
          // Using regular loops rather than batch for simplicity in wrapper
          for (const d of snapshot.docs) {
             await withTimeout(deleteDoc(d.ref));
          }
        }
      } else {
        const docRef = doc(db, parts[0], parts.slice(1).join('/'));
        if (data === null || data === undefined) {
          await withTimeout(deleteDoc(docRef));
        } else {
          await withTimeout(setDoc(docRef, data));
        }
      }
    } catch (err: any) {
      console.error(`Firebase Set error at index: ${path}`, err);
      // Fallback
      this.enableFallbackMode(err.message || 'database-error');
      const parts = path.split('/');
      let current = this.fallbackData;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = data;
      this.saveFallback();
      this.triggerListeners(parts[0], this.fallbackData[parts[0]]);
    }
  }

  // Push data (add item to list)
  static async push(path: string, data: any): Promise<string> {
    if (this.useFallback) {
      const newId = `id_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      if (!this.fallbackData[path]) this.fallbackData[path] = {};
      const actualData = { ...data, id: newId };
      this.fallbackData[path][newId] = actualData;
      this.saveFallback();
      this.triggerListeners(path, this.fallbackData[path]);
      return newId;
    }

    try {
      const collRef = collection(db, path);
      const newRef = doc(collRef);
      const key = newRef.id;
      const actualData = { ...data, id: key };
      await withTimeout(setDoc(newRef, actualData));
      return key;
    } catch (err: any) {
      console.error(`Firebase Push error at indexing: ${path}`, err);
      this.enableFallbackMode(err.message || 'database-error');
      const newId = `id_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      if (!this.fallbackData[path]) this.fallbackData[path] = {};
      const actualData = { ...data, id: newId };
      this.fallbackData[path][newId] = actualData;
      this.saveFallback();
      this.triggerListeners(path, this.fallbackData[path]);
      return newId;
    }
  }

  // Listen to path
  private static listeners: Record<string, Array<(data: any) => void>> = {};

  private static triggerListeners(path: string, data: any) {
    if (this.listeners[path]) {
      this.listeners[path].forEach(cb => cb(data));
    }
  }

  static onValue(path: string, callback: (data: any) => void, errorCallback?: (err: any) => void): () => void {
    if (this.useFallback) {
      // Call immediately
      callback(this.fallbackData[path] || null);
      if (!this.listeners[path]) this.listeners[path] = [];
      this.listeners[path].push(callback);
      return () => {
        this.listeners[path] = (this.listeners[path] || []).filter(cb => cb !== callback);
      };
    }

    const parts = path.split('/');
    if (parts.length === 1) {
      const collRef = collection(db, path);
      const unsubscribe = onSnapshot(collRef, (snapshot) => {
        const obj: any = {};
        snapshot.forEach(d => {
          obj[d.id] = d.data();
        });
        callback(obj);
      }, (err) => {
        console.error(`Firebase onSnapshot error on collection: ${path}`, err);
        if (err.message?.includes('Permission denied') || err.message?.includes('PERMISSION_DENIED') || err.message?.includes('offline') || err.message?.includes('operation') || err.message?.includes('unavailable')) {
          this.enableFallbackMode(err.message);
          callback(this.fallbackData[path] || null);
          if (!this.listeners[path]) this.listeners[path] = [];
          this.listeners[path].push(callback);
        } else if (errorCallback) {
          errorCallback(err);
        }
      });
      return () => {
        unsubscribe();
        if (this.listeners[path]) {
           this.listeners[path] = this.listeners[path].filter(cb => cb !== callback);
        }
      };
    } else {
      const docRef = doc(db, parts[0], parts.slice(1).join('/'));
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        callback(snapshot.exists() ? snapshot.data() : null);
      }, (err) => {
        console.error(`Firebase onSnapshot error on doc: ${path}`, err);
        if (err.message?.includes('Permission denied') || err.message?.includes('PERMISSION_DENIED') || err.message?.includes('offline') || err.message?.includes('operation') || err.message?.includes('unavailable')) {
          this.enableFallbackMode(err.message);
          callback(this.fallbackData[path] || null);
          if (!this.listeners[path]) this.listeners[path] = [];
          this.listeners[path].push(callback);
        } else if (errorCallback) {
          errorCallback(err);
        }
      });
      return () => {
        unsubscribe();
        if (this.listeners[path]) {
           this.listeners[path] = this.listeners[path].filter(cb => cb !== callback);
        }
      };
    }
  }

  // Delete node
  static async remove(path: string): Promise<void> {
    if (this.useFallback) {
      const parts = path.split('/');
      let current = this.fallbackData;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) return;
        current = current[parts[i]];
      }
      delete current[parts[parts.length - 1]];
      this.saveFallback();
      this.triggerListeners(parts[0], this.fallbackData[parts[0]]);
      return;
    }

    try {
      const parts = path.split('/');
      if (parts.length === 1) {
        const snapshot = await withTimeout(getDocs(collection(db, path)));
        for (const d of snapshot.docs) {
           await withTimeout(deleteDoc(d.ref));
        }
      } else {
        const docRef = doc(db, parts[0], parts.slice(1).join('/'));
        await withTimeout(deleteDoc(docRef));
      }
    } catch (err: any) {
      console.error(`Firebase Remove error at: ${path}`, err);
      this.enableFallbackMode(err.message || 'database-error');
      const parts = path.split('/');
      let current = this.fallbackData;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) return;
        current = current[parts[i]];
      }
      delete current[parts[parts.length - 1]];
      this.saveFallback();
      this.triggerListeners(parts[0], this.fallbackData[parts[0]]);
    }
  }

  // Get once
  static async get(path: string): Promise<any> {
    if (this.useFallback) {
      const parts = path.split('/');
      let current = this.fallbackData;
      for (const p of parts) {
        if (current === null || current === undefined) return null;
        current = current[p];
      }
      return current;
    }

    try {
      const parts = path.split('/');
      if (parts.length === 1) {
        const snapshot = await withTimeout(getDocs(collection(db, path)));
        const obj: any = {};
        snapshot.forEach((d: any) => {
          obj[d.id] = d.data();
        });
        return obj;
      } else {
        const docRef = doc(db, parts[0], parts.slice(1).join('/'));
        const snapshot = await withTimeout(getDoc(docRef));
        return snapshot.exists() ? snapshot.data() : null;
      }
    } catch (err: any) {
      console.error(`Firebase Get error on: ${path}`, err);
      this.enableFallbackMode(err.message || 'database-error');
      const parts = path.split('/');
      let current = this.fallbackData;
      for (const p of parts) {
        if (current === null || current === undefined) return null;
        current = current[p];
      }
      return current;
    }
  }
}

