"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, Button, InputAdornment, Typography, Stack, Divider, Alert } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import AuthLayout from "../../components/AuthLayout";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useForm, Controller } from "react-hook-form";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    severity: "error" // "error", "warning", "info", "success"
  });

  // React Hook Form integration
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: ""
    }
  });

  const checkUsernameAvailability = async (username) => {
    try {
      const usernameDoc = await getDoc(doc(db, "usernames", username.toLowerCase()));
      return !usernameDoc.exists();
    } catch (error) {
      console.error("Error checking username:", error);
      return false;
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
            // Username check
      const isUsernameAvailable = await checkUsernameAvailability(data.username);
      if (!isUsernameAvailable) {
        setAlertState({
          open: true,
          message: `"${data.username}" username is already taken. Please try a different username.`,
          severity: "error"
        });
        setLoading(false);
        return;
      }

      const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password);

      await setDoc(doc(db, "users", user.uid), {
        email: data.email,
        username: data.username.toLowerCase(), // Convert to lowercase
        createdAt: new Date(),
        provider: 'email'
      });

      await setDoc(doc(db, "usernames", data.username.toLowerCase()), { // Convert to lowercase
        uid: user.uid,
      });

      // Success message
      setAlertState({
        open: true,
        message: "Account created successfully! Redirecting to sign in page...",
        severity: "success"
      });
      
      setTimeout(() => {
        router.push("/login");  // Redirect to login page instead of home page
      }, 1500);
    } catch (error) {
      console.error(error);
      
      // Make Firebase error codes more understandable
      let errorMessage = error.message;
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email has already been registered. Please sign in or use a different email address.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password with at least 6 characters.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format. Please enter a valid email address.";
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage = "Registration with email and password is currently disabled.";
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

  const handleGoogleSignUp = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const user = result.user;
      const username = user.displayName?.toLowerCase().replace(/\s+/g, '') || user.email?.split('@')[0];
      
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Username check for Google
        const isUsernameAvailable = await checkUsernameAvailability(username);
        if (!isUsernameAvailable) {
          // Username alınmış ise rastgele numara ekle
          let counter = 1;
          let newUsername = `${username}${counter}`;
          while (!(await checkUsernameAvailability(newUsername))) {
            counter++;
            newUsername = `${username}${counter}`;
          }
          username = newUsername;
        }
        
        await setDoc(userDocRef, {
          email: user.email,
          username: username.toLowerCase(), // Küçük harfe çevir
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date(),
          provider: 'google'
        });
        
        await setDoc(doc(db, "usernames", username.toLowerCase()), { // Küçük harfe çevir
          uid: user.uid,
        });
      }
      
      // Success message
      setAlertState({
        open: true,
        message: "Google sign up successful! Redirecting to login page...",
        severity: "success"
      });
      
      console.log("Redirection starting...");
      
      // Shorter duration and different redirect target
      setTimeout(() => {
        console.log("Redirecting to login page...");
        router.push("/login");  // Use "/login" instead of "/"
      }, 1000);  // 1000ms instead of 1500ms
    } catch (error) {
      console.error("Google signup error:", error);
      
      // Special error messages for Google signup
      let errorMessage = error.message;
      
      if (error.code === "auth/account-exists-with-different-credential") {
        errorMessage = "This email has been previously registered with a different method. Please try the other sign-in method.";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email has already been registered. Please sign in or use a different email address.";
      } else if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Google sign-in window was closed. Please try again.";
      } else if (error.code === "auth/cancelled-popup-request") {
        errorMessage = "Operation canceled. Please try again.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Your browser blocked the popup window. Please check your popup permissions.";
      }
      
      setAlertState({
        open: true,
        message: errorMessage,
        severity: "error"
      });
    }
  };

  const handleFacebookSignUp = () => {
    console.log("Facebook sign up");
  };

  return (
    <AuthLayout title="SIGN UP" subtitle="Create your account to get started">
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
          <Controller
            name="username"
            control={control}
            rules={{ 
              required: "Username is required",
              minLength: { 
                value: 3, 
                message: "Username must be at least 3 characters" 
              },
              pattern: { 
                value: /^[a-z0-9_]+$/, 
                message: "Kullanıcı adı sadece küçük harf, rakam ve _ içerebilir (Türkçe karakter kullanmayın)" 
              }
            }}
            render={({ field }) => (
              <TextField
                fullWidth
                placeholder="Username"
                error={!!errors.username}
                helperText={errors.username?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: errors.username ? 'error.main' : '#9ca3af' }} />
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
                    '& fieldset': { borderColor: errors.username ? 'error.main' : 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: errors.username ? 'error.main' : 'rgba(255, 255, 255, 0.3)' },
                    '&.Mui-focused fieldset': { borderColor: errors.username ? 'error.main' : '#8b5cf6' },
                  },
                  '& .MuiOutlinedInput-input::placeholder': { color: '#9ca3af', opacity: 1 },
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
                    '& fieldset': { borderColor: errors.email ? 'error.main' : 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: errors.email ? 'error.main' : 'rgba(255, 255, 255, 0.3)' },
                    '&.Mui-focused fieldset': { borderColor: errors.email ? 'error.main' : '#8b5cf6' },
                  },
                  '& .MuiOutlinedInput-input::placeholder': { color: '#9ca3af', opacity: 1 },
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

          <Controller
            name="password"
            control={control}
            rules={{ 
              required: "Password is required",
              minLength: { 
                value: 6, 
                message: "Password must be at least 6 characters" 
              }
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
                    '& fieldset': { borderColor: errors.password ? 'error.main' : 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: errors.password ? 'error.main' : 'rgba(255, 255, 255, 0.3)' },
                    '&.Mui-focused fieldset': { borderColor: errors.password ? 'error.main' : '#8b5cf6' },
                  },
                  '& .MuiOutlinedInput-input::placeholder': { color: '#9ca3af', opacity: 1 },
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

          <Button
            fullWidth
            variant="contained"
            type="submit"
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
        </form>

        <Divider></Divider>

        <div className="text-center">
          <Typography sx={{ 
            fontFamily: 'Poppins, sans-serif',
            fontSize: '12px', 
            color: '#B6B6B6' ,my:2
          }}>
            Or continue with
          </Typography>
        </div>

        <Stack direction="row" spacing={2} sx={{ width: '100%',mb:4 }}>
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

        <Typography variant="body2" sx={{ textAlign: 'center', color: '#9CA3AF' }}>
          Already have an account?{" "}
          <Typography 
            component="span"
            variant="body2"
            sx={{ 
              color: '#9D5CE9',
              cursor: 'pointer',
              '&:hover': { 
                textDecoration: 'underline'
              }
            }}
            onClick={() => router.push("/login")}
          >
            Sign in
          </Typography>
        </Typography>
      </div>
    </AuthLayout>
  );
}