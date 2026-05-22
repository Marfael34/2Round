import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { IMG_BGGLOVE } from "../constants/appConstante"
import { ChevronLeft } from "lucide-react"
import { securedFetch } from "../utils/api"

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
    <div className="w-full bg-return bg-no-repeat bg-cover pt-32 pb-16 px-6 sm:px-12 md:px-20 lg:px-32 xl:px-40 flex flex-col justify-center border-b border-black" style={{backgroundImage : `url(${IMG_BGGLOVE})` }}>
      <div className="w-full bg-return pt-32 pb-16 px-6 sm:px-12 md:px-20 lg:px-32 xl:px-40 flex flex-col justify-center border-b border-black">
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
              Mon round personnalisé
            </h2>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-4xl font-inter font-extralight">
              Niveau : {user?.level?.label || 'Non renseigné'} • {user?.boxe?.label || 'Type non renseigné'} • Budget : {user?.budget ? `${user.budget} €` : 'Non renseigné'}
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default MyCustomised