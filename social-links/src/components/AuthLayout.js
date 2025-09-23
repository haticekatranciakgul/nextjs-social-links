import { Typography } from "@mui/material";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div 
      className="min-h-screen flex"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        margin: 0,
        padding: 0,
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* Sol Taraf - Adventure Text */}
      <div className="flex-1 flex items-end justify-start p-16">
        <div className="mb-32">
          <Typography 
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 'bold',
              fontSize: '50.68px',
              lineHeight: '1.2',
              color: '#FFFFFF',
              mb: 0
            }}
          >
            SIGN IN TO YOUR
          </Typography>
          <Typography 
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 'normal',
              fontSize: '51.5px',
              lineHeight: '1.2',
              background: 'linear-gradient(90deg, #501794 0%, #AE69FF 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mt: 0
            }}
          >
            ADVENTURE!
          </Typography>
        </div>
      </div>

      {/* Sağ Taraf - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div style={{ width: '460px', maxWidth: '100%' }}>
          {/* Form Header */}
          <div className="text-center mb-8">
            <Typography 
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 'bold',
                fontSize: '77.71px',
                color: '#FFFFFF',
                mb: 2
              }}
            >
              {title}
            </Typography>
            <Typography 
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '15.4px',
                color: '#FFFFFF',
                mb: 4
              }}
            >
              {subtitle}
            </Typography>
          </div>

          {/* Form Content */}
          <div style={{ width: '100%' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}