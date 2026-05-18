import { Link } from "react-router-dom";


const Tagline = () => {
  return (
    <div className="bg-black text-white p-8 md:p-16 lg:p-24 flex flex-col md:flex-row justify-between items-end gap-12 border-t border-white/5">
      <div className="flex flex-col gap-10 md:gap-16 max-w-3xl">
        {/* Titre */}
        <h2 className="font-bebas text-5xl md:text-7xl lg:text-8xl font-bold uppercase leading-none tracking-wide">
          Ton matériel peut <br />
          <span className="text-red-600">encore</span> faire des <br />
          rounds
        </h2>

        {/* Badges/Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-xl">
          <span className="border border-white/30 rounded-full py-3 px-6 text-sm font-inter text-center uppercase tracking-wider md:whitespace-nowrap">
            Gagne de l'argent
          </span>
          <span className="border border-white/30 rounded-full py-3 px-6 text-sm font-inter text-center uppercase tracking-wider md:whitespace-nowrap">
            Aide un boxeur
          </span>
          <span className="border border-white/30 rounded-full py-3 px-6 text-sm font-inter text-center uppercase tracking-wider md:whitespace-nowrap">
            Évite le gaspillage
          </span>
          <span className="border border-white/30 rounded-full py-3 px-6 text-sm font-inter text-center uppercase tracking-wider md:whitespace-nowrap">
            Vente simple et rapide
          </span>
        </div>
      </div>

      {/* Bouton Revendre */}
      <div className="shrink-0 mb-4">
        <Link
          to="/resale" 
          className="bg-red-600 text-white font-inter font-bold uppercase text-sm py-3 px-6 rounded-full flex items-center gap-2 hover:bg-red-700 transition-colors"
        >
          Revendre
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default Tagline;