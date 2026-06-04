import { useState, useEffect } from 'react';
import { securedFetch } from '../../utils/api';
import { FiAlertTriangle, FiClock, FiTrash2 } from 'react-icons/fi';

const UserSanctions = ({ sanctionUris, isAdmin, onDeleteSanction }) => {
  const [sanctions, setSanctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSanctions = async () => {
      try {
        if (!sanctionUris || sanctionUris.length === 0) {
          setLoading(false);
          return;
        }

        const sanctionPromises = sanctionUris.map(async (uri) => {
          const id = typeof uri === 'object' ? uri.id : uri.split('/').pop();
          const response = await securedFetch(`/api/sanctions/${id}`);
          if (response.ok) return await response.json();
          return null;
        });

        const results = await Promise.all(sanctionPromises);
        setSanctions(results.filter(s => s !== null).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (error) {
        console.error("Erreur lors de la récupération des sanctions :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSanctions();
  }, [sanctionUris]);

  if (loading) {
    return <div className="text-gray-400 py-10">Chargement de l'historique...</div>;
  }

  if (sanctions.length === 0) {
    return (
      <div className="bg-[#111] border border-gray-800 p-8 rounded-lg text-center mt-8">
        <FiClock className="mx-auto text-4xl text-gray-600 mb-4" />
        <p className="text-gray-400 text-lg">Votre casier est vierge. Aucune sanction à l'horizon.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {sanctions.map((sanction, index) => (
        <div key={index} className="bg-red-950/20 border border-red-900/50 p-4 md:p-6 rounded-lg flex flex-col sm:flex-row items-start gap-3 md:gap-4 relative">
          <div className="p-2 md:p-3 bg-red-900/40 text-red-500 rounded-full flex-shrink-0">
            <FiAlertTriangle className="text-xl md:text-2xl" />
          </div>
          <div className="flex-1 w-full pr-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
              <h4 className="text-lg md:text-xl font-bold text-red-500 uppercase tracking-wider leading-tight">
                {sanction.type === 'WARNING' ? 'Avertissement' : sanction.type === 'MUTE' ? 'Désactivation Temporaire' : sanction.type === 'BAN' ? 'Bannissement' : sanction.type}
              </h4>
              <span className="text-xs md:text-sm text-gray-500 whitespace-nowrap">
                {new Date(sanction.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              {sanction.reason || "Aucun motif spécifique n'a été fourni par l'administration."}
            </p>
          </div>
          {isAdmin && onDeleteSanction && (
            <button
              onClick={() => onDeleteSanction(sanction.id, sanction.type)}
              className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-colors border border-red-500/20 hover:border-red-600"
              title="Supprimer cette sanction et révoquer l'effet si applicable"
            >
              <FiTrash2 size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default UserSanctions;
