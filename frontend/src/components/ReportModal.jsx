import { useState } from "react";
import { securedFetch } from "../utils/api";
import { API_URL } from "../constants/apiConstante";
import { FaXmark, FaFlag } from "react-icons/fa6";

const ReportModal = ({ isOpen, onClose, targetType, targetId, targetSellerId, currentUserId, onReportSuccess }) => {
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const submitReport = async () => {
    if (!reportReason) {
      setError("Veuillez sélectionner une raison.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const payload = {
        reason: reportReason,
        description: reportDescription,
        createdAt: new Date().toISOString(),
        sender: `/api/users/${currentUserId}`,
      };

      if (targetType === "product") {
        payload.product = `/api/products/${targetId}`;
        if (targetSellerId) {
          payload.reportedUser = `/api/users/${targetSellerId}`;
        }
      } else if (targetType === "user") {
        payload.reportedUser = `/api/users/${targetId}`;
      } else if (targetType === "conversation") {
        payload.conversation = `/api/conversations/${targetId}`;
        if (targetSellerId) { // Used as other user ID
          payload.reportedUser = `/api/users/${targetSellerId}`;
        }
      }

      const res = await securedFetch(`${API_URL}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/ld+json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erreur de signalement");
      
      setReportReason("");
      setReportDescription("");
      if (onReportSuccess) onReportSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'envoi du signalement. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[150] flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-sm max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <FaXmark className="text-xl" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-950/30 flex items-center justify-center border border-red-500/20">
            <FaFlag className="text-red-500 text-lg" />
          </div>
          <h2 className="text-2xl font-bebas uppercase tracking-wider text-white">
            Signaler {targetType === 'product' ? "l'article" : targetType === 'user' ? "l'utilisateur" : ""}
          </h2>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 text-sm mb-4 rounded-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
              Raison du signalement
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full bg-[#151515] border border-white/10 rounded-sm px-4 py-3 text-sm text-white focus:border-red-600 outline-none transition-colors"
            >
              <option value="">-- Sélectionnez une raison --</option>
              <option value="spam">Spam ou publicité</option>
              <option value="scam">Arnaque suspectée</option>
              <option value="abuse">Harcèlement ou propos injurieux</option>
              <option value="fake">Contrefaçon ou objet interdit</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
              Détails (facultatif)
            </label>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Donnez plus de détails pour aider notre modération..."
              className="w-full bg-[#151515] border border-white/10 rounded-sm px-4 py-3 text-sm text-white focus:border-red-600 outline-none transition-colors resize-none h-24"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={submitReport}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-sm uppercase tracking-widest text-sm transition-colors"
            >
              {loading ? "Envoi..." : "Envoyer le signalement"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
