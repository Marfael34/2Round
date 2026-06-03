import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { API_URL } from "../../constants/apiConstante";
import {
  IMG_ILLU_GLOVES1,
  IMG_ILLU_GLOVES2,
  IMG_ILLU_HELMET,
  IMG_ILLU_BANDAGE,
  IMG_ILLU_SHOES1,
  IMG_ILLU_SHOES2,
} from "../../constants/appConstante";

const GuideSize = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("GANTS");
  const [sizeData, setSizeData] = useState({});
  const [loading, setLoading] = useState(true);

  const categories = ["GANTS", "BANDES", "CASQUE", "CHAUSSURES"];

  useEffect(() => {
    fetch(`${API_URL}/size_guides`)
      .then((res) => res.json())
      .then((data) => {
        const formattedData = {};
        const items =
          data["hydra:member"] ||
          data.member ||
          (Array.isArray(data) ? data : []);
        items.forEach((item) => {
          formattedData[item.equipment] = item.content;
        });
        setSizeData(formattedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des guides de tailles", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-black text-white">
        <p>Chargement des guides...</p>
      </div>
    );
  }

  const currentData = sizeData[selectedCategory];

  if (!currentData) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-red-500 font-inter">
          Impossible de charger les données pour cette catégorie.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="ml-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          Retour
        </button>
      </div>
    );
  }

  const getImage = (category, genderStr) => {
    if (category === "GANTS")
      return genderStr === "homme" ? IMG_ILLU_GLOVES1 : IMG_ILLU_GLOVES2;
    if (category === "BANDES") return IMG_ILLU_BANDAGE;
    if (category === "CASQUE") return IMG_ILLU_HELMET;
    if (category === "CHAUSSURES")
      return genderStr === "homme" ? IMG_ILLU_SHOES1 : IMG_ILLU_SHOES2;
    return IMG_ILLU_GLOVES1;
  };

  return (
    <div
      className="w-full min-h-screen flex flex-col pt-32 pb-8 px-6 sm:px-12 md:px-20 lg:px-32 relative text-white"
      style={{
        backgroundColor: "#0a0a0a",
        backgroundImage: `repeating-linear-gradient(-45deg, #070707, #070707 4px, #0e0e0e 4px, #0e0e0e 8px)`,
      }}
    >
      {/* Close button (Top Right) */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-28 right-6 sm:right-12 md:right-20 lg:right-32 text-gray-400 hover:text-white transition-colors z-50"
      >
        <X strokeWidth={1.5} className="w-8 h-8 md:w-10 md:h-10" />
      </button>

      <div className="flex flex-col max-w-6xl mx-auto w-full mt-4">
        {/* Header Section */}
        <div className="flex flex-col mb-12">
          <h2 className="font-bebas text-5xl md:text-6xl lg:text-7xl tracking-wide uppercase">
            GUIDE DES TAILLES
          </h2>
          <p className="font-inter text-gray-400 text-sm md:text-base lg:text-lg mb-6">
            Trouver la bonne taille selon son corps
          </p>

          {/* Category Selector */}
          <div className="relative inline-block w-48">
            {!isDropdownOpen ? (
              <button
                onClick={() => setIsDropdownOpen(true)}
                className="flex items-center justify-between w-full border border-red-600 px-4 py-2 hover:bg-red-900/20 transition-colors bg-transparent"
              >
                <span className="font-inter font-bold text-red-600 uppercase tracking-widest text-sm">
                  {selectedCategory}
                </span>
                <ChevronDown className="text-red-600 w-4 h-4" />
              </button>
            ) : (
              <div className="absolute top-0 left-0 flex flex-col border border-red-600 bg-[#555] z-20 w-full shadow-2xl">
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center justify-between px-4 py-2 hover:bg-white/10 transition-colors border-b border-gray-400"
                >
                  <span className="font-inter font-bold text-white uppercase tracking-widest text-sm">
                    {selectedCategory}
                  </span>
                  <ChevronUp className="text-gray-300 w-4 h-4" />
                </button>
                {categories
                  .filter((c) => c !== selectedCategory)
                  .map((cat, idx, arr) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsDropdownOpen(false);
                      }}
                      className={`flex items-center justify-start px-4 py-2 hover:bg-white/10 transition-colors text-left ${idx !== arr.length - 1 ? "border-b border-gray-400" : ""}`}
                    >
                      <span className="font-inter font-bold text-white uppercase tracking-widest text-sm">
                        {cat}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Rendering logic based on category type */}
        {currentData.type === "gendered" ? (
          <>
            {/* HOMME Section */}
            <div className="flex flex-col mb-20">
              <h2 className="font-bebas text-4xl md:text-5xl lg:text-6xl tracking-widest mb-6">
                HOMME
              </h2>

              <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
                {/* Table */}
                <div className="w-full lg:w-3/5 overflow-x-auto">
                  <table className="w-full text-left font-inter border-collapse">
                    <thead>
                      <tr className="border border-gray-600 bg-black/50">
                        {currentData.headers.map((header, i) => (
                          <th
                            key={i}
                            className={`p-2 sm:p-4 ${i < currentData.headers.length - 1 ? "border-r border-gray-600" : ""} font-bold text-xs sm:text-sm md:text-base uppercase tracking-wider`}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.homme.map((row, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-l border-r border-gray-600 bg-black/30 hover:bg-black/60 transition-colors text-xs sm:text-sm md:text-base"
                        >
                          <td className="p-2 sm:p-4 border-r border-gray-600 font-semibold">
                            {row[0]}
                          </td>
                          <td className="p-2 sm:p-4 border-r border-gray-600 text-gray-300">
                            {row[1]}
                          </td>
                          <td className="p-2 sm:p-4 text-gray-300">{row[2]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Image Homme */}
                <div className="w-full lg:w-2/5 flex justify-center lg:justify-end">
                  <div className="w-full max-w-[300px] aspect-square bg-gray-900 border border-gray-800 relative overflow-hidden">
                    <img
                      src={getImage(selectedCategory, "homme")}
                      alt={`${selectedCategory} Homme`}
                      className="object-cover w-full h-full opacity-80"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* FEMME Section */}
            <div className="flex flex-col mb-20">
              <h2 className="font-bebas text-4xl md:text-5xl lg:text-6xl tracking-widest mb-6 text-right">
                FEMME
              </h2>

              <div className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-16 items-start">
                {/* Image Femme */}
                <div className="w-full lg:w-2/5 flex justify-center lg:justify-start">
                  <div className="w-full max-w-[300px] aspect-square bg-gray-900 border border-gray-800 relative overflow-hidden">
                    <img
                      src={getImage(selectedCategory, "femme")}
                      alt={`${selectedCategory} Femme`}
                      className="object-cover w-full h-full opacity-80"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="w-full lg:w-3/5 overflow-x-auto">
                  <table className="w-full text-left font-inter border-collapse">
                    <thead>
                      <tr className="border border-gray-600 bg-black/50">
                        {currentData.headers.map((header, i) => (
                          <th
                            key={i}
                            className={`p-2 sm:p-4 ${i < currentData.headers.length - 1 ? "border-r border-gray-600" : ""} font-bold text-xs sm:text-sm md:text-base uppercase tracking-wider`}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.femme.map((row, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-l border-r border-gray-600 bg-black/30 hover:bg-black/60 transition-colors text-xs sm:text-sm md:text-base"
                        >
                          <td className="p-2 sm:p-4 border-r border-gray-600 font-semibold">
                            {row[0]}
                          </td>
                          <td className="p-2 sm:p-4 border-r border-gray-600 text-gray-300">
                            {row[1]}
                          </td>
                          <td className="p-2 sm:p-4 text-gray-300">{row[2]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* STANDARD Section (for Bandes, Casque) */
          <div className="flex flex-col mb-20">
            <h2 className="font-bebas text-4xl md:text-5xl lg:text-6xl tracking-widest mb-6">
              GUIDE STANDARD
            </h2>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
              {/* Table */}
              <div className="w-full lg:w-3/5 overflow-x-auto">
                <table className="w-full text-left font-inter border-collapse">
                  <thead>
                    <tr className="border border-gray-600 bg-black/50">
                      {currentData.headers.map((header, i) => (
                        <th
                          key={i}
                          className={`p-2 sm:p-4 ${i < currentData.headers.length - 1 ? "border-r border-gray-600" : ""} font-bold text-xs sm:text-sm md:text-base uppercase tracking-wider`}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.data.map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-l border-r border-gray-600 bg-black/30 hover:bg-black/60 transition-colors text-xs sm:text-sm md:text-base"
                      >
                        <td className="p-2 sm:p-4 border-r border-gray-600 font-semibold">
                          {row[0]}
                        </td>
                        <td className="p-2 sm:p-4 border-r border-gray-600 text-gray-300">
                          {row[1]}
                        </td>
                        <td className="p-2 sm:p-4 text-gray-300">{row[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Image */}
              <div className="w-full lg:w-2/5 flex justify-center lg:justify-end">
                <div className="w-full max-w-[300px] aspect-square bg-gray-900 border border-gray-800 relative overflow-hidden">
                  <img
                    src={getImage(selectedCategory, "standard")}
                    alt={`${selectedCategory} Guide`}
                    className="object-cover w-full h-full opacity-80"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideSize;
