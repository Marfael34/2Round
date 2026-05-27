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

  const handlePrint = () => {
    window.print();
  };

  const isReceipt = invoice.type === 'receipt_purchase';
  const title = isReceipt ? "Facture d'Achat" : (invoice.type === 'invoice_commission' ? "Facture de Commission" : "Bordereau de Vente");
  
  return (
    <div className="bg-white min-h-screen text-black p-8 font-inter print:p-0 print:m-0">
      <div className="max-w-4xl mx-auto border border-gray-200 p-10 shadow-lg print:border-none print:shadow-none print:p-0 bg-white">
        
        <div className="flex justify-between items-center mb-10 print:hidden">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-black">
            <FaArrowLeft className="mr-2" /> Retour
          </button>
          <button onClick={handlePrint} className="bg-red-600 text-white px-6 py-2 rounded-sm font-bold flex items-center shadow-md hover:bg-red-700">
            <FaPrint className="mr-2" /> Imprimer / Enregistrer PDF
          </button>
        </div>

        <div className="flex justify-between border-b border-gray-300 pb-8 mb-8">
          <div>
            <h1 className="text-5xl font-bebas text-red-600 uppercase tracking-widest mb-2">2ROUND</h1>
            <p className="text-sm text-gray-500">Plateforme d'équipements de boxe de seconde main</p>
            <p className="text-sm text-gray-500 mt-2">123 Rue de la Boxe, 75000 Paris</p>
            <p className="text-sm text-gray-500">SIRET: 123 456 789 00012</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bebas uppercase text-gray-800">{title}</h2>
            <p className="text-sm mt-2 font-bold text-gray-600">N° {invoice.number}</p>
            <p className="text-sm text-gray-600">Date : {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</p>
            {invoice.orderObj && <p className="text-sm text-gray-600">Commande : {invoice.orderObj.number}</p>}
          </div>
        </div>

        <div className="flex justify-between mb-12">
          <div className="w-1/2">
            <h3 className="font-bold text-gray-800 mb-2 uppercase text-sm">Facturé à :</h3>
            {invoice.userObj ? (
              <div className="text-sm text-gray-700">
                <p className="font-bold">{invoice.userObj.firstname} {invoice.userObj.lastname}</p>
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

        <table className="w-full mb-12">
          <thead>
            <tr className="border-b-2 border-gray-800 text-left text-sm uppercase text-gray-600">
              <th className="py-3 px-2">Description</th>
              <th className="py-3 px-2 text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-4 px-2">
                <p className="font-bold text-gray-800">{invoice.productObj?.name || 'Article / Service 2Round'}</p>
                {invoice.type === 'receipt_purchase' && <p className="text-xs text-gray-500 mt-1">Prix de l'article de boxe</p>}
                {invoice.type === 'invoice_commission' && <p className="text-xs text-gray-500 mt-1">Frais de service plateforme</p>}
                {invoice.type === 'receipt_transfer' && <p className="text-xs text-gray-500 mt-1">Revenu de vente</p>}
              </td>
              <td className="py-4 px-2 text-right text-gray-800">
                {invoice.type === 'receipt_purchase' && invoice.productObj 
                  ? parseFloat(invoice.productObj.price).toFixed(2) 
                  : invoice.amount} €
              </td>
            </tr>
            {invoice.type === 'receipt_purchase' && invoice.orderObj && (
              <>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-2">
                    <p className="font-bold text-gray-800">Frais de protection acheteur</p>
                    <p className="text-xs text-gray-500 mt-1">Garantie 2Round et paiements sécurisés</p>
                  </td>
                  <td className="py-4 px-2 text-right text-gray-800">
                    {((invoice.orderObj.servicesFees || 0) / 100).toFixed(2)} €
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-2">
                    <p className="font-bold text-gray-800">Frais de livraison</p>
                    <p className="text-xs text-gray-500 mt-1">Transport du colis</p>
                  </td>
                  <td className="py-4 px-2 text-right text-gray-800">
                    {((invoice.orderObj.shippingFees || 0) / 100).toFixed(2)} €
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-1/2 md:w-2/5">
            {invoice.type === 'receipt_purchase' && invoice.orderObj && (
              <>
                <div className="flex justify-between py-2 text-gray-600 text-sm border-t border-gray-300 mt-4">
                  <span>Total Article (Sans TVA)</span>
                  <span>{parseFloat(invoice.productObj?.price || 0).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between py-2 text-gray-600 text-sm">
                  <span>Total Services 2Round (TTC)</span>
                  <span>{(((invoice.orderObj.servicesFees || 0) + (invoice.orderObj.shippingFees || 0)) / 100).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between py-1 text-gray-400 text-xs italic">
                  <span>Dont TVA sur les services (20%)</span>
                  <span>{((((invoice.orderObj.servicesFees || 0) + (invoice.orderObj.shippingFees || 0)) / 100) - (((invoice.orderObj.servicesFees || 0) + (invoice.orderObj.shippingFees || 0)) / 100) / 1.2).toFixed(2)} €</span>
                </div>
              </>
            )}

            {invoice.type === 'invoice_commission' && (
               <>
                <div className="flex justify-between py-2 text-gray-600 text-sm border-t border-gray-300 mt-4">
                  <span>Total HT</span>
                  <span>{(parseFloat(invoice.amount) / 1.2).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between py-2 text-gray-600 text-sm">
                  <span>TVA (20%)</span>
                  <span>{(parseFloat(invoice.amount) - parseFloat(invoice.amount) / 1.2).toFixed(2)} €</span>
                </div>
               </>
            )}

            <div className="flex justify-between py-4 text-xl font-bold text-gray-900 border-t-2 border-gray-800 mt-2">
              <span>{invoice.type === 'receipt_transfer' ? 'Total Reversé' : 'Total Payé TTC'}</span>
              <span>
                {invoice.type === 'receipt_purchase' && invoice.orderObj
                  ? (parseFloat(invoice.productObj?.price || 0) + (invoice.orderObj.servicesFees || 0) / 100 + (invoice.orderObj.shippingFees || 0) / 100).toFixed(2)
                  : invoice.amount} €
              </span>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-gray-200 text-center text-xs text-gray-500">
          {invoice.type === 'receipt_purchase' || invoice.type === 'receipt_transfer' ? (
            <p className="font-bold text-gray-700">Vente entre particuliers - L'article n'est pas assujetti à la TVA (art. 293 B du CGI ou équivalent).</p>
          ) : (
            <p className="font-bold text-gray-700">Facture de services 2Round - TVA applicable au taux normal de 20%.</p>
          )}
          <p className="mt-2">Merci pour votre confiance !</p>
          <p className="mt-1">Ce document est généré électroniquement et sert de preuve de transaction.</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
