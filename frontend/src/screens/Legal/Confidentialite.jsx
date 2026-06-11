
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const Confidentialite = () => {
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
          Politique de Confidentialité & RGPD
        </h1>

        <div className="space-y-8 text-gray-300 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données personnelles collectées via la plateforme <strong>2ROUND</strong> est <strong>L'IDEM - Creative Arts School</strong> (ci-après "L'IDEM"), sise Rue du Mas de les Garrigues, 66270 Le Soler. Pour toute question relative à la protection de vos données, vous pouvez contacter notre Délégué à la Protection des Données (DPO) à l'adresse suivante : dpo@2round.fr.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Données collectées et finalités</h2>
            <p>
              Nous collectons les données strictement nécessaires à l'utilisation de nos services :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Données d'identification :</strong> Nom, prénom, email, date de naissance (pour valider la majorité), et adresses postales (pour la livraison).</li>
              <li><strong>Données transactionnelles :</strong> Historique des achats/ventes, suivi d'expédition, et informations du Wallet. Les données de carte bancaire sont traitées de bout en bout par notre prestataire certifié PCI-DSS (Stripe) et ne transitent jamais en clair sur nos serveurs.</li>
              <li><strong>Données de communication :</strong> Messages échangés via le système de messagerie interne, à des fins de modération et de résolution des litiges.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Destinataires des données</h2>
            <p>
              Vos données ne sont jamais revendues à des fins commerciales. Elles sont transmises uniquement à nos sous-traitants agissant dans le cadre exclusif de notre service :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Stripe :</strong> Pour la gestion des paiements et la vérification d'identité (KYC).</li>
              <li><strong>Transporteurs (ex: Mondial Relay) :</strong> Pour l'édition des bordereaux d'expédition et le suivi des colis.</li>
              <li><strong>OVH SAS :</strong> Hébergeur de nos bases de données sécurisées (situées en France).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Durée de conservation</h2>
            <p>
              Nous conservons vos données personnelles tant que votre compte est actif. Conformément aux obligations légales, les données de facturation sont conservées 10 ans. En cas de suppression de compte, vos données sont anonymisées, à l'exception de celles nécessaires à la prévention de la fraude ou aux litiges en cours (conservées 3 ans).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Vos droits (RGPD) et recours CNIL</h2>
            <p>
              Conformément au Règlement Européen sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Droit d'accès, de rectification et d'effacement de vos données.</li>
              <li>Droit à la portabilité (récupérer vos données dans un format lisible).</li>
              <li>Droit de limitation ou d'opposition au traitement.</li>
            </ul>
            <p className="mt-2">
              Pour exercer ces droits, envoyez une demande avec une copie d'une pièce d'identité à : <strong>dpo@2round.fr</strong>. Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez adresser une réclamation en ligne à la CNIL (cnil.fr).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Politique des Cookies</h2>
            <p>
              2ROUND utilise uniquement des cookies et traceurs dits "strictement nécessaires" à la fourniture du service (authentification par jeton JWT, sécurisation de session, mémorisation du panier). Aucun cookie de ciblage publicitaire tiers n'est utilisé sur notre plateforme.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Confidentialite;
