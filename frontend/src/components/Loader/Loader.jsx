import { useEffect } from 'react';
import { IMG_LOGO } from '../../constants/appConstante';

const Loader = () => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col justify-center items-center">
      <div className="relative flex flex-col items-center">
        {/* Pulsing glow effect with theme red */}
        <div className="absolute inset-0 rounded-full bg-red blur-2xl opacity-30 animate-pulse"></div>
        
        {/* Logo */}
        <img 
          src={IMG_LOGO} 
          alt="Logo" 
          className="w-32 h-32 object-contain relative z-10"
        />
        
        {/* Loading spinner */}
        <div className="mt-8 flex flex-col items-center relative z-10">
          <div className="w-10 h-10 border-4 border-t-red border-gray-dark rounded-full animate-spin"></div>
          <p className="text-white mt-4 font-semibold tracking-wider uppercase text-xs">Chargement...</p>
        </div>
      </div>
    </div>
  );
};

export default Loader;
