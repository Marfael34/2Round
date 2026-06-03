import { useState, useEffect } from 'react';
import { securedFetch } from '../../utils/api';
import { FiTrash2, FiAlertTriangle, FiUserX, FiVolumeX } from 'react-icons/fi';

const AllSanctions = () => {
  const [sanctions, setSanctions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSanctions = async () => {
    try {
      const response = await securedFetch('/api/sanctions');
      if (response.ok) {
        const data = await response.json();
        const items = data['hydra:member'] || data.member || (Array.isArray(data) ? data : []);
        setSanctions(items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (error) {
      console.error("Erreur de récupération des sanctions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSanctions();
  }, []);

  const handleDeleteSanction = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette sanction ? Cela ne révoquera pas automatiquement l'effet (ex: débannir).")) return;
    try {
      const response = await securedFetch(`/api/sanctions/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setSanctions(sanctions.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error("Erreur de suppression", error);
    }
  };

  if (loading) {
    return <div className="text-gray-400 p-8 text-center">Chargement de l'historique des sanctions...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400">
            <th className="py-4 px-4">ID</th>
            <th className="py-4 px-4">Type</th>
            <th className="py-4 px-4">Motif</th>
            <th className="py-4 px-4">Utilisateur Ciblé</th>
            <th className="py-4 px-4">Date</th>
            <th className="py-4 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sanctions.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-8 text-center text-gray-500">
                Aucune sanction enregistrée.
              </td>
            </tr>
          ) : (
            sanctions.map((sanction) => (
              <tr key={sanction.id} className="border-b border-gray-800/50 hover:bg-[#151515] transition-colors">
                <td className="py-4 px-4">#{sanction.id}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2 font-bold text-red-500 uppercase text-xs tracking-wider">
                    {sanction.type === 'WARNING' && <FiAlertTriangle size={16} />}
                    {sanction.type === 'MUTE' && <FiVolumeX size={16} />}
                    {sanction.type === 'BAN' && <FiUserX size={16} />}
                    {sanction.type}
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-300">
                  {sanction.reason || <span className="italic text-gray-500">Non précisé</span>}
                </td>
                <td className="py-4 px-4 text-gray-300">
                  {sanction.targetUser?.pseudo || sanction.targetUser?.email || "Inconnu"}
                </td>
                <td className="py-4 px-4 text-gray-400 text-sm">
                  {new Date(sanction.createdAt).toLocaleDateString('fr-FR')} à {new Date(sanction.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                </td>
                <td className="py-4 px-4 text-right">
                  <button
                    onClick={() => handleDeleteSanction(sanction.id)}
                    className="p-2 bg-gray-800 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                    title="Supprimer la trace de la sanction"
                  >
                    <FiTrash2 size={20} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AllSanctions;
