import { useState, useEffect, useCallback } from "react";
import { securedFetch } from "../utils/api";
import { useConfirm } from "../contexts/ConfirmContext";
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
import UserSanctions from "../components/User/UserSanctions";

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
  const [sanctionFormData, setSanctionFormData] = useState({ targetUserId: "", targetUserPseudo: "", type: "WARNING", reason: "", reportId: null, durationDays: "3" });
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedReportForProduct, setSelectedReportForProduct] = useState(null);
  const [viewingUserSanctions, setViewingUserSanctions] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [transactionSearchQuery, setTransactionSearchQuery] = useState("");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [reportSearchQuery, setReportSearchQuery] = useState("");
  
  const { confirm, alert: customAlert } = useConfirm();

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
        refreshAll();
      } else {
        await customAlert("Erreur lors de la mise à jour du statut.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      await customAlert("Erreur réseau ou serveur.");
    }
  };

  const handleForcePayment = async (transactionId) => {
    if (!(await confirm("Êtes-vous sûr de vouloir libérer les fonds pour le vendeur ?"))) return;
    try {
      const response = await securedFetch("/api/admin/orders/force-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: transactionId }),
      });
      if (response.ok) {
        await customAlert("Fonds libérés avec succès !");
        refreshAll();
      } else {
        await customAlert("Erreur lors de la libération des fonds.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      await customAlert("Erreur réseau ou serveur.");
    }
  };

  const handleRefund = async (transactionId) => {
    if (!(await confirm("Êtes-vous sûr de vouloir annuler et rembourser cette commande ?"))) return;
    try {
      const response = await securedFetch("/api/admin/orders/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: transactionId }),
      });
      if (response.ok) {
        await customAlert("Commande remboursée avec succès !");
        refreshAll();
      } else {
        await customAlert("Erreur lors du remboursement.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      await customAlert("Erreur réseau ou serveur.");
    }
  };

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshAll = useCallback(() => {
    fetchUsers();
    fetchReports();
    fetchTransactions();
    setRefreshTrigger(prev => prev + 1);
  }, [fetchUsers, fetchReports, fetchTransactions]);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchUsers(), fetchReports(), fetchTransactions()]);
      setLoading(false);
    };
    loadData();
  }, [fetchUsers, fetchReports, fetchTransactions]);

  const handleToggleUserStatus = async (user) => {
    try {
      const isTemporarilyBanned = user.bannedUntil && new Date(user.bannedUntil) > new Date();

      if (isTemporarilyBanned) {
        const isConfirmed = await confirm("Cet utilisateur est actuellement suspendu. Voulez-vous annuler sa suspension pour réactiver son compte ?");
        if (!isConfirmed) return;

        await securedFetch(`/api/users/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/merge-patch+json" },
          body: JSON.stringify({ bannedUntil: null }),
        });
        await customAlert("La suspension a été levée avec succès.");
      } else {
        const actionText = user.isActive ? "bannir définitivement" : "réactiver";
        const isConfirmed = await confirm(`Êtes-vous sûr de vouloir ${actionText} cet utilisateur ?`);
        if (!isConfirmed) return;

        await securedFetch(`/api/users/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/merge-patch+json" },
          body: JSON.stringify({ isActive: !user.isActive }),
        });
        await customAlert(user.isActive ? "L'utilisateur a été banni définitivement." : "L'utilisateur a été réactivé.");
      }

      refreshAll();
    } catch (error) {
      console.error("Erreur lors de la modification de l'utilisateur", error);
      await customAlert("Erreur lors de la modification du statut de l'utilisateur.");
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
      let shouldAutoMute = false;

      // Check if user has reached 4 warnings (this will be the 5th)
      if (sanctionFormData.type === "WARNING") {
        const userRes = await securedFetch(`/api/users/${sanctionFormData.targetUserId}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          const sanctionUris = userData.sanctions || [];
          
          // Fetch existing sanctions to count WARNINGs
          const sanctionPromises = sanctionUris.map(uri => {
            const id = typeof uri === 'object' ? uri.id : uri.split('/').pop();
            return securedFetch(`/api/sanctions/${id}`).then(r => r.ok ? r.json() : null);
          });
          const sanctionsList = await Promise.all(sanctionPromises);
          const validSanctions = sanctionsList.filter(s => s !== null);
          const warningCount = validSanctions.filter(s => s.type === "WARNING").length;
          
          if (warningCount >= 4) {
            shouldAutoMute = true;
          }
        }
      }

      let finalReason = sanctionFormData.reason;
      if (sanctionFormData.type === "MUTE" && sanctionFormData.durationDays) {
        finalReason = `[Durée: ${sanctionFormData.durationDays} jour(s)] ${finalReason ? '- ' + finalReason : ''}`;
      }

      await securedFetch(`/api/sanctions`, {
        method: "POST",
        headers: { "Content-Type": "application/ld+json" },
        body: JSON.stringify({
          type: sanctionFormData.type,
          reason: finalReason,
          targetUser: `/api/users/${sanctionFormData.targetUserId}`
        }),
      });

      if (sanctionFormData.type === "BAN") {
        await securedFetch(`/api/users/${sanctionFormData.targetUserId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/merge-patch+json" },
          body: JSON.stringify({ isActive: false }),
        });
      } else if (sanctionFormData.type === "MUTE" && sanctionFormData.durationDays) {
        const bannedUntilDate = new Date();
        bannedUntilDate.setDate(bannedUntilDate.getDate() + parseInt(sanctionFormData.durationDays, 10));
        
        await securedFetch(`/api/users/${sanctionFormData.targetUserId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/merge-patch+json" },
          body: JSON.stringify({ bannedUntil: bannedUntilDate.toISOString() }),
        });
      }

      if (sanctionFormData.reportId) {
        await securedFetch(`/api/reports/${sanctionFormData.reportId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/merge-patch+json" },
          body: JSON.stringify({ status: "processed" }),
        });
      }

      if (shouldAutoMute) {
        const bannedUntilDate = new Date();
        bannedUntilDate.setDate(bannedUntilDate.getDate() + 3);

        await securedFetch(`/api/users/${sanctionFormData.targetUserId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/merge-patch+json" },
          body: JSON.stringify({ bannedUntil: bannedUntilDate.toISOString() }),
        });

        await securedFetch(`/api/sanctions`, {
          method: "POST",
          headers: { "Content-Type": "application/ld+json" },
          body: JSON.stringify({
            type: "MUTE",
            reason: "Bannissement temporaire automatique (3 jours) : le quota de 5 avertissements a été atteint.",
            targetUser: `/api/users/${sanctionFormData.targetUserId}`
          }),
        });
        await customAlert(`Sanction appliquée. L'utilisateur ${sanctionFormData.targetUserPseudo || sanctionFormData.targetUserId} a atteint 5 avertissements et a été banni temporairement (3 jours) automatiquement.`);
      } else {
        await customAlert(`Sanction appliquée avec succès à ${sanctionFormData.targetUserPseudo || sanctionFormData.targetUserId}`);
      }

      setSanctionModalOpen(false);
      setSanctionFormData({ targetUserId: "", targetUserPseudo: "", type: "WARNING", reason: "", reportId: null, durationDays: "3" });
      refreshAll();
    } catch (error) {
      console.error("Erreur lors de l'application de la sanction", error);
      await customAlert("Erreur lors de l'application de la sanction");
    }
  };

  const handleDeleteUserSanction = async (sanctionId, type) => {
    const isConfirmed = await confirm("Êtes-vous sûr de vouloir supprimer cette sanction du casier de cet utilisateur ?");
    if (!isConfirmed) return;
    
    try {
      const response = await securedFetch(`/api/sanctions/${sanctionId}`, { method: 'DELETE' });
      if (response.ok) {
        let needsUserRefresh = false;
        if (type === 'BAN' || type === 'MUTE') {
          const isRevokeConfirmed = await confirm("Voulez-vous également lever l'effet de cette sanction sur l'utilisateur (le débannir ou annuler sa suspension) ?");
          if (isRevokeConfirmed) {
            await securedFetch(`/api/users/${viewingUserSanctions.id}`, {
              method: 'PATCH',
              headers: { "Content-Type": "application/merge-patch+json" },
              body: JSON.stringify(type === 'BAN' ? { isActive: true } : { bannedUntil: null })
            });
            needsUserRefresh = true;
            await customAlert("L'effet de la sanction a été révoqué avec succès.");
          }
        }
        
        // Rafraichir les données de l'utilisateur vu dans la modale
        const userRes = await securedFetch(`/api/users/${viewingUserSanctions.id}`);
        if (userRes.ok) {
           const updatedUser = await userRes.json();
           setViewingUserSanctions(updatedUser);
        }
        if (needsUserRefresh) {
           refreshAll();
        }
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la sanction", error);
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
      refreshAll();
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
      refreshAll();
    } catch (error) {
      console.error("Erreur lors de la suppression du signalement", error);
    }
  };

  const handleDismissReport = async (reportId) => {
    const isConfirmed = await confirm("Êtes-vous sûr de vouloir classer ce signalement sans suite (aucune sanction ne sera appliquée) ?");
    if (!isConfirmed) return;

    try {
      await securedFetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/merge-patch+json" },
        body: JSON.stringify({ status: "processed" })
      });
      refreshAll();
      await customAlert("Signalement classé sans suite avec succès.");
    } catch (error) {
      console.error("Erreur lors de l'ignorance du signalement", error);
      await customAlert("Une erreur est survenue lors du classement du signalement.");
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

  const finalFilteredReports = filteredReports.filter(r => 
    r.id?.toString().includes(reportSearchQuery) || 
    r.reason?.toLowerCase().includes(reportSearchQuery.toLowerCase()) || 
    r.status?.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
    r.reporter?.id?.toString().includes(reportSearchQuery)
  );

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
              <div className="space-y-4">
                <div className="flex items-center bg-[#151515] border border-gray-800 rounded-lg px-4 py-2 w-full max-w-md">
                  <span className="text-gray-500 mr-3">🔍</span>
                  <input
                    type="text"
                    placeholder="Rechercher par ID, pseudo ou email..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-600"
                  />
                </div>
                <UsersTable 
                  users={users.filter(u => 
                    u.id?.toString().includes(userSearchQuery) || 
                    u.pseudo?.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                    u.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
                  )} 
                  handleToggleUserStatus={handleToggleUserStatus} 
                  handleEditClick={handleEditClick} 
                  handleViewSanctions={(user) => setViewingUserSanctions(user)} 
                />
              </div>
            ) : activeTab === "transactions" ? (
              <div className="space-y-4">
                <div className="flex items-center bg-[#151515] border border-gray-800 rounded-lg px-4 py-2 w-full max-w-md">
                  <span className="text-gray-500 mr-3">🔍</span>
                  <input
                    type="text"
                    placeholder="Rechercher par référence, n° commande..."
                    value={transactionSearchQuery}
                    onChange={(e) => setTransactionSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-600"
                  />
                </div>
                <TransactionsTable 
                  transactions={transactions.filter(t => 
                    t.stripeReference?.toLowerCase().includes(transactionSearchQuery.toLowerCase()) || 
                    t.number?.toLowerCase().includes(transactionSearchQuery.toLowerCase()) ||
                    t.stripeStatus?.toLowerCase().includes(transactionSearchQuery.toLowerCase())
                  )} 
                  handleForcePayment={handleForcePayment}
                  handleRefund={handleRefund}
                />
              </div>
            ) : activeTab === "orders" ? (
              <div className="space-y-4">
                <div className="flex items-center bg-[#151515] border border-gray-800 rounded-lg px-4 py-2 w-full max-w-md">
                  <span className="text-gray-500 mr-3">🔍</span>
                  <input
                    type="text"
                    placeholder="Rechercher par n° commande, tracking..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-600"
                  />
                </div>
                <OrdersTable 
                  transactions={transactions.filter(t => 
                    t.number?.toLowerCase().includes(orderSearchQuery.toLowerCase()) || 
                    t.trackingNumber?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                    t.status?.toLowerCase().includes(orderSearchQuery.toLowerCase())
                  )} 
                  handleUpdateTransactionStatus={handleUpdateTransactionStatus}
                  handleForcePayment={handleForcePayment}
                  handleRefund={handleRefund}
                />
              </div>
            ) : activeTab === "reports" ? (
              <div>
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6 border-b border-gray-800 pb-4">
                  {/* Sous-onglets de signalements */}
                  <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
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
                  <div className="flex items-center bg-[#151515] border border-gray-800 rounded-lg px-4 py-2 w-full md:w-64 shrink-0">
                    <span className="text-gray-500 mr-3">🔍</span>
                    <input
                      type="text"
                      placeholder="Rechercher (ID, motif)..."
                      value={reportSearchQuery}
                      onChange={(e) => setReportSearchQuery(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-600"
                    />
                  </div>
                </div>

                {reportFilter === "user" ? (
                  <UserReports reports={finalFilteredReports} handleDeleteReport={handleDeleteReport} handleDismissReport={handleDismissReport} handleOpenSanctionModal={handleOpenSanctionModal} />
                ) : reportFilter === "product" ? (
                  <ProductReports reports={finalFilteredReports} handleDeleteReport={handleDeleteReport} handleDismissReport={handleDismissReport} handleOpenSanctionModal={handleOpenSanctionModal} handleOpenProductModal={handleOpenProductModal} />
                ) : reportFilter === "conversation" ? (
                  <ConversationReports reports={finalFilteredReports} handleDeleteReport={handleDeleteReport} handleDismissReport={handleDismissReport} handleOpenSanctionModal={handleOpenSanctionModal} />
                ) : reportFilter === "message" ? (
                  <MessageReports reports={finalFilteredReports} handleDeleteReport={handleDeleteReport} handleDismissReport={handleDismissReport} handleOpenSanctionModal={handleOpenSanctionModal} />
                ) : (
                  <AllReports reports={finalFilteredReports} handleDeleteReport={handleDeleteReport} handleDismissReport={handleDismissReport} handleOpenSanctionModal={handleOpenSanctionModal} handleOpenProductModal={handleOpenProductModal} />
              )}
            </div>
            ) : activeTab === "sanctions" ? (
              <AllSanctions refreshTrigger={refreshTrigger} onUpdate={refreshAll} />
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
                    <option value="WARNING">Avertissements</option>
                    <option value="MUTE">Bannissement temporaire</option>
                    <option value="BAN">Bannissement définitif</option>
                  </select>
                </div>
                
                {sanctionFormData.type === "MUTE" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Durée (en jours)</label>
                    <select
                      value={sanctionFormData.durationDays}
                      onChange={(e) => setSanctionFormData({ ...sanctionFormData, durationDays: e.target.value })}
                      className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="1">1 jour</option>
                      <option value="3">3 jours</option>
                      <option value="7">7 jours (1 semaine)</option>
                      <option value="30">30 jours (1 mois)</option>
                    </select>
                  </div>
                )}

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
            onUpdate={refreshAll}
            onClose={() => {
              setProductModalOpen(false);
              setSelectedReportForProduct(null);
            }} 
          />
        )}

        {/* Modal Sanctions d'un Utilisateur */}
        {viewingUserSanctions && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#111] border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl relative">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-white">
                  Sanctions de {viewingUserSanctions.pseudo || viewingUserSanctions.email}
                </h2>
                <button 
                  onClick={() => setViewingUserSanctions(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto grow">
                <UserSanctions 
                  sanctionUris={viewingUserSanctions.sanctions || []} 
                  isAdmin={true}
                  onDeleteSanction={handleDeleteUserSanction}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
