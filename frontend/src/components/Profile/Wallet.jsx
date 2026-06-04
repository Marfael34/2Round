import { useState, useEffect } from "react";
import { securedFetch } from "../../utils/api";
import { useConfirm } from "../../contexts/ConfirmContext";

const Wallet = ({ user }) => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [message, setMessage] = useState(null);
  const [walletInfo, setWalletInfo] = useState({ available: 0, pending: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const { confirm, alert: customAlert } = useConfirm();

  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        const res = await securedFetch('/api/wallet/info');
        if (res.ok) {
          const data = await res.json();
          setWalletInfo(data);
        }
      } catch (err) {
        console.error("Failed to load wallet info:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWalletInfo();
  }, [user?.id]);

  const availableBalance = parseFloat(walletInfo.available || 0);
  const pending = parseFloat(walletInfo.pending || 0);

  const handleWithdraw = async () => {
    if (availableBalance <= 0) {
      await customAlert("Votre porte-monnaie est vide.");
      return;
    }

    const isConfirmed = await confirm("Voulez-vous transférer l'intégralité de vos fonds vers votre compte bancaire ?");
    if (!isConfirmed) {
      return;
    }

    setIsWithdrawing(true);
    setMessage(null);

    try {
      const response = await securedFetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors du transfert");
      }

      const data = await response.json();
      
      // Mettre à jour l'info du porte-monnaie localement
      setWalletInfo(prev => ({ 
        ...prev, 
        available: data.newBudget,
        transactions: [
          {
            id: 'temp-' + Date.now(),
            amount: availableBalance,
            type: 'withdrawal',
            status: 'completed',
            reference: 'Bank Transfer',
            createdAt: new Date().toISOString()
          },
          ...prev.transactions
        ]
      }));
      
      setMessage({ type: 'success', text: "Fonds transférés avec succès. Ils apparaîtront sur votre compte sous 2 à 3 jours ouvrés." });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (loading) {
    return <div className="text-white animate-pulse">Chargement de votre porte-monnaie...</div>;
  }

  return (
    <div className="w-full flex flex-col gap-6">
        <div className="bg-black/50 border border-white/10 p-6 flex flex-col items-start gap-4 w-full rounded-sm">
        <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <h4 className="font-bebas text-2xl text-gray-300 uppercase tracking-wider">Mon Porte-monnaie</h4>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 w-full">
            <div className="flex-1 border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-4">
                <p className="text-sm text-gray-400 uppercase tracking-wider mb-2 font-inter">Fonds Disponibles</p>
                <p className="text-5xl font-bebas text-green-500">
                    {availableBalance.toFixed(2)} €
                </p>
                <p className="text-xs text-gray-500 font-inter leading-tight mt-2">
                    Fonds issus de vos ventes finalisées. Prêts à être retirés.
                </p>

                <button
                    onClick={handleWithdraw}
                    disabled={isWithdrawing || availableBalance <= 0}
                    className={`w-full py-3 mt-4 rounded-sm text-sm font-bold uppercase tracking-wider transition-colors ${
                    availableBalance > 0 
                        ? 'bg-white hover:bg-gray-200 text-black cursor-pointer' 
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                >
                    {isWithdrawing ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                        Transfert en cours...
                    </span>
                    ) : (
                    "Récupérer l'argent"
                    )}
                </button>
            </div>

            <div className="flex-1">
                <p className="text-sm text-gray-400 uppercase tracking-wider mb-2 font-inter">Argent en attente</p>
                <p className="text-4xl font-bebas text-yellow-500">
                    {pending.toFixed(2)} €
                </p>
                <p className="text-xs text-gray-500 font-inter leading-tight mt-2">
                    Fonds bloqués correspondant à vos ventes en cours (en attente de validation de réception par l'acheteur).
                </p>
            </div>
        </div>

        {message && (
            <div className={`mt-4 p-3 text-xs w-full rounded-sm border ${message.type === 'success' ? 'bg-green-900/20 text-green-400 border-green-500/20' : 'bg-red-900/20 text-red-400 border-red-500/20'}`}>
            {message.text}
            </div>
        )}
        </div>

        {/* Historique des transactions */}
        <div className="bg-[#111] border border-white/10 p-6 rounded-sm w-full">
            <h4 className="font-bebas text-xl text-white uppercase tracking-wider mb-6">Historique des transactions</h4>
            
            {walletInfo.transactions && walletInfo.transactions.length > 0 ? (
                <div className="flex flex-col gap-3">
                    {walletInfo.transactions.map((tx) => (
                        <div key={tx.id} className="flex justify-between items-center p-4 bg-black border border-white/5 rounded-sm">
                            <div className="flex flex-col">
                                <span className={`font-bold ${tx.type === 'withdrawal' ? 'text-red-400' : 'text-green-400'}`}>
                                    {tx.type === 'withdrawal' ? 'Retrait vers compte bancaire' : 'Vente finalisée'}
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                    {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                    {tx.reference && ` • Réf: ${tx.reference}`}
                                </span>
                            </div>
                            <div className={`text-xl font-bebas ${tx.type === 'withdrawal' ? 'text-red-500' : 'text-green-500'}`}>
                                {tx.type === 'withdrawal' ? '-' : '+'}{tx.amount.toFixed(2)} €
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500 font-inter">
                    Aucune transaction récente à afficher.
                </div>
            )}
        </div>
    </div>
  );
};

export default Wallet;
