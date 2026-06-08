import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { IMG_BOXE } from '../constants/appConstante';
import { API_URL } from '../constants/apiConstante';
import { Eye, EyeOff } from 'lucide-react';
import CustomInput from '../components/UI/CustomInput';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      const from = location.state?.from || '/my-locker';
      navigate(from);
    }
  }, [navigate, location]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(
    location.state?.message || 
    (new URLSearchParams(location.search).get('expired') ? "Votre session a expiré, veuillez vous reconnecter." : "")
  );
  const [showPassword, setShowPassword] = useState(false);

  const [banInfo, setBanInfo] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBanInfo(null);

    try {
      const response = await fetch(`${API_URL}/login_check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Le serveur a renvoyé un format non supporté. Détails: ${text.substring(0, 50)}...`);
      }

      if (!response.ok) {
        if (data?.message && data.message.startsWith('BAN_')) {
          const parts = data.message.split('|||');
          setBanInfo({
            type: parts[0] === 'BAN_DEFINITIF' ? 'Bannissement Définitif' : 'Désactivation Temporaire',
            date: parts[1] || null,
            reason: parts[2] || 'Aucun motif précisé.'
          });
          return;
        }
        let errorMessage = data?.message;
        if (errorMessage === 'Invalid credentials.' || errorMessage === 'Invalid credentials') {
          errorMessage = 'Mail ou mot de passe incorrect';
        }
        throw new Error(errorMessage || "Mail ou mot de passe incorrect");
      }

      // Stocker le token JWT et le Refresh Token
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      localStorage.setItem('lastActive', Date.now().toString());
      sessionStorage.setItem('session_active', 'true');

      // Rediriger vers la page d'origine ou l'accueil
      const from = location.state?.from || '/';
      navigate(from);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-12 bg-cover bg-left" style={{ backgroundImage: `url(${IMG_BOXE})` }}>
      <div className="w-full max-w-md bg-black/60 backdrop-blur-lg border border-white/10 rounded-sm p-8 md:p-12 shadow-2xl my-4">
        
        {/* En-tête */}
        <div className="text-center mb-10">
          <h1 className="font-bebas text-5xl font-bold uppercase tracking-wide mb-2">Se connecter</h1>
          <p className="font-inter text-gray-400 text-sm">Bon retour parmi nous</p>
        </div>

        {error && (
          <div className="bg-red-600/10 border border-red-600 text-red-600 text-sm p-4 rounded-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <CustomInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <CustomInput
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-red transition-colors m-2"
              >
                {showPassword ? <EyeOff  size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <button
            type="submit"
            className="w-full bg-red-600 text-white font-inter font-bold uppercase py-3.5 rounded-sm hover:bg-red-700 transition-colors text-sm"
          >
            Se connecter
          </button>

          <div className="text-center text-xs text-gray-500 font-inter mt-4">
            Pas encore inscrit ? <Link to="/register" className="text-white hover:text-red-600 transition-colors">Créer un compte</Link>
          </div>
        </form>
      </div>

      {/* Modal de Bannissement */}
      {banInfo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-red-900/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-red-600 p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bebas uppercase tracking-wider text-white mb-1">
                Compte Suspendu
              </h2>
              <p className="text-red-100 font-inter text-sm">
                {banInfo.type}
              </p>
            </div>
            
            <div className="p-8 space-y-6">
              {banInfo.date && banInfo.date !== "Aucun motif précisé." && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Fin de suspension</span>
                  <p className="text-white font-medium text-lg">{banInfo.date}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Motif de la sanction</span>
                <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
                  <p className="text-gray-300 text-sm leading-relaxed italic">
                    "{banInfo.reason}"
                  </p>
                </div>
              </div>

              <button
                onClick={() => setBanInfo(null)}
                className="w-full mt-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-inter font-medium py-3 rounded-xl transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;