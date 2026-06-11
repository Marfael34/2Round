
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const MentionsLegales = () => {
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
          Mentions Légales
        </h1>

        <div className="space-y-8 text-gray-300 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Éditeur du site</h2>
            <p>
              Le site <strong>2ROUND</strong> (ci-après "le Site") est édité et exploité par <strong>L'IDEM - Creative Arts School</strong>, établissement d'enseignement supérieur technique privé.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Raison sociale :</strong> L'IDEM - Creative Arts School</li>
              <li><strong>Siège social :</strong> Rue du Mas de les Garrigues, 66270 Le Soler, France</li>
              <li><strong>Forme juridique :</strong> Société à Responsabilité Limitée (SARL)</li>
              <li><strong>Capital social :</strong> 10 000,00 €</li>
              <li><strong>Numéro SIRET :</strong> 412 187 636 00021</li>
              <li><strong>TVA Intracommunautaire :</strong> FR 89 412187636</li>
              <li><strong>Email de contact :</strong> contact@2round.fr</li>
              <li><strong>Téléphone :</strong> +33 (0)4 68 92 53 84</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Directeur de la publication</h2>
            <p>
              Le Directeur de la publication du Site est <strong>L'équipe 2ROUND</strong>, en qualité de créateurs et administrateurs du projet.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Hébergement</h2>
            <p>
              Le Site est hébergé par la société <strong>OVH SAS</strong>.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Raison sociale :</strong> OVH SAS</li>
              <li><strong>Siège social :</strong> 2 rue Kellermann - 59100 Roubaix - France</li>
              <li><strong>Téléphone :</strong> 1007</li>
              <li><strong>RCS :</strong> Lille Métropole 424 761 419 00045</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Propriété Intellectuelle</h2>
            <p>
              L'ensemble des éléments graphiques, textuels, informatiques et conceptuels du Site (notamment les textes, logos, images, éléments sonores, logiciels, icônes) sont la propriété exclusive de L'IDEM - Creative Arts School et de l'équipe 2ROUND, à l'exception des marques, logos ou contenus appartenant à d'autres sociétés partenaires ou auteurs.
            </p>
            <p className="mt-2">
              Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du Site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Limitation de responsabilité</h2>
            <p>
              L'IDEM - Creative Arts School s'efforce de fournir sur le Site des informations aussi précises que possible. Toutefois, elle ne pourra être tenue responsable des omissions, des inexactitudes et des carences dans la mise à jour, qu'elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.
            </p>
            <p className="mt-2">
              L'utilisation du Site et des services associés se fait aux risques et périls de l'utilisateur. 2ROUND décline toute responsabilité quant aux éventuels dommages directs ou indirects causés au matériel de l'utilisateur lors de l'accès au site.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegales;
