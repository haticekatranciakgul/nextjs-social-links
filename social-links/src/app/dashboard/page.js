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
  MenuItem,
  Avatar,
  CircularProgress
} from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkIcon from "@mui/icons-material/Link";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import PersonIcon from "@mui/icons-material/Person";
import DashboardLayout from "../../components/DashboardLayout";
import { db } from "../../lib/firebase";
import { doc, updateDoc, getDoc, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";

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
    linkedin: "",
    username: "",
    photoURL: ""
  });

  // Profile photo upload state
  const [photoFile, setPhotoFile] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Link Forms State - Array of link objects  
  const [linkForms, setLinkForms] = useState([{
    id: Date.now(),
    title: "",
    subtitle: "",
    url: "",
    icon: "link"
  }]);
  // Existing Links State
  const [existingLinks, setExistingLinks] = useState([]);

  // Loading States
  const [loading, setLoading] = useState(false);

  // Auth control
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
        router.replace("/login"); // use replace (prevents back button issues)
      } else {
        console.log("✅ User authenticated:", user.email);
      }
    }
  }, [user, authLoading, router]);

  // Fetch user profile data
  useEffect(() => {
    if (!user?.uid) return;

    const fetchData = async () => {
      try {
        // Fetch profile information
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfileData({
            displayName: data.displayName || "",
            location: data.location || "",
            bio: data.bio || "",
            instagram: data.instagram || "",
            github: data.github || "",
            linkedin: data.linkedin || "",
            username: data.username || "",
            photoURL: data.photoURL || user.photoURL || ""
          });
        }

        // Fetch existing links
        const linksSnapshot = await getDocs(collection(db, "users", user.uid, "links"));
        const linksData = linksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExistingLinks(linksData.sort((a, b) => (a.order || 0) - (b.order || 0)));

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [user]);

  const handleProfileSave = async () => {
    if (!user?.uid) return;

    console.log("🔄 Starting profile save...", {
      hasPhotoFile: !!photoFile,
      profileData
    });

    setLoading(true);
    try {
      let updatedData = { ...profileData };
      
      // If new photo is selected, upload it
      if (photoFile) {
        console.log("📸 Photo file detected, starting upload...");
        const photoURL = await uploadProfilePhoto();
        if (photoURL) {
          console.log("✅ Photo uploaded, URL:", photoURL);
          updatedData.photoURL = photoURL;
          setProfileData(prev => ({ ...prev, photoURL }));
        } else {
          console.log("❌ Photo upload failed");
          alert("Photo could not be uploaded, saving other information...");
        }
      }

      console.log("💾 Saving to Firestore...", updatedData);
      await updateDoc(doc(db, "users", user.uid), {
        ...updatedData,
        updatedAt: new Date()
      });
      console.log("✅ Profile saved successfully");
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      alert(`Error updating profile: ${error.message}`);
    } finally {
      setLoading(false);
      console.log("🏁 Profile save process finished");
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Profile photo upload
  const handlePhotoSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // File type and size control
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be smaller than 5MB.');
        return;
      }
      setPhotoFile(file);
    }
  };

  const uploadProfilePhoto = async () => {
    if (!photoFile || !user?.uid) return null;

    console.log("🔄 Starting photo upload (Base64 method)...", {
      fileName: photoFile.name,
      fileSize: photoFile.size,
      fileType: photoFile.type
    });

    setPhotoUploading(true);
    try {
      // Convert to Base64
      const base64 = await convertToBase64(photoFile);
      console.log("✅ File converted to Base64");
      
      setPhotoFile(null); // Clear file
      return base64;
    } catch (error) {
      console.error("❌ Error converting photo:", error);
      alert(`Error processing photo: ${error.message}`);
      return null;
    } finally {
      setPhotoUploading(false);
    }
  };

  // Base64 converter helper
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Add new link form
  const addNewLinkForm = () => {
    const newId = Date.now();
    setLinkForms(prev => [...prev, {
      id: newId,
      title: "",
      subtitle: "",
      url: "",
      icon: "link"
    }]);
  };

  // Remove link form
  const removeLinkForm = (id) => {
    setLinkForms(prev => prev.filter(form => form.id !== id));
  };

  // Update link form
  const updateLinkForm = (id, field, value) => {
    setLinkForms(prev => prev.map(form => 
      form.id === id ? { ...form, [field]: value } : form
    ));
  };

  // Delete existing link
  const deleteExistingLink = async (linkId) => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      await deleteDoc(doc(db, "users", user.uid, "links", linkId));
      setExistingLinks(prev => prev.filter(link => link.id !== linkId));
      alert("Link deleted successfully!");
    } catch (error) {
      console.error("Error deleting link:", error);
      alert("Error deleting link");
    } finally {
      setLoading(false);
    }
  };

  // Update existing link
  const updateExistingLink = (id, field, value) => {
    setExistingLinks(prev => prev.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  // Save existing link changes
  const saveExistingLink = async (linkId) => {
    if (!user?.uid) return;

    const linkToUpdate = existingLinks.find(link => link.id === linkId);
    if (!linkToUpdate) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid, "links", linkId), {
        title: linkToUpdate.title,
        description: linkToUpdate.description,
        url: linkToUpdate.url,
        icon: linkToUpdate.icon,
        updatedAt: new Date()
      });
      alert("Link updated successfully!");
    } catch (error) {
      console.error("Error updating link:", error);
      alert("Error updating link");
    } finally {
      setLoading(false);
    }
  };

  // Save all existing links changes
  const saveAllExistingLinks = async () => {
    if (!user?.uid || existingLinks.length === 0) return;

    setLoading(true);
    try {
      const promises = existingLinks.map(link => 
        updateDoc(doc(db, "users", user.uid, "links", link.id), {
          title: link.title,
          description: link.description,
          url: link.url,
          icon: link.icon,
          updatedAt: new Date()
        })
      );
      
      await Promise.all(promises);
      alert("All links updated successfully!");
    } catch (error) {
      console.error("Error updating links:", error);
      alert("Error updating links");
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconType) => {
    const icons = {
      github: GitHubIcon,
      instagram: InstagramIcon,
      linkedin: LinkedInIcon,
      youtube: YouTubeIcon,
      twitter: TwitterIcon,
      link: LinkIcon
    };
    return icons[iconType] || LinkIcon;
  };

  // Save all links
  const saveAllLinks = async () => {
    if (!user?.uid) return;
    
    const validLinks = linkForms.filter(form => form.title && form.url);
    if (validLinks.length === 0) return;

    setLoading(true);
    try {
      const promises = validLinks.map(link => 
        addDoc(collection(db, "users", user.uid, "links"), {
          title: link.title,
          description: link.subtitle,
          url: link.url,
          icon: link.icon,
          order: Date.now(),
          clicks: 0,
          createdAt: new Date()
        })
      );
      
      await Promise.all(promises);
      
      // Refresh existing links
      const linksSnapshot = await getDocs(collection(db, "users", user.uid, "links"));
      const linksData = linksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExistingLinks(linksData.sort((a, b) => (a.order || 0) - (b.order || 0)));
      
      setLinkForms([]);
      alert(`${validLinks.length} link(s) added successfully!`);
    } catch (error) {
      console.error("Error adding links:", error);
      alert("Error adding links");
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
      <Box>
        {/* Public Profile Link Section */}
        {profileData.username && (
          <Box
            sx={{
              backgroundColor: "rgba(139, 92, 246, 0.2)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              borderRadius: "12px",
              padding: 3,
              mb: 4,
              textAlign: "center"
            }}
          >
            <Typography variant="h6" sx={{ color: "white", fontWeight: "bold", mb: 1 }}>
              🌐 Public Profile
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.8)", mb: 2 }}>
              Share profile link :
            </Typography>
            <Box
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                padding: "8px 16px",
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.15)" }
              }}
              onClick={() => {
                const url = `${window.location.origin}/${profileData.username}`;
                navigator.clipboard.writeText(url);
                alert("Link copied!");
              }}
            >
              <Typography variant="body1" sx={{ color: "white", fontFamily: "monospace" }}>
                {window.location?.origin}/{profileData.username}
              </Typography>
              <LinkIcon sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "1rem" }} />
            </Box>
            <Button
              variant="outlined"
              size="small"
              sx={{
                mt: 2,
                borderColor: "rgba(139, 92, 246, 0.5)",
                color: "white",
                "&:hover": { borderColor: "#8b5cf6", backgroundColor: "rgba(139, 92, 246, 0.1)" }
              }}
              onClick={() => window.open(`${window.location.origin}/${profileData.username}`, '_blank')}
            >
              View Profile
            </Button>
          </Box>
        )}

        {/* Profile Section */}
        <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ color: 'white' }}>
          Profile Information
        </Typography>

        {/* Profile Photo Section */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          mb: 4,
          p: 3,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)'
        }}>
         
          
          <Box sx={{ position: 'relative', mb: 2 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '3px solid #8b5cf6',
                fontSize: '3rem'
              }}
              src={photoFile ? URL.createObjectURL(photoFile) : profileData.photoURL}
            >
              {!photoFile && !profileData.photoURL && (
                profileData.displayName ? 
                profileData.displayName.charAt(0).toUpperCase() : 
                <PersonIcon sx={{ fontSize: '3rem' }} />
              )}
            </Avatar>
            
            {photoUploading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  borderRadius: '50%'
                }}
              >
                <CircularProgress size={40} sx={{ color: '#8b5cf6' }} />
              </Box>
            )}
          </Box>

          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="profile-photo-upload"
            type="file"
            onChange={handlePhotoSelect}
          />
          <label htmlFor="profile-photo-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<PhotoCameraIcon />}
              disabled={photoUploading}
              sx={{
                borderColor: 'rgba(139, 92, 246, 0.5)',
                color: 'white',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#8b5cf6',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)'
                }
              }}
            >
              {photoFile ? 'Change Photo' : 'Select Photo'}
            </Button>
          </label>
          
          {photoFile && (
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1, textAlign: 'center' }}>
              Selected: {photoFile.name}<br />
              Click &quot;Save Profile&quot; button to save
            </Typography>
          )}
        </Box>

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

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Button
            variant="contained"
            onClick={handleProfileSave}
            disabled={loading}
            sx={{
              background: 'linear-gradient(50deg, #4f1d94 30%, #40659f 90%)',
              color: 'white', 
              textTransform: 'none',
              fontSize: '14px',        // 16px'den 14px'e düşürdüm
              padding: '8px 16px',     // 12px'den 8px 16px'e değiştirdim
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

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={handleProfileSave}
            disabled={loading}
            sx={{
              background: 'linear-gradient(50deg, #4f1d94 30%, #40659f 90%)',
              color: 'white', 
              textTransform: 'none',
              fontSize: '14px',        // 16px'den 14px'e düşürdüm
              padding: '8px 16px',     // 12px'den 8px 16px'e değiştirdim
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
            {loading ? "Saving..." : "Save Contacts"}
          </Button>
        </Box>

        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Links Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
            Links
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={addNewLinkForm}
            sx={{
              background: 'linear-gradient(50deg, #4f1d94 30%, #40659f 90%)',
              color: 'white',
              textTransform: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              '&:hover': {
                background: 'linear-gradient(90deg, #401560 0%, #2d5a88 100%)',
              },
            }}
          >
            Add New
          </Button>
        </Box>

        {/* Existing Links as Editable Forms */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
          {existingLinks.map((link) => (
            <Box
              key={link.id}
              sx={{
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                p: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }}
            >
              <TextField
                fullWidth
                label="Link Title"
                value={link.title || ''}
                onChange={(e) => updateExistingLink(link.id, 'title', e.target.value)}
                placeholder="e.g., My Portfolio"
                sx={{
                  mb: 3,
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
                value={link.description || ''}
                onChange={(e) => updateExistingLink(link.id, 'description', e.target.value)}
                placeholder="Brief description"
                sx={{
                  mb: 3,
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
                value={link.url || ''}
                onChange={(e) => updateExistingLink(link.id, 'url', e.target.value)}
                placeholder="https://example.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
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
                mb: 3,
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
                  value={link.icon || 'link'}
                  label="Icon"
                  onChange={(e) => updateExistingLink(link.id, 'icon', e.target.value)}
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

              {/* Only Remove Button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DeleteIcon fontSize="small" />}
                  onClick={() => deleteExistingLink(link.id)}
                  sx={{
                    borderColor: 'rgba(244, 67, 54, 0.5)',
                    color: 'rgba(244, 67, 54, 0.8)',
                    textTransform: 'none',
                    fontSize: '12px',
                    '&:hover': {
                      borderColor: '#f44336',
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    }
                  }}
                >
                  Remove
                </Button>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Save Changes Button for Existing Links */}
        {existingLinks.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Button
              variant="contained"
              onClick={saveAllExistingLinks}
              disabled={loading}
              sx={{
                background: 'linear-gradient(50deg, #4f1d94 30%, #40659f 90%)',
                color: 'white', 
                textTransform: 'none',
                fontSize: '14px',
                padding: '8px 16px',
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        )}

        {/* Dynamic Link Forms - New Links */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
          {linkForms.map((form) => (
            <Box
              key={form.id}
              sx={{
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                p: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }}
            >
              <TextField
                fullWidth
                label="Link Title"
                value={form.title}
                onChange={(e) => updateLinkForm(form.id, 'title', e.target.value)}
                placeholder="e.g., My Portfolio"
                sx={{
                  mb: 3,
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
                value={form.subtitle}
                onChange={(e) => updateLinkForm(form.id, 'subtitle', e.target.value)}
                placeholder="Brief description"
                sx={{
                  mb: 3,
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
                value={form.url}
                onChange={(e) => updateLinkForm(form.id, 'url', e.target.value)}
                placeholder="https://example.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
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
                mb: 3,
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
                  value={form.icon}
                  label="Icon"
                  onChange={(e) => updateLinkForm(form.id, 'icon', e.target.value)}
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

              {/* Remove Button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DeleteIcon fontSize="small" />}
                  onClick={() => removeLinkForm(form.id)}
                  sx={{
                    borderColor: 'rgba(244, 67, 54, 0.5)',
                    color: 'rgba(244, 67, 54, 0.8)',
                    textTransform: 'none',
                    fontSize: '12px',
                    '&:hover': {
                      borderColor: '#f44336',
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    }
                  }}
                >
                  Remove
                </Button>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Save Button - Only show if there are new forms */}
        {linkForms.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={saveAllLinks}
              disabled={loading}
              sx={{
                background: 'linear-gradient(50deg, #4f1d94 30%, #40659f 90%)',
                color: 'white',
                textTransform: 'none',
                fontSize: '14px',
                padding: '8px 16px',
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
              {loading ? "Saving..." : "Save New Links"}
            </Button>
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}
