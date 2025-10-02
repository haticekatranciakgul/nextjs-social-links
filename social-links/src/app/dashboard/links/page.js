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
  Container,
  Tooltip
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
  const [contactsOrder, setContactsOrder] = useState([
    'instagram', 'github', 'linkedin', 'email', 'mobile', 
    'facebook', 'discord', 'tiktok', 'youtube', 'whatsapp', 'telegram'
  ]);

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
        const userData = userDoc.data();
        setProfileData(userData);
        
        // ContactsOrder'ı yükle
        if (userData.contactsOrder && Array.isArray(userData.contactsOrder)) {
          setContactsOrder(userData.contactsOrder);
        }
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

        {/* Social Media Icons - Dynamic order based on contactsOrder */}
        {contactsOrder.some(key => profileData[key]) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
            {contactsOrder.map((contactKey) => {
              if (!profileData[contactKey]) return null;
              
              const getContactConfig = (key) => {
                const configs = {
                  instagram: { icon: InstagramIcon, color: '#E1306C', url: profileData[key], label: 'Instagram' },
                  github: { icon: GitHubIcon, color: '#333', url: profileData[key], label: 'GitHub' },
                  linkedin: { icon: LinkedInIcon, color: '#0077B5', url: profileData[key], label: 'LinkedIn' },
                  email: { icon: EmailIcon, color: '#EA4335', url: `mailto:${profileData[key]}`, label: 'Email' },
                  mobile: { icon: PhoneIcon, color: '#4CAF50', url: `tel:${profileData[key]}`, label: 'Mobile' },
                  facebook: { icon: FacebookIcon, color: '#1877F2', url: profileData[key], label: 'Facebook' },
                  discord: { icon: MovieIcon, color: '#5865F2', url: profileData[key], label: 'Discord' },
                  tiktok: { icon: MovieIcon, color: '#000000', url: profileData[key], label: 'TikTok' },
                  youtube: { icon: YouTubeIcon, color: '#FF0000', url: profileData[key], label: 'YouTube' },
                  whatsapp: { icon: WhatsAppIcon, color: '#25D366', url: `https://wa.me/${profileData[key].replace(/[^0-9]/g, '')}`, label: 'WhatsApp' },
                  telegram: { icon: TelegramIcon, color: '#0088CC', url: profileData[key], label: 'Telegram' },
                };
                return configs[key];
              };

              const config = getContactConfig(contactKey);
              if (!config) return null;

              const IconComponent = config.icon;

              return (
                <Tooltip key={contactKey} title={config.label} arrow>
                  <IconButton 
                    onClick={() => handleLinkClick(config.url)}
                    sx={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      '&:hover': { 
                        backgroundColor: config.color,
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <IconComponent />
                  </IconButton>
                </Tooltip>
              );
            })}
          </Box>
        )}

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
                  onClick={() => handleLinkClick(link.url)}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "15px",
                    padding: "12px 20px",
                    color: "white",
                    textTransform: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: 2,
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    width: "100%",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.3)",
                      transform: "translateY(-2px)",
                      transition: "all 0.2s ease"
                    }
                  }}
                >
                  <IconComponent />
                  <Box sx={{ textAlign: 'left', flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
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

        {/* Footer */}
        <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid rgba(255, 255, 255, 0.2)" }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "0.875rem"
            }}
          >
            Powered by Social Links
          </Typography>
        </Box>

      </Box>
    </Container>
  </Box>
  );
}