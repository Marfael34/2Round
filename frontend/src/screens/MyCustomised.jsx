import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { IMG_BGGLOVE } from "../constants/appConstante"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { securedFetch } from "../utils/api"
import GuideLayout from "../components/Guide/GuideLayout"
import Tagline from "../components/UI/Tagline"
import UserWishlist from "../components/Profile/UserWishlist"

const MyCustomised = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        const email = payload.username;

        if (!email) return;

        const response = await securedFetch(`/api/users?email=${encodeURIComponent(email)}`);

        if (response.ok) {
          const data = await response.json();
          const userData = data.member ? data.member[0] : (data['hydra:member'] ? data['hydra:member'][0] : (Array.isArray(data) ? data[0] : data));
          if (userData) {
            setUser(userData);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserData();
  }, [navigate]);

  return (
    <>
    {/* La div externe inverse l'image de fond */}
    <div className="w-full bg-return bg-bottom-left bg-no-repeat bg-cover border-b border-black" style={{backgroundImage : `url(${IMG_BGGLOVE})` }}>
      
      {/* La div interne ré-inverse le contenu pour que le texte soit à l'endroit */}
      <div className="relative w-full bg-return py-16 sm:py-24 px-6 md:px-20 lg:px-32 xl:px-40 flex flex-col justify-center min-h-[350px] lg:min-h-[450px]">
        
        {/* Ombre pour la lisibilité du texte (qui s'applique sur la vue "à l'endroit") */}
        <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/60 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col w-full">
          {/* Ligne du titre et chevron */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              to="/"
              className="text-white hover:text-gray-300 transition-colors flex items-center justify-center shrink-0"
              aria-label="Retour"
            >
              <ChevronLeft strokeWidth={1} className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24" />
            </Link>
            <h2 className="font-bebas text-white uppercase text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[6rem] tracking-wide m-0 pt-2 md:pt-4 leading-none">
              Mon round personnalisé
            </h2>
          </div>
          
          {/* Ligne du sous-titre et du lien profil, alignés avec le texte du titre */}
          <div className="flex flex-col gap-5 mt-4 ml-14  md:ml-24 lg:ml-28">
            <p className="text-gray-300 text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl font-inter font-light tracking-wide m-0">
              Niveau : {user?.level?.label || 'Non renseigné'} • {user?.boxe?.label || 'Type non renseigné'} • Budget : {user?.budget ? `${user.budget} €` : 'Non renseigné'}
            </p>
            <Link to="/profil" className="text-gray-500 hover:text-gray-300 transition-colors text-sm sm:text-base md:text-lg lg:text-xl flex items-center gap-1 font-inter font-light w-max">
              Modifier mon Profil <ChevronRight strokeWidth={1.5} className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
            </Link>
          </div>
        </div>
      </div>
    </div>

    <UserWishlist/>

    <GuideLayout/>

    <Tagline/>
    </>
  )
}

export default MyCustomised