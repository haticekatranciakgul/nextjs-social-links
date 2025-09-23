export default function AuthLayout({ children, title, subtitle }) {
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
      {/* Sol Taraf - Adventure Text */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="text-white max-w-md">
          <h1 className="text-5xl font-bold mb-4">
            SIGN IN TO YOUR
          </h1>
          <h1 className="text-5xl font-bold text-purple-300">
            ADVENTURE!
          </h1>
        </div>
      </div>

      {/* Sağ Taraf - Form Container */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
            <p className="text-gray-300 text-sm">{subtitle}</p>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
}