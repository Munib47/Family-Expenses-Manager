import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, collection, setDoc, getDoc, onSnapshot, deleteDoc, getDocs } from 'firebase/firestore';
import aiStudioConfig from '../../firebase-applet-config.json';

const isAiStudioPreview = typeof window !== 'undefined' && 
  (window.location.hostname.includes('aistudio.google') || window.location.hostname.includes('web-applet'));

const firebaseConfig = !isAiStudioPreview 
  ? {
      apiKey: "AIzaSyCGcQCkoJkEtKxIzQz8BV_eXudtkWpDJdw",
      authDomain: "family-expense-manager-ac9ef.firebaseapp.com",
      projectId: "family-expense-manager-ac9ef",
      storageBucket: "family-expense-manager-ac9ef.firebasestorage.app",
      messagingSenderId: "237145522695",
      appId: "1:237145522695:web:1f18a77db6f8eb18caa0a2",
      measurementId: "G-K0KK77TL5M"
    }
  : {
      apiKey: aiStudioConfig.apiKey,
      authDomain: aiStudioConfig.authDomain,
      projectId: aiStudioConfig.projectId,
      storageBucket: aiStudioConfig.storageBucket,
      messagingSenderId: aiStudioConfig.messagingSenderId,
      appId: aiStudioConfig.appId,
      measurementId: aiStudioConfig.measurementId
    };

const firestoreDatabaseId = !isAiStudioPreview ? undefined : aiStudioConfig.firestoreDatabaseId;

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = firestoreDatabaseId ? getFirestore(app, firestoreDatabaseId) : getFirestore(app);

if (import.meta.env.DEV) {
  console.log(`[Firebase Active] Project: "${firebaseConfig.projectId}" | DB: "${firestoreDatabaseId || '(default)'}"`);
}

/**
 * Defensive Data Utility: Recursively removes `undefined` properties or converts them to `null`
 */
const sanitizePayload = (obj: any): any => {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizePayload);

  return Object.keys(obj).reduce((acc: any, key) => {
    const val = obj[key];
    if (val !== undefined) {
      acc[key] = sanitizePayload(val);
    }
    return acc;
  }, {});
};

export class SmartDBService {
  private static useFallback = false;
  private static fallbackData: Record<string, any> = JSON.parse(localStorage.getItem('family_expenses_fallback_db') || '{}');

  private static saveFallback() {
    localStorage.setItem('family_expenses_fallback_db', JSON.stringify(this.fallbackData));
  }

  // Only enable fallback if we are sure we are offline/unauthorized
  static enableFallbackMode(reason: string) {
    if (!this.useFallback) {
      console.warn('Switching to local-first fallback due to:', reason);
      this.useFallback = true;
    }
  }

  static isFallbackActive() {
    return this.useFallback;
  }

