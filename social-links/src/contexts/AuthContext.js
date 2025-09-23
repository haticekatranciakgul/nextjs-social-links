"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔥 AuthContext: Setting up Firebase listener");
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("🔄 Auth state changed:", {
        user: user?.email || "No user",
        uid: user?.uid || "No UID",
        timestamp: new Date().toISOString()
      });
      
      if (user) {
        // User is signed in
        console.log("✅ User authenticated, setting user state");
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
      } else {
        // User is signed out
        console.log("❌ User signed out, clearing user state");
        setUser(null);
      }
      setLoading(false);
      console.log("📊 Auth loading set to false");
    });

    // Cleanup subscription on unmount
    return () => {
      console.log("🧹 AuthContext: Cleaning up Firebase listener");
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};