import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { ADMIN_UID, isUserAdmin } from '../lib/constants';
import { saveOrUpdateUserProfile } from '../lib/database';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isStudent: boolean;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Admin authority check directly from UID or configured admin emails
  const isAdmin = Boolean(currentUser && isUserAdmin(currentUser));
  const isStudent = Boolean(currentUser && !isAdmin);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Record login in database under users/{uid}
        try {
          await saveOrUpdateUserProfile(user.uid, {
            displayName: user.displayName || user.email?.split('@')[0] || 'Learner',
            email: user.email || '',
            photoURL: user.photoURL || '',
          });
        } catch (e) {
          console.warn('Could not update user profile record in database:', e);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), pass);
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (name && userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name.trim() });
      await saveOrUpdateUserProfile(userCredential.user.uid, {
        displayName: name.trim(),
        email: userCredential.user.email,
        photoURL: '',
      });
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        isStudent,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
