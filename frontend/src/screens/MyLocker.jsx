import { useState, useEffect } from "react";
import { IMG_BGRAYURE } from "../constants/appConstante"
import { useNavigate, Link } from "react-router-dom";
import UserProducts from "../components/UserProducts";
import UserEvaluations from "../components/UserEvaluations";

const MyLocker = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('articles');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const evaluations = user?.receivedEvaluations || [];
  const hasEvaluations = evaluations.length > 0;
  const averageRating = hasEvaluations
    ? evaluations.reduce((sum, ev) => sum + ev.rating, 0) / evaluations.length
    : 0;

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Décoder le token pour obtenir l'email
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

        // Récupérer les infos de l'utilisateur
        const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/ld+json, application/json',
          }
        });

        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }

        const data = await response.json();
        console.log('API Response data:', data);

        // Gérer le format de réponse (collection ou objet)
        const userData = data.member ? data.member[0] : (data['hydra:member'] ? data['hydra:member'][0] : (Array.isArray(data) ? data[0] : data));
        console.log('User Data extracted:', userData);

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

  useEffect(() => {
    const fetchUserProducts = async () => {
      if (!user || activeTab !== 'articles' || products.length > 0) return;

      setLoadingProducts(true);
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`/api/products?seller=${encodeURIComponent(user['@id'])}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/ld+json, application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          const extractedProducts = data.member || data['hydra:member'] || (Array.isArray(data) ? data : []);
          setProducts(extractedProducts);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchUserProducts();
  }, [user, activeTab, products.length]);

  return (
    <>
      <img src={IMG_BGRAYURE}
        alt="preload"
        className="hidden"
        onLoad={() => setIsLoaded(true)}
      />

      <div className={`text-white min-h-screen flex flex-col ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Top Section: Striped Background */}
        <div className="bg-rayure p-8 pb-0 border-b border-white/10 pb-2" style={{ backgroundImage: `url(${IMG_BGRAYURE})` }}>
          <div className="w-full px-4 md:px-12 lg:px-24">
            <div className="mb-12 flex items-center">
              <Link to="/" className="text-white text-5xl md:text-6xl font-bebas mr-4">
                &lt;
              </Link>
              <h2 className="font-bebas uppercase text-5xl md:text-6xl">Mon Vestiaire</h2>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <p className="text-2xl font-inter">Chargement...</p>
              </div>
            ) : error ? (
              <div className="bg-red-600/10 border border-red-600 text-red-600 p-6 rounded-sm">
                <p className="text-lg">{error}</p>
              </div>
            ) : user ? (
              <div className="flex flex-col md:flex-row gap-12 items-start mb-12">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                  <div className="w-64 h-80 bg-[#1A1A1A] border border-white/10 overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl font-bebas text-gray-500">
                        Pas d'image
                      </div>
                    )}
                  </div>
                  <Link to="/profile/edit" className="text-sm text-gray-400 hover:text-white transition-colors mt-4">
                    Mettre à jour mon profil
                  </Link>
                </div>

                {/* Infos */}
                <div className="space-y-4 flex-1">
                  <h3 className="font-bebas text-6xl uppercase text-white border-b-4 border-cyan-400 inline-block pb-1">
                    {user.pseudo || 'Non renseigné'}
                  </h3>
                  
                  {/* Stars */}
                  {hasEvaluations ? (
                    <div className="flex gap-2 text-red-600 text-3xl">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.round(averageRating) ? "text-red-600" : "text-gray-600"}>★</span>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <div className="flex gap-2 text-gray-600 text-3xl">
                        <span>★</span>
                        <span>★</span>
                        <span>★</span>
                        <span>★</span>
                        <span>★</span>
                      </div>
                      <span className="text-xs md:text-base text-gray-400">(Aucune évaluation)</span>
                    </div>
                  )}

                  <div className="space-y-3 font-inter text-xl text-white mt-6">
                    <p><span className="font-bold">Type de Boxe :</span> <span className="text-gray-300">{user.boxe?.label || 'Non renseigné'}</span></p>
                    <p><span className="font-bold">Poids :</span> <span className="text-gray-300">{user.weight ? `${user.weight} Kg` : 'Non renseigné'}</span></p>
                    <p><span className="font-bold">Taille :</span> <span className="text-gray-300">{user.size ? `${user.size} cm` : 'Non renseignée'}</span></p>
                    <p><span className="font-bold">Niveau :</span> <span className="text-gray-300">{user.level?.label || 'Non renseigné'}</span></p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          
        </div>

        {/* Bottom Section: Solid Black Background */}
        <div className="bg-black flex-1 p-8 pt-16 relative">
          {/* Tabs straddling the border */}
          <div className="absolute top-0 left-0 w-full px-4 md:px-12 lg:px-24 -translate-y-9 md:-translate-y-11">
            <div className="flex gap-6 text-sm uppercase font-inter font-bold">
              <button 
                className={`${activeTab === 'articles' ? 'text-white border-b-2 border-red-600' : 'text-gray-500 hover:text-white'} pb-2`}
                onClick={() => setActiveTab('articles')}
              >
               <span className="font-inter font-extralight uppercase text-xl md:text-3xl">Articles</span> 
              </button>
              <button 
                className={`${activeTab === 'evaluations' ? 'text-white border-b-2 border-red-600' : 'text-gray-500 hover:text-white'} pb-2`}
                onClick={() => setActiveTab('evaluations')}
              >
                <span className="font-inter font-extralight uppercase text-xl md:text-3xl">Évaluations</span>
                
              </button>
            </div>
          </div>
          <div className="w-full px-4 md:px-12 lg:px-24">
            {activeTab === 'articles' ? (
              <UserProducts products={products} loading={loadingProducts} />
            ) : (
              <UserEvaluations evaluations={evaluations} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default MyLocker