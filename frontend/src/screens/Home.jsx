import { useState } from 'react';
import { IMG_BOXE, IMG_LOGO } from '../constants/appConstante';
import Loader from '../components/Loader/Loader';
import CustomButton from '../components/UI/CustomButton';
import { Link } from 'react-router-dom';
import PackCard from '../components/Product/PackCard';
import GuideLayout from '../components/Guide/GuideLayout';
import NotreSelection from '../components/Product/Highlighted';
import Tagline from '../components/UI/Tagline';



const Home = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <>
      {!isLoaded && <Loader />}
      
      <div className="flex flex-col justify-center items-center text-white ">
        {/* Image cachée pour écouter l'événement de chargement */}
        <img 
          src={IMG_BOXE} 
          alt="preload" 
          className="hidden" 
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)}
        />
        
        {/* Conteneur principal avec l'image de fond (ajout de relative ici) */}
        <div 
          className={`w-full h-[435px] bg-boxe max-w-[1800px] md:h-[1000px] relative transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
          style={{ backgroundImage: `url(${IMG_BOXE})` }}
        >
          {/*  */}
          <div className="flex flex-col items-center h-full md:items-end md:mr-20"> 
            <img src={IMG_LOGO} alt="logo" className="w-50 pt-10 md:w-[651px]"/>
             
            <div className="flex flex-col gap-4 pt-30 w-full max-w-[651px] px-4 md:px-0 md:h-27 md:justify-start md:mt-25">
              {isLoggedIn ? (
                <CustomButton to="/my-locker" className="border-3 font-inter font-extrabold uppercase hover:bg-red active:bg-red md:mb-10">
                  Mon Vestiaire
                </CustomButton>
              ) : (
                <CustomButton to="/register" className="border-3 font-inter font-extrabold uppercase hover:bg-red active:bg-red md:mb-10">
                  Créer mon profil
                </CustomButton>
              )}
              <CustomButton to="/resale" className="border-3 font-inter font-extrabold uppercase hover:bg-red active:bg-red">
                Commencer a vendre
              </CustomButton>
            </div>
            
            {/* Liens en bas (utilisation de className au lieu de class) */}
            <div className="absolute bottom-6 md:bottom-10 left-0 w-full z-20 px-4">
              <div className="flex flex-row justify-between md:justify-around items-center max-w-4xl mx-auto text-white font-medium uppercase tracking-widest text-[10px] sm:text-xs md:text-base border-t border-white/20 pt-4 md:border-none">
                <div>
                  <Link to="/guide" className="hover:text-red transition-colors">
                    GUIDE
                  </Link>
                </div>
                <div>
                  <Link to="/marketplace" className="hover:text-red transition-colors">
                    Catalogue
                  </Link>
                </div>
                <div>
                  <Link to="/resale" className="hover:text-red transition-colors">
                    Revente
                  </Link>
                </div>
              </div>
            </div>
            
          </div>
        </div> {/* Fermeture du conteneur Hero (ligne 30) */}
        {/* Guide */}
        <GuideLayout/>
        
        {/* Notre Sélection */}
        <NotreSelection/>

        <div className="my-6 h-px w-full bg-gray-300 "></div>
        {/* Phrase d'accroche */}
        <Tagline/>
        <div className="my-6 h-px w-full bg-gray-300 md:hidden"></div>
      </div>
    </>
  );
};

export default Home;