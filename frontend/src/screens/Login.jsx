import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { IMG_BOXE } from '../constants/appConstante';
import { API_URL } from '../constants/apiConstante';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/my-locker');
    }
  }, [navigate]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(
    location.state?.message || 
    (new URLSearchParams(location.search).get('expired') ? "Votre session a expiré, veuillez vous reconnecter." : "")
  );
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
        throw new Error("Email ou mot de passe incorrect");
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

      // Rediriger vers l'accueil
      navigate('/');
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
          <div className="flex flex-col gap-1">
            <label className="font-inter text-xs uppercase text-gray-400">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="bg-[#1A1A1A] border border-white/10 rounded-sm p-3 text-white focus:border-red-600 focus:outline-none font-inter text-sm" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-inter text-xs uppercase text-gray-400">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-sm p-3 pr-10 text-white focus:border-red-600 focus:outline-none font-inter text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

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
    </div>
  );
};

export default Login;