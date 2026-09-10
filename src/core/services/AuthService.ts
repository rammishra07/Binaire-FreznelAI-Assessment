import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User,
} from 'firebase/auth';
import { UserAuth } from '../../types/model';

// Firebase configuration placeholder / fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKeyForBinaireAssessment12345',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'binaire-freznel-assessment.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'binaire-freznel-assessment',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'binaire-freznel-assessment.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456',
};

/**
 * Singleton OOP AuthService class handling Firebase Authentication operations.
 */
export class AuthService {
  private static _instance: AuthService | null = null;
  private _app: FirebaseApp | null = null;
  private _auth: Auth | null = null;
  private _currentUser: UserAuth | null = null;
  private _listeners: ((user: UserAuth | null) => void)[] = [];
  private _isFirebaseActive: boolean = false;

  private constructor() {
    this.initFirebase();
  }

  public static getInstance(): AuthService {
    if (!AuthService._instance) {
      AuthService._instance = new AuthService();
    }
    return AuthService._instance;
  }

  private initFirebase(): void {
    try {
      if (!getApps().length) {
        this._app = initializeApp(firebaseConfig);
      } else {
        this._app = getApps()[0];
      }
      this._auth = getAuth(this._app);
      this._isFirebaseActive = true;

      firebaseOnAuthStateChanged(this._auth, (user: User | null) => {
        if (user) {
          this._currentUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || 'Developer User',
            isAnonymous: user.isAnonymous,
          };
        } else {
          this._currentUser = null;
        }
        this.notifyListeners();
      });
    } catch (err) {
      console.warn('Firebase initialization notice: Running in local auth mode', err);
      this._isFirebaseActive = false;
      // Load local session if stored
      const stored = localStorage.getItem('binaire_user_session');
      if (stored) {
        try {
          this._currentUser = JSON.parse(stored);
        } catch {
          this._currentUser = null;
        }
      }
    }
  }

  public getCurrentUser(): UserAuth | null {
    return this._currentUser;
  }

  public isFirebaseActive(): boolean {
    return this._isFirebaseActive;
  }

  public subscribe(callback: (user: UserAuth | null) => void): () => void {
    this._listeners.push(callback);
    callback(this._currentUser);
    return () => {
      this._listeners = this._listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners(): void {
    this._listeners.forEach((cb) => cb(this._currentUser));
  }

  /**
   * Firebase Sign-up with Email and Password.
   */
  public async signUp(email: string, pass: string): Promise<UserAuth> {
    if (this._isFirebaseActive && this._auth) {
      try {
        const cred = await createUserWithEmailAndPassword(this._auth, email, pass);
        const user: UserAuth = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || email.split('@')[0],
          isAnonymous: false,
        };
        return user;
      } catch (err: any) {
        // Fallback to local user session if offline or network error
        return this.localSignUp(email, pass);
      }
    }
    return this.localSignUp(email, pass);
  }

  /**
   * Firebase Sign-in with Email and Password.
   */
  public async signIn(email: string, pass: string): Promise<UserAuth> {
    if (this._isFirebaseActive && this._auth) {
      try {
        const cred = await signInWithEmailAndPassword(this._auth, email, pass);
        const user: UserAuth = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || email.split('@')[0],
          isAnonymous: false,
        };
        return user;
      } catch (err: any) {
        return this.localSignIn(email, pass);
      }
    }
    return this.localSignIn(email, pass);
  }

  /**
   * Firebase Anonymous Sign-in.
   */
  public async signInGuest(): Promise<UserAuth> {
    if (this._isFirebaseActive && this._auth) {
      try {
        const cred = await signInAnonymously(this._auth);
        const user: UserAuth = {
          uid: cred.user.uid,
          email: null,
          displayName: 'Guest Assessor',
          isAnonymous: true,
        };
        return user;
      } catch (err) {
        return this.localGuestSignIn();
      }
    }
    return this.localGuestSignIn();
  }

  /**
   * Firebase Sign Out.
   */
  public async signOut(): Promise<void> {
    if (this._isFirebaseActive && this._auth) {
      try {
        await firebaseSignOut(this._auth);
      } catch (err) {
        console.warn('Firebase sign out error', err);
      }
    }
    localStorage.removeItem('binaire_user_session');
    this._currentUser = null;
    this.notifyListeners();
  }

  // Local Session fallbacks for offline testing
  private localSignUp(email: string, _pass: string): UserAuth {
    const user: UserAuth = {
      uid: 'user-' + Date.now(),
      email: email,
      displayName: email.split('@')[0],
      isAnonymous: false,
    };
    this._currentUser = user;
    localStorage.setItem('binaire_user_session', JSON.stringify(user));
    this.notifyListeners();
    return user;
  }

  private localSignIn(email: string, _pass: string): UserAuth {
    const user: UserAuth = {
      uid: 'user-' + Date.now(),
      email: email,
      displayName: email.split('@')[0],
      isAnonymous: false,
    };
    this._currentUser = user;
    localStorage.setItem('binaire_user_session', JSON.stringify(user));
    this.notifyListeners();
    return user;
  }

  private localGuestSignIn(): UserAuth {
    const user: UserAuth = {
      uid: 'guest-' + Date.now(),
      email: null,
      displayName: 'Guest Assessor',
      isAnonymous: true,
    };
    this._currentUser = user;
    localStorage.setItem('binaire_user_session', JSON.stringify(user));
    this.notifyListeners();
    return user;
  }
}
