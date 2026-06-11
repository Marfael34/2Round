import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomInput from "../components/UI/CustomInput";
import { IMG_BGRAYURE } from "../constants/appConstante";
import { API_URL } from "../constants/apiConstante";
import { securedFetch } from "../utils/api";

const FormMarket = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [equipementType, setEquipementType] = useState("");
  const [size, setSize] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [etats, setEtats] = useState([]);
  const [colors, setColors] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Boost Modal states
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  // Guard routing: redirect to login if not authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchEtats = async () => {
      try {
        const response = await securedFetch(`${API_URL}/dictionaries?type=etat`);
        if (response.ok) {
          const data = await response.json();
          let members = [];
          if (Array.isArray(data)) {
            members = data;
          } else if (data && Array.isArray(data["hydra:member"])) {
            members = data["hydra:member"];
          } else if (data && Array.isArray(data["member"])) {
            members = data["member"];
          } else {
            console.warn("Format de données d'états inconnu :", data);
          }
          setEtats(members);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des états :", error);
      }
    };

    const fetchColors = async () => {
      try {
        const response = await securedFetch(`${API_URL}/dictionaries?type=color`);
        if (response.ok) {
          const data = await response.json();
          let members = [];
          if (Array.isArray(data)) {
            members = data;
          } else if (data && Array.isArray(data["hydra:member"])) {
            members = data["hydra:member"];
          } else if (data && Array.isArray(data["member"])) {
            members = data["member"];
          }
          setColors(members);
        }
      } catch (error) {
        console.error("Erreur chargement couleurs :", error);
      }
    };

    fetchEtats();
    fetchColors();
  }, []);

  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        const response = await securedFetch(`${API_URL}/wallet/info`);
        if (response.ok) {
          const data = await response.json();
          setWalletBalance(data.availableFunds || 0);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du porte-monnaie :", error);
      }
    };
    fetchWalletInfo();
  }, []);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      photos.forEach((photo) => {
        if (photo.preview) {
          URL.revokeObjectURL(photo.preview);
        }
      });
    };
  }, [photos]);

  const handlePhotoChange = (e) => {
    if (e.target.files) {
      const urlExtRegex = /\.(jpg|jpeg|png|webp|gif|avif)$/i;
      const validFiles = [];
      let hasError = false;

      Array.from(e.target.files).forEach((file) => {
        if (!urlExtRegex.test(file.name)) {
          hasError = true;
        } else {
          validFiles.push({
            file,
            preview: URL.createObjectURL(file)
          });
        }
      });

      if (hasError) {
        setSubmitError("Un ou plusieurs fichiers ont une extension non valide (.jpg, .jpeg, .png, .webp, .gif, .avif attendues).");
      }

      setPhotos((prev) => [...prev, ...validFiles]);
    }
  };

  const removePhoto = (index) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (!title || !price || photos.length === 0) {
      setSubmitError("Veuillez remplir tous les champs et ajouter au moins une photo.");
      return;
    }
    setShowBoostModal(true);
  };

  const submitProduct = async (highlighted) => {
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", title);
      formDataToSend.append("brand", brand);
      formDataToSend.append("equipementType", equipementType);
      formDataToSend.append("type", equipementType); // support both naming formats
      formDataToSend.append("size", size);
      formDataToSend.append("etat", condition);
      formDataToSend.append("price", price);
      formDataToSend.append("weight", weight);
      formDataToSend.append("description", description);
      
      // IS HIGHLIGHTED
      formDataToSend.append("isHighlighted", highlighted ? "1" : "0");
      if (highlighted) {
        formDataToSend.append("paymentMethod", "wallet");
      }

      // Append colors
      selectedColors.forEach(colorId => {
        formDataToSend.append("colors[]", colorId);
      });

      // Append files as array
      photos.forEach((photoObj) => {
        formDataToSend.append("photos[]", photoObj.file);
      });

      const response = await securedFetch(`${API_URL}/products-create`, {
        method: "POST",
        body: formDataToSend
      });

      if (response.ok) {
        setSubmitSuccess(true);
        // Clear form
        setTitle("");
        setBrand("");
        setEquipementType("");
        setSize("");
        setCondition("");
        setPrice("");
        setWeight("");
        setDescription("");
        setPhotos([]);

        // Redirect after 2s
        setTimeout(() => {
          navigate("/my-locker");
        }, 2000);
      } else {
        const errData = await response.json();
        setSubmitError(errData.message || "Une erreur est survenue lors de la création de l'annonce.");
      }
    } catch (error) {
      console.error("Erreur lors de la soumission :", error);
      setSubmitError("Impossible de se connecter au serveur.");
    } finally {
      setIsSubmitting(false);
      setShowBoostModal(false);
    }
  };

  const submitProductForStripe = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", title);
      formDataToSend.append("brand", brand);
      formDataToSend.append("equipementType", equipementType);
      formDataToSend.append("type", equipementType);
      formDataToSend.append("size", size);
      formDataToSend.append("etat", condition);
      formDataToSend.append("price", price);
      formDataToSend.append("weight", weight);
      formDataToSend.append("description", description);
      formDataToSend.append("isHighlighted", "0");

      selectedColors.forEach(colorId => {
        formDataToSend.append("colors[]", colorId);
      });

      photos.forEach((photoObj) => {
        formDataToSend.append("photos[]", photoObj.file);
      });

      const response = await securedFetch(`${API_URL}/products-create`, {
        method: "POST",
        body: formDataToSend
      });

      if (response.ok) {
        const productData = await response.json();
        
        // Appeler la session Stripe
        const stripeRes = await securedFetch(`${API_URL}/stripe/create-checkout-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productName: `Boost - ${title}`,
            amount: 500, // 5€
            productId: productData.id,
            type: "boost"
          })
        });

        if (stripeRes.ok) {
          const stripeData = await stripeRes.json();
          window.location.href = stripeData.url;
        } else {
          setSubmitError("Erreur lors de la création de la session Stripe.");
          setIsProcessingPayment(false);
          setIsSubmitting(false);
        }
      } else {
        const errData = await response.json();
        setSubmitError(errData.message || "Erreur de création de l'annonce.");
        setIsProcessingPayment(false);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setSubmitError("Impossible de se connecter au serveur.");
      setIsProcessingPayment(false);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="w-full min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-12 bg-cover bg-left"
        style={{ backgroundImage: `url(${IMG_BGRAYURE})` }}
      >
        <div className="w-full max-w-5xl bg-black/60 backdrop-blur-lg border border-white/10 rounded-sm p-8 md:p-12 shadow-2xl my-4">
          <h1 className="font-bebas text-5xl font-bold uppercase tracking-wide mb-10 text-center">
            Revendre son matériel
          </h1>

          {submitSuccess && (
            <div className="mb-6 p-4 bg-emerald-600/20 border border-emerald-500 rounded-sm text-emerald-300 font-inter text-center">
              Annonce publiée avec succès ! Redirection vers votre vestiaire...
            </div>
          )}

          {submitError && (
            <div className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-sm text-red-300 font-inter text-center">
              {submitError}
            </div>
          )}

          <form onSubmit={handleInitialSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
              {/* Colonne Gauche : Détails de l'équipement */}
              <div className="flex flex-col gap-6 justify-between">
                {/* Titre de l'annonce */}
                <CustomInput
                  label="Titre de l'annonce"
                  type="text"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Gants de boxe Venum 12oz"
                  className="py-4! text-base"
                  required
                />

                {/* Type d'équipement */}
                <div className="flex flex-col gap-1 w-full">
                  <label className="font-inter text-xs uppercase text-gray-400">
                    Type d'équipement
                  </label>
                  <select
                    name="equipementType"
                    id="equipementType"
                    value={equipementType}
                    onChange={(e) => setEquipementType(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-sm py-4 px-3 text-white focus:border-red-600 focus:outline-none font-inter text-base cursor-pointer pr-10"
                    required
                  >
                    <option value="">Type d'équipement</option>
                    <optgroup label="Gants & Bandages">
                      <option value="gloves">Gants</option>
                      <option value="bandages">Bandages</option>
                      <option value="under-gloves">Sous-gants</option>
                    </optgroup>
                    <optgroup label="Protections">
                      <option value="helmet">Casques</option>
                      <option value="mouthguard">Protège-dents</option>
                      <option value="shin-guard">Protège-tibias</option>
                      <option value="groin-guard">Coquilles</option>
                      <option value="groin-guard-holder">
                        Coquille et porte-coquille
                      </option>
                      <option value="chest-guard">Plastron</option>
                      <option value="ankle-wrap">Chevillière</option>
                    </optgroup>
                    <optgroup label="Vêtements & Chaussures">
                      <option value="shorts">Short</option>
                      <option value="tank-top">Débardeur</option>
                      <option value="shoes">Chaussures de boxe</option>
                      <option value="sauna-suit">Combinaison de sudation</option>
                    </optgroup>
                    <optgroup label="Matériel d'entraînement">
                      <option value="punching-bag">Sac de frappe</option>
                      <option value="kick-shield">Bouclier de Frappe</option>
                      <option value="focus-mitts">Patte d'ours</option>
                      <option value="speed-bag">Poires de Vitesse</option>
                      <option value="reflex-ball">Reflex Balls</option>
                    </optgroup>
                  </select>
                </div>

                {/* Marque */}
                <div className="flex flex-col gap-1 w-full">
                  <label className="font-inter text-xs uppercase text-gray-400">
                    Marque
                  </label>
                  <select
                    name="brand"
                    id="brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-sm py-4 px-3 text-white focus:border-red-600 focus:outline-none font-inter text-base cursor-pointer pr-10"
                    required
                  >
                    <option value="">Sélectionnez une marque</option>
                    <option value="Venum">Venum</option>
                    <option value="Adidas">Adidas</option>
                    <option value="Everlast">Everlast</option>
                    <option value="Cleto Reyes">Cleto Reyes</option>
                    <option value="Twins Special">Twins Special</option>
                    <option value="Fairtex">Fairtex</option>
                    <option value="Hayabusa">Hayabusa</option>
                    <option value="Rival">Rival</option>
                    <option value="Title Boxing">Title Boxing</option>
                    <option value="Ringhorns">Ringhorns</option>
                    <option value="Leone 1947">Leone 1947</option>
                    <option value="RDX Sports">RDX Sports</option>
                    <option value="Phantom Athletics">Phantom Athletics</option>
                    <option value="Metal Boxe">Metal Boxe</option>
                    <option value="Century">Century</option>
                    <option value="Nike">Nike</option>
                    <option value="Under Armour">Under Armour</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                {/* Taille */}
                <div className="flex flex-col gap-1 w-full">
                  <label className="font-inter text-xs uppercase text-gray-400">
                    Taille
                  </label>
                  <select
                    name="size"
                    id="size"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-sm py-4 px-3 text-white focus:border-red-600 focus:outline-none font-inter text-base cursor-pointer pr-10"
                    required
                  >
                    <option value="">Tailles</option>
                    <optgroup label="Vêtements">
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                    </optgroup>
                    <optgroup label="Gants (Oz)">
                      <option value="8oz">8 Oz</option>
                      <option value="10oz">10 Oz</option>
                      <option value="12oz">12 Oz</option>
                      <option value="14oz">14 Oz</option>
                      <option value="16oz">16 Oz</option>
                    </optgroup>
                    <optgroup label="Chaussures (EU)">
                      <option value="39">39</option>
                      <option value="40">40</option>
                      <option value="41">41</option>
                      <option value="42">42</option>
                      <option value="43">43</option>
                      <option value="44">44</option>
                      <option value="45">45</option>
                    </optgroup>
                    <optgroup label="Bandes (m)">
                      <option value="2.5m">2.5 m</option>
                      <option value="3m">3 m</option>
                      <option value="3.5m">3.5 m</option>
                      <option value="4m">4 m</option>
                      <option value="4.5m">4.5 m</option>
                      <option value="5m">5 m</option>
                    </optgroup>
                  </select>
                </div>

                {/* État */}
                <div className="flex flex-col gap-1 w-full">
                  <label className="font-inter text-xs uppercase text-gray-400">
                    État
                  </label>
                  <select
                    name="condition"
                    id="condition"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-sm py-4 px-3 text-white focus:border-red-600 focus:outline-none font-inter text-base cursor-pointer pr-10"
                    required
                  >
                    <option value="">Sélectionnez l'état</option>
                    {Array.isArray(etats) && etats.map((etat) => (
                      <option key={etat.id} value={etat["@id"] || `/api/dictionaries/${etat.id}`}>
                        {etat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Couleurs */}
                <div className="flex flex-col gap-1 w-full">
                  <label className="font-inter text-xs uppercase text-gray-400 mb-2">
                    Couleurs
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(colors) && colors.map((col) => {
                      const colorId = col["@id"] || `/api/dictionaries/${col.id}`;
                      const isSelected = selectedColors.includes(colorId);
                      return (
                        <button
                          key={colorId}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedColors(selectedColors.filter(id => id !== colorId));
                            } else {
                              setSelectedColors([...selectedColors, colorId]);
                            }
                          }}
                          className={`py-2 px-4 rounded-full text-xs font-bold transition-colors ${isSelected ? "bg-red-600 text-white" : "bg-[#1A1A1A] text-gray-400 border border-white/10 hover:border-white/30"}`}
                        >
                          {col.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Prix (€) */}
                <CustomInput
                  label="Prix (€)"
                  type="number"
                  step="0.01"
                  name="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ex: 40.50"
                  className="py-4! text-base"
                  min="0"
                  required
                />

                {/* Poids estimé (g) */}
                <CustomInput
                  label="Poids estimé (g)"
                  type="number"
                  step="1"
                  name="weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Ex: 800"
                  className="py-4! text-base"
                  min="0"
                  required
                />
              </div>

              {/* Colonne Droite : Description & Médias */}
              <div className="flex flex-col gap-6 justify-between h-full">
                <div className="space-y-6">
                  {/* Description */}
                  <div className="flex flex-col gap-1">
                    <label className="font-inter text-xs uppercase text-gray-400">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Décrivez l'état de votre équipement, son utilisation, etc..."
                      rows="8"
                      className="w-full bg-[#1A1A1A] border border-white/10 rounded-sm p-4 text-white focus:border-red-600 focus:outline-none font-inter text-base resize-none"
                      required
                    />
                  </div>

                  {/* Photos */}
                  <div className="flex flex-col gap-1">
                    <label className="font-inter text-xs uppercase text-gray-400">
                      Photos de l'équipement
                    </label>
                    <div className="relative border border-dashed border-white/20 hover:border-red-600/50 rounded-sm bg-[#1A1A1A] p-10 text-center cursor-pointer transition-colors group">
                      <input
                        type="file"
                        name="photos"
                        onChange={handlePhotoChange}
                        multiple
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center justify-center gap-3">
                        <svg
                          className="w-10 h-10 text-gray-400 group-hover:text-red-600 transition-colors"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="font-inter text-base text-gray-300 group-hover:text-white transition-colors">
                          Glissez vos photos ou cliquez pour parcourir
                        </span>
                        <span className="font-inter text-xs text-gray-500">
                          PNG, JPG, WEBP, AVIF jusqu'à 5MB
                        </span>
                      </div>
                    </div>

                    {/* Aperçu des photos sélectionnées */}
                    {photos.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-4">
                        {photos.map((photo, index) => (
                          <div
                            key={index}
                            className="relative group aspect-square bg-[#1A1A1A] border border-white/10 rounded-sm overflow-hidden"
                          >
                            <img
                              src={photo.preview}
                              alt={`Aperçu ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bouton de validation */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 text-white font-inter font-bold uppercase py-4 rounded-sm hover:bg-red-700 transition-colors text-base tracking-wider mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Publication en cours..." : "Publier l'annonce"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Boost */}
      {showBoostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-lg p-6 max-w-md w-full shadow-2xl relative">
            <h2 className="text-2xl font-bebas uppercase tracking-wide mb-4 text-white">Mettre en avant votre annonce ?</h2>
            <p className="text-gray-400 text-sm font-inter mb-6">
              Boostez la visibilité de votre article dans le catalogue pour le vendre plus vite ! Votre produit apparaîtra en tête des résultats de recherche pour seulement <strong className="text-white">5,00 €</strong>.
            </p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={async () => {
                  setIsProcessingPayment(true);
                  // Simulate Wallet payment logic then submit
                  setTimeout(() => {
                    submitProduct(true);
                  }, 1500);
                }}
                disabled={isProcessingPayment || walletBalance < 5}
                className="bg-[#2A2A2A] hover:bg-[#333] border border-white/10 text-white font-bold py-3 px-4 rounded-sm transition-colors text-sm uppercase flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingPayment 
                  ? "Traitement..." 
                  : (walletBalance < 5 
                      ? `💰 Porte-monnaie (Solde: ${walletBalance.toFixed(2)}€ - Insuffisant)` 
                      : `💰 Payer avec mon Porte-monnaie (Solde: ${walletBalance.toFixed(2)}€)`)}
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsProcessingPayment(true);
                  // We will create the product first without highlight, then redirect to Stripe
                  await submitProductForStripe();
                }}
                disabled={isProcessingPayment}
                className="bg-[#635BFF] hover:bg-[#5249e5] text-white font-bold py-3 px-4 rounded-sm transition-colors text-sm uppercase flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessingPayment ? "Redirection Stripe..." : "💳 Payer par Carte (Stripe)"}
              </button>

              <button
                type="button"
                onClick={() => submitProduct(false)}
                disabled={isProcessingPayment}
                className="bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5 text-gray-300 font-bold py-3 px-4 mt-2 rounded-sm transition-colors text-sm uppercase disabled:opacity-50"
              >
                Non merci, publier normalement
              </button>
            </div>
            {!isProcessingPayment && (
              <button 
                type="button"
                onClick={() => setShowBoostModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FormMarket;
