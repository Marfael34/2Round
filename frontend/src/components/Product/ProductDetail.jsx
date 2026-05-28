import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation, useSearchParams } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaHeart, FaStar, FaXmark, FaTag, FaShieldHalved } from "react-icons/fa6";
import { securedFetch } from "../../utils/api";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Carousel State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Relatives lists
  const [sellerProducts, setSellerProducts] = useState([]);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  
  // Variables Utilisateur connectés
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // Offer Modal States
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerError, setOfferError] = useState("");
  const [sendingOffer, setSendingOffer] = useState(false);

  // Fetch current user details if logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setLoadingUser(true);
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          window.atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const payload = JSON.parse(jsonPayload);
        const email = payload.username;
        if (email) {
          securedFetch(`/api/users?email=${encodeURIComponent(email)}`)
            .then((res) => res.json())
            .then((data) => {
              const members = data.member || data["hydra:member"] || (Array.isArray(data) ? data : []);
              const userObj = members[0];
              if (userObj && userObj.id) {
                setCurrentUserId(userObj.id);
              } else {
                console.warn("Utilisateur non trouvé pour l'email:", email, "Réponse API:", data);
              }
            })
            .catch((err) => console.error("Erreur de récupération utilisateur:", err))
            .finally(() => setLoadingUser(false));
        } else {
          setLoadingUser(false);
        }
      } catch (e) {
        console.error("JWT decoding failed:", e);
        setLoadingUser(false);
      }
    }
  }, []);

  // Handle auto-open of offer modal if query param is set
  useEffect(() => {
    if (searchParams.get('initOffer') === 'true') {
      Promise.resolve().then(() => {
        setShowOfferModal(true);
        setSearchParams({});
      });
    }
  }, [searchParams, setSearchParams]);

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    if (!offerAmount || !product) return;
    
    // Si l'utilisateur n'a pas pu être identifié malgré le fait d'être connecté
    if (!currentUserId) {
        setOfferError("Impossible de vérifier votre identité. Veuillez vous reconnecter.");
        return;
    }

    const originalPrice = parseFloat(product.price || 0);
    const minOffer = originalPrice * 0.6;
    const amount = parseFloat(offerAmount);

    if (amount < minOffer) {
      setOfferError(`Votre offre doit être d'au moins 60% du prix d'origine (soit ${minOffer.toFixed(0)}€).`);
      return;
    }
    if (amount >= originalPrice) {
      setOfferError(`Votre offre doit être inférieure au prix initial (soit ${originalPrice.toFixed(0)}€).`);
      return;
    }

    setSendingOffer(true);
    try {
      // 1. Check if conversation already exists
      const convsRes = await securedFetch(`/api/conversations`);
      let activeConvId = null;
      
      if (convsRes.ok) {
        const convsData = await convsRes.json();
        const allConvs = convsData.member || convsData['hydra:member'] || [];
        const extractId = (val) => {
          if (!val) return null;
          if (typeof val === 'object') return val.id || (val['@id'] ? val['@id'].split('/').pop() : null);
          if (typeof val === 'string') return val.split('/').pop();
          return val;
        };

        const existing = allConvs.find(c => {
          const prodId = extractId(c.product);
          const buyerId = extractId(c.buyer);
          return Number(prodId) === Number(product.id) && Number(buyerId) === Number(currentUserId);
        });
        if (existing) {
          activeConvId = existing.id;
        }
      }

      // 2. Create conversation if it doesn't exist
      if (!activeConvId) {
        const newConvRes = await securedFetch(`/api/conversations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/ld+json' },
          body: JSON.stringify({
            buyer: `/api/users/${currentUserId}`,
            seller: typeof product.seller === 'string' ? product.seller : (product.seller?.['@id'] || `/api/users/${product.seller?.id}`),
            product: `/api/products/${product.id}`,
            createdAt: new Date().toISOString()
          })
        });
        if (!newConvRes.ok) throw new Error("Erreur de création de la conversation");
        const newConvData = await newConvRes.json();
        activeConvId = newConvData.id;
      }

      // 3. Create the Offer
      const offerRes = await securedFetch(`/api/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/ld+json' },
        body: JSON.stringify({
          amount: Number(offerAmount),
          status: 'pending',
          createdAt: new Date().toISOString()
        })
      });
      if (!offerRes.ok) throw new Error("Erreur de création de l'offre");
      const offerData = await offerRes.json();

      // 4. Create the Message
      const msgRes = await securedFetch(`/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/ld+json' },
        body: JSON.stringify({
          content: `Propose une offre de prix à ${offerAmount}€`,
          isRead: false,
          createdAt: new Date().toISOString(),
          users: `/api/users/${currentUserId}`,
          conversation: `/api/conversations/${activeConvId}`,
          offer: offerData['@id']
        })
      });
      if (!msgRes.ok) throw new Error("Erreur d'envoi du message");

      // 5. Navigate to the conversation screen
      setShowOfferModal(false);
      navigate(`/conversation?productId=${product.id}`);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi de l'offre.");
    } finally {
      setSendingOffer(false);
    }
  };

  const fetchSellerProducts = async (sellerIri, currentId) => {
    try {
      const response = await securedFetch(`/api/products?seller=${encodeURIComponent(sellerIri)}`);
      if (response.ok) {
        const data = await response.json();
        const items = data.member || data["hydra:member"] || (Array.isArray(data) ? data : []);
        const filtered = items.filter(item => item.id !== currentId).slice(0, 2);
        setSellerProducts(filtered);
      }
    } catch (err) {
      console.error("Error fetching seller products:", err);
    }
  };

  const fetchSuggestions = async (currentId) => {
    try {
      const response = await securedFetch(`/api/products?status=active`);
      if (response.ok) {
        const data = await response.json();
        const items = data.member || data["hydra:member"] || (Array.isArray(data) ? data : []);
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

        if (data.seller && data.seller["@id"]) {
          fetchSellerProducts(data.seller["@id"], data.id);
        }
        
        fetchSuggestions(data.id);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Determine if the product is favorited by the current user
  useEffect(() => {
    if (product && currentUserId) {
      const userIri = `/api/users/${currentUserId}`;
      const isFav = product.favorites?.some(fav => {
        // fav.users peut être un IRI string ou un objet
        const favUserIri = typeof fav.users === 'string' ? fav.users : fav.users?.['@id'];
        return favUserIri === userIri;
      });
      setIsFavorite(!!isFav);
    }
  }, [product, currentUserId]);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product) return;
    
    // Toggle optimiste
    setIsFavorite(!isFavorite);
    
    try {
      const response = await securedFetch(`/api/products/${product.id}/favorite`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        setIsFavorite(isFavorite);
      } else {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error('Erreur lors du toggle favori:', error);
      setIsFavorite(isFavorite);
    }
  };

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
  const sellerIri = seller['@id'] || (typeof seller === 'string' ? seller : '');
  const sellerId = seller.id ? Number(seller.id) : (sellerIri ? Number(sellerIri.split('/').pop()) : null);
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
            <div 
              onClick={handleFavoriteClick}
              className={`absolute bottom-4 right-4 w-12 h-12 bg-black/60 border border-white/10 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-all ${
                isFavorite ? "text-red-500" : "text-white hover:text-red-500"
              }`}
            >
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
            <div className="mb-8">
              <div className="text-red font-bebas text-4xl tracking-wide">
                {product.price}€
              </div>
              <div className="text-gray-400 text-[11px] mt-1.5 flex items-center gap-1.5 font-light">
                <FaShieldHalved className="text-emerald-500 text-xs" />
                <span>
                  + {(0.7 + product.price * 0.05).toFixed(2)}€ de frais de protection acheteur
                </span>
              </div>
            </div>

            {/* Specifications List */}
            <div className="space-y-4 font-inter text-sm mb-8">
              
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white font-inter tracking-wider">Taille :</span>
                  <span className="text-gray-400 font-inter font-light">{product.size || "Non spécifiée"}</span>
                </div>
                <Link to="/guidesize" className="text-xs text-gray-400 hover:text-white underline transition-colors">
                  Voir le guide &gt;
                </Link>
              </div>

              <div className="flex items-center py-1 gap-1.5">
                <span className="font-bold text-white font-inter tracking-wider">Marque :</span>
                <span className="text-gray-400 font-inter font-light">{product.brand || "Non renseignée"}</span>
              </div>

              <div className="flex items-center py-1 gap-1.5">
                <span className="font-bold text-white font-inter tracking-wider">État :</span>
                <span className="text-gray-400 font-inter font-light">{product.etat?.label || "Non renseigné"}</span>
              </div>

              <div className="flex items-center py-1 gap-1.5">
                <span className="font-bold text-white uppercase text-xs tracking-wider">Couleurs :</span>
                <span className="text-gray-400 font-inter font-light">{getColors(product)}</span>
              </div>

              {product.weight && (
                <div className="flex items-center py-1 gap-1.5">
                  <span className="font-bold text-white font-inter tracking-wider">Poids :</span>
                  <span className="text-gray-400 font-inter font-light">{product.weight} g</span>
                </div>
              )}
            </div>

            {/* Description Text */}
            <p className="text-gray-400 text-sm font-light leading-relaxed mb-10 pb-8 border-b border-white/10">
              {product.description || "Aucune description fournie pour cet article."}
            </p>

            {/* CTA Buttons */}
            {loadingUser ? (
              <div className="flex justify-center py-4 mb-8">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : currentUserId && sellerId && Number(currentUserId) === Number(sellerId) ? (
              <div className="bg-[#151515] border border-white/10 p-4 rounded-sm text-center mb-8">
                <span className="text-gray-400 font-inter text-sm font-extralight tracking-wider">C'est votre produit</span>
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                <button 
                  onClick={() => {
                    if (!localStorage.getItem("token")) {
                      navigate("/login", { state: { from: `/conversation?productId=${product.id}&checkout=true` } });
                    } else {
                      navigate(`/conversation?productId=${product.id}&checkout=true`);
                    }
                  }}
                  className="w-full bg-[#E5E5E5] hover:bg-white text-black font-inter font-bold py-4 text-center tracking-widest uppercase transition-all cursor-pointer rounded-sm text-sm"
                >
                  Acheter
                </button>
                
                <button 
                  onClick={() => {
                    if (!localStorage.getItem("token")) {
                      navigate("/login", { state: { from: `${location.pathname}?initOffer=true` } });
                    } else {
                      setOfferError('');
                      setShowOfferModal(true);
                    }
                  }}
                  className="w-full bg-transparent hover:bg-white/5 border border-white/40 hover:border-white text-white font-inter font-bold py-4 text-center tracking-widest uppercase transition-all cursor-pointer rounded-sm text-sm"
                >
                  Faire une offre
                </button>

                <button 
                  onClick={() => {
                    if (!localStorage.getItem("token")) {
                      navigate("/login", { state: { from: `/conversation?productId=${product.id}` } });
                    } else {
                      navigate(`/conversation?productId=${product.id}`);
                    }
                  }}
                  className="w-full bg-transparent hover:bg-white/5 border border-white/40 hover:border-white text-white font-inter font-bold py-4 text-center tracking-widest uppercase transition-all cursor-pointer rounded-sm text-sm"
                >
                  Message
                </button>
              </div>
            )}

            {/* Seller Card Section */}
            {seller.pseudo && (
              <div 
                onClick={() => navigate(`/locker/${sellerId}`)}
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
                          <div className="absolute bottom-2 right-2 text-lg text-white/80 hover:text-red-500 transition-colors p-1.5 bg-black/40 rounded-full">
                            <FaHeart />
                          </div>
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
                          <div className="absolute bottom-2 right-2 text-lg text-white/80 hover:text-red-500 transition-colors p-1.5 bg-black/40 rounded-full">
                            <FaHeart />
                          </div>
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

      {showOfferModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0c0c0c] border border-white/10 rounded-sm p-6 md:p-8 shadow-2xl relative">
            <button 
              onClick={() => setShowOfferModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <FaXmark className="text-lg" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-red-500">
              <FaTag className="text-xl" />
              <h3 className="font-bebas text-3xl uppercase tracking-wider text-white">
                Faire une offre
              </h3>
            </div>
            
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Proposez un prix d'achat alternatif au vendeur pour{' '}
              <span className="text-white font-bold">{product.title}</span>. Le prix initial est de{' '}
              <span className="text-red-500 font-bold">{product.price}€</span>.
            </p>

            <div className="mb-6">
              <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3">Offres rapides suggérées</span>
              <div className="flex gap-3">
                {[
                  { pct: '-10%', val: Math.round(product.price * 0.9) },
                  { pct: '-15%', val: Math.round(product.price * 0.85) },
                  { pct: '-20%', val: Math.round(product.price * 0.8) }
                ].map((sugg, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setOfferAmount(sugg.val.toString());
                      setOfferError('');
                    }}
                    className="flex-1 bg-neutral-900 border border-white/10 hover:border-red-500/50 hover:bg-neutral-800 text-white font-bold py-2 px-3 rounded-md text-xs uppercase transition-all cursor-pointer flex flex-col items-center gap-0.5"
                  >
                    <span className="text-red-400 font-bold">{sugg.pct}</span>
                    <span className="text-[10px] text-gray-400">{sugg.val}€</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmitOffer} className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">
                  Votre proposition (€)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    placeholder={`Min. ${(product.price * 0.6).toFixed(0)}€`}
                    value={offerAmount}
                    onChange={(e) => {
                      setOfferAmount(e.target.value);
                      setOfferError('');
                    }}
                    className="w-full bg-black border border-white/10 focus:border-red-600 outline-none rounded-sm p-3.5 pr-10 text-white text-base transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">€</span>
                </div>
                
                {offerError && (
                  <span className="text-red-500 text-[10px] mt-2 block leading-relaxed font-semibold">
                    {offerError}
                  </span>
                )}
                <span className="block text-[9px] text-gray-500 mt-2 italic">
                  Note: Par respect des règles anti-spam Vinted, vous ne pouvez pas proposer une réduction supérieure à 40% du prix d'origine (soit minimum ${(product.price * 0.6).toFixed(0)}€).
                </span>
              </div>

              <button
                type="submit"
                disabled={sendingOffer || !offerAmount}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3.5 uppercase tracking-widest rounded-sm text-xs transition-colors cursor-pointer"
              >
                {sendingOffer ? 'Soumission...' : "Soumettre l'offre"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;