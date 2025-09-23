"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, Button, InputAdornment, Checkbox, FormControlLabel } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import AuthLayout from "../../components/AuthLayout";
import SocialButtons from "../../components/SocialButtons";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Firebase Auth Context otomatik olarak user state'i güncelleyecek
      console.log("Login successful");
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Kullanıcı bilgilerini al
      const user = result.user;
      const username = user.displayName?.toLowerCase().replace(/\s+/g, '') || user.email?.split('@')[0];
      
      // Firestore'da kullanıcı var mı kontrol et
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Yeni kullanıcı - Firestore'a kaydet
        await setDoc(userDocRef, {
          email: user.email,
          username: username,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date(),
          provider: 'google'
        });
        
        // Username mapping
        await setDoc(doc(db, "usernames", username), {
          uid: user.uid,
        });
      }
      
      // Firebase Auth Context otomatik olarak user state'i güncelleyecek
      console.log("Google login successful:", user.email);
      router.push("/dashboard");
    } catch (error) {
      console.error("Google login error:", error);
      alert("Google login failed: " + error.message);
    }
  };

  const handleFacebookSignIn = () => {
    // Facebook sign-in logic will be added later
    console.log("Facebook sign in");
  };

  return (
    <AuthLayout title="SIGN IN" subtitle="Welcome back! Please sign in to your account">
      <div className="space-y-6">
        {/* Email Input */}
        <TextField
          fullWidth
          placeholder="Yourname@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon sx={{ color: '#9ca3af' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              color: 'white',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#8b5cf6',
              },
            },
            '& .MuiOutlinedInput-input::placeholder': {
              color: '#9ca3af',
              opacity: 1,
            },
          }}
        />

        {/* Password Input */}
        <TextField
          fullWidth
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: '#9ca3af' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              color: 'white',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#8b5cf6',
              },
            },
            '& .MuiOutlinedInput-input::placeholder': {
              color: '#9ca3af',
              opacity: 1,
            },
          }}
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                sx={{
                  color: '#9ca3af',
                  '&.Mui-checked': {
                    color: '#8b5cf6',
                  },
                }}
              />
            }
            label={
              <span className="text-gray-300 text-sm">Remember me</span>
            }
          />
          <span className="text-blue-400 text-sm cursor-pointer hover:underline">
            Forgot password?
          </span>
        </div>

        {/* Sign In Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          disabled={loading}
          sx={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
            color: 'white',
            textTransform: 'none',
            fontSize: '16px',
            padding: '14px',
            borderRadius: '12px',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
            },
            '&:disabled': {
              background: 'rgba(139, 92, 246, 0.5)',
            },
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-600"></div>
          <span className="px-4 text-gray-400 text-sm">Or continue with</span>
          <div className="flex-1 h-px bg-gray-600"></div>
        </div>

        {/* Social Buttons */}
        <SocialButtons 
          onGoogleClick={handleGoogleSignIn}
          onFacebookClick={handleFacebookSignIn}
        />

        {/* Register Link */}
        <p className="text-center text-sm text-gray-300 mt-6">
          Don&apos;t have an account?{" "}
          <span 
            className="text-blue-400 cursor-pointer hover:underline"
            onClick={() => router.push("/register")}
          >
            Sign up
          </span>
        </p>
      </div>
    </AuthLayout>
  );
}