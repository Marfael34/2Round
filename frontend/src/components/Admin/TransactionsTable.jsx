import { useState } from "react";
import { FiExternalLink, FiEye, FiX } from "react-icons/fi";

const TransactionsTable = ({ transactions, handleForcePayment, handleRefund }) => {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const getStatusColor = (status) => {
    switch (status) {
      case "CREATED":
      case "PAYMENT_PENDING":
      case "SHIPPING_PENDING":
        return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
      case "SHIPPED":
        return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
      case "DELIVERED":
      case "COMPLETED":
        return "bg-green-500/10 text-green-500 border border-green-500/20";
      case "DISPUTED":
        return "bg-orange-500/10 text-orange-500 border border-orange-500/20";
      case "CANCELLED":
        return "bg-red-500/10 text-red-500 border border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border border-gray-500/20";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400">
            <th className="py-4 px-4 font-medium">N° Commande</th>
            <th className="py-4 px-4 font-medium">Date</th>
            <th className="py-4 px-4 font-medium">Montant</th>
            <th className="py-4 px-4 font-medium">Stripe</th>
            <th className="py-4 px-4 font-medium">Statut</th>
            <th className="py-4 px-4 font-medium text-right">Détails</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-8 text-center text-gray-500">
                Aucune transaction trouvée.
              </td>
            </tr>
          ) : (
            transactions.map((transaction) => (
              <tr
                key={transaction.id || transaction.number}
                className="border-b border-gray-800/50 hover:bg-[#151515] transition-colors"
              >
                <td className="py-4 px-4 font-mono text-sm text-gray-300">
                  {transaction.number}
                </td>
                <td className="py-4 px-4 text-sm text-gray-400">
                  {new Date(transaction.createdAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </td>
                <td className="py-4 px-4 font-bold">
                  {parseFloat(transaction.totalprice).toFixed(2)} €
                </td>
                <td className="py-4 px-4 text-sm">
                  {transaction.stripe_payment_intent_id ? (
                    <span className="inline-flex items-center gap-1 text-blue-400">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span> Payé
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-gray-500">
                      <span className="w-2 h-2 rounded-full bg-gray-500"></span> En attente
                    </span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                      transaction.status
                    )}`}
                  >
                    {transaction.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    {/* Bouton pour ouvrir la modale de détails */}
                    <button
                      className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                      title="Voir les détails"
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <FiEye size={18} />
                    </button>
                    {transaction.stripe_payment_intent_id && (
                      <a
                        href={`https://dashboard.stripe.com/payments/${transaction.stripe_payment_intent_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20 transition-colors"
                        title="Voir sur Stripe"
                      >
                        <FiExternalLink size={18} />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal des détails de la transaction */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button 
              onClick={() => setSelectedTransaction(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <FiX size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-800 pb-4">
              Détails de la Transaction
            </h2>
            
            <div className="space-y-4 mb-8 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Numéro :</span>
                <span className="font-mono text-white">{selectedTransaction.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date :</span>
                <span className="text-white">
                  {new Date(selectedTransaction.createdAt).toLocaleString("fr-FR")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Statut :</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedTransaction.status)}`}>
                  {selectedTransaction.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Montant total :</span>
                <span className="font-bold text-white">{parseFloat(selectedTransaction.totalprice).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">N° Suivi :</span>
                <span className="text-white">{selectedTransaction.trackingNumber || "Non renseigné"}</span>
              </div>
              {selectedTransaction.stripe_payment_intent_id && (
                <div className="flex justify-between items-center border-t border-gray-800 pt-4 mt-4">
                  <span className="text-gray-400">Paiement Stripe :</span>
                  <a
                    href={`https://dashboard.stripe.com/payments/${selectedTransaction.stripe_payment_intent_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Voir dans Stripe <FiExternalLink />
                  </a>
                </div>
              )}
            </div>

            {/* Actions Administratives */}
            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Actions de paiement</h3>
              <div className="flex flex-col gap-3">
                {selectedTransaction.status !== "COMPLETED" && selectedTransaction.status !== "CANCELLED" ? (
                  <>
                    <button
                      onClick={() => {
                        handleForcePayment(selectedTransaction.id || selectedTransaction['@id']?.split('/').pop());
                        setSelectedTransaction(null);
                      }}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Valider et débloquer les fonds (Vendeur)
                    </button>
                    <button
                      onClick={() => {
                        handleRefund(selectedTransaction.id || selectedTransaction['@id']?.split('/').pop());
                        setSelectedTransaction(null);
                      }}
                      className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Annuler et rembourser (Acheteur)
                    </button>
                  </>
                ) : (
                  <p className="text-gray-500 text-center italic text-sm">
                    Aucune action disponible pour une transaction {selectedTransaction.status === "COMPLETED" ? "terminée" : "annulée"}.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsTable;
