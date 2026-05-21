import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { IMG_BOXER_ANATOMY } from "../../constants/appConstante";

const GuideStuff = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();

  const equipmentData = {
    casque: {
      id: "casque",
      title: "Le Casque",
      shortDesc: "Protection de la tête",
      fullDesc: "Indispensable pour le sparring et la compétition. Il protège contre les coupures, les chocs superficiels au visage et limite les risques pour le nez et les tympans. Un bon casque doit offrir une protection optimale sans restreindre votre champ de vision.",
      top: "10%", left: "50%"
    },
    dents: {
      id: "dents",
      title: "Le Protège-Dents",
      shortDesc: "Protection de la mâchoire",
      fullDesc: "Accessoire vital à tout âge et niveau. Il s'adapte à votre dentition (souvent moulé à chaud). Il protège les dents mais sert surtout à absorber l'onde de choc et ainsi prévenir les commotions cérébrales et les blessures à la langue.",
      top: "20%", left: "50%"
    },
    gants: {
      id: "gants",
      title: "Les Gants & Bandes",
      shortDesc: "L'arme et le bouclier",
      fullDesc: "Vos gants (généralement 10 à 16 Oz) protègent vos phalanges et votre partenaire d'entraînement. N'oubliez jamais les bandes en dessous : elles maintiennent vos articulations, verrouillent le poignet et absorbent la transpiration.",
      top: "55%", left: "36.5%"
    },
    coquille: {
      id: "coquille",
      title: "La Coquille",
      shortDesc: "Protection pelvienne",
      fullDesc: "Les coups bas (sous la ceinture) sont fréquents par erreur, surtout en entraînement. La coquille (homme) ou le protège-pelvien (femme) est une sécurité absolue pour éviter des douleurs extrêmes.",
      top: "47%", left: "50%"
    },
    chaussures: {
      id: "chaussures",
      title: "Chaussures de Boxe",
      shortDesc: "Maintien et appuis",
      fullDesc: "Les chaussures montantes assurent un verrouillage parfait de la cheville, indispensable pour les changements de direction explosifs. La semelle plate favorise l'ancrage au sol et l'efficacité de vos coups.",
      top: "88%", left: "42%"
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0a0a0a] text-white pt-28 pb-16 px-4 md:px-8 relative overflow-hidden">
      {/* Background Effect */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.1) 10px, rgba(255, 255, 255, 0.1) 20px)' }}
      />

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center">
        {/* Header Section */}
        <div className="w-full flex flex-col items-center text-center mb-8 lg:mb-12">
          <div className="w-full flex justify-start mb-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group font-inter">
              <span className="transform transition-transform group-hover:-translate-x-1">←</span> Retour
            </button>
          </div>
          <h3 className="font-bebas text-5xl md:text-7xl tracking-widest text-white mb-4 uppercase">
            Guide de <span className="text-red-600">L'équipement</span>
          </h3>
          <p className="text-gray-400 font-inter text-lg max-w-2xl">
            Cliquez sur les différents points de l'anatomie du boxeur pour découvrir le matériel indispensable et ses spécificités.
          </p>
        </div>

        {/* Content Section (Side by Side) */}
        <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-center">
          
          {/* Left Side: Interactive Character */}
          <div className="w-full lg:w-1/2 flex justify-center relative">
            <div className="relative w-full max-w-[500px] xl:max-w-[600px] mt-4">
              <img 
                src={IMG_BOXER_ANATOMY} 
                alt="Anatomie de l'équipement" 
                className="w-full h-auto object-contain drop-shadow-2xl opacity-90 transition-opacity duration-300"
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=800"; }}
              />

              {/* Hotspots */}
              {Object.values(equipmentData).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 z-20 ${
                    selectedItem?.id === item.id ? "bg-red-600 scale-110 ring-4 ring-red-500/50" : "bg-black/80 border-2 border-red-600 animate-pulse hover:bg-red-600/80"
                  }`}
                  style={{ top: item.top, left: item.left }}
                  aria-label={`Voir les détails pour ${item.title}`}
                >
                  <div className={`w-3 h-3 rounded-full ${selectedItem?.id === item.id ? "bg-white" : "bg-red-500"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: Details Panel */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center min-h-[500px]">
            {selectedItem ? (
              <div className="bg-gray-900/80 border border-gray-800 p-6 md:p-8 rounded-lg shadow-2xl backdrop-blur-sm animate-fade-in relative">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                  aria-label="Fermer"
                >
                  <X size={24} />
                </button>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-8 bg-red-600" />
                  <div>
                    <h2 className="font-bebas text-3xl md:text-4xl text-white tracking-wider">{selectedItem.title}</h2>
                    <p className="text-red-500 text-sm font-semibold uppercase tracking-widest">{selectedItem.shortDesc}</p>
                  </div>
                </div>

                <p className="text-gray-300 font-inter leading-relaxed">
                  {selectedItem.fullDesc}
                </p>
              </div>
            ) : (
              <div className="bg-gray-900/30 border border-gray-800 border-dashed p-10 flex flex-col items-center justify-center text-center rounded-lg h-[400px]">
                <div className="w-16 h-16 rounded-full border-4 border-red-600/30 border-t-red-600 animate-spin mb-6" />
                <p className="text-gray-400 font-inter text-lg">Sélectionnez un point sur le boxeur pour afficher les détails de l'équipement.</p>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default GuideStuff;