"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  Button, 
  Box, 
  Typography, 
  Avatar,
  Container,
  CircularProgress
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
import { db } from "../../lib/firebase";
import { collection, getDocs, doc, getDoc, query, where, limit } from "firebase/firestore";

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username;

  const [links, setLinks] = useState([]);
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [userExists, setUserExists] = useState(false);
  const [contactsOrder, setContactsOrder] = useState([
    'instagram', 'github', 'linkedin', 'email', 'mobile', 
    'facebook', 'discord', 'tiktok', 'youtube', 'whatsapp', 'telegram'
  ]);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        setLoading(true);
        
        // Username'den UID'yi bul
        const usernameDoc = await getDoc(doc(db, "usernames", username));
        
        if (!usernameDoc.exists()) {
          setUserExists(false);
          setLoading(false);
          return;
        }

        const uid = usernameDoc.data().uid;
        setUserExists(true);

        // Kullanıcı profilini çek
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          setUserExists(true);
          const userData = userDoc.data();
          setProfileData(userData);
          
          // ContactsOrder'ı yükle
          if (userData.contactsOrder && Array.isArray(userData.contactsOrder)) {
            setContactsOrder(userData.contactsOrder);
          }
        }        // Kullanıcının linklerini çek
        const querySnapshot = await getDocs(collection(db, "users", uid, "links"));
        const linksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Linkleri sıraya koy
        setLinks(linksData.sort((a, b) => (a.order || 0) - (b.order || 0)));

      } catch (error) {
        console.error("Error fetching public profile:", error);
        setUserExists(false);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchPublicProfile();
    }
  }, [username]);

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
    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(finalUrl, '_blank');
  };

  // Loading durumu
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <CircularProgress sx={{ color: "white" }} />
      </Box>
    );
  }

  // Kullanıcı bulunamadı
  if (!userExists) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "white",
          textAlign: "center",
          px: 2
        }}
      >
        <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
          Kullanıcı Bulunamadı
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, opacity: 0.8 }}>
          @{username} kullanıcı adına sahip bir profil mevcut değil.
        </Typography>
        <Button 
          variant="contained" 
          sx={{ 
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",
            "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" }
          }}
          href="/register"
        >
          Kayıt Ol
        </Button>
      </Box>
    );
  }

  // Public Profile
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
          {/* Profile Header */}
          <Avatar
            src={profileData.photoURL}
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
            {!profileData.photoURL && (profileData.displayName ? profileData.displayName.charAt(0).toUpperCase() : username.charAt(0).toUpperCase())}
          </Avatar>

          <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", mb: 1 }}>
            {profileData.displayName || `@${username}`}
          </Typography>

          <Typography variant="h6" sx={{ color: "rgba(255, 255, 255, 0.8)", mb: 1 }}>
            @{username}
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

          {/* Social Links - Dynamic order based on contactsOrder */}
          {contactsOrder.some(key => profileData[key]) && (
            <Box sx={{ mb: 4, display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
              {contactsOrder.map((contactKey) => {
                if (!profileData[contactKey]) return null;
                
                const getContactIcon = (key) => {
                  const icons = {
                    instagram: InstagramIcon,
                    github: GitHubIcon,
                    linkedin: LinkedInIcon,
                    email: EmailIcon,
                    mobile: PhoneIcon,
                    facebook: FacebookIcon,
                    discord: MovieIcon,
                    tiktok: MovieIcon,
                    youtube: YouTubeIcon,
                    whatsapp: WhatsAppIcon,
                    telegram: TelegramIcon,
                  };
                  return icons[key];
                };

                const getContactUrl = (key, value) => {
                  if (key === 'email') return `mailto:${value}`;
                  if (key === 'mobile') return `tel:${value}`;
                  return value;
                };

                const IconComponent = getContactIcon(contactKey);
                if (!IconComponent) return null;

                return (
                  <Button
                    key={contactKey}
                    onClick={() => handleLinkClick(getContactUrl(contactKey, profileData[contactKey]))}
                    sx={{
                      minWidth: "auto",
                      p: 1,
                      borderRadius: "50%",
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" }
                    }}
                  >
                    <IconComponent sx={{ color: "white" }} />
                  </Button>
                );
              })}
            </Box>
          )}

          {/* YouTube continuation */}
          {false && profileData.youtube && (
                <Button
                  onClick={() => handleLinkClick(profileData.youtube)}
                  sx={{
                    minWidth: "auto",
                    p: 1,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" }
                  }}
                >
                  <YouTubeIcon sx={{ color: "white" }} />
                </Button>
              )}
              {profileData.whatsapp && (
                <Button
                  onClick={() => handleLinkClick(`https://wa.me/${profileData.whatsapp.replace(/[^0-9]/g, '')}`)}
                  sx={{
                    minWidth: "auto",
                    p: 1,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" }
                  }}
                >
                  <WhatsAppIcon sx={{ color: "white" }} />
                </Button>
              )}
              {profileData.telegram && (
                <Button
                  onClick={() => handleLinkClick(profileData.telegram)}
                  sx={{
                    minWidth: "auto",
                    p: 1,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" }
                  }}
                >
                  <TelegramIcon sx={{ color: "white" }} />
                </Button>
              )}
            </Box>
          )}

          {/* Custom Links */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {links.length > 0 ? (
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
            ) : (
              <Typography 
                variant="body1" 
                sx={{ 
                  color: "rgba(255, 255, 255, 0.7)",
                  fontStyle: "italic",
                  py: 4
                }}
              >
                Henüz link eklenmemiş.
              </Typography>
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