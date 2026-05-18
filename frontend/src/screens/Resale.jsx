import { ChevronLeft, ArrowRight } from "lucide-react";
import { IMG_BGRAYURE } from "../constants/appConstante";
import { Link } from "react-router-dom";
import Advantage from "../components/Resale/Advantage";
import TechnicalSteps from "../components/Resale/TechnicalSteps";

const Resale = () => {
  return (
    <div className="flex flex-col w-full bg-black">
      {/* Hero Section: Striped Diagonal Banner */}
      <div
        className="w-full bg-rayure flex flex-col min-h-fit md:min-h-[650px] lg:min-h-[750px] py-12 sm:py-24 md:py-28 lg:py-36 px-6 sm:px-12 md:px-20 lg:px-32 xl:px-40 bg-cover bg-center transition-all relative overflow-hidden"
        style={{ backgroundImage: `url(${IMG_BGRAYURE})` }}
      >
        <div className="flex flex-col gap-16 sm:gap-20 md:gap-24 lg:gap-32 max-w-5xl lg:max-w-6xl xl:max-w-none mt-2 md:mt-4">
          {/* Row 1: Chevron + Title */}
          <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
            {/* Chevron Back Button */}
            <Link
              to="/"
              className="text-white hover:text-red transition-colors flex items-center justify-center shrink-0"
              aria-label="Retour"
            >
              <ChevronLeft
                strokeWidth={1.5}
                className="w-8 h-8 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20"
              />
            </Link>

            {/* Title */}
            <h2 className="font-bebas text-white uppercase text-4xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl leading-[0.95] sm:leading-[0.9] md:leading-[0.85] tracking-wide">
              Ton matériel peut <br />
              <span className="text-red">encore</span> faire des rounds
            </h2>
          </div>

          <p className="font-inter font-light text-sm sm:text-lg md:text-xl lg:text-2xl text-white pl-4 sm:pl-20 md:pl-24 lg:pl-28 tracking-wide">
            Donne une seconde vie à ton équipement !
          </p>
        </div>

        <div className="flex justify-center md:justify-end w-full mt-10 md:mt-24 lg:mt-32">
          <Link
            to="/formarket"
            className="bg-red text-white font-inter font-bold uppercase text-xs sm:text-sm md:text-base py-3.5 px-7 sm:py-4.5 sm:px-9 md:py-5 md:px-10 rounded-full flex items-center gap-2 sm:gap-3 hover:bg-red/90 transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98] shadow-lg shadow-red/20"
          >
            Commencer la revente
            <ArrowRight strokeWidth={2.5} className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>
      </div>

      {/* Spaced components underneath */}
      <Advantage />
      <TechnicalSteps />
    </div>
  );
};

export default Resale;
