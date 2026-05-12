import { FiTool, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { IMG_LOGO } from '../../constants/appConstante';

const InProgress = ({ pageName }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center text-white p-6">
      <div className="relative flex flex-col items-center max-w-lg text-center">
        {/* Effet de halo lumineux (couleur thème rouge) */}
        <div className="absolute inset-0 rounded-full bg-red blur-3xl opacity-20 animate-pulse"></div>
        
        {/* Icône animée */}
        <div className="relative z-10 mb-6">
          <div className="p-5 bg-gray-dark rounded-full border border-gray">
            <FiTool className="w-12 h-12 text-red" />
          </div>
        </div>
        
        {/* Logo pour le branding */}
        <img src={IMG_LOGO} alt="2Round" className="w-24 mb-4 relative z-10" />
        
        <h1 className="text-2xl font-bold tracking-tighter mb-1 relative z-10 uppercase">
          {pageName || 'En cours de développement'}
        </h1>
        {pageName && (
          <p className="text-sm text-red font-semibold mb-3 relative z-10 uppercase">
            En cours de développement
          </p>
        )}
        
        <p className="text-gray mb-8 relative z-10 max-w-sm text-sm">
          Cette page ou fonctionnalité n'est pas encore disponible. Nos équipes travaillent d'arrache-pied pour vous la proposer très bientôt !
        </p>
        
        {/* Bouton Retour */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 bg-white text-black hover:bg-gray-300 transition-colors px-6 py-2.5 font-bold uppercase text-xs relative z-10"
        >
          <FiArrowLeft className="w-4 h-4" />
          Retour en arrière
        </button>
      </div>
    </div>
  );
};

export default InProgress;
