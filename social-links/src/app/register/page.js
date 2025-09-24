"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, Button, InputAdornment, Typography, Stack } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
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

        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <Button
            variant="outlined"
            onClick={handleGoogleSignUp}
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
            onClick={handleFacebookSignUp}
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