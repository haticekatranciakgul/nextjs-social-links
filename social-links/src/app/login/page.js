"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, Button, InputAdornment, Typography, Stack, Divider, Alert } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import AuthLayout from "../../components/AuthLayout";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useForm, Controller } from "react-hook-form";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    severity: "error" // "error", "warning", "info", "success"
  });

  // React Hook Form entegrasyonu
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      
      // Başarılı giriş mesajı
      setAlertState({
        open: true,
        message: "Login successful! Redirecting to dashboard...",
        severity: "success"
      });
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      
      // Firebase hata kodlarına göre özel mesajlar
      let errorMessage = error.message;
      
      if (error.code === "auth/invalid-credential") {
        errorMessage = "Email or password is incorrect. Please check your credentials.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address. Please sign up first.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please check your password.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later.";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "This account has been disabled.";
      }
      
      setAlertState({
        open: true,
        message: errorMessage,
        severity: "error"
      });
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
        // User registration - Saving to Firestore
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
      
      // Success message
      setAlertState({
        open: true,
        message: "Google login successful! Redirecting to dashboard...",
        severity: "success"
      });
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Google login error:", error);
      setAlertState({
        open: true,
        message: `Google login failed: ${error.message}`,
        severity: "error"
      });
    }
  };

  const handleFacebookSignIn = () => {
    // Facebook sign-in logic will be added later
    console.log("Facebook sign in");
  };

  return (
    <AuthLayout title="SIGN IN" subtitle="Log in with email address">
      <div className="space-y-6">
        {alertState.open && (
          <Alert 
            severity={alertState.severity} 
            onClose={() => setAlertState(prev => ({...prev, open: false}))}
            sx={{ mb: 2 }}
          >
            {alertState.message}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Email Input */}
          <Controller
            name="email"
            control={control}
            rules={{ 
              required: "Email is required",
              pattern: { 
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                message: "Invalid email address" 
              }
            }}
            render={({ field }) => (
              <TextField
                fullWidth
                placeholder="E-mail"
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: errors.email ? 'error.main' : '#9ca3af' }} />
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
                      borderColor: errors.email ? 'error.main' : 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: errors.email ? 'error.main' : 'rgba(255, 255, 255, 0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: errors.email ? 'error.main' : '#8b5cf6',
                    },
                  },
                  '& .MuiOutlinedInput-input::placeholder': {
                    color: '#9ca3af',
                    opacity: 1,
                  },
                  '& .MuiFormHelperText-root': {
                    color: 'error.main',
                    marginLeft: 1,
                    marginTop: 0.5
                  }
                }}
                {...field}
              />
            )}
          />

          {/* Password Input */}
          <Controller
            name="password"
            control={control}
            rules={{ 
              required: "Password is required"
            }}
            render={({ field }) => (
              <TextField
                fullWidth
                type="password"
                placeholder="Password"
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: errors.password ? 'error.main' : '#9ca3af' }} />
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
                      borderColor: errors.password ? 'error.main' : 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: errors.password ? 'error.main' : 'rgba(255, 255, 255, 0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: errors.password ? 'error.main' : '#8b5cf6',
                    },
                  },
                  '& .MuiOutlinedInput-input::placeholder': {
                    color: '#9ca3af',
                    opacity: 1,
                  },
                  '& .MuiFormHelperText-root': {
                    color: 'error.main',
                    marginLeft: 1,
                    marginTop: 0.5
                  }
                }}
                {...field}
              />
            )}
          />

          {/* Sign In Button */}
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{
              width: '460px',
              maxWidth: '100%',
              background: 'linear-gradient(50deg, #4f1d94 30%, #40659f 90%)',
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
        </form>

        {/* Divider */}
        <Divider></Divider>

        {/* Or continue with text */}
        <div className="text-center">
          <Typography sx={{ 
            fontFamily: 'Poppins, sans-serif',
            fontSize: '12px', 
            color: '#B6B6B6', my:2
          }}>
            Or continue with
          </Typography>
        </div>

        {/* Social Buttons */}
        <Stack direction="row" spacing={2} sx={{ width: '100%',mb:4  }}>
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
        <Typography variant="body2" sx={{ textAlign: 'center', color: '#9CA3AF' }}>
          Don&apos;t have an account?{" "}
          <Typography 
            component="span"
            variant="body2"
            sx={{ 
              color: '#9D5CE9', // blue-400 renk değeri
              cursor: 'pointer',
              '&:hover': { 
                textDecoration: 'underline'
              }
            }}
            onClick={() => router.push("/register")}
            >
            Sign up
          </Typography>
        </Typography>
      </div>
    </AuthLayout>
  );
}