"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { 
  Button, 
  Box, 
  Typography, 
  Avatar,
  IconButton
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkIcon from "@mui/icons-material/Link";
import EditIcon from "@mui/icons-material/Edit";
import { db } from "../../../lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default function LinksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [links, setLinks] = useState([]);
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);

  // Auth kontrolü
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Profile ve Links'leri çek
  const fetchData = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      // Profile bilgilerini çek
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setProfileData(userDoc.data());
      }

      // Links'leri çek
      const querySnapshot = await getDocs(collection(db, "users", user.uid, "links"));
      const linksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLinks(linksData.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleLinkClick = (url) => {
    // URL'nin başında http yoksa ekle
    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(finalUrl, '_blank');
  };

  if (!user || authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <Typography variant="h6" sx={{ color: 'white' }}>Loading...</Typography>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Box 
        sx={{ 
          maxWidth: 400,
          width: '100%',
          padding: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3
        }}
      >
        {/* Profile Section */}
        <Box sx={{ mb: 4 }}>
          <Avatar
            src={user.photoURL || profileData.photoURL}
            sx={{ 
              width: 100, 
              height: 100, 
              mx: 'auto', 
              mb: 2,
              border: '3px solid rgba(255, 255, 255, 0.5)'
            }}
          >
            {(profileData.displayName || user.displayName)?.[0] || user.email?.[0] || 'U'}
          </Avatar>
          
          <Typography 
            variant="h5" 
            sx={{ color: 'white', fontWeight: 'bold', mb: 1, textAlign: 'center' }}
          >
            @{profileData.username || user.email?.split('@')[0] || 'user'}
          </Typography>

          {profileData.displayName && (
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 1, textAlign: 'center' }}>
              {profileData.displayName}
            </Typography>
          )}

          {profileData.bio && (
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3, maxWidth: 300, mx: 'auto', textAlign: 'center' }}>
              {profileData.bio}
            </Typography>
          )}
        </Box>

        {/* Social Media Icons - Yatay */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
          {profileData.github && (
            <IconButton 
              onClick={() => handleLinkClick(profileData.github)}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '&:hover': { 
                  backgroundColor: '#333',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <GitHubIcon />
            </IconButton>
          )}
          {profileData.instagram && (
            <IconButton 
              onClick={() => handleLinkClick(profileData.instagram)}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '&:hover': { 
                  backgroundColor: '#E1306C',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <InstagramIcon />
            </IconButton>
          )}
          {profileData.linkedin && (
            <IconButton 
              onClick={() => handleLinkClick(profileData.linkedin)}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '&:hover': { 
                  backgroundColor: '#0077B5',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <LinkedInIcon />
            </IconButton>
          )}
        </Box>

        {/* Custom Links - Dikey */}
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
          {links.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
                No links added yet
              </Typography>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => router.push('/dashboard')}
                sx={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.3)',
                  }
                }}
              >
                Add Your First Link
              </Button>
            </Box>
          ) : (
            links.map((link) => {
              const IconComponent = getIconComponent(link.icon);
              return (
                <Button
                  key={link.id}
                  fullWidth
                  onClick={() => handleLinkClick(link.url)}
                  startIcon={<IconComponent />}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    textTransform: 'none',
                    fontSize: '16px',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    justifyContent: 'flex-start',
                    gap: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box sx={{ textAlign: 'left', flex: 1 }}>
                    <Typography variant="body1" fontWeight="600">
                      {link.title}
                    </Typography>
                    {link.description && (
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {link.description}
                      </Typography>
                    )}
                  </Box>
                </Button>
              );
            })
          )}
        </Box>

        {/* Edit Profile Button */}
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => router.push('/dashboard')}
          sx={{
            borderColor: 'rgba(255, 255, 255, 0.3)',
            color: 'white',
            '&:hover': {
              borderColor: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          Edit Profile & Links
        </Button>
      </Box>
    </div>
  );
}