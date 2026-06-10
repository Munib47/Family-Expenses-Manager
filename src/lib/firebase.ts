import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDatabase, ref, set, push, onValue, update, remove, get } from 'firebase/database';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Build Realtime Database URL
const dbUrl = `https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com`;
export const rtdb = getDatabase(app, dbUrl);

// Safe database operation wrappers that work with Firebase RTDB but have a local-first fallback
export class SmartDBService {
  private static useFallback = false;
  private static fallbackData: Record<string, any> = JSON.parse(localStorage.getItem('family_expenses_fallback_db') || '{}');

  private static saveFallback() {
    localStorage.setItem('family_expenses_fallback_db', JSON.stringify(this.fallbackData));
  }

  static enableFallbackMode(reason: string) {
    if (!this.useFallback) {
      console.warn('Switching to local-first fallback database mode due to:', reason);
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
      const dbRef = ref(rtdb, path);
      await set(dbRef, data);
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
      const newId = `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      if (!this.fallbackData[path]) this.fallbackData[path] = {};
      const actualData = { ...data, id: newId };
      this.fallbackData[path][newId] = actualData;
      this.saveFallback();
      this.triggerListeners(path, this.fallbackData[path]);
      return newId;
    }

    try {
      const dbRef = ref(rtdb, path);
      const newRef = push(dbRef);
      const key = newRef.key || `key_${Date.now()}`;
      const actualData = { ...data, id: key };
      await set(newRef, actualData);
      return key;
    } catch (err: any) {
      console.error(`Firebase Push error at indexing: ${path}`, err);
      this.enableFallbackMode(err.message || 'database-error');
      const newId = `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

    const dbRef = ref(rtdb, path);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      callback(snapshot.val());
    }, (err) => {
      console.error(`Firebase onValue error on: ${path}`, err);
      if (err.message?.includes('Permission denied') || err.message?.includes('PERMISSION_DENIED')) {
        this.enableFallbackMode('Permission Denied');
        callback(this.fallbackData[path] || null);
      } else if (errorCallback) {
        errorCallback(err);
      }
    });

    return unsubscribe;
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
      const dbRef = ref(rtdb, path);
      await remove(dbRef);
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
      const dbRef = ref(rtdb, path);
      const snapshot = await get(dbRef);
      return snapshot.val();
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
