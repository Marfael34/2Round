import { useState } from "react";
import { securedFetch } from "../../utils/api";

const Wallet = ({ user, setUser }) => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [message, setMessage] = useState(null);

  const budget = user?.budget ? parseFloat(user.budget) : 0;

  const handleWithdraw = async () => {
    if (budget <= 0) {
      alert("Votre portefeuille est vide.");
      return;
    }

    if (!window.confirm("Voulez-vous transférer l'intégralité de vos fonds vers votre compte bancaire ?")) {
      return;
    }

    setIsWithdrawing(true);
    setMessage(null);

    try {
      const response = await securedFetch('/api/users/withdraw', {
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
      
      // Mettre à jour l'utilisateur localement
      if (setUser) {
        setUser(prev => ({ ...prev, budget: data.newBudget }));
      }
      
      setMessage({ type: 'success', text: "Fonds transférés avec succès. Ils apparaîtront sur votre compte sous 2 à 3 jours ouvrés." });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="mt-8 bg-black/50 border border-white/10 p-6 flex flex-col items-start gap-4 max-w-sm rounded-sm">
      <div className="flex items-center gap-3">
        <span className="text-2xl">💰</span>
        <h4 className="font-bebas text-2xl text-gray-300 uppercase tracking-wider">Mon Portefeuille</h4>
      </div>
      
      <p className="text-5xl font-bebas text-green-500">
        {budget.toFixed(2)} €
      </p>
      
      <p className="text-xs text-gray-500 font-inter leading-tight">
        Fonds disponibles issus de vos ventes finalisées.
      </p>

      {message && (
        <div className={`p-3 text-xs w-full rounded-sm border ${message.type === 'success' ? 'bg-green-900/20 text-green-400 border-green-500/20' : 'bg-red-900/20 text-red-400 border-red-500/20'}`}>
          {message.text}
        </div>
      )}

      <button
        onClick={handleWithdraw}
        disabled={isWithdrawing || budget <= 0}
        className={`w-full py-3 mt-2 rounded-sm text-sm font-bold uppercase tracking-wider transition-colors ${
          budget > 0 
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
  );
};

export default Wallet;