  static async set(path: string, data: any): Promise<void> {
    if (this.useFallback) {
      this.updateFallbackData(path, data);
      return;
    }

    try {
      const parts = path.split('/');
      if (parts.length === 1) {
        if (!data) {
          const snapshot = await getDocs(collection(db, path));
          for (const d of snapshot.docs) await deleteDoc(d.ref);
        }
      } else {
        const docRef = doc(db, parts[0], parts.slice(1).join('/'));
        if (data === null || data === undefined) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, sanitizePayload(data));
        }
      }
    } catch (err: any) {
      console.error(`Firebase Set error at: ${path}`, err);
      if (this.isNetworkError(err)) this.enableFallbackMode(err.message);
      this.updateFallbackData(path, data);
    }
  }

  static async push(path: string, data: any): Promise<string> {
    if (this.useFallback) {
      const newId = `id_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      this.updateFallbackData(path, { ...data, id: newId }, true);
      return newId;
    }

    try {
      const newRef = doc(collection(db, path));
      await setDoc(newRef, sanitizePayload({ ...data, id: newRef.id }));
      return newRef.id;
    } catch (err: any) {
      console.error(`Firebase Push error at: ${path}`, err);
      if (this.isNetworkError(err)) this.enableFallbackMode(err.message);
      const newId = `id_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      this.updateFallbackData(path, { ...data, id: newId }, true);
      return newId;
    }
  }

  private static listeners: Record<string, Array<(data: any) => void>> = {};

  private static triggerListeners(path: string, data: any) {
    if (this.listeners[path]) this.listeners[path].forEach(cb => cb(data));
  }

  static onValue(path: string, callback: (data: any) => void): () => void {
    if (this.useFallback) {
      callback(this.fallbackData[path] || null);
      if (!this.listeners[path]) this.listeners[path] = [];
      this.listeners[path].push(callback);
      return () => { this.listeners[path] = this.listeners[path].filter(cb => cb !== callback); };
    }

    const parts = path.split('/');
    const isCollection = parts.length === 1;
    const ref = isCollection ? collection(db, path) : doc(db, parts[0], parts.slice(1).join('/'));

    const unsubscribe = onSnapshot(ref as any, (snapshot) => {
      if (isCollection) {
        const obj: any = {};
        snapshot.forEach((d: any) => { obj[d.id] = d.data(); });
        callback(obj);
      } else {
        callback((snapshot as any).exists() ? (snapshot as any).data() : null);
      }
    }, (err) => {
      console.error(`Firebase onSnapshot error: ${path}`, err);
      if (this.isNetworkError(err)) {
        this.enableFallbackMode(err.message);
        callback(this.fallbackData[path] || null);
      }
    });

    return unsubscribe;
  }

  static async remove(path: string): Promise<void> {
    if (this.useFallback) {
      this.removeFromFallback(path);
      return;
    }

    try {
      const parts = path.split('/');
      if (parts.length === 1) {
        const snapshot = await getDocs(collection(db, path));
        for (const d of snapshot.docs) await deleteDoc(d.ref);
      } else {
        await deleteDoc(doc(db, parts[0], parts.slice(1).join('/')));
      }
    } catch (err: any) {
      console.error(`Firebase Remove error at: ${path}`, err);
      if (this.isNetworkError(err)) this.enableFallbackMode(err.message);
      this.removeFromFallback(path);
    }
  }

  static async get(path: string): Promise<any> {
    if (this.useFallback) {
      return this.getFromFallback(path);
    }

    try {
      const parts = path.split('/');
      if (parts.length === 1) {
        const snapshot = await getDocs(collection(db, path));
        const obj: any = {};
        snapshot.forEach((d: any) => { obj[d.id] = d.data(); });
        return obj;
      } else {
        const docRef = doc(db, parts[0], parts.slice(1).join('/'));
        const snapshot = await getDoc(docRef);
        return snapshot.exists() ? snapshot.data() : null;
      }
    } catch (err: any) {
      console.error(`Firebase Get error on: ${path}`, err);
      if (this.isNetworkError(err)) this.enableFallbackMode(err.message);
      return this.getFromFallback(path);
    }
  }

  // --- Helper Methods ---

  private static isNetworkError(err: any): boolean {
    const msg = err.message?.toLowerCase() || '';
    return msg.includes('offline') || msg.includes('unavailable') || msg.includes('network') || msg.includes('permission');
  }

  private static updateFallbackData(path: string, data: any, isPush = false) {
    const parts = path.split('/');
    let current = this.fallbackData;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    
    if (isPush) {
       if (!current[parts[parts.length-1]]) current[parts[parts.length-1]] = {};
       current[parts[parts.length-1]][data.id] = data;
    } else {
       current[parts[parts.length - 1]] = data;
    }
    this.saveFallback();
    this.triggerListeners(parts[0], this.fallbackData[parts[0]]);
  }

  private static removeFromFallback(path: string) {
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

  private static getFromFallback(path: string) {
    const parts = path.split('/');
    let current = this.fallbackData;
    for (const p of parts) {
      if (!current) return null;
      current = current[p];
    }
    return current;
  }
}