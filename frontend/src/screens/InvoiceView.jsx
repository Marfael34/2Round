import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { securedFetch } from '../utils/api';
import { FaPrint, FaArrowLeft } from 'react-icons/fa6';

const InvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await securedFetch(`/api/invoices/${id}`);
        if (!response.ok) throw new Error("Erreur lors de la récupération de la facture");
        const data = await response.json();
        
        let user = null;
        if (typeof data.users === 'string') {
          const userRes = await securedFetch(data.users);
          if(userRes.ok) user = await userRes.json();
        } else if (data.users) {
           user = data.users;
        }

        let order = null;
        if (typeof data.orders === 'string') {
          const orderRes = await securedFetch(data.orders);
          if(orderRes.ok) order = await orderRes.json();
        } else if (data.orders) {
          order = data.orders;
        }
        
        let product = null;
        if (order && order.orderItems && order.orderItems.length > 0) {
            let item = order.orderItems[0];
            if (typeof item === 'string') {
                const itemRes = await securedFetch(item);
                if(itemRes.ok) item = await itemRes.json();
            }
            if (item && typeof item.products === 'string') {
                const pRes = await securedFetch(item.products);
                if(pRes.ok) product = await pRes.json();
            } else if (item && item.products) {
                product = item.products;
            }
            order.orderItemObj = item;
        }

        setInvoice({ ...data, userObj: user, orderObj: order, productObj: product });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  if (loading) return <div className="p-10 text-white font-inter bg-black min-h-screen">Chargement de la facture...</div>;
  if (error) return <div className="p-10 text-red-500 font-inter bg-black min-h-screen">Erreur: {error}</div>;
  if (!invoice) return null;

  const handleDownloadPDF = async () => {
    if (!window.html2pdf) {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      document.body.appendChild(script);
      await new Promise(resolve => script.onload = resolve);
    }

    const element = document.getElementById('invoice-content');
    // Ensure the background is strictly black for the PDF capture
    element.style.backgroundColor = '#1A1A1A';
    
    const opt = {
      margin:       [0.5, 0.5, 0.5, 0.5],
      filename:     `Facture_${invoice.number}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#1A1A1A' },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    window.html2pdf().set(opt).from(element).save();
  };

  const isReceipt = invoice.type === 'receipt_purchase';
  const title = isReceipt ? "Facture d'Achat" : (invoice.type === 'invoice_commission' ? "Facture de Commission" : "Bordereau de Vente");
  
  return (
    <div className="bg-[#0E0E0E] min-h-screen text-white p-4 md:p-8 font-inter">
      
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white transition-colors">
          <FaArrowLeft className="mr-2" /> Retour
        </button>
        <button onClick={handleDownloadPDF} className="bg-[#00D26A] text-black px-6 py-2 rounded-sm font-bold flex items-center shadow-md hover:bg-green-500 transition-colors">
          <FaPrint className="mr-2" /> Télécharger le PDF
        </button>
      </div>

      <div id="invoice-content" className="max-w-4xl mx-auto border border-gray-800 bg-[#1A1A1A] p-6 md:p-10 shadow-2xl rounded-lg">
        
        <div className="flex flex-col md:flex-row justify-between border-b border-gray-800 pb-8 mb-8">
          <div>
            <h1 className="text-5xl font-bebas text-red-600 uppercase tracking-widest mb-2">2ROUND</h1>
            <p className="text-sm text-gray-400">Plateforme d'équipements de boxe de seconde main</p>
            <p className="text-sm text-gray-400 mt-2">123 Rue de la Boxe, 75000 Paris</p>
            <p className="text-sm text-gray-400">SIRET: 123 456 789 00012</p>
          </div>
          <div className="text-left md:text-right mt-6 md:mt-0">
            <h2 className="text-3xl font-bebas uppercase text-gray-200">{title}</h2>
            <p className="text-sm mt-2 font-bold text-gray-300">N° {invoice.number}</p>
            <p className="text-sm text-gray-400">Date : {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</p>
            {invoice.orderObj && <p className="text-sm text-gray-400">Commande : {invoice.orderObj.number}</p>}
          </div>
        </div>

        <div className="flex justify-between mb-12">
          <div className="w-full md:w-1/2">
            <h3 className="font-bold text-[#00D26A] mb-2 uppercase text-sm">Facturé à :</h3>
            {invoice.snapshot && invoice.snapshot.buyer ? (
              <div className="text-sm text-gray-300">
                <p className="font-bold text-white">{invoice.type === 'invoice_commission' || invoice.type === 'receipt_transfer' ? invoice.snapshot.seller?.firstname + ' ' + invoice.snapshot.seller?.lastname : invoice.snapshot.buyer.firstname + ' ' + invoice.snapshot.buyer.lastname}</p>
                <p>{invoice.type === 'invoice_commission' || invoice.type === 'receipt_transfer' ? invoice.snapshot.seller?.email : invoice.snapshot.buyer.email}</p>
                {((invoice.type === 'invoice_commission' || invoice.type === 'receipt_transfer' ? invoice.snapshot.seller?.address : invoice.snapshot.buyer.address)) && (
                  <p className="mt-1 text-gray-500 italic">{invoice.type === 'invoice_commission' || invoice.type === 'receipt_transfer' ? invoice.snapshot.seller?.address : invoice.snapshot.buyer.address}</p>
                )}
              </div>
            ) : invoice.userObj ? (
              <div className="text-sm text-gray-300">
                <p className="font-bold text-white">{invoice.userObj.firstname} {invoice.userObj.lastname}</p>
                <p>{invoice.userObj.email}</p>
                {invoice.userObj.adresses && invoice.userObj.adresses.length > 0 && (
                  <p className="mt-1 text-gray-500 italic">Adresse enregistrée sur le profil</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Client</p>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full mb-12">
            <thead>
              <tr className="border-b-2 border-gray-700 text-left text-sm uppercase text-gray-400">
                <th className="py-3 px-2">Description</th>
                <th className="py-3 px-2 text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800">
                <td className="py-4 px-2">
                  <p className="font-bold text-white">{invoice.snapshot?.product?.name || invoice.productObj?.name || 'Article / Service 2Round'}</p>
                  {invoice.type === 'receipt_purchase' && <p className="text-xs text-gray-400 mt-1">Prix de l'article de boxe</p>}
                  {invoice.type === 'invoice_commission' && <p className="text-xs text-gray-400 mt-1">Frais de service plateforme</p>}
                  {invoice.type === 'receipt_transfer' && <p className="text-xs text-gray-400 mt-1">Revenu de vente</p>}
                </td>
                <td className="py-4 px-2 text-right text-gray-200 font-semibold">
                  {invoice.type === 'receipt_purchase' && (invoice.snapshot?.product || invoice.productObj)
                    ? parseFloat(invoice.snapshot?.product?.price || invoice.productObj?.price).toFixed(2) 
                    : invoice.amount} €
                </td>
              </tr>
              {invoice.type === 'receipt_purchase' && (invoice.snapshot?.order || invoice.orderObj) && (
                <>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-2">
                      <p className="font-bold text-white flex items-center">Frais de protection acheteur <span className="ml-2 text-[#00D26A] text-xs">🛡️</span></p>
                      <p className="text-xs text-gray-400 mt-1">Garantie 2Round et paiements sécurisés</p>
                    </td>
                    <td className="py-4 px-2 text-right text-gray-200 font-semibold">
                      {((invoice.snapshot?.order?.servicesFees ?? invoice.orderObj?.servicesFees ?? 0) / 100).toFixed(2)} €
                    </td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-2">
                      <p className="font-bold text-white">Frais de livraison</p>
                      <p className="text-xs text-gray-400 mt-1">Transport du colis</p>
                    </td>
                    <td className="py-4 px-2 text-right text-gray-200 font-semibold">
                      {((invoice.snapshot?.order?.shippingFees ?? invoice.orderObj?.shippingFees ?? 0) / 100).toFixed(2)} €
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-full md:w-1/2 lg:w-2/5">
            {invoice.type === 'receipt_purchase' && (invoice.snapshot?.order || invoice.orderObj) && (
              <>
                <div className="flex justify-between py-2 text-gray-400 text-sm border-t border-gray-700 mt-4">
                  <span>Total Article (Sans TVA)</span>
                  <span>{parseFloat(invoice.snapshot?.product?.price || invoice.productObj?.price || 0).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between py-2 text-gray-400 text-sm">
                  <span>Total Services 2Round (TTC)</span>
                  <span>{(((invoice.snapshot?.order?.servicesFees ?? invoice.orderObj?.servicesFees ?? 0) + (invoice.snapshot?.order?.shippingFees ?? invoice.orderObj?.shippingFees ?? 0)) / 100).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between py-1 text-gray-500 text-xs italic">
                  <span>Dont TVA sur les services (20%)</span>
                  <span>{((((invoice.snapshot?.order?.servicesFees ?? invoice.orderObj?.servicesFees ?? 0) + (invoice.snapshot?.order?.shippingFees ?? invoice.orderObj?.shippingFees ?? 0)) / 100) - (((invoice.snapshot?.order?.servicesFees ?? invoice.orderObj?.servicesFees ?? 0) + (invoice.snapshot?.order?.shippingFees ?? invoice.orderObj?.shippingFees ?? 0)) / 100) / 1.2).toFixed(2)} €</span>
                </div>
              </>
            )}

            {invoice.type === 'invoice_commission' && (
               <>
                <div className="flex justify-between py-2 text-gray-400 text-sm border-t border-gray-700 mt-4">
                  <span>Total HT</span>
                  <span>{(parseFloat(invoice.amount) / 1.2).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between py-2 text-gray-400 text-sm">
                  <span>TVA (20%)</span>
                  <span>{(parseFloat(invoice.amount) - parseFloat(invoice.amount) / 1.2).toFixed(2)} €</span>
                </div>
               </>
            )}

            <div className="flex justify-between py-4 text-2xl font-bebas tracking-wider text-[#00D26A] border-t-2 border-gray-700 mt-2">
              <span>{invoice.type === 'receipt_transfer' ? 'Total Reversé' : 'Total Payé TTC'}</span>
              <span>
                {invoice.type === 'receipt_purchase' && (invoice.snapshot?.order || invoice.orderObj)
                  ? (parseFloat(invoice.snapshot?.product?.price || invoice.productObj?.price || 0) + (invoice.snapshot?.order?.servicesFees ?? invoice.orderObj?.servicesFees ?? 0) / 100 + (invoice.snapshot?.order?.shippingFees ?? invoice.orderObj?.shippingFees ?? 0) / 100).toFixed(2)
                  : invoice.amount} €
              </span>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
          {invoice.type === 'receipt_purchase' || invoice.type === 'receipt_transfer' ? (
            <p className="font-bold text-gray-400">Vente entre particuliers - L'article n'est pas assujetti à la TVA (art. 293 B du CGI ou équivalent).</p>
          ) : (
            <p className="font-bold text-gray-400">Facture de services 2Round - TVA applicable au taux normal de 20%.</p>
          )}
          <p className="mt-2">Merci pour votre confiance !</p>
          <p className="mt-1">Ce document est généré électroniquement et sert de preuve de transaction.</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
