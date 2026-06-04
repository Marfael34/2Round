import { useState, useEffect } from "react";
import { securedFetch } from "../../utils/api";
import { FiX, FiPower } from "react-icons/fi";
import { useConfirm } from "../../contexts/ConfirmContext";

const AdminProductModal = ({ report, onClose }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState("");
  const { confirm, alert: customAlert } = useConfirm();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productIri = report?.product;
        if (!productIri) return;
        const id = typeof productIri === "object" ? productIri.id : productIri.split('/').pop();
        const res = await securedFetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch (err) {
        console.error("Error fetching product", err);
      } finally {
        setLoading(false);
      }
    };
    if (report?.product) fetchProduct();
  }, [report]);

  if (!report) return null;

  const handleToggleProductStatus = async () => {
    const isCurrentlySuspended = product.status === 'suspended_by_admin';

    if (!isCurrentlySuspended) {
      // Show reason input if we want to deactivate
      setShowReasonInput(true);
      return;
    }

    // Unsuspend logic
    const isConfirmed = await confirm("Voulez-vous réactiver ce produit ?");
    if (!isConfirmed) return;

    try {
      const res = await securedFetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/merge-patch+json" },
        body: JSON.stringify({ status: 'active', suspensionReason: null })
      });
      
      if (res.ok) {
        setProduct({ ...product, status: 'active', suspensionReason: null });
        await customAlert("Le produit a été réactivé avec succès.");
      } else {
        throw new Error("API responded with an error");
      }
    } catch (err) {
      console.error(err);
      await customAlert("Erreur lors de la modification du statut du produit.");
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivationReason.trim()) {
      await customAlert("Veuillez renseigner un motif pour la désactivation.");
      return;
    }

    try {
      const res = await securedFetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/merge-patch+json" },
        body: JSON.stringify({ status: 'suspended_by_admin', suspensionReason: deactivationReason })
      });
      
      if (res.ok) {
        setProduct({ ...product, status: 'suspended_by_admin', suspensionReason: deactivationReason });
        setShowReasonInput(false);
        setDeactivationReason("");
        await customAlert("Le produit a été désactivé avec succès. L'utilisateur en sera informé.");
      } else {
        throw new Error("API responded with an error");
      }
    } catch (err) {
      console.error(err);
      await customAlert("Erreur lors de la modification du statut du produit.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#111] rounded-2xl w-full max-w-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-800 shrink-0">
          <h3 className="text-xl font-bold text-white uppercase tracking-wider">
            {loading ? "Chargement..." : product?.title || "Produit Inconnu"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Bloc d'informations du Signalement */}
          <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-5 mb-6">
            <h4 className="text-red-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              Détails du Signalement
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-gray-400 font-medium">Motif :</span>
                <span className="text-white font-bold">{report.reason}</span>
              </div>
              {report.description && (
                <div className="flex flex-col gap-1 mt-2">
                  <span className="text-gray-400 font-medium">Description de l'utilisateur :</span>
                  <p className="text-gray-200 bg-red-950/40 p-3 rounded-lg border border-red-500/10 italic">
                    "{report.description}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : product ? (
            <>
              <div className="flex flex-col md:flex-row gap-6">
                {(product.image || (product.images && product.images.length > 0)) && (
                  <div className="w-full md:w-1/2 aspect-square rounded-xl bg-black border border-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                    <img 
                      src={product.image || product.images[0]?.path || product.images[0]} 
                      alt={product.title} 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                )}
                <div className="flex-1 space-y-4">
                  <div className="text-3xl font-bebas text-red-500">{product.price} €</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b border-gray-800 pb-2">
                      <span className="text-gray-400">Marque :</span>
                      <span className="text-white font-medium">{product.brand || 'Non renseignée'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-2">
                      <span className="text-gray-400">Taille :</span>
                      <span className="text-white font-medium">{product.size || 'Unique'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-2">
                      <span className="text-gray-400">État :</span>
                      <span className="text-white font-medium">{product.etat?.label || 'Non renseigné'}</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-gray-400">Vendeur :</span>
                      <span className="text-white font-medium">{product.seller?.pseudo || 'Inconnu'}</span>
                    </div>
                  </div>
                  {product.status === 'suspended_by_admin' && (
                    <div className="bg-orange-500/10 border border-orange-500/20 text-orange-500 px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center mt-2">
                      Produit actuellement désactivé par l'administration
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-gray-400 font-medium mb-2 uppercase text-xs tracking-wider">Description</h4>
                <p className="text-gray-300 text-sm bg-[#1A1A1A] p-4 rounded-xl border border-gray-800 leading-relaxed whitespace-pre-wrap">
                  {product.description || "Aucune description fournie."}
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-center py-8">Impossible de charger les détails de ce produit.</p>
          )}
        </div>

        {showReasonInput ? (
          <div className="p-6 border-t border-gray-800 bg-[#0A0A0A] shrink-0 space-y-4">
            <label className="block text-sm font-medium text-gray-400">Motif de la désactivation (visible par le vendeur) :</label>
            <textarea 
              value={deactivationReason}
              onChange={(e) => setDeactivationReason(e.target.value)}
              placeholder="Ex: Contrefaçon suspectée, annonce inappropriée..."
              className="w-full bg-[#1A1A1A] border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all resize-none"
              rows={2}
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  setShowReasonInput(false);
                  setDeactivationReason("");
                }} 
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleConfirmDeactivate} 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm flex items-center justify-center transition-colors"
              >
                Confirmer la désactivation
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 border-t border-gray-800 bg-[#0A0A0A] shrink-0 flex justify-between items-center gap-3">
            <div className="flex gap-3">
              {product && (
                <button
                  onClick={handleToggleProductStatus}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2 ${
                    product.status === 'suspended_by_admin' 
                    ? 'bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20' 
                    : 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20'
                  }`}
                >
                  <FiPower size={16} />
                  {product.status === 'suspended_by_admin' ? 'Réactiver le produit' : 'Désactiver le produit'}
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium text-sm"
              >
                Fermer
              </button>
              {product && product.status !== 'suspended_by_admin' && (
                <a
                  href={`/product/${product.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm flex items-center justify-center"
                >
                  Voir l'annonce
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductModal;
