"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, Button, InputAdornment, Typography } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import AuthLayout from "../../components/AuthLayout";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !username) return;
    
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", user.uid), {
        email,
        username,
        createdAt: new Date(),
      });

      await setDoc(doc(db, "usernames", username), {
        uid: user.uid,
      });

      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const user = result.user;
      const username = user.displayName?.toLowerCase().replace(/\s+/g, '') || user.email?.split('@')[0];
      
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          username: username,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date(),
          provider: 'google'
        });
        
        await setDoc(doc(db, "usernames", username), {
          uid: user.uid,
        });
      }
      
      console.log("Google signup successful:", user.email);
      router.push("/");
    } catch (error) {
      console.error("Google signup error:", error);
      alert("Google signup failed: " + error.message);
    }
  };

  const handleFacebookSignUp = () => {
    console.log("Facebook sign up");
  };

  return (
    <AuthLayout title="SIGN UP" subtitle="Create your account to get started">
      <div className="space-y-6">
        <TextField
          fullWidth
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon sx={{ color: '#9ca3af' }} />
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
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
              '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
              '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
            },
            '& .MuiOutlinedInput-input::placeholder': { color: '#9ca3af', opacity: 1 },
          }}
        />

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
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
              '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
              '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
            },
            '& .MuiOutlinedInput-input::placeholder': { color: '#9ca3af', opacity: 1 },
          }}
        />

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
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
              '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
              '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
            },
            '& .MuiOutlinedInput-input::placeholder': { color: '#9ca3af', opacity: 1 },
          }}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleRegister}
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
            '&:hover': { background: 'linear-gradient(90deg, #401560 0%, #2d5a88 100%)' },
            '&:disabled': { background: 'rgba(139, 92, 246, 0.5)' },
          }}
        >
          {loading ? "Creating Account..." : "Sign up"}
        </Button>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-600"></div>
        </div>

        <div className="text-center mb-4">
          <Typography sx={{ 
            fontFamily: 'Poppins, sans-serif',
            fontSize: '12px', 
            color: '#B6B6B6' 
          }}>
            Or continue with
          </Typography>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outlined"
            onClick={handleGoogleSignUp}
            startIcon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.6 16.9 16.77 15.73 17.53V20.56H19.36C21.09 18.98 22.56 15.92 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23.25C15.04 23.25 17.51 22.21 19.36 20.56L15.73 17.53C14.61 18.25 13.13 18.68 12 18.68C9.05 18.68 6.59 16.82 5.69 14.36H2V17.42C3.82 21.03 7.61 23.25 12 23.25Z" fill="#34A853"/>
                <path d="M5.69 14.36C5.5 13.82 5.39 13.24 5.39 12.63C5.39 12.02 5.5 11.44 5.69 10.9V7.84H2C1.36 9.13 1 10.84 1 12.63C1 14.42 1.36 16.13 2 17.42L5.69 14.36Z" fill="#FBBC04"/>
                <path d="M12 6.58C13.52 6.58 14.89 7.13 15.95 8.13L19.31 4.77C17.5 3.09 15.03 2 12 2C7.61 2 3.82 4.22 2 7.84L5.69 10.9C6.59 8.44 9.05 6.58 12 6.58Z" fill="#EA4335"/>
              </svg>
            }
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
            onClick={handleFacebookSignUp}
            startIcon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M24 12C24 5.37258 18.6274 0 12 0S0 5.37258 0 12C0 17.991 4.38837 22.9541 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.658 4.6875C15.9701 4.6875 17.3438 4.9275 17.3438 4.9275V7.875H15.8309C14.34 7.875 13.875 8.8 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6116 22.9541 24 17.991 24 12Z" fill="#1877F2"/>
              </svg>
            }
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
        </div>

        <p className="text-center text-sm text-gray-300 mt-6">
          Already have an account?{" "}
          <span 
            className="text-blue-400 cursor-pointer hover:underline"
            onClick={() => router.push("/login")}
          >
            Sign in
          </span>
        </p>
      </div>
    </AuthLayout>
  );
}