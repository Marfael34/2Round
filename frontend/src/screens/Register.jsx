import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { IMG_BOXE } from '../constants/appConstante';
import { API_URL } from '../constants/apiConstante';
import { Eye, EyeOff } from 'lucide-react';
import CustomInput from '../components/UI/CustomInput';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      const from = location.state?.from || '/my-locker';
      navigate(from);
    }
  }, [navigate, location]);
  const [formType, setFormType] = useState('short'); // 'short' or 'long'
  const [currentStep, setCurrentStep] = useState(1); // 1 to 4 for long form

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    pseudo: '',
    firstname: '',
    lastname: '',
    birthday: '',
    weight: '',
    size: '',
    budget: '',
  });

  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formType === 'long' && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      return;
    }


    
    const dataToSend = { ...formData };
    delete dataToSend.confirmPassword;
    
    // Set default value for isActive
    dataToSend.isActive = true;

    // Map birthday to birthday_at
    if (dataToSend.birthday) {
      dataToSend.birthday_at = dataToSend.birthday;
      delete dataToSend.birthday;
    }
    
    // Sanitize optional fields
    const optionalFields = ['birthday_at', 'weight', 'size', 'budget'];
    optionalFields.forEach(field => {
      if (dataToSend[field] === '' || dataToSend[field] === undefined) {
        delete dataToSend[field];
      } else if (['weight', 'size', 'budget'].includes(field)) {
        dataToSend[field] = parseFloat(dataToSend[field]);
      }
    });

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ld+json',
        },
        body: JSON.stringify(dataToSend),
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
        const errorMessage = data['hydra:description'] || data.message || `Erreur serveur (${response.status})`;
        throw new Error(errorMessage);
      }


      
      // Vider les champs
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        pseudo: '',
        firstname: '',
        lastname: '',
        birthday: '',
        weight: '',
        size: '',
        budget: '',
      });

      // Rediriger vers la page de connexion
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-12 bg-cover bg-left" style={{ backgroundImage: `url(${IMG_BOXE})` }}>
      <div className="w-full max-w-2xl bg-black/60 backdrop-blur-lg border border-white/10 rounded-sm p-8 md:p-12 shadow-2xl my-4">
        
        {/* Sélecteur de version */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#1A1A1A] p-1 rounded-full flex gap-2">
            <button
              onClick={() => { setFormType('short'); setCurrentStep(1); }}
              className={`py-2 px-6 rounded-full text-sm font-inter font-bold uppercase transition-colors ${formType === 'short' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Rapide
            </button>
            <button
              onClick={() => setFormType('long')}
              className={`py-2 px-6 rounded-full text-sm font-inter font-bold uppercase transition-colors ${formType === 'long' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Complète
            </button>
          </div>
        </div>

        {/* En-tête */}
        <div className="text-center mb-10">
          <h1 className="font-bebas text-5xl font-bold uppercase tracking-wide mb-2">Créer un profil</h1>
          <p className="font-inter text-gray-400 text-sm">
            {formType === 'short' 
              ? 'Inscription rapide en quelques secondes' 
              : `Inscription complète — Étape ${currentStep} sur 4`}
          </p>
        </div>



        {error && (
          <div className="bg-red-600/10 border border-red-600 text-red-600 text-sm p-4 rounded-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* VERSION COURTE */}
          {formType === 'short' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomInput label="Prénom" type="text" name="firstname" value={formData.firstname} onChange={handleChange} required />
                <CustomInput label="Nom" type="text" name="lastname" value={formData.lastname} onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomInput label="Pseudo" type="text" name="pseudo" value={formData.pseudo} onChange={handleChange} required />
                <CustomInput label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                <CustomInput
                  label="Confirmer"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
              </div>
            </>
          )}

          {/* VERSION LONGUE (4 ÉTAPES) */}
          {formType === 'long' && (
            <>
              {/* Étape 1 : Identité */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="font-bebas text-2xl text-white uppercase mb-4">Étape 1 : Qui êtes-vous ?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomInput label="Prénom" type="text" name="firstname" value={formData.firstname} onChange={handleChange} required />
                    <CustomInput label="Nom" type="text" name="lastname" value={formData.lastname} onChange={handleChange} required />
                  </div>
                  <CustomInput label="Pseudo" type="text" name="pseudo" value={formData.pseudo} onChange={handleChange} required />
                </div>
              )}

              {/* Étape 2 : Sécurité */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="font-bebas text-2xl text-white uppercase mb-4">Étape 2 : Vos identifiants</h2>
                  <CustomInput label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      }
                    />
                    <CustomInput
                      label="Confirmer"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      }
                    />
                  </div>
                </div>
              )}

              {/* Étape 3 : Profil Sportif */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="font-bebas text-2xl text-white uppercase mb-4">Étape 3 : Votre profil</h2>
                  <CustomInput label="Date de naissance" type="date" name="birthday" value={formData.birthday} onChange={handleChange} required />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomInput label="Taille (m)" type="number" step="0.01" name="size" value={formData.size} onChange={handleChange} placeholder="Ex: 1.75" required />
                    <CustomInput label="Poids (kg)" type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} placeholder="Ex: 70.5" required />
                  </div>
                </div>
              )}

              {/* Étape 4 : Préférences */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="font-bebas text-2xl text-white uppercase mb-4">Étape 4 : Vos préférences</h2>
                  <CustomInput label="Budget (€)" type="number" name="budget" value={formData.budget} onChange={handleChange} placeholder="Ex: 500" required />
                </div>
              )}
            </>
          )}

          {/* Barre de progression pour la version longue */}
          {formType === 'long' && (
            <div className="w-full bg-[#1A1A1A] h-1 mb-4 rounded-full overflow-hidden">
              <div 
                className="bg-red-600 h-full transition-all duration-300" 
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
          )}

          {/* Boutons de navigation */}
          <div className="flex justify-between gap-4 pt-4">
            {formType === 'long' && currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="w-1/2 bg-transparent border border-white/20 text-white font-inter font-bold uppercase py-3.5 rounded-sm hover:bg-white/5 transition-colors text-sm"
              >
                Retour
              </button>
            )}
            
            <button
              type="submit"
              className={`${formType === 'long' && currentStep > 1 ? 'w-1/2' : 'w-full'} bg-red-600 text-white font-inter font-bold uppercase py-3.5 rounded-sm hover:bg-red-700 transition-colors text-sm`}
            >
              {formType === 'short' 
                ? "S'inscrire" 
                : currentStep === 4 ? "Terminer" : "Suivant"}
            </button>
          </div>

          <div className="text-center text-xs text-gray-500 font-inter mt-4">
            Déjà inscrit ? <Link to="/login" className="text-white hover:text-red-600 transition-colors">Se connecter</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;