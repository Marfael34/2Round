import { FiTrash2, FiMessageSquare, FiTag, FiShield } from "react-icons/fi";

const AllReports = ({ reports, handleDeleteReport, handleOpenSanctionModal, handleOpenProductModal }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400">
            <th className="py-4 px-4">ID</th>
            <th className="py-4 px-4">Motif</th>
            <th className="py-4 px-4">Type</th>
            <th className="py-4 px-4">Signalant</th>
            <th className="py-4 px-4">Cible</th>
            <th className="py-4 px-4">Date</th>
            <th className="py-4 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.length === 0 ? (
            <tr>
              <td colSpan="7" className="py-8 text-center text-gray-500">
                Aucun signalement trouvé.
              </td>
            </tr>
          ) : (
            reports.map((report) => {
              let targetId = report.reportedUser?.id;
              let targetPseudo = report.reportedUser?.pseudo;
              if (!targetId && report.message?.users?.id) {
                targetId = report.message.users.id;
                targetPseudo = report.message.users.pseudo;
              }
              if (!targetId && report.product?.seller?.id) {
                targetId = report.product.seller.id;
                targetPseudo = report.product.seller.pseudo;
              }
              if (!targetId && report.conversation) {
                const senderId = report.sender?.id;
                const buyerId = report.conversation.buyer?.id;
                const sellerId = report.conversation.seller?.id;
                if (senderId && buyerId && sellerId) {
                  if (Number(senderId) === Number(buyerId)) {
                    targetId = report.conversation.seller?.id;
                    targetPseudo = report.conversation.seller?.pseudo;
                  } else {
                    targetId = report.conversation.buyer?.id;
                    targetPseudo = report.conversation.buyer?.pseudo;
                  }
                }
              }
              const candidates = [
                { role: "Signalant", id: report.sender?.id, pseudo: report.sender?.pseudo },
                { role: "Cible", id: targetId, pseudo: targetPseudo }
              ].filter(c => c.id);

              return (
              <tr
                key={report.id}
                className="border-b border-gray-800/50 hover:bg-[#151515] transition-colors"
              >
                <td className="py-4 px-4">#{report.id}</td>
                <td className="py-4 px-4 font-semibold text-red-400">
                  <div className="flex items-center gap-2">
                    {report.reason}
                    {report.status === 'processed' && (
                      <span className="bg-green-900/50 text-green-400 text-[10px] px-2 py-0.5 rounded-full border border-green-500/30 uppercase tracking-widest">
                        Traité
                      </span>
                    )}
                  </div>
                  {report.description && (
                    <p className="text-xs text-gray-400 max-w-xs truncate mt-1" title={report.description}>
                      {report.description}
                    </p>
                  )}
                </td>
                <td className="py-4 px-4 text-gray-300">
                  {report.product ? "Produit" : report.message ? "Message" : report.conversation ? "Conversation" : "Utilisateur"}
                </td>
                <td className="py-4 px-4 text-gray-300">
                  {report.sender?.pseudo || "Inconnu"}
                </td>
                <td className="py-4 px-4 text-gray-300">
                  {(() => {
                    if (report.reportedUser?.pseudo) return report.reportedUser.pseudo;
                    if (report.message?.users?.pseudo) return report.message.users.pseudo;
                    if (report.product?.seller?.pseudo) return report.product.seller.pseudo;
                    if (report.conversation) {
                      const senderId = report.sender?.id;
                      const buyerId = report.conversation.buyer?.id;
                      const sellerId = report.conversation.seller?.id;
                      if (senderId && buyerId && sellerId) {
                        if (Number(senderId) === Number(buyerId)) return report.conversation.seller?.pseudo || "Inconnu";
                        return report.conversation.buyer?.pseudo || "Inconnu";
                      }
                    }
                    return "Inconnu";
                  })()}
                </td>
                <td className="py-4 px-4 text-sm text-gray-400">
                  {new Date(report.createdAt).toLocaleDateString("fr-FR")}
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    {(report.conversation?.id || report.message?.conversation?.id) && (
                      <button
                        onClick={() => {
                          const cId = report.conversation?.id || report.message?.conversation?.id;
                          window.location.href = `/conversation?conversationId=${cId}`;
                        }}
                        className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-colors"
                        title="Voir la discussion"
                      >
                        <FiMessageSquare size={20} />
                      </button>
                    )}
                    {report.product && (
                      <button
                        onClick={() => {
                          if (handleOpenProductModal) {
                            handleOpenProductModal(report);
                          } else {
                            const productId = typeof report.product === 'object' ? (report.product.id || report.product['@id']?.split('/').pop()) : report.product.split('/').pop();
                            window.location.href = `/product/${productId}`;
                          }
                        }}
                        className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg transition-colors"
                        title="Voir le produit"
                      >
                        <FiTag size={20} />
                      </button>
                    )}
                    {candidates.length > 0 && report.status !== 'processed' && (
                      <button
                        onClick={() => handleOpenSanctionModal(candidates, report.id)}
                        className="p-2 bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors flex items-center justify-center border border-red-900/50 hover:border-red-500"
                        title="Appliquer une sanction"
                      >
                        <FiShield size={20} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="p-2 bg-gray-800 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                      title="Supprimer / Clôturer le signalement"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
      </table>
    </div>
  );
};

export default AllReports;
