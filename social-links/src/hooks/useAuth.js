// /hooks/useAuth.js
import { useDispatch } from "react-redux";
import { auth } from "../lib/firebase";
import { setUser, clearUser } from "../features/auth/authSlice";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect } from "react";

export function useAuth() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setUser(user));
      } else {
        dispatch(clearUser());
      }
    });
    return () => unsub();
  }, [dispatch]);

  const logout = () => signOut(auth);

  return { logout };
}
