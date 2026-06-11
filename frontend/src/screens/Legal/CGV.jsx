
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const CGV = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-16 px-6 md:px-12 lg:px-24 font-inter">
      <div className="max-w-4xl mx-auto bg-[#1A1A1A] p-8 md:p-12 rounded-lg border border-white/10 shadow-2xl relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 text-gray-400 hover:text-white transition-colors"
          title="Retour"
        >
          <FaArrowLeft size={24} />
        </button>

        <h1 className="text-4xl md:text-5xl font-bebas uppercase tracking-widest text-center mb-12 mt-8">
          Conditions Générales de Vente (CGV)
        </h1>

        <div className="space-y-8 text-gray-300 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Préambule et Champ d'application</h2>
            <p>
              Les présentes Conditions Générales de Vente (CGV) s'appliquent sans restriction ni réserve à l'ensemble des ventes et services proposés sur la plateforme <strong>2ROUND</strong>, éditée par L'IDEM - Creative Arts School (SARL au capital de 10 000,00 €, SIRET : 412 187 636 00021, sise au Soler).
            </p>
            <p className="mt-2">
              2ROUND agit en tant qu'intermédiaire technique (hébergeur) mettant en relation des vendeurs particuliers et des acheteurs pour la vente d'équipements de sports de combat d'occasion. La validation d'une commande implique l'acceptation pleine et entière des présentes CGV.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Qualité et Description des Produits</h2>
            <p>
              Les produits mis en vente sont décrits et présentés par les vendeurs particuliers. Le vendeur s'engage à fournir une description exacte et transparente de l'état du produit. 2ROUND n'étant pas propriétaire des biens, sa responsabilité ne saurait être engagée en cas de description trompeuse de la part d'un vendeur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Prix, Frais de Service et Paiement</h2>
            <p>
              Les prix des articles sont fixés librement par les vendeurs et sont indiqués en euros (€) TTC. 
            </p>
            <p className="mt-2">
              <strong>Protection Acheteur :</strong> Afin de sécuriser les transactions, 2ROUND applique des frais de « Protection Acheteur » obligatoires sur chaque transaction. Ces frais garantissent le cantonnement des fonds jusqu'à la réception et la validation de l'article par l'acheteur.
            </p>
            <p className="mt-2">
              Le paiement est intégralement géré par notre partenaire de paiement agréé <strong>Stripe</strong>. L'utilisateur peut payer par carte bancaire ou utiliser le solde de son portefeuille virtuel (Wallet 2ROUND).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Expédition et Livraison</h2>
            <p>
              Les livraisons sont assurées via notre transporteur partenaire (Mondial Relay ou Colissimo). Une fois la commande payée, le vendeur dispose d'un délai strict de <strong>5 jours ouvrés</strong> pour déposer le colis en point relais. Passé ce délai, la commande sera automatiquement annulée et l'acheteur intégralement remboursé.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Droit de rétractation et Gestion des Litiges</h2>
            <p>
              S'agissant de contrats conclus entre consommateurs (particuliers), <strong>le droit de rétractation légal de 14 jours ne s'applique pas</strong> (Article L221-18 du Code de la consommation). 
            </p>
            <p className="mt-2">
              Cependant, la Protection Acheteur 2ROUND permet à l'acquéreur de suspendre la transaction s'il constate, dans un délai de <strong>48 heures après réception</strong>, que l'article est non conforme à l'annonce ou gravement endommagé. Un litige doit alors être ouvert via la plateforme. En l'absence de signalement dans ce délai de 48 heures, la vente est réputée conclue et les fonds sont débloqués au vendeur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Droit Applicable et Juridiction Compétente</h2>
            <p>
              Les présentes CGV sont soumises à la loi française. En cas de litige entre 2ROUND et un utilisateur, non résolu à l'amiable, les tribunaux français du ressort du siège social de L'IDEM (Tribunal de Perpignan) seront seuls compétents.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CGV;
