"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { 
  Button, 
  Box, 
  Typography, 
  Avatar,
  IconButton,
  Container
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkIcon from "@mui/icons-material/Link";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import FacebookIcon from "@mui/icons-material/Facebook";
import MovieIcon from "@mui/icons-material/Movie";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TelegramIcon from "@mui/icons-material/Telegram";
import EditIcon from "@mui/icons-material/Edit";
import { db } from "../../../lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default function LinksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [links, setLinks] = useState([]);
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);

  // Auth kontrolünü kaldırıyoruz - artık herkese açık
  // useEffect(() => {
  //   if (!authLoading && !user) {
  //     router.push("/login");
  //   }
  // }, [user, authLoading, router]);

  // Profile ve Links'leri çek - user olmasa bile çalışacak şekilde düzenliyoruz
  const fetchData = useCallback(async () => {
    // Eğer user yoksa, default bir user ID kullanabiliriz veya URL'den alırız
    if (!user?.uid) {
      setLoading(false);
      return; // Şimdilik user yoksa boş bırakıyoruz
    }
    
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
      email: EmailIcon,
      mobile: PhoneIcon,
      facebook: FacebookIcon,
      discord: MovieIcon,
      tiktok: MovieIcon,
      whatsapp: WhatsAppIcon,
      telegram: TelegramIcon,
      link: LinkIcon
    };
    return icons[iconType] || LinkIcon;
  };

  const handleLinkClick = (url) => {
    // URL'nin başında http yoksa ekle
    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(finalUrl, '_blank');
  };

  // Loading durumunu sadece data loading için kullanıyoruz
  if (loading) {
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
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            padding: 4,
            textAlign: "center",
            border: "1px solid rgba(255, 255, 255, 0.2)"
          }}
        >
        {/* Profile Header - View Profile ile aynı */}
        <Avatar
          src={user?.photoURL || profileData.photoURL}
          sx={{
            width: 120,
            height: 120,
            mx: "auto",
            mb: 2,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            fontSize: "3rem",
            color: "white",
            border: "3px solid rgba(255, 255, 255, 0.3)"
          }}
        >
          {!profileData.photoURL && (profileData.displayName ? profileData.displayName.charAt(0).toUpperCase() : (profileData.username || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase())}
        </Avatar>

        <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", mb: 1 }}>
          {profileData.displayName || `@${profileData.username || user?.email?.split('@')[0] || 'user'}`}
        </Typography>

        <Typography variant="h6" sx={{ color: "rgba(255, 255, 255, 0.8)", mb: 1 }}>
          @{profileData.username || user?.email?.split('@')[0] || 'user'}
        </Typography>

        {profileData.location && (
          <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 2 }}>
            📍 {profileData.location}
          </Typography>
        )}

        {profileData.bio && (
          <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.9)", mb: 3 }}>
            {profileData.bio}
          </Typography>
        )}

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
          {profileData.email && (
            <IconButton 
              onClick={() => handleLinkClick(`mailto:${profileData.email}`)}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '&:hover': { 
                  backgroundColor: '#EA4335',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <EmailIcon />
            </IconButton>
          )}
          {profileData.mobile && (
            <IconButton 
              onClick={() => handleLinkClick(`tel:${profileData.mobile}`)}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '&:hover': { 
                  backgroundColor: '#4CAF50',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <PhoneIcon />
            </IconButton>
          )}
          {profileData.facebook && (
            <IconButton 
              onClick={() => handleLinkClick(profileData.facebook)}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '&:hover': { 
                  backgroundColor: '#1877F2',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <FacebookIcon />
            </IconButton>
          )}
          {profileData.discord && (
            <IconButton 
              onClick={() => handleLinkClick(profileData.discord)}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '&:hover': { 
                  backgroundColor: '#5865F2',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <MovieIcon />
            </IconButton>
          )}
          {profileData.tiktok && (
            <IconButton 
              onClick={() => handleLinkClick(profileData.tiktok)}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '&:hover': { 
                  backgroundColor: '#000000',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <MovieIcon />
            </IconButton>
          )}
          {profileData.youtube && (
            <IconButton 
              onClick={() => handleLinkClick(profileData.youtube)}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '&:hover': { 
                  backgroundColor: '#FF0000',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <YouTubeIcon />
            </IconButton>
          )}
          {profileData.whatsapp && (
            <IconButton 
              onClick={() => handleLinkClick(`https://wa.me/${profileData.whatsapp.replace(/[^0-9]/g, '')}`)}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '&:hover': { 
                  backgroundColor: '#25D366',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <WhatsAppIcon />
            </IconButton>
          )}
          {profileData.telegram && (
            <IconButton 
              onClick={() => handleLinkClick(profileData.telegram)}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '&:hover': { 
                  backgroundColor: '#0088CC',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <TelegramIcon />
            </IconButton>
          )}
        </Box>

        {/* Custom Links - Dikey */}
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
          {links.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                No links added yet
              </Typography>
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

      </Box>
    </Container>
  </Box>
  );
}