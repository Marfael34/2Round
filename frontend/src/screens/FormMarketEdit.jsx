import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomInput from "../components/UI/CustomInput";
import { IMG_BGRAYURE } from "../constants/appConstante";
import { API_URL } from "../constants/apiConstante";
import { securedFetch } from "../utils/api";

const FormMarketEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [equipementType, setEquipementType] = useState("");
  const [size, setSize] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  
  const [etats, setEtats] = useState([]);
  const [colors, setColors] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Photos states
  const [existingPhotos, setExistingPhotos] = useState([]); // [{id: 1, path: '/uploads/...'}]
  const [deletedPhotosIds, setDeletedPhotosIds] = useState([]); // [1, 5, ...]
  const [newPhotos, setNewPhotos] = useState([]); // [{file: File, preview: 'blob:...'}]

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
          let members = data.member || data["hydra:member"] || (Array.isArray(data) ? data : []);
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
          let members = data.member || data["hydra:member"] || (Array.isArray(data) ? data : []);
          setColors(members);
        }
      } catch (error) {
        console.error("Erreur chargement couleurs :", error);
      }
    };

    const fetchProduct = async () => {
      try {
        const res = await securedFetch(`${API_URL}/products/${id}`);
        if (res.ok) {
          const prod = await res.json();
          setTitle(prod.title || "");
          setBrand(prod.brand || "");
          setEquipementType(prod.type || "");
          setSize(prod.size || "");
          setCondition(prod.etat?.['@id'] || `/api/dictionaries/${prod.etat?.id}`);
          setPrice(prod.price || "");
          setWeight(prod.weight || "");
          setDescription(prod.description || "");
          
          if (prod.colors) {
             const colIds = prod.colors.map(c => c['@id'] || `/api/dictionaries/${c.id}`);
             setSelectedColors(colIds);
          }
          if (prod.images) {
             setExistingPhotos(prod.images);
          }
        } else {
          setSubmitError("Produit introuvable ou accès refusé.");
        }
      } catch {
        setSubmitError("Impossible de charger les données du produit.");
      } finally {
        setLoadingData(false);
      }
    };

    fetchEtats();
    fetchColors();
    if (id) fetchProduct();
  }, [id]);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      newPhotos.forEach((photo) => {
        if (photo.preview) {
          URL.revokeObjectURL(photo.preview);
        }
      });
    };
  }, [newPhotos]);

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

      setNewPhotos((prev) => [...prev, ...validFiles]);
    }
  };

  const removeExistingPhoto = (photoId) => {
    setExistingPhotos((prev) => prev.filter(p => p.id !== photoId));
    setDeletedPhotosIds((prev) => [...prev, photoId]);
  };

  const removeNewPhoto = (index) => {
    setNewPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !price || (existingPhotos.length === 0 && newPhotos.length === 0)) {
      setSubmitError("Veuillez remplir tous les champs obligatoires et ajouter au moins une photo.");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", title);
      formDataToSend.append("brand", brand);
      formDataToSend.append("type", equipementType);
      formDataToSend.append("size", size);
      formDataToSend.append("etat", condition);
      formDataToSend.append("price", price);
      formDataToSend.append("weight", weight);
      formDataToSend.append("description", description);
      
      selectedColors.forEach(colorId => {
        formDataToSend.append("colors[]", colorId);
      });

      deletedPhotosIds.forEach(photoId => {
        formDataToSend.append("deletedImages[]", photoId);
      });

      newPhotos.forEach((photoObj) => {
        formDataToSend.append("photos[]", photoObj.file);
      });

      const response = await securedFetch(`${API_URL}/products-update/${id}`, {
        method: "POST", // We use POST for multipart/form-data
        body: formDataToSend
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          navigate(`/product/${id}`);
        }, 2000);
      } else {
        const errData = await response.json();
        setSubmitError(errData.message || "Une erreur est survenue lors de la modification de l'annonce.");
      }
    } catch (error) {
      console.error("Erreur lors de la modification :", error);
      setSubmitError("Impossible de se connecter au serveur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white text-xl font-inter tracking-wider">
        Chargement des données...
      </div>
    );
  }

  return (
    <>
      <div
        className="w-full min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-12 bg-cover bg-left mt-[80px]"
        style={{ backgroundImage: `url(${IMG_BGRAYURE})` }}
      >
        <div className="w-full max-w-5xl bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-sm p-8 md:p-12 shadow-2xl my-4">
          <h1 className="font-bebas text-5xl font-bold uppercase tracking-wide mb-10 text-center">
            Modifier mon annonce
          </h1>

          {submitSuccess && (
            <div className="mb-6 p-4 bg-emerald-600/20 border border-emerald-500 rounded-sm text-emerald-300 font-inter text-center">
              Annonce modifiée avec succès ! Redirection en cours...
            </div>
          )}

          {submitError && (
            <div className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-sm text-red-300 font-inter text-center">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
              <div className="flex flex-col gap-6 justify-between">
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

              <div className="flex flex-col gap-6 justify-between h-full">
                <div className="space-y-6">
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

                  {/* Photos Edition */}
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

                    {/* Aperçu des photos sélectionnées / existantes */}
                    {(existingPhotos.length > 0 || newPhotos.length > 0) && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-4">
                        {existingPhotos.map((photo) => (
                          <div
                            key={`exist-${photo.id}`}
                            className="relative group aspect-square bg-[#1A1A1A] border border-white/10 rounded-sm overflow-hidden"
                          >
                            <img
                              src={`${API_URL.replace('/api', '')}${photo.path}`}
                              alt="Photo existante"
                              className="w-full h-full object-cover opacity-80"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingPhoto(photo.id)}
                              className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-center text-[10px] py-1 pointer-events-none">Existante</span>
                          </div>
                        ))}
                        
                        {newPhotos.map((photo, index) => (
                          <div
                            key={`new-${index}`}
                            className="relative group aspect-square bg-[#1A1A1A] border border-white/10 rounded-sm overflow-hidden"
                          >
                            <img
                              src={photo.preview}
                              alt={`Nouvelle photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeNewPhoto(index)}
                              className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <span className="absolute bottom-0 left-0 right-0 bg-emerald-600/60 text-center text-[10px] py-1 text-white pointer-events-none">Nouvelle</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-red-600 text-white font-inter font-bold uppercase py-4 rounded-sm hover:bg-red-700 transition-colors text-base tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Enregistrement en cours..." : "Sauvegarder les modifications"}
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => navigate(`/product/${id}`)}
                    className="w-full bg-transparent border border-white/20 text-gray-300 font-inter font-bold uppercase py-4 rounded-sm hover:bg-white/5 hover:text-white transition-colors text-base tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Annuler les modifications
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default FormMarketEdit;
