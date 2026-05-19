import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaHeart, FaStar } from "react-icons/fa6";
import { securedFetch } from "../../utils/api";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carousel State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Relatives lists
  const [sellerProducts, setSellerProducts] = useState([]);
  const [suggestedProducts, setSuggestedProducts] = useState([]);

  const fetchSellerProducts = async (sellerIri, currentId) => {
    try {
      const response = await securedFetch(`/api/products?seller=${encodeURIComponent(sellerIri)}`);
      if (response.ok) {
        const data = await response.json();
        const items = data.member || data["hydra:member"] || (Array.isArray(data) ? data : []);
        // Filter out current product and keep at most 2 items
        const filtered = items.filter(item => item.id !== currentId).slice(0, 2);
        setSellerProducts(filtered);
      }
    } catch (err) {
      console.error("Error fetching seller products:", err);
    }
  };

  const fetchSuggestions = async (currentId) => {
    try {
      const response = await securedFetch(`/api/products`);
      if (response.ok) {
        const data = await response.json();
        const items = data.member || data["hydra:member"] || (Array.isArray(data) ? data : []);
        // Prioritize highlighted items, filter out current product, and keep at most 4 items
        const filtered = items
          .filter(item => item.id !== currentId)
          .sort((a, b) => (b.isHighlighted ? 1 : 0) - (a.isHighlighted ? 1 : 0))
          .slice(0, 4);
        setSuggestedProducts(filtered);
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      setCurrentImageIndex(0);

      try {
        const response = await securedFetch(`/api/products/${id}`);
        if (!response.ok) {
          throw new Error("Impossible de récupérer les détails du produit");
        }
        const data = await response.json();
        setProduct(data);

        // Fetch seller other products
        if (data.seller && data.seller["@id"]) {
          fetchSellerProducts(data.seller["@id"], data.id);
        }
        
        // Fetch general suggestions
        fetchSuggestions(data.id);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Helpers
  const getProductImage = (prod) => {
    if (prod.image) return prod.image;
    if (Array.isArray(prod.images) && prod.images.length > 0) {
      const firstImage = prod.images[0];
      if (firstImage && typeof firstImage === "object" && firstImage.path) {
        return firstImage.path;
      }
    }
    return null;
  };

  const getProductAllImages = (prod) => {
    const list = [];
    if (prod.image) list.push(prod.image);
    if (Array.isArray(prod.images)) {
      prod.images.forEach((img) => {
        if (img && typeof img === "object" && img.path) {
          list.push(img.path);
        } else if (typeof img === "string") {
          list.push(img);
        }
      });
    }
    return [...new Set(list)];
  };

  const getColors = (prod) => {
    const desc = (prod.description || "").toLowerCase();
    const title = (prod.title || "").toLowerCase();
    if ((desc.includes("noir") || title.includes("noir")) && (desc.includes("gold") || desc.includes("or") || title.includes("gold"))) {
      return "Noir & Gold";
    }
    if (desc.includes("noir") || title.includes("noir")) return "Noir";
    if (desc.includes("rouge") || title.includes("rouge")) return "Rouge";
    if (desc.includes("bleu") || title.includes("bleu")) return "Bleu";
    if (desc.includes("blanc") || title.includes("blanc")) return "Blanc";
    return "Unique";
  };

  const getShowCertification = (prod) => {
    return (
      prod.isHighlighted === true ||
      prod.isHighlighted === 1 ||
      prod.isHighlighted === "1" ||
      prod.is_highlighted === true ||
      prod.is_highlighted === 1 ||
      prod.is_highlighted === "1" ||
      prod.highlighted === true ||
      prod.highlighted === 1 ||
      prod.highlighted === "1"
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-white">
        <p className="text-2xl font-inter tracking-wider">Chargement des détails du produit...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-white">
        <p className="text-red-500 text-xl mb-6">Erreur : {error || "Produit introuvable"}</p>
        <Link to="/marketplace" className="inline-block bg-white text-black px-6 py-3 font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  const allImages = getProductAllImages(product);
  const seller = product.seller || {};
  const evaluations = seller.receivedEvaluations || [];
  const averageRating = evaluations.length > 0
    ? evaluations.reduce((sum, ev) => sum + ev.rating, 0) / evaluations.length
    : 0;

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-12 lg:px-24 py-8 font-inter">
      <div className="max-w-[960px] mx-auto">
        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white hover:text-gray-400 transition-colors text-3xl mb-8 font-bebas tracking-wider"
        >
          <FaChevronLeft className="text-2xl" />
        </button>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-4 items-start">
          
          {/* Carousel Box */}
          <div className="order-1 lg:col-start-1 lg:row-start-1 relative aspect-square w-full max-w-[450px] mx-auto lg:mx-0 bg-[#111] border border-white/10 overflow-hidden flex items-center justify-center group">
            {allImages.length > 0 ? (
              <img
                src={allImages[currentImageIndex]}
                alt={product.title}
                className="w-full h-full object-contain select-none"
              />
            ) : (
              <div className="text-gray-600 text-lg font-light">Aucune image disponible</div>
            )}

            {/* Left and Right navigation arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/70 flex items-center justify-center rounded-full text-white transition-colors cursor-pointer"
                >
                  <FaChevronLeft />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/70 flex items-center justify-center rounded-full text-white transition-colors cursor-pointer"
                >
                  <FaChevronRight />
                </button>
              </>
            )}

            {/* Carousel dots indicators */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {allImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === currentImageIndex ? "bg-white scale-110" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Favorite heart icon at bottom right */}
            <div className="absolute bottom-4 right-4 w-12 h-12 bg-black/60 border border-white/10 rounded-full flex items-center justify-center text-white hover:text-red-500 hover:scale-105 cursor-pointer transition-all">
              <FaHeart className="text-xl" />
            </div>
          </div>

          {/* Details Box */}
          <div className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2 w-full max-w-[450px] mx-auto lg:mx-0 border border-white/10 bg-[#0A0A0A] p-8 flex flex-col">
            
            {/* Title */}
            <h2 className="font-bebas text-5xl uppercase tracking-wider text-white mb-2">
              {product.title}
            </h2>

            {/* Price */}
            <div className="text-[#EF4444] font-bebas text-4xl mb-8 tracking-wide">
              {product.price}€
            </div>

            {/* Specifications List */}
            <div className="space-y-4 font-inter text-sm mb-8">
              
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white uppercase text-xs tracking-wider">Taille :</span>
                  <span className="text-gray-400 font-light">{product.size || "Non spécifiée"}</span>
                </div>
                <Link to="/guidesize" className="text-xs text-gray-400 hover:text-white underline transition-colors">
                  Voir le guide &gt;
                </Link>
              </div>

              <div className="flex items-center py-1 gap-1.5">
                <span className="font-bold text-white uppercase text-xs tracking-wider">Marque :</span>
                <span className="text-gray-400 font-light">{product.brand || "Non renseignée"}</span>
              </div>

              <div className="flex items-center py-1 gap-1.5">
                <span className="font-bold text-white uppercase text-xs tracking-wider">État :</span>
                <span className="text-gray-400 font-light">{product.etat?.label || "Non renseigné"}</span>
              </div>

              <div className="flex items-center py-1 gap-1.5">
                <span className="font-bold text-white uppercase text-xs tracking-wider">Couleurs :</span>
                <span className="text-gray-400 font-light">{getColors(product)}</span>
              </div>

              {product.weight && (
                <div className="flex items-center py-1 gap-1.5">
                  <span className="font-bold text-white uppercase text-xs tracking-wider">Poids :</span>
                  <span className="text-gray-400 font-light">{product.weight} g</span>
                </div>
              )}
            </div>

            {/* Description Text */}
            <p className="text-gray-400 text-sm font-light leading-relaxed mb-10 pb-8 border-b border-white/10">
              {product.description || "Aucune description fournie pour cet article."}
            </p>

            {/* CTA Buttons */}
            <div className="space-y-4 mb-8">
              <button className="w-full bg-[#E5E5E5] hover:bg-white text-black font-inter font-bold py-4 text-center tracking-widest uppercase transition-all cursor-pointer rounded-sm text-sm">
                Acheter
              </button>
              
              <button className="w-full bg-transparent hover:bg-white/5 border border-white/40 hover:border-white text-white font-inter font-bold py-4 text-center tracking-widest uppercase transition-all cursor-pointer rounded-sm text-sm">
                Faire une offre
              </button>

              <button className="w-full bg-transparent hover:bg-white/5 border border-white/40 hover:border-white text-white font-inter font-bold py-4 text-center tracking-widest uppercase transition-all cursor-pointer rounded-sm text-sm">
                Message
              </button>
            </div>

            {/* Seller Card Section */}
            {seller.pseudo && (
              <div 
                onClick={() => navigate(`/locker/${seller.id}`)}
                className="border-t border-white/10 pt-6 mt-2 flex items-center gap-4 cursor-pointer group/seller"
              >
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full bg-[#1A1A1A] border border-white/10 overflow-hidden shrink-0">
                  {seller.avatar ? (
                    <img src={seller.avatar} alt={seller.pseudo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-bebas text-gray-500 uppercase">
                      {seller.pseudo.slice(0, 2)}
                    </div>
                  )}
                </div>

                {/* Rating & Pseudo */}
                <div>
                  <h4 className="font-bebas text-2xl tracking-wide uppercase text-white group-hover/seller:text-red-500 transition-colors">
                    {seller.pseudo}
                  </h4>
                  
                  <div className="flex flex-col mt-0.5">
                    <div className="flex gap-1 text-base">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={i < Math.round(averageRating) ? "text-red-600" : "text-gray-700"}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400 font-inter uppercase mt-1 tracking-wider">
                      {evaluations.length} Évaluation{evaluations.length > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Right arrow */}
                <FaChevronRight className="ml-auto text-gray-500 group-hover/seller:text-white transition-colors text-lg" />
              </div>
            )}
          </div>

          {/* Related Section (Dressing + Suggestions) */}
          <div className="order-3 lg:col-start-1 lg:row-start-2 space-y-12 max-w-[450px] w-full mx-auto lg:mx-0">
            
            {/* Dressing du membre */}
            {sellerProducts.length > 0 && (
              <div>
                <h4 className="font-bebas text-3xl uppercase tracking-wider mb-6 pb-2 border-b border-white/10">
                  Dressing du membre
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  {sellerProducts.map((item) => {
                    const img = getProductImage(item);
                    return (
                      <Link to={`/product/${item.id}`} key={item.id} className="group block text-white">
                        <div className="relative aspect-square bg-[#111] border border-white/10 overflow-hidden mb-3">
                          {img ? (
                            <img
                              src={img}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Pas d'image</div>
                          )}
                          {/* Heart Overlay */}
                          <div className="absolute bottom-2 right-2 text-lg text-white/80 hover:text-red-500 transition-colors p-1.5 bg-black/40 rounded-full">
                            <FaHeart />
                          </div>
                          {/* Certification overlay */}
                          {getShowCertification(item) && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                              <span className="text-black text-xs font-bold">✓</span>
                            </div>
                          )}
                        </div>
                        <h5 className="font-bold uppercase text-base truncate mb-0.5">{item.title}</h5>
                        <p className="text-gray-400 text-xs font-light mb-1">
                          {item.size || "Unique"} - {item.etat?.label || "Bon état"}
                        </p>
                        <p className="font-bold text-base">{item.price}€</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {suggestedProducts.length > 0 && (
              <div>
                <h4 className="font-bebas text-3xl uppercase tracking-wider mb-6 pb-2 border-b border-white/10">
                  Suggestions
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  {suggestedProducts.map((item) => {
                    const img = getProductImage(item);
                    return (
                      <Link to={`/product/${item.id}`} key={item.id} className="group block text-white">
                        <div className="relative aspect-square bg-[#111] border border-white/10 overflow-hidden mb-3">
                          {img ? (
                            <img
                              src={img}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Pas d'image</div>
                          )}
                          {/* Heart Overlay */}
                          <div className="absolute bottom-2 right-2 text-lg text-white/80 hover:text-red-500 transition-colors p-1.5 bg-black/40 rounded-full">
                            <FaHeart />
                          </div>
                          {/* Certification overlay */}
                          {getShowCertification(item) && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                              <span className="text-black text-xs font-bold">✓</span>
                            </div>
                          )}
                        </div>
                        <h5 className="font-bold uppercase text-base truncate mb-0.5">{item.title}</h5>
                        <p className="text-gray-400 text-xs font-light mb-1">
                          {item.size || "Unique"} - {item.etat?.label || "Bon état"}
                        </p>
                        <p className="font-bold text-base">{item.price}€</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;