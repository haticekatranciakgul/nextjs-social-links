"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, Button, InputAdornment, Typography, Stack } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import AuthLayout from "../../components/AuthLayout";
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
    <AuthLayout title="SIGN IN" subtitle="Log in with email address">
      <div className="space-y-6">
        {/* Email Input */}
        <TextField
          fullWidth
          placeholder="E-mail"
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
            width: '460px',
            maxWidth: '100%',
            mb: 3,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              color: 'white',
              height: '56px',
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
            width: '460px',
            maxWidth: '100%',
            mb: 4,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              color: 'white',
              height: '56px',
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

        {/* Sign In Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          disabled={loading}
          sx={{
            width: '460px',
            maxWidth: '100%',
            background: 'linear-gradient(90deg, #501794 0%, #3E70A1 100%)',
            color: 'white',
            textTransform: 'none',
            fontSize: '16px',
            padding: '16px',
            borderRadius: '12px',
            fontWeight: 600,
            height: '56px',
            mb: 4,
            '&:hover': {
              background: 'linear-gradient(90deg, #401560 0%, #2d5a88 100%)',
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
        </div>

        {/* Or continue with text */}
        <div className="text-center mb-4">
          <Typography sx={{ 
            fontFamily: 'Poppins, sans-serif',
            fontSize: '12px', 
            color: '#B6B6B6' 
          }}>
            Or continue with
          </Typography>
        </div>

        {/* Social Buttons */}
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <Button
            variant="outlined"
            onClick={handleGoogleSignIn}
            startIcon={<GoogleIcon />}
            sx={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              textTransform: 'none',
              height: '56px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            Google
          </Button>

          <Button
            variant="outlined"
            onClick={handleFacebookSignIn}
            startIcon={<FacebookIcon />}
            sx={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              textTransform: 'none',
              height: '56px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            Facebook
          </Button>
        </Stack>

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