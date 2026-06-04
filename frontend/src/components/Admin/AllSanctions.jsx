import { useState, useEffect } from 'react';
import { securedFetch } from '../../utils/api';
import { FiTrash2, FiAlertTriangle, FiUserX, FiClock } from 'react-icons/fi';
import { useConfirm } from '../../contexts/ConfirmContext';

const AllSanctions = () => {
  const [sanctions, setSanctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { confirm, alert: customAlert } = useConfirm();

  useEffect(() => {
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

    fetchSanctions();
  }, []);

  const handleDeleteSanction = async (sanction) => {
    const isConfirmed = await confirm("Êtes-vous sûr de vouloir supprimer cette trace de sanction du casier ?");
    if (!isConfirmed) return;
    try {
      const response = await securedFetch(`/api/sanctions/${sanction.id}`, { method: 'DELETE' });
      if (response.ok) {
        setSanctions(sanctions.filter(s => s.id !== sanction.id));

        if (sanction.type === 'BAN' || sanction.type === 'MUTE') {
          const isRevokeConfirmed = await confirm("Voulez-vous également lever l'effet de cette sanction sur l'utilisateur (le débannir ou annuler sa suspension) ?");
          if (isRevokeConfirmed) {
            const userId = sanction.targetUser?.id || (typeof sanction.targetUser === 'string' ? sanction.targetUser.split('/').pop() : null);
            if (userId) {
              await securedFetch(`/api/users/${userId}`, {
                method: 'PATCH',
                headers: { "Content-Type": "application/merge-patch+json" },
                body: JSON.stringify(sanction.type === 'BAN' ? { isActive: true } : { bannedUntil: null })
              });
              await customAlert("L'effet de la sanction a été révoqué avec succès.");
            }
          }
        }
      }
    } catch (error) {
      console.error("Erreur de suppression", error);
    }
  };

  if (loading) {
    return <div className="text-gray-400 p-8 text-center">Chargement de l'historique des sanctions...</div>;
  }

  const filteredSanctions = sanctions.filter(s => 
    s.id?.toString().includes(searchQuery) ||
    s.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.targetUser?.pseudo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.targetUser?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center bg-[#151515] border border-gray-800 rounded-lg px-4 py-2 w-full max-w-md">
        <span className="text-gray-500 mr-3">🔍</span>
        <input
          type="text"
          placeholder="Rechercher par ID, utilisateur, motif, type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-600"
        />
      </div>

      {filteredSanctions.length === 0 ? (
        <div className="py-8 text-center text-gray-500 bg-[#111] rounded-xl border border-gray-800">
          Aucune sanction enregistrée.
        </div>
      ) : (
        <>
          {/* Mobile View: Cards */}
          <div className="md:hidden space-y-4">
            {filteredSanctions.map((sanction) => (
              <div key={sanction.id} className="bg-[#151515] p-5 rounded-xl border border-gray-800 space-y-3 relative">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 font-bold text-red-500 uppercase text-xs tracking-wider bg-red-500/10 px-3 py-1.5 rounded-lg">
                    {sanction.type === 'WARNING' && <FiAlertTriangle size={16} />}
                    {sanction.type === 'MUTE' && <FiClock size={16} />}
                    {sanction.type === 'BAN' && <FiUserX size={16} />}
                    {sanction.type === 'WARNING' ? 'Avertissements' : sanction.type === 'MUTE' ? 'Bannissement temporaire' : sanction.type === 'BAN' ? 'Bannissement définitif' : sanction.type}
                  </div>
                  <span className="text-xs text-gray-500 font-medium bg-[#1A1A1A] px-2 py-1 rounded-md">#{sanction.id}</span>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-gray-400">Utilisateur ciblé</div>
                  <div className="text-white font-medium">{sanction.targetUser?.pseudo || sanction.targetUser?.email || "Inconnu"}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-gray-400">Motif</div>
                  <div className="text-gray-300 text-sm italic">{sanction.reason || "Non précisé"}</div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-800 mt-2">
                  <div className="text-xs text-gray-500 flex flex-col">
                    <span>{new Date(sanction.createdAt).toLocaleDateString('fr-FR')}</span>
                    <span>{new Date(sanction.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteSanction(sanction)}
                    className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-colors flex items-center justify-center border border-red-500/20 hover:border-red-600"
                    title="Supprimer la trace de la sanction"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block overflow-x-auto bg-[#111] rounded-xl border border-gray-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 bg-[#0A0A0A]">
                  <th className="py-4 px-6 font-medium text-sm">ID</th>
                  <th className="py-4 px-6 font-medium text-sm">Type</th>
                  <th className="py-4 px-6 font-medium text-sm">Motif</th>
                  <th className="py-4 px-6 font-medium text-sm">Utilisateur Ciblé</th>
                  <th className="py-4 px-6 font-medium text-sm">Date</th>
                  <th className="py-4 px-6 text-right font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSanctions.map((sanction) => (
                  <tr key={sanction.id} className="border-b border-gray-800/50 hover:bg-[#1A1A1A] transition-colors">
                    <td className="py-4 px-6 text-gray-400">#{sanction.id}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 font-bold text-red-500 uppercase text-xs tracking-wider">
                        {sanction.type === 'WARNING' && <FiAlertTriangle size={16} />}
                        {sanction.type === 'MUTE' && <FiClock size={16} />}
                        {sanction.type === 'BAN' && <FiUserX size={16} />}
                        {sanction.type === 'WARNING' ? 'Avertissements' : sanction.type === 'MUTE' ? 'Bannissement temporaire' : sanction.type === 'BAN' ? 'Bannissement définitif' : sanction.type}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-300">
                      {sanction.reason || <span className="italic text-gray-600">Non précisé</span>}
                    </td>
                    <td className="py-4 px-6 font-medium text-white">
                      {sanction.targetUser?.pseudo || sanction.targetUser?.email || "Inconnu"}
                    </td>
                    <td className="py-4 px-6 text-gray-400 text-sm">
                      {new Date(sanction.createdAt).toLocaleDateString('fr-FR')} à {new Date(sanction.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteSanction(sanction)}
                        className="p-2 bg-gray-800 text-gray-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors border border-gray-700 hover:border-red-600 inline-flex items-center justify-center"
                        title="Supprimer la trace de la sanction"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AllSanctions;
