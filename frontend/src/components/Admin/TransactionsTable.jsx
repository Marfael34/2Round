import { FiExternalLink, FiEye } from "react-icons/fi";
import { Link } from "react-router-dom";

const TransactionsTable = ({ transactions }) => {
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
                    {/* Placeholder for viewing details, e.g. a link to the order or a modal */}
                    <button
                      className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                      title="Voir les détails"
                      onClick={() => alert("Fonctionnalité en cours de développement")}
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
    </div>
  );
};

export default TransactionsTable;
