import { Box, Paper, IconButton, Tooltip } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import LinkIcon from "@mui/icons-material/Link";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";

export default function DashboardLayout({ children, currentPage = "home" }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      console.log("Logout button clicked"); // Debug log
      await signOut(auth);
      console.log("Firebase signOut completed"); // Debug log
      // Firebase Auth Context otomatik olarak user state'i temizleyecek
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const sidebarItems = [
    { icon: HomeIcon, label: "Home", key: "home", path: "/dashboard", newTab: false },
    { icon: LinkIcon, label: "Links", key: "links", path: "/dashboard/links", newTab: true },
    { icon: SettingsIcon, label: "Settings", key: "settings", path: "/dashboard/settings", newTab: false },
  ];

  const handleNavigation = (item) => {
    if (item.newTab) {
      window.open(item.path, '_blank');
    } else {
      router.push(item.path);
    }
  };

  return (
    <div 
      className="min-h-screen flex"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Sol Sidebar */}
      <Box 
        sx={{ 
          width: 80, 
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingY: 3,
          gap: 2,
          position: 'relative',
          zIndex: 9999 // Dev overlay'den daha yüksek z-index
        }}
      >
        {/* Logo */}
        <Box 
          sx={{ 
            width: 40, 
            height: 40, 
            backgroundColor: '#8b5cf6',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}
        >
          <LinkIcon sx={{ color: 'white' }} />
        </Box>

        {/* Navigation Items */}
        {sidebarItems.map((item) => (
          <Tooltip key={item.key} title={item.label} placement="right">
            <IconButton
              onClick={() => handleNavigation(item)}
              sx={{
                color: currentPage === item.key ? '#8b5cf6' : 'rgba(255, 255, 255, 0.7)',
                backgroundColor: currentPage === item.key ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(139, 92, 246, 0.3)',
                  color: '#8b5cf6'
                }
              }}
            >
              <item.icon />
            </IconButton>
          </Tooltip>
        ))}

        {/* Logout Button - Settings'in hemen altında */}
        <Tooltip title="Logout" placement="right">
          <IconButton
            onClick={handleLogout}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              marginTop: 1, // Settings'ten küçük boşluk
              '&:hover': {
                backgroundColor: 'rgba(239, 68, 68, 0.3)',
                color: '#ef4444'
              }
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Ana İçerik Alanı */}
      <Box 
        sx={{ 
          flex: 1, 
          padding: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          minHeight: '100vh'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            maxWidth: 600,
            backgroundColor: 'rgb(121 118 121 / 23%)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            padding: 4,
            marginTop: 2
          }}
        >
          {children}
        </Paper>
      </Box>
    </div>
  );
}