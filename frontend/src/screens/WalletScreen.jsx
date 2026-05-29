import { useState, useEffect } from "react";
import { IMG_BGRAYURE } from "../constants/appConstante";
import { useNavigate, Link } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa6";
import { securedFetch } from "../utils/api";
import Wallet from "../components/Profile/Wallet";

const WalletScreen = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        if (!email) {
          throw new Error("Impossible de récupérer l'email du token");
        }

        const response = await securedFetch(`/api/users?email=${encodeURIComponent(email)}`);

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }

        const data = await response.json();
        const userData = data.member ? data.member[0] : (data['hydra:member'] ? data['hydra:member'][0] : (Array.isArray(data) ? data[0] : data));

        if (!userData) {
          throw new Error('Utilisateur non trouvé');
        }

        setUser(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  return (
    <>
      <img src={IMG_BGRAYURE}
        alt="preload"
        className="hidden"
        onLoad={() => setIsLoaded(true)}
      />

      <div className={`text-white min-h-screen flex flex-col ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
        {/* Top Section: Striped Background */}
        <div className="bg-rayure p-8 border-b border-white/10 flex-1 flex flex-col" style={{ backgroundImage: `url(${IMG_BGRAYURE})`, minHeight: '100vh' }}>
          <div className="w-full px-4 md:px-12 lg:px-24 flex-1 flex flex-col">
            <div className="mb-12 flex items-center">
              <Link to="/my-locker" className="text-white text-4xl font-bebas mr-4 hover:text-cyan-400 transition-colors">
                <FaChevronLeft /> 
              </Link>
              <h2 className="font-bebas uppercase text-4xl md:text-6xl text-white drop-shadow-md">Mon Porte-monnaie Numérique</h2>
            </div>

            {loading ? (
              <div className="text-center py-20 flex-1 flex items-center justify-center">
                <p className="text-2xl font-inter animate-pulse">Chargement...</p>
              </div>
            ) : error ? (
              <div className="bg-red-600/10 border border-red-600 text-red-600 p-6 rounded-sm w-full max-w-md mx-auto">
                <p className="text-lg text-center font-bold">{error}</p>
              </div>
            ) : user ? (
              <div className="flex-1 flex flex-col items-center justify-center w-full">
                <div className="w-full max-w-xl bg-black/60 backdrop-blur-sm border border-white/20 p-8 rounded-sm shadow-2xl">
                    <div className="mb-6 pb-6 border-b border-white/10">
                        <h3 className="text-3xl font-bebas uppercase text-white tracking-widest text-center">Gérer vos fonds</h3>
                        <p className="text-gray-400 font-inter text-center text-sm mt-2">Ici, vous pouvez visualiser l'argent généré par vos ventes sécurisées et demander un transfert vers votre compte bancaire.</p>
                    </div>
                    
                    <div className="flex justify-center w-full">
                        <Wallet user={user} setUser={setUser} />
                    </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default WalletScreen;
