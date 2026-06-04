import { FiTrash2, FiTag, FiShield, FiXCircle } from "react-icons/fi";

const ProductReports = ({ reports, handleDeleteReport, handleDismissReport, handleOpenSanctionModal, handleOpenProductModal }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400">
            <th className="py-4 px-4">ID</th>
            <th className="py-4 px-4">Motif</th>
            <th className="py-4 px-4">Signalant</th>
            <th className="py-4 px-4">Vendeur</th>
            <th className="py-4 px-4">Date</th>
            <th className="py-4 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-8 text-center text-gray-500">
                Aucun signalement de produit trouvé.
              </td>
            </tr>
          ) : (
            reports.map((report) => {
              const candidates = [
                { role: "Signalant", id: report.sender?.id, pseudo: report.sender?.pseudo },
                { role: "Vendeur", id: report.product?.seller?.id, pseudo: report.product?.seller?.pseudo }
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
                  {report.sender?.pseudo || "Inconnu"}
                </td>
                <td className="py-4 px-4 text-gray-300">
                  {report.product?.seller?.pseudo || report.reportedUser?.pseudo || "Inconnu"}
                </td>
                <td className="py-4 px-4 text-sm text-gray-400">
                  {new Date(report.createdAt).toLocaleDateString("fr-FR")}
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex justify-end gap-2">
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
                    {report.status !== 'processed' && (
                      <button
                        onClick={() => handleDismissReport(report.id)}
                        className="p-2 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 rounded-lg transition-colors border border-orange-500/20"
                        title="Ignorer sans sanction"
                      >
                        <FiXCircle size={20} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="p-2 bg-gray-800 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                      title="Supprimer / Clôturer"
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

export default ProductReports;
