import { FiUserX, FiUserCheck, FiEdit2 } from "react-icons/fi";

const UsersTable = ({ users, handleToggleUserStatus, handleEditClick, handleViewSanctions }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400">
            <th className="py-4 px-4">ID</th>
            <th className="py-4 px-4">Email</th>
            <th className="py-4 px-4">Pseudo</th>
            <th className="py-4 px-4">Rôles</th>
            <th className="py-4 px-4">Sanctions</th>
            <th className="py-4 px-4">Statut</th>
            <th className="py-4 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="7" className="py-8 text-center text-gray-500">
                Aucun utilisateur trouvé.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-800/50 hover:bg-[#151515] transition-colors"
              >
                <td className="py-4 px-4">#{user.id}</td>
                <td className="py-4 px-4">{user.email}</td>
                <td className="py-4 px-4">{user.pseudo || "N/A"}</td>
                <td className="py-4 px-4 text-xs font-mono text-gray-400">
                  {(user.roles || ["ROLE_USER"]).join(", ")}
                </td>
                <td className="py-4 px-4">
                  {user.sanctions && user.sanctions.length > 0 ? (
                    <button 
                      onClick={() => handleViewSanctions(user)}
                      className="px-3 py-1.5 rounded-lg bg-red-900/20 hover:bg-red-900/40 text-red-400 text-xs font-bold border border-red-800/30 hover:border-red-500/50 transition-colors flex items-center gap-2"
                      title="Voir le détail des sanctions"
                    >
                      {user.sanctions.length} {user.sanctions.length > 1 ? "Sanctions" : "Sanction"}
                    </button>
                  ) : (
                    <span className="text-gray-500 text-sm">Aucune</span>
                  )}
                </td>
                <td className="py-4 px-4">
                  {(() => {
                    const isTemporarilyBanned = user.bannedUntil && new Date(user.bannedUntil) > new Date();
                    
                    if (!user.isActive) {
                      return (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 whitespace-nowrap">
                          BANNI DÉFINITIVEMENT
                        </span>
                      );
                    } else if (isTemporarilyBanned) {
                      const date = new Date(user.bannedUntil);
                      return (
                        <div className="flex flex-col gap-1 items-start">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-500 whitespace-nowrap">
                            SUSPENDU
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium">
                            Jusqu'au {date.toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      );
                    } else {
                      return (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500 whitespace-nowrap">
                          ACTIF
                        </span>
                      );
                    }
                  })()}
                </td>
                <td className="py-4 px-4 text-right">
                  {(() => {
                    const isTemporarilyBanned = user.bannedUntil && new Date(user.bannedUntil) > new Date();

                    if (!user.isActive) {
                      return (
                        <button
                          onClick={() => handleToggleUserStatus(user)}
                          className="p-2 rounded-lg transition-colors bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          title="Réactiver le compte"
                        >
                          <FiUserCheck size={20} />
                        </button>
                      );
                    } else if (isTemporarilyBanned) {
                      return (
                        <button
                          onClick={() => handleToggleUserStatus(user)}
                          className="p-2 rounded-lg transition-colors bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
                          title="Annuler la suspension"
                        >
                          <FiUserCheck size={20} />
                        </button>
                      );
                    } else {
                      return (
                        <button
                          onClick={() => handleToggleUserStatus(user)}
                          className="p-2 rounded-lg transition-colors bg-red-500/10 text-red-500 hover:bg-red-500/20"
                          title="Bannir définitivement"
                        >
                          <FiUserX size={20} />
                        </button>
                      );
                    }
                  })()}
                  <button
                    onClick={() => handleEditClick(user)}
                    className="p-2 ml-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                    title="Modifier"
                  >
                    <FiEdit2 size={20} />
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

export default UsersTable;
