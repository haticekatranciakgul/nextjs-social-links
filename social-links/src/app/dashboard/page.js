"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import {
  TextField,
  Button,
  Box,
  Typography,
  Divider,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkIcon from "@mui/icons-material/Link";
import AddIcon from "@mui/icons-material/Add";
import DashboardLayout from "../../components/DashboardLayout";
import { db } from "../../lib/firebase";
import { doc, updateDoc, getDoc, collection, addDoc } from "firebase/firestore";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Profile State
  const [profileData, setProfileData] = useState({
    displayName: "",
    location: "",
    bio: "",
    instagram: "",
    github: "",
    linkedin: ""
  });

  // Link Form State
  const [linkForm, setLinkForm] = useState({
    title: "",
    subtitle: "",
    url: "",
    icon: "link"
  });

  // Loading States
  const [loading, setLoading] = useState(false);

  // Auth kontrolü
  useEffect(() => {
    console.log("Dashboard auth check:", {
      user: user?.email || 'No user',
      authLoading,
      timestamp: new Date().toISOString()
    });

    // Sadece loading bittikten sonra kontrol et
    if (!authLoading) {
      if (!user) {
        console.log("🚨 No user found - redirecting to login");
        router.replace("/login"); // replace kullan (back button sorununu önler)
      } else {
        console.log("✅ User authenticated:", user.email);
      }
    }
  }, [user, authLoading, router]);

  // User profile verilerini çek
  useEffect(() => {
    if (!user?.uid) return;

    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfileData({
            displayName: data.displayName || "",
            location: data.location || "",
            bio: data.bio || "",
            instagram: data.instagram || "",
            github: data.github || "",
            linkedin: data.linkedin || ""
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [user]);

  const handleProfileSave = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        ...profileData,
        updatedAt: new Date()
      });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLinkFormChange = (field, value) => {
    setLinkForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLinkSave = async () => {
    if (!user?.uid || !linkForm.title || !linkForm.url) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "users", user.uid, "links"), {
        title: linkForm.title,
        description: linkForm.subtitle,
        url: linkForm.url,
        icon: linkForm.icon,
        order: Date.now(),
        clicks: 0,
        createdAt: new Date()
      });

      // Reset form
      setLinkForm({
        title: "",
        subtitle: "",
        url: "",
        icon: "link"
      });

      alert("Link added successfully!");
    } catch (error) {
      console.error("Error adding link:", error);
      alert("Error adding link");
    } finally {
      setLoading(false);
    }
  };

  console.log("🏠 Dashboard component render:", {
    userEmail: user?.email || 'No user',
    authLoading,
    timestamp: new Date().toISOString()
  });

  if (authLoading) {
    console.log("⏳ Auth is loading...");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>🔄 Checking authentication...</div>
      </div>
    );
  }

  if (!user) {
    console.log("🚫 No user - showing redirect message");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>🔄 Redirecting to login...</div>
      </div>
    );
  }

  console.log("✅ Rendering dashboard for user:", user.email);

  return (
    <DashboardLayout currentPage="home">
      <Box >
        {/* Profile Section */}
        <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ color: 'white' }}>
          Profile Information
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
          <TextField
            fullWidth
            label="Display Name"
            value={profileData.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#8b5cf6' },
            }}
          />

          <TextField
            fullWidth
            label="Location"
            value={profileData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#8b5cf6' },
            }}
          />

          <TextField
            fullWidth
            label="Bio"
            value={profileData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            variant="outlined"
            multiline
            rows={3}
            placeholder="Tell something about yourself..."
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#8b5cf6' },
              '& .MuiOutlinedInput-input::placeholder': { color: 'rgba(255, 255, 255, 0.5)' },
            }}
          />
        </Box>

        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Contacts Section */}
        <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ color: 'white' }}>
          Contacts
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
          <TextField
            fullWidth
            label="Instagram"
            value={profileData.instagram}
            onChange={(e) => handleInputChange('instagram', e.target.value)}
            variant="outlined"
            placeholder="https://instagram.com/username"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <InstagramIcon sx={{ color: '#E1306C' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#8b5cf6' },
              '& .MuiOutlinedInput-input::placeholder': { color: 'rgba(255, 255, 255, 0.5)' },
            }}
          />

          <TextField
            fullWidth
            label="GitHub"
            value={profileData.github}
            onChange={(e) => handleInputChange('github', e.target.value)}
            variant="outlined"
            placeholder="https://github.com/username"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <GitHubIcon sx={{ color: '#333' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#8b5cf6' },
              '& .MuiOutlinedInput-input::placeholder': { color: 'rgba(255, 255, 255, 0.5)' },
            }}
          />

          <TextField
            fullWidth
            label="LinkedIn"
            value={profileData.linkedin}
            onChange={(e) => handleInputChange('linkedin', e.target.value)}
            variant="outlined"
            placeholder="https://linkedin.com/in/username"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkedInIcon sx={{ color: '#0077B5' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#8b5cf6' },
              '& .MuiOutlinedInput-input::placeholder': { color: 'rgba(255, 255, 255, 0.5)' },
            }}
          />
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={handleProfileSave}
          disabled={loading}
          sx={{
            background: 'linear-gradient(50deg, #4f1d94 30%, #40659f 90%)',
            color: 'white', 
            textTransform: 'none',
            fontSize: '16px',
            padding: '12px',
            borderRadius: '8px',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(90deg, #401560 0%, #2d5a88 100%)',
            },
            '&:disabled': {
              background: 'rgba(139, 92, 246, 0.5)',
            },

          }}

        >
          {loading ? "Saving..." : "Save Profile"}
        </Button>

        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Links Section */}
        <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ color: 'white' }}>
          Links
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
          <TextField
            fullWidth
            label="Link Title"
            value={linkForm.title}
            onChange={(e) => handleLinkFormChange('title', e.target.value)}
            placeholder="e.g., My Portfolio"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#8b5cf6' },
              '& .MuiOutlinedInput-input::placeholder': { color: 'rgba(255, 255, 255, 0.5)' },
            }}
          />

          <TextField
            fullWidth
            label="Subtitle (Optional)"
            value={linkForm.subtitle}
            onChange={(e) => handleLinkFormChange('subtitle', e.target.value)}
            placeholder="Brief description"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#8b5cf6' },
              '& .MuiOutlinedInput-input::placeholder': { color: 'rgba(255, 255, 255, 0.5)' },
            }}
          />

          <TextField
            fullWidth
            label="URL"
            value={linkForm.url}
            onChange={(e) => handleLinkFormChange('url', e.target.value)}
            placeholder="https://example.com"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#8b5cf6' },
              '& .MuiOutlinedInput-input::placeholder': { color: 'rgba(255, 255, 255, 0.5)' },
            }}
          />

          <FormControl fullWidth sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
              '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
              '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
            },
            '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
            '& .MuiInputLabel-root.Mui-focused': { color: '#8b5cf6' },
            '& .MuiSelect-icon': { color: 'rgba(255, 255, 255, 0.7)' },
          }}>
            <InputLabel>Icon</InputLabel>
            <Select
              value={linkForm.icon}
              label="Icon"
              onChange={(e) => handleLinkFormChange('icon', e.target.value)}
            >
              <MenuItem value="link">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinkIcon fontSize="small" />
                  Link
                </Box>
              </MenuItem>
              <MenuItem value="github">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GitHubIcon fontSize="small" />
                  GitHub
                </Box>
              </MenuItem>
              <MenuItem value="instagram">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InstagramIcon fontSize="small" />
                  Instagram
                </Box>
              </MenuItem>
              <MenuItem value="linkedin">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinkedInIcon fontSize="small" />
                  LinkedIn
                </Box>
              </MenuItem>
              <MenuItem value="youtube">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <YouTubeIcon fontSize="small" />
                  YouTube
                </Box>
              </MenuItem>
              <MenuItem value="twitter">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TwitterIcon fontSize="small" />
                  Twitter
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={handleLinkSave}
          disabled={loading || !linkForm.title || !linkForm.url}
          sx={{
            background: 'linear-gradient(50deg, #4f1d94 30%, #40659f 90%)',
            color: 'white',
            textTransform: 'none',
            fontSize: '16px',
            padding: '12px',
            borderRadius: '8px',
            fontWeight: 600,
            mb: 2,
            '&:hover': {
              background: 'linear-gradient(90deg, #401560 0%, #2d5a88 100%)',
            },
            '&:disabled': {
              background: 'rgba(139, 92, 246, 0.5)',
            },
          }}
        >
          {loading ? "Adding..." : "Add Link"}
        </Button>

       
      </Box>
    </DashboardLayout>
  );
}
