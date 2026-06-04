import { FiEye } from "react-icons/fi";
import { API_URL } from "../../constants/apiConstante";
import { useConfirm } from "../../contexts/ConfirmContext";

const OrdersTable = ({ transactions, handleUpdateTransactionStatus }) => {
  const { alert: customAlert } = useConfirm();
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
            <th className="py-4 px-4 font-medium">Tracking</th>
            <th className="py-4 px-4 font-medium">Étiquette</th>
            <th className="py-4 px-4 font-medium">Statut</th>
            <th className="py-4 px-4 font-medium text-right">Détails</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-8 text-center text-gray-500">
                Aucune commande trouvée.
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
                <td className="py-4 px-4 font-bold text-sm">
                  {transaction.trackingNumber || "Non défini"}
                </td>
                <td className="py-4 px-4 text-sm">
                  {transaction.shipping_label_url ? (
                    <a
                      href={transaction.shipping_label_url?.startsWith('http') ? transaction.shipping_label_url : `${API_URL.replace("/api", "")}${transaction.shipping_label_url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      Voir étiquette
                    </a>
                  ) : (
                    <span className="text-gray-500">Non générée</span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <select
                    className={`px-3 py-1 rounded-full text-xs font-bold appearance-none cursor-pointer outline-none ${getStatusColor(
                      transaction.status
                    )}`}
                    value={transaction.status}
                    onChange={(e) => handleUpdateTransactionStatus(transaction.id || transaction['@id']?.split('/').pop(), e.target.value)}
                  >
                    <option value="CREATED">CREATED</option>
                    <option value="PAYMENT_PENDING">PAYMENT_PENDING</option>
                    <option value="SHIPPING_PENDING">SHIPPING_PENDING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="DISPUTED">DISPUTED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                      title="Voir les détails"
                      onClick={() => customAlert("Fonctionnalité en cours de développement")}
                    >
                      <FiEye size={18} />
                    </button>
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

export default OrdersTable;
