import { FiTrash2, FiShield } from "react-icons/fi";

const UserReports = ({ reports, handleDeleteReport, handleOpenSanctionModal }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400">
            <th className="py-4 px-4">ID</th>
            <th className="py-4 px-4">Motif</th>
            <th className="py-4 px-4">Signalant</th>
            <th className="py-4 px-4">Utilisateur Ciblé</th>
            <th className="py-4 px-4">Date</th>
            <th className="py-4 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-8 text-center text-gray-500">
                Aucun signalement d'utilisateur trouvé.
              </td>
            </tr>
          ) : (
            reports.map((report) => {
              const candidates = [
                { role: "Signalant", id: report.sender?.id, pseudo: report.sender?.pseudo },
                { role: "Cible", id: report.reportedUser?.id, pseudo: report.reportedUser?.pseudo }
              ].filter(c => c.id);

              return (
              <tr
                key={report.id}
                className="border-b border-gray-800/50 hover:bg-[#151515] transition-colors"
              >
                <td className="py-4 px-4">#{report.id}</td>
                <td className="py-4 px-4 font-semibold text-red-400">
                  {report.reason}
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
                  {report.reportedUser?.pseudo || "Inconnu"}
                </td>
                <td className="py-4 px-4 text-sm text-gray-400">
                  {new Date(report.createdAt).toLocaleDateString("fr-FR")}
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    {candidates.length > 0 && (
                      <button
                        onClick={() => handleOpenSanctionModal(candidates)}
                        className="p-2 bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors flex items-center justify-center border border-red-900/50 hover:border-red-500"
                        title="Appliquer une sanction"
                      >
                        <FiShield size={20} />
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

export default UserReports;
