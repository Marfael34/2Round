const Advantage = () => {
  return (
    <div className="w-full bg-gray-middle py-16 sm:py-20 md:py-24 px-6 sm:px-12 md:px-20 lg:px-32">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-center items-stretch gap-6 md:gap-0">
        
        {/* Gagne de l'argent */}
        <div className="flex flex-col items-center text-center justify-center flex-1 px-4 md:px-8 lg:px-12">
          <h3 className="font-inter font-bold text-lg sm:text-xl lg:text-2xl text-white uppercase tracking-wider mb-2.5">
            Gagne de l'argent
          </h3>
          <p className="font-inter font-light text-sm sm:text-base text-white/70 max-w-[260px] leading-relaxed">
            Ton ancien matériel devient un nouveau budget.
          </p>
        </div>

        {/* Separator */}
        <div className="hidden md:block w-px h-24 bg-gray-light self-center shrink-0"></div>
        <div className="block md:hidden h-px w-1/3 bg-gray-light my-6 self-center"></div>

        {/* Aide */}
        <div className="flex flex-col items-center text-center justify-center flex-1 px-4 md:px-8 lg:px-12">
          <h3 className="font-inter font-bold text-lg sm:text-xl lg:text-2xl text-white uppercase tracking-wider mb-2.5">
            Aide
          </h3>
          <p className="font-inter font-light text-sm sm:text-base text-white/70 max-w-[260px] leading-relaxed">
            Un boxeur peut s'équiper à moindre coût.
          </p>
        </div>

        {/* Separator 2 */}
        <div className="hidden md:block w-px h-24 bg-gray-light self-center shrink-0"></div>
        <div className="block md:hidden h-px w-1/3 bg-gray-light my-6 self-center"></div>

        {/* Evite le gaspillage */}
        <div className="flex flex-col items-center text-center justify-center flex-1 px-4 md:px-8 lg:px-12">
          <h3 className="font-inter font-bold text-lg sm:text-xl lg:text-2xl text-white uppercase tracking-wider mb-2.5">
            Évite le gaspillage
          </h3>
          <p className="font-inter font-light text-sm sm:text-base text-white/70 max-w-[260px] leading-relaxed">
            Moins de déchets, plus d'impact.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Advantage;