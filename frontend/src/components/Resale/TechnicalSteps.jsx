import {
  IMG_TECH_FLOU,
  IMG_TECH_GUARD,
  IMG_TECH_LEFT,
  IMG_TECH_RIGHT,
  IMG_TECH_UPERCUT,
} from "../../constants/appConstante";
import { FaArrowRight } from "react-icons/fa";

const TechnicalSteps = () => {
  return (
    <div className="bg-black min-h-screen text-white font-sans p-6 xl:p-16 overflow-hidden">
      {/* En-tête */}
      <div className="max-w-6xl mb-16">
        <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-wide">
          Leçon de technique
        </h2>
      </div>

      {/* Conteneur principal des étapes */}
      <div className="flex flex-col items-center xl:items-stretch xl:max-w-6xl  mx-auto relative">
        {/* Étape 1 : La Garde */}
        <div className="flex flex-col xl:flex-row items-center gap-1 w-fit relative  p-5 xl:mb-8 xl:-translate-x-50">
          <div className="relative w-48 h-48 md:w-72 md:h-72 xl:w-150 xl:h-100 shrink-0 overflow-hidden">
            <img
              src={IMG_TECH_GUARD}
              alt="Garde"
              className="w-full h-full object-contain object-bottom"
            />
            <img
              src={IMG_TECH_FLOU}
              alt=""
              className="absolute bottom-0 w-100 h-25 pointer-events-none"
            />
          </div>
          <div className="flex flex-col text-center xl:text-left xl:mt-65 xl:-ml-50 ">
            <span className="text-2xl md:text-4xl xl:text-6xl font-bebas uppercase mb-1">
              Étape 1 : La garde
            </span>
            <span className="text-xl md:text-2xl xl:text-4xl font-inter font-bold mb-1">
              Choisis ton équipement
            </span>
            <span className="text-white font-inter font-extralight text-base md:text-xl xl:text-3xl">
              Gants, casque, vêtements, sac...
            </span>
          </div>
        </div>

        {/* Étape 2 : Gauche */}
        <div className="flex justify-center  xl:justify-end xl:-translate-y-40 xl:translate-x-15">
          <div className="flex flex-col xl:flex-row items-center gap-1 w-fit p-6 ">
            {/* image */}
            <div className="relative w-48 h-48 md:w-72 md:h-72 xl:w-150 xl:h-100 overflow-hidden">
              <img
                src={IMG_TECH_LEFT}
                alt="Gauche"
                className="w-full h-full object-contain object-bottom"
              />
              <img
                src={IMG_TECH_FLOU}
                alt=""
                className="absolute bottom-0 left-0 w-60 h-9 pointer-events-none"
              />
            </div>
            {/* text */}
            <div className="flex flex-col text-center xl:text-left xl:-ml-90 xl:mt-50">
              <span className="text-2xl md:text-4xl xl:text-6xl font-bebas uppercase mb-1">
                Étape 2 : Gauche
              </span>
              <span className="text-xl md:text-2xl xl:text-4xl font-inter font-bold mb-1">
                Décris son état
              </span>
              <span className="text-white font-inter font-extralight text-base md:text-xl xl:text-3xl">
                Taille, usage, état général.
              </span>
            </div>
          </div>
        </div>

        {/* Étape 3 : Droite */}
        <div className="flex flex-col-reverse xl:flex-row  items-center gap-1 w-fit xl:ml-24 mx-auto  p-5 xl:-translate-x-10 xl:-translate-y-75 ">
          {/* text  */}
          <div className="flex flex-col text-center xl:text-left xl:-mr-60 xl:mt-50">
            <span className="text-2xl md:text-4xl xl:text-6xl font-bebas uppercase mb-1">
              Étape 3 : Droite
            </span>
            <span className="text-xl md:text-2xl xl:text-4xl font-inter font-bold mb-1">
              Ajoute des photos
            </span>
            <span className="text-white font-inter font-extralight text-base md:text-xl xl:text-3xl">
              Pour rassurer l'acheteur.
            </span>
          </div>
          {/* image */}
          <div className="relative w-48 h-48 md:w-72 md:h-72 xl:w-150 xl:h-100 shrink-0 overflow-hidden">
            <img
              src={IMG_TECH_RIGHT}
              alt="Droite"
              className="w-full h-full object-contain object-bottom-left"
            />
            <img
              src={IMG_TECH_FLOU}
              alt=""
              className="absolute bottom-0 right-0 w-80 h-20 pointer-events-none"
            />
          </div>
        </div>

        {/* Étape 4 : Uppercut */}
        <div className="flex flex-col-reverse xl:flex-row items-center gap-1 w-fit xl:translate-x-95 xl:-translate-y-150">
          {/* text  */}
          <div className="flex flex-col text-center xl:text-right xl:mt-75 xl:-mr-20">
            <span className="text-2xl md:text-4xl xl:text-6xl font-bebas uppercase mb-1">
              Étape 4 : Upercut
            </span>
            <span className="text-xl md:text-2xl xl:text-4xl font-inter font-bold mb-1">Mets en ligne</span>
            <span className="text-white font-inter font-extralight text-base md:text-xl xl:text-3xl">
              Ton équipement est visible immédiatement.
            </span>
          </div>
          {/* image */}
          <div className="relative w-48 h-48 md:w-72 md:h-72 xl:w-150 xl:h-100 shrink-0 overflow-hidden">
            <img
              src={IMG_TECH_UPERCUT}
              alt="Upercut"
              className="w-full h-full object-contain object-bottom scale-x-[-1]"
            />
            <img
              src={IMG_TECH_FLOU}
              alt=""
              className="absolute bottom-0 right-0 w-90 h-10 pointer-events-none"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center text-center space-y-8 xl:-translate-y-135 xl:translate-x-65">
        <h3 className="text-2xl md:text-4xl xl:text-6xl font-bebas uppercase tracking-wide">
          Un enchaînement facile, simple et efficace.
        </h3>

        <button className="bg-red hover:bg-red-700 text-white font-extrabold font-inter py-3 px-8 md:text-xl xl:text-3xl rounded-full inline-flex items-center gap-3 uppercase transition-all duration-300 xl:translate-x-55">
          Commencer la revente <FaArrowRight  className="h-5 w-5 md:h-6 md:w-6 xl:h-8 xl:w-8"/>
        </button>
      </div>
    </div>
  );
};

export default TechnicalSteps;
