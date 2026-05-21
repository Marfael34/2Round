import { Link } from 'react-router-dom';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import { IMG_BGALI } from '../constants/appConstante';

const Guide = () => {
  return (
    <div className="flex flex-col w-full bg-black min-h-screen">
      {/* 1. Top Section (Dark Gray Header) */}
      <div className="w-full bg-[#333333] pt-32 pb-16 px-6 sm:px-12 md:px-20 lg:px-32 xl:px-40 flex flex-col justify-center border-b border-black">
        <div className="flex items-start gap-4 sm:gap-6 md:gap-8 ">
          <Link
            to="/"
            className="text-white hover:text-red transition-colors flex items-center justify-center shrink-0 mt-7 md:mt-5 lg:mt-12 xl:mt-10"
            aria-label="Retour"
          >
            <ChevronLeft strokeWidth={1} className="w-8 h-8 md:w-12 md:h-12 lg:w-24 lg:h-24" />
          </Link>
          <div className="flex flex-col gap-1">
            <h2 className="font-bebas text-white uppercase text-4xl sm:text-5xl md:text-6l lg:text-8xl tracking-wide">
              UN COUP DE POING ?
            </h2>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-4xl font-inter font-extralight">
              Des guides pour mieux comprendre la boxe et ses équipements.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Middle Section (Links with striped background) */}
      <div 
        className="w-full flex flex-col py-16 px-6 sm:px-12 md:px-20 lg:px-32 xl:px-40 border-b border-black"
        style={{
          backgroundImage: `repeating-linear-gradient(-45deg, #070707, #070707 4px, #0e0e0e 4px, #0e0e0e 8px)`
        }}
      >
        <div className="flex flex-col max-w-5xl w-full mx-auto md:mx-0">
          
          <Link to="/guidesize" className="flex items-center justify-between py-10 sm:py-14 border-b border-white/10 group cursor-pointer">
            <h3 className="font-bebas text-white uppercase text-4xl md:text-6xl lg:text-7xl xl:text-8xl tracking-widest group-hover:text-gray-300 transition-colors">
              GUIDE DES TAILLES
            </h3>
            <ArrowRight strokeWidth={1.5} className="text-red w-8 h-8 md:w-12 md:h-12 transform group-hover:translate-x-2 transition-transform" />
          </Link>

          <Link to="/guidestuff" className="flex items-center justify-between py-10 sm:py-14 border-b border-white/10 group cursor-pointer">
            <h3 className="font-bebas text-white uppercase text-4xl md:text-6xl lg:text-7xl xl:text-8xl tracking-widest group-hover:text-gray-300 transition-colors">
              GUIDE DES ÉQUIPEMENTS
            </h3>
            <ArrowRight strokeWidth={1.5} className="text-red w-8 h-8 md:w-12 md:h-12 transform group-hover:translate-x-2 transition-transform" />
          </Link>

          <Link to="/guideadvice" className="flex items-center justify-between py-10 sm:py-14 border-b border-transparent group cursor-pointer">
            <h3 className="font-bebas text-white uppercase text-4xl md:text-6xl lg:text-7xl xl:text-8xl tracking-widest group-hover:text-gray-300 transition-colors">
              GUIDE DÉMARRER LA BOXE
            </h3>
            <ArrowRight strokeWidth={1.5} className="text-red w-8 h-8 md:w-12 md:h-12 transform group-hover:translate-x-2 transition-transform" />
          </Link>

        </div>
      </div>

      {/* 3. Bottom Section (Muhammad Ali Image) */}
      {/* TODO: L'image de Muhammad Ali devra être placée dans /public/images/background/ali_bg.webp */}
      <div 
        className="w-full flex flex-col justify-between py-16 px-6 sm:px-12 md:px-20 lg:px-32 xl:px-40 bg-cover bg-center md:bg-top bg-no-repeat relative min-h-[400px] md:min-h-[500px] lg:min-h-[700px] xl:min-h-[850px]"
        style={{ 
          backgroundImage: `url(${IMG_BGALI})`
        }}
      >
        {/* Assombrissement si l'image est trop claire */}
        <div className="absolute inset-0 bg-black/40 z-0"></div>

        <div className="relative z-10 flex flex-col justify-center flex-1 max-w-4xl py-8">
          <h2 className="font-inter font-bold uppercase text-2xl sm:text-4xl md:text-[42px] text-white leading-snug tracking-wide">
            J'AI DÉTESTÉ <br />
            CHAQUE MINUTE <br />
            D'ENTRAÎNEMENT, <br />
            <span className="text-red">
              MAIS JE N'AI JAMAIS <br />
              ABANDONNÉ.
            </span>
          </h2>
        </div>

        <div className="relative z-10 w-full flex justify-end mt-16 sm:mt-0">
          <h3 className="font-bebas text-white text-3xl sm:text-4xl md:text-5xl tracking-wider">
            MUHAMMAD ALI
          </h3>
        </div>
      </div>
    </div>
  );
};

export default Guide;