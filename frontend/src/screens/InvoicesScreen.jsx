import { useState, useEffect } from "react";
import { IMG_BGRAYURE } from "../constants/appConstante";
import { useNavigate, Link } from "react-router-dom";
import { FaChevronLeft, FaDownload } from "react-icons/fa6";
import { securedFetch } from "../utils/api";

const InvoicesScreen = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        const email = payload.username;

        if (!email) {
          throw new Error("Impossible de récupérer l'email du token");
        }

        const userResponse = await securedFetch(`/api/users?email=${encodeURIComponent(email)}`);
        if (!userResponse.ok) throw new Error('Erreur lors de la récupération des données utilisateur');
        
        const userData = await userResponse.json();
        const user = userData.member ? userData.member[0] : (userData['hydra:member'] ? userData['hydra:member'][0] : (Array.isArray(userData) ? userData[0] : userData));

        if (!user || !user['@id']) throw new Error('Utilisateur non trouvé');

        const invoicesResponse = await securedFetch(`/api/invoices?users=${encodeURIComponent(user['@id'])}`);
        if (!invoicesResponse.ok) throw new Error('Erreur lors de la récupération des factures');

        const invoicesData = await invoicesResponse.json();
        const extractedInvoices = invoicesData['hydra:member'] || invoicesData.member || [];
        
        // Trier par date décroissante
        extractedInvoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setInvoices(extractedInvoices);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [navigate]);

  const getInvoiceTypeInfo = (type) => {
    switch (type) {
      case 'receipt_purchase':
        return { label: "Reçu d'Achat", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30" };
      case 'invoice_commission':
        return { label: "Facture Commission", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30" };
      case 'receipt_transfer':
        return { label: "Bordereau Transfert", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30" };
      default:
        return { label: "Facture", color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/30" };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  };

  // Ouverture de la page de la facture pour impression
  const handleDownload = (invoice) => {
    // URL to the physical PDF via Vite proxy (avoids React Router intercepting /invoice/)
    const pdfUrl = `/pdf/${invoice.number}.pdf`;
    window.open(pdfUrl, '_blank');
  };

  return (
    <>
      <img src={IMG_BGRAYURE} alt="preload" className="hidden" onLoad={() => setIsLoaded(true)} />

      <div className={`text-white min-h-screen flex flex-col ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
        <div className="bg-rayure p-8 border-b border-white/10 flex-1 flex flex-col" style={{ backgroundImage: `url(${IMG_BGRAYURE})`, minHeight: '100vh' }}>
          <div className="w-full px-4 md:px-12 lg:px-24 flex-1 flex flex-col">
            <div className="mb-12 flex items-center">
              <Link to="/my-locker" className="text-white text-4xl font-bebas mr-4 hover:text-cyan-400 transition-colors">
                <FaChevronLeft /> 
              </Link>
              <h2 className="font-bebas uppercase text-5xl md:text-6xl text-white drop-shadow-md">Mes Factures & Reçus</h2>
            </div>

            {loading ? (
              <div className="text-center py-20 flex-1 flex items-center justify-center">
                <p className="text-2xl font-inter animate-pulse">Chargement...</p>
              </div>
            ) : error ? (
              <div className="bg-red-600/10 border border-red-600 text-red-600 p-6 rounded-sm w-full max-w-md mx-auto">
                <p className="text-lg text-center font-bold">{error}</p>
              </div>
            ) : (
              <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col gap-8">
                {/* Section Achats */}
                <div className="bg-black/80 backdrop-blur-md border border-white/20 p-6 md:p-10 rounded-sm shadow-2xl">
                  <h3 className="text-3xl font-bebas uppercase mb-6 text-white tracking-widest border-b border-white/10 pb-4">Mes Achats</h3>
                  
                  {invoices.filter(i => i.type === 'receipt_purchase').length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">Aucun achat effectué.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/20 text-gray-400 text-sm uppercase font-bold tracking-wider">
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Numéro</th>
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4 text-right">Montant</th>
                            <th className="py-3 px-4 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoices.filter(i => i.type === 'receipt_purchase').map((invoice) => {
                            const typeInfo = getInvoiceTypeInfo(invoice.type);
                            return (
                              <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="py-4 px-4 font-mono text-sm">{formatDate(invoice.createdAt)}</td>
                                <td className="py-4 px-4 font-mono text-sm text-gray-300">{invoice.number}</td>
                                <td className="py-4 px-4">
                                  <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${typeInfo.bg} ${typeInfo.color} ${typeInfo.border}`}>
                                    {typeInfo.label}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-right font-bold text-lg">
                                  {invoice.amount} €
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <button
                                    onClick={() => handleDownload(invoice)}
                                    className="inline-flex items-center justify-center p-2 rounded-sm bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                                    title="Télécharger PDF"
                                  >
                                    <FaDownload />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Section Ventes */}
                <div className="bg-black/80 backdrop-blur-md border border-white/20 p-6 md:p-10 rounded-sm shadow-2xl mb-12">
                  <h3 className="text-3xl font-bebas uppercase mb-6 text-white tracking-widest border-b border-white/10 pb-4">Mes Ventes</h3>
                  
                  {invoices.filter(i => i.type !== 'receipt_purchase').length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">Aucune vente effectuée.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/20 text-gray-400 text-sm uppercase font-bold tracking-wider">
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Numéro</th>
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4 text-right">Montant</th>
                            <th className="py-3 px-4 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoices.filter(i => i.type !== 'receipt_purchase').map((invoice) => {
                            const typeInfo = getInvoiceTypeInfo(invoice.type);
                            return (
                              <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="py-4 px-4 font-mono text-sm">{formatDate(invoice.createdAt)}</td>
                                <td className="py-4 px-4 font-mono text-sm text-gray-300">{invoice.number}</td>
                                <td className="py-4 px-4">
                                  <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${typeInfo.bg} ${typeInfo.color} ${typeInfo.border}`}>
                                    {typeInfo.label}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-right font-bold text-lg">
                                  {invoice.amount} €
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <button
                                    onClick={() => handleDownload(invoice)}
                                    className="inline-flex items-center justify-center p-2 rounded-sm bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                                    title="Télécharger PDF"
                                  >
                                    <FaDownload />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoicesScreen;
