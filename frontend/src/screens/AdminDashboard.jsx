import { useState, useEffect } from "react";
import { securedFetch } from "../utils/api";
import { FiTrash2, FiUserX, FiUserCheck, FiEdit2, FiX, FiSave, FiMessageSquare } from "react-icons/fi";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const fetchUsers = async () => {
    try {
      const response = await securedFetch("/api/users");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des utilisateurs");
      }
      const data = await response.json();
      const members = data["hydra:member"] || data.member || [];
      setUsers(members);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await securedFetch("/api/reports");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des signalements");
      }
      const data = await response.json();
      const members = data["hydra:member"] || data.member || [];
      setReports(members);
    } catch (error) {
      console.error("Erreur lors de la récupération des signalements:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchReports()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleUserStatus = async (user) => {
    try {
      await securedFetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/merge-patch+json",
        },
        body: JSON.stringify({
          isActive: !user.isActive,
        }),
      });
      // Refresh
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la modification de l'utilisateur", error);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user.id);
    setEditFormData({
      email: user.email || "",
      pseudo: user.pseudo || "",
      budget: user.budget || 0,
      weight: user.weight || "",
      roles: user.roles || ["ROLE_USER"],
    });
  };

  const handleRoleToggle = (role) => {
    setEditFormData((prev) => {
      const roles = prev.roles || [];
      if (roles.includes(role)) {
        return { ...prev, roles: roles.filter((r) => r !== role) };
      } else {
        return { ...prev, roles: [...roles, role] };
      }
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await securedFetch(`/api/users/${editingUser}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/merge-patch+json",
        },
        body: JSON.stringify({
          email: editFormData.email,
          pseudo: editFormData.pseudo,
          budget: Number(editFormData.budget),
          weight: editFormData.weight ? editFormData.weight.toString() : null,
          roles: editFormData.roles,
        }),
      });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde", error);
    }
  };

  const handleDeleteReport = async (reportId) => {
    try {
      await securedFetch(`/api/reports/${reportId}`, {
        method: "DELETE",
      });
      // Refresh
      fetchReports();
    } catch (error) {
      console.error("Erreur lors de la suppression du signalement", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 md:px-12 lg:px-24 pb-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          Dashboard Administrateur
        </h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-gray-800 pb-2">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 font-semibold text-lg transition-colors ${
              activeTab === "users"
                ? "text-red-500 border-b-2 border-red-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Utilisateurs
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 font-semibold text-lg transition-colors ${
              activeTab === "reports"
                ? "text-red-500 border-b-2 border-red-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Signalements
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl p-6">
            {activeTab === "users" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="py-4 px-4">ID</th>
                      <th className="py-4 px-4">Email</th>
                      <th className="py-4 px-4">Pseudo</th>
                      <th className="py-4 px-4">Rôles</th>
                      <th className="py-4 px-4">Statut</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-gray-500">
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
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                user.isActive
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {user.isActive ? "Actif" : "Banni"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => handleToggleUserStatus(user)}
                              className={`p-2 rounded-lg transition-colors ${
                                user.isActive
                                  ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                  : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                              }`}
                              title={user.isActive ? "Bannir" : "Réactiver"}
                            >
                              {user.isActive ? <FiUserX size={20} /> : <FiUserCheck size={20} />}
                            </button>
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
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="py-4 px-4">ID</th>
                      <th className="py-4 px-4">Motif</th>
                      <th className="py-4 px-4">Signalant</th>
                      <th className="py-4 px-4">Cible</th>
                      <th className="py-4 px-4">Date</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-gray-500">
                          Aucun signalement trouvé.
                        </td>
                      </tr>
                    ) : (
                      reports.map((report) => (
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
                            {report.message?.users?.pseudo || "Conversation"}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-400">
                            {new Date(report.createdAt).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="py-4 px-4 text-right flex justify-end gap-2">
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
                            <button
                                onClick={() => handleDeleteReport(report.id)}
                                className="p-2 bg-gray-800 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                                title="Supprimer / Clôturer"
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
            )}
          </div>
        )}

        {/* Modal Modification Utilisateur */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#111] border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
              <button 
                onClick={() => setEditingUser(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <FiX size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-6 text-white">Modifier l'utilisateur #{editingUser}</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditChange}
                    required
                    className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Pseudo</label>
                  <input
                    type="text"
                    name="pseudo"
                    value={editFormData.pseudo}
                    onChange={handleEditChange}
                    className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Budget (€)</label>
                    <input
                      type="number"
                      name="budget"
                      value={editFormData.budget}
                      onChange={handleEditChange}
                      className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Poids (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="weight"
                      value={editFormData.weight}
                      onChange={handleEditChange}
                      className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Rôles</label>
                  <div className="flex flex-wrap gap-3">
                    {['ROLE_USER', 'ROLE_ADMIN'].map(role => (
                      <label key={role} className="flex items-center space-x-2 bg-[#1A1A1A] border border-gray-700 rounded-lg px-3 py-2 cursor-pointer hover:border-red-500 transition-colors">
                        <input
                          type="checkbox"
                          checked={editFormData.roles?.includes(role)}
                          onChange={() => handleRoleToggle(role)}
                          className="w-4 h-4 text-red-600 bg-[#111] border-gray-600 rounded focus:ring-red-500 focus:ring-offset-gray-900"
                        />
                        <span className="text-sm font-medium text-white">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <FiSave size={16} />
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
