import { Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";

export default function SocialButtons({ onGoogleClick, onFacebookClick }) {
  return (
    <div className="flex gap-3 w-full">
      {/* Google Button */}
      <Button
        variant="contained"
        onClick={onGoogleClick}
        startIcon={<GoogleIcon />}
        sx={{
          flex: 1,
          backgroundColor: '#6366f1',
          color: 'white',
          textTransform: 'none',
          fontSize: '14px',
          padding: '12px',
          borderRadius: '8px',
          '&:hover': {
            backgroundColor: '#5856eb',
          }
        }}
      >
        Google
      </Button>

      {/* Facebook Button */}
      <Button
        variant="contained"
        onClick={onFacebookClick}
        startIcon={<FacebookIcon />}
        sx={{
          flex: 1,
          backgroundColor: '#1877f2',
          color: 'white',
          textTransform: 'none',
          fontSize: '14px',
          padding: '12px',
          borderRadius: '8px',
          '&:hover': {
            backgroundColor: '#166fe5',
          }
        }}
      >
        Facebook
      </Button>
    </div>
  );
}