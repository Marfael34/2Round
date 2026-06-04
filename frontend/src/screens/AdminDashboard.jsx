import { useState, useEffect, useCallback } from "react";
import { securedFetch } from "../utils/api";
import { FiX, FiSave } from "react-icons/fi";
import UserReports from "../components/Admin/UserReports";
import ProductReports from "../components/Admin/ProductReports";
import ConversationReports from "../components/Admin/ConversationReports";
import MessageReports from "../components/Admin/MessageReports";
import AllSanctions from "../components/Admin/AllSanctions";
import UsersTable from "../components/Admin/UsersTable";
import AllReports from "../components/Admin/AllReports";
import TransactionsTable from "../components/Admin/TransactionsTable";
import OrdersTable from "../components/Admin/OrdersTable";
import AdminProductModal from "../components/Admin/AdminProductModal";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [reportFilter, setReportFilter] = useState("all");
  const [sanctionModalOpen, setSanctionModalOpen] = useState(false);
  const [sanctionTargetCandidates, setSanctionTargetCandidates] = useState([]);
  const [sanctionFormData, setSanctionFormData] = useState({ targetUserId: "", targetUserPseudo: "", type: "WARNING", reason: "", reportId: null });
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedReportForProduct, setSelectedReportForProduct] = useState(null);

  const handleOpenProductModal = (report) => {
    setSelectedReportForProduct(report);
    setProductModalOpen(true);
  };

  const fetchUsers = useCallback(async () => {
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
  }, []);

  const fetchReports = useCallback(async () => {
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
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await securedFetch("/api/orders");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des transactions");
      }
      const data = await response.json();
      const members = data["hydra:member"] || data.member || [];
      setTransactions(members);
    } catch (error) {
      console.error("Erreur lors de la récupération des transactions:", error);
    }
  }, []);

  const handleUpdateTransactionStatus = async (transactionId, newStatus) => {
    try {
      const response = await securedFetch(`/api/orders/${transactionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/merge-patch+json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });
      if (response.ok) {
        fetchTransactions();
      } else {
        alert("Erreur lors de la mise à jour du statut.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur réseau ou serveur.");
    }
  };

  const handleForcePayment = async (transactionId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir libérer les fonds pour le vendeur ?")) return;
    try {
      const response = await securedFetch("/api/admin/orders/force-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: transactionId }),
      });
      if (response.ok) {
        alert("Fonds libérés avec succès !");
        fetchTransactions();
      } else {
        alert("Erreur lors de la libération des fonds.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur réseau ou serveur.");
    }
  };

  const handleRefund = async (transactionId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler et rembourser cette commande ?")) return;
    try {
      const response = await securedFetch("/api/admin/orders/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: transactionId }),
      });
      if (response.ok) {
        alert("Commande remboursée avec succès !");
        fetchTransactions();
      } else {
        alert("Erreur lors du remboursement.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur réseau ou serveur.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      // loading est déjà à true initialement
      await Promise.all([fetchUsers(), fetchReports(), fetchTransactions()]);
      setLoading(false);
    };
    loadData();
  }, [fetchUsers, fetchReports, fetchTransactions]);

  const handleToggleUserStatus = async (user) => {
    // ... rest of the code is there, wait, I can just insert it at the top of the component!
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

  const handleOpenSanctionModal = (candidates, reportId = null) => {
    const validCandidates = candidates.filter(c => c && c.id);
    setSanctionTargetCandidates(validCandidates);
    if (validCandidates.length > 0) {
      setSanctionFormData({ 
        ...sanctionFormData, 
        targetUserId: validCandidates[0].id, 
        targetUserPseudo: validCandidates[0].pseudo,
        reportId: reportId
      });
    } else {
      setSanctionFormData({ ...sanctionFormData, reportId: reportId });
    }
    setSanctionModalOpen(true);
  };

  const submitSanction = async (e) => {
    e.preventDefault();
    try {
      await securedFetch(`/api/sanctions`, {
        method: "POST",
        headers: { "Content-Type": "application/ld+json" },
        body: JSON.stringify({
          type: sanctionFormData.type,
          reason: sanctionFormData.reason,
          targetUser: `/api/users/${sanctionFormData.targetUserId}`
        }),
      });

      if (sanctionFormData.type === "BAN") {
        await securedFetch(`/api/users/${sanctionFormData.targetUserId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/merge-patch+json" },
          body: JSON.stringify({ isActive: false }),
        });
      }

      if (sanctionFormData.reportId) {
        await securedFetch(`/api/reports/${sanctionFormData.reportId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/merge-patch+json" },
          body: JSON.stringify({ status: "processed" }),
        });
      }

      alert(`Sanction appliquée avec succès à ${sanctionFormData.targetUserPseudo || sanctionFormData.targetUserId}`);
      setSanctionModalOpen(false);
      setSanctionFormData({ targetUserId: "", targetUserPseudo: "", type: "WARNING", reason: "", reportId: null });
      fetchUsers();
      fetchReports();
    } catch (error) {
      console.error("Erreur lors de l'application de la sanction", error);
      alert("Erreur lors de l'application de la sanction");
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

  const filteredReports = reports.filter((report) => {
    if (reportFilter === "all") return true;
    if (reportFilter === "product") return !!report.product;
    if (reportFilter === "message") return !!report.message;
    if (reportFilter === "conversation") return !!report.conversation;
    if (reportFilter === "user") return !report.product && !report.message && !report.conversation;
    return true;
  });

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 md:px-12 lg:px-24 pb-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-linear-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          Dashboard Administrateur
        </h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 pb-4 border-b border-gray-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === "users"
                ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
                : "bg-[#1A1A1A] text-gray-400 hover:bg-[#252525] hover:text-white"
            }`}
          >
            Utilisateurs
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === "reports"
                ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
                : "bg-[#1A1A1A] text-gray-400 hover:bg-[#252525] hover:text-white"
            }`}
          >
            Signalements
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === "transactions"
                ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
                : "bg-[#1A1A1A] text-gray-400 hover:bg-[#252525] hover:text-white"
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === "orders"
                ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
                : "bg-[#1A1A1A] text-gray-400 hover:bg-[#252525] hover:text-white"
            }`}
          >
            Commandes
          </button>
          <button
            onClick={() => setActiveTab("sanctions")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === "sanctions"
                ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
                : "bg-[#1A1A1A] text-gray-400 hover:bg-[#252525] hover:text-white"
            }`}
          >
            Sanctions
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl p-6">
            {activeTab === "users" ? (
              <UsersTable users={users} handleToggleUserStatus={handleToggleUserStatus} handleEditClick={handleEditClick} />
            ) : activeTab === "transactions" ? (
              <TransactionsTable 
                transactions={transactions} 
                handleForcePayment={handleForcePayment}
                handleRefund={handleRefund}
              />
            ) : activeTab === "orders" ? (
              <OrdersTable 
                transactions={transactions} 
                handleUpdateTransactionStatus={handleUpdateTransactionStatus}
                handleForcePayment={handleForcePayment}
                handleRefund={handleRefund}
              />
            ) : activeTab === "reports" ? (
              <div>
                {/* Sous-onglets de signalements */}
                <div className="flex gap-2 mb-6 overflow-x-auto border-b border-gray-800 pb-4">
                  {[
                    { id: "all", label: "Tous" },
                    { id: "user", label: "Utilisateurs" },
                    { id: "product", label: "Produits" },
                    { id: "conversation", label: "Conversations" },
                    { id: "message", label: "Messages" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setReportFilter(tab.id)}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors text-sm font-medium ${
                        reportFilter === tab.id
                          ? "bg-gray-800 text-white"
                          : "bg-transparent text-gray-400 hover:bg-gray-900 hover:text-gray-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {reportFilter === "user" ? (
                  <UserReports reports={filteredReports} handleDeleteReport={handleDeleteReport} handleOpenSanctionModal={handleOpenSanctionModal} />
                ) : reportFilter === "product" ? (
                  <ProductReports reports={filteredReports} handleDeleteReport={handleDeleteReport} handleOpenSanctionModal={handleOpenSanctionModal} handleOpenProductModal={handleOpenProductModal} />
                ) : reportFilter === "conversation" ? (
                  <ConversationReports reports={filteredReports} handleDeleteReport={handleDeleteReport} handleOpenSanctionModal={handleOpenSanctionModal} />
                ) : reportFilter === "message" ? (
                  <MessageReports reports={filteredReports} handleDeleteReport={handleDeleteReport} handleOpenSanctionModal={handleOpenSanctionModal} />
                ) : (
                  <AllReports reports={filteredReports} handleDeleteReport={handleDeleteReport} handleOpenSanctionModal={handleOpenSanctionModal} handleOpenProductModal={handleOpenProductModal} />
              )}
            </div>
            ) : activeTab === "sanctions" ? (
              <AllSanctions />
            ) : null}
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

        {/* Modal de Sanction */}
        {sanctionModalOpen && sanctionTargetCandidates.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#111] rounded-2xl w-full max-w-md border border-gray-800 shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-gray-800">
                <h3 className="text-xl font-bold text-white">Appliquer une sanction</h3>
                <button
                  onClick={() => setSanctionModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>
              <form onSubmit={submitSanction} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Qui voulez-vous sanctionner ?</label>
                  <div className="space-y-2">
                    {sanctionTargetCandidates.map((candidate, idx) => (
                      <label key={idx} className="flex items-center space-x-3 cursor-pointer bg-[#1A1A1A] p-3 rounded-lg border border-gray-700 hover:border-red-500 transition-colors">
                        <input 
                          type="radio" 
                          name="targetUser" 
                          value={candidate.id}
                          checked={String(sanctionFormData.targetUserId) === String(candidate.id)}
                          onChange={() => setSanctionFormData({ ...sanctionFormData, targetUserId: candidate.id, targetUserPseudo: candidate.pseudo })}
                          className="w-4 h-4 text-red-600 bg-[#111] border-gray-600 focus:ring-red-500"
                        />
                        <span className="text-white text-sm">
                          <span className="font-bold">{candidate.role}</span> : {candidate.pseudo || "Inconnu"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Type de Sanction</label>
                  <select
                    value={sanctionFormData.type}
                    onChange={(e) => setSanctionFormData({ ...sanctionFormData, type: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                  >
                    <option value="WARNING">Avertissement</option>
                    <option value="MUTE">Mute (Désactivation temporaire)</option>
                    <option value="BAN">Bannissement Définitif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Motif (Optionnel)</label>
                  <textarea
                    value={sanctionFormData.reason}
                    onChange={(e) => setSanctionFormData({ ...sanctionFormData, reason: e.target.value })}
                    rows={4}
                    placeholder="Précisez la raison de la sanction..."
                    className="w-full bg-[#1A1A1A] border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all resize-none"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSanctionModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <FiSave size={16} />
                    Appliquer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Produit (Signalement) */}
        {productModalOpen && (
          <AdminProductModal 
            report={selectedReportForProduct} 
            onClose={() => {
              setProductModalOpen(false);
              setSelectedReportForProduct(null);
            }} 
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
