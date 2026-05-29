import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa6";
import { securedFetch } from "../../utils/api";
import { IMG_BGRAYURE } from "../../constants/appConstante";

const EditProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [popup, setPopup] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const showPopup = (message, type = "error") => {
    setPopup({ message, type });
    setTimeout(() => setPopup(null), 5000);
  };

  const [formData, setFormData] = useState({
    email: "",
    pseudo: "",
    firstname: "",
    lastname: "",
    birthday_at: "",
    weight: "",
    size: "",
    budget: "",
    avatar: "",
    boxe: "",
    level: "",
    gender: "",
  });



  const [boxes, setBoxes] = useState([]);
  const [levels, setLevels] = useState([]);
  const [genders, setGenders] = useState([]);

  // Adresse states
  const [addressQuery, setAddressQuery] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [addressToDelete, setAddressToDelete] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        const email = payload.username;

        if (!email) throw new Error("Impossible de récupérer l'email");

        const response = await securedFetch(`/api/users?email=${encodeURIComponent(email)}`);
        if (!response.ok) throw new Error('Erreur de récupération');
        
        const data = await response.json();
        const userData = data.member ? data.member[0] : (data['hydra:member'] ? data['hydra:member'][0] : (Array.isArray(data) ? data[0] : data));

        if (!userData) throw new Error('Utilisateur non trouvé');

        // Fetch reference data
        const [boxesRes, levelsRes, gendersRes] = await Promise.all([
          securedFetch("/api/boxes"),
          securedFetch("/api/levels"),
          securedFetch("/api/genders")
        ]);

        if (boxesRes.ok) {
          const bData = await boxesRes.json();
          setBoxes(bData['hydra:member'] || bData.member || []);
        }
        if (levelsRes.ok) {
          const lData = await levelsRes.json();
          setLevels(lData['hydra:member'] || lData.member || []);
        }
        if (gendersRes.ok) {
          const gData = await gendersRes.json();
          setGenders(gData['hydra:member'] || gData.member || []);
        }

        const extractId = (item) => {
          if (!item) return "";
          if (typeof item === 'object') return item.id ? item.id.toString() : (item['@id'] ? item['@id'].split('/').pop() : "");
          if (typeof item === 'string') return item.split('/').pop();
          if (typeof item === 'number') return item.toString();
          return "";
        };

        setUser(userData);
        const bDate = userData.birthdayAt ? userData.birthdayAt.split('T')[0] : (userData.birthday_at ? userData.birthday_at.split('T')[0] : "");
        
        setFormData({
          email: userData.email || "",
          pseudo: userData.pseudo || "",
          firstname: userData.firstname || "",
          lastname: userData.lastname || "",
          birthday_at: bDate,
          weight: userData.weight || "",
          size: userData.size || "",
          budget: userData.budget || "",
          avatar: userData.avatar || "",
          boxe: extractId(userData.boxeId),
          level: extractId(userData.levelId),
          gender: extractId(userData.genderId),
        });

        const userId = userData.id || userData['@id']?.split('/').pop();
        if (userId) {
          const adressesRes = await securedFetch(`/api/adresses?user=/api/users/${userId}`);
          if (adressesRes.ok) {
            const aData = await adressesRes.json();
            setUserAddresses(aData['hydra:member'] || aData.member || []);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    let validationErrors = [];

    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]*$/;
    const pseudoRegex = /^[a-zA-Z0-9_.-]*$/;

    if (formData.firstname && !nameRegex.test(formData.firstname)) {
      validationErrors.push("Le prénom contient des caractères non autorisés.");
    }
    if (formData.lastname && !nameRegex.test(formData.lastname)) {
      validationErrors.push("Le nom contient des caractères non autorisés.");
    }
    if (formData.pseudo && !pseudoRegex.test(formData.pseudo)) {
      validationErrors.push("Le pseudo contient des caractères non autorisés (lettres, chiffres, tirets, points et underscores uniquement).");
    }

    if (avatarFile) {
      const urlExtRegex = /\.(jpg|jpeg|png|webp|gif)$/i;
      if (!urlExtRegex.test(avatarFile.name)) {
        validationErrors.push("Le fichier d'avatar a une extension non valide (.jpg, .jpeg, .png, .webp, .gif attendues).");
      }
      if (avatarFile.size > 100 * 1024) {
        validationErrors.push("La taille de l'image de l'avatar ne doit pas dépasser 100 Ko.");
      }
    } else if (formData.avatar) {
      const urlExtRegex = /\.(jpg|jpeg|png|webp|gif)$/i;
      if (!urlExtRegex.test(formData.avatar) && !formData.avatar.startsWith('data:image/')) {
        validationErrors.push("L'URL de l'avatar doit se terminer par une extension d'image valide (.jpg, .jpeg, .png, .webp, .gif).");
      }
    }

    if (formData.budget) {
      const budgetNum = parseInt(formData.budget, 10);
      if (isNaN(budgetNum) || budgetNum < 0 || budgetNum > 100000) {
        validationErrors.push("Veuillez saisir un budget valide (entre 0 et 100000 €).");
      }
    }
    
    if (formData.size) {
      const sizeNum = parseInt(formData.size, 10);
      if (isNaN(sizeNum) || sizeNum < 50 || sizeNum > 300) {
        validationErrors.push("Veuillez saisir une taille valide en centimètres (entre 50 et 300 cm).");
      }
    }

    if (formData.weight) {
      const weightNum = parseFloat(formData.weight);
      if (isNaN(weightNum) || weightNum < 20 || weightNum > 300) {
        validationErrors.push("Veuillez saisir un poids valide en kg (entre 20 et 300 kg).");
      }
    }

    if (validationErrors.length > 0) {
      showPopup(validationErrors, "error");
      setSaving(false);
      return;
    }

    try {
      let finalAvatarPath = formData.avatar;

      if (avatarFile) {
        const fileFormData = new FormData();
        fileFormData.append("avatar", avatarFile);
        
        const token = localStorage.getItem("token");
        const uploadRes = await fetch(`/api/users/avatar`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: fileFormData
        });

        if (!uploadRes.ok) {
          throw new Error("Erreur lors du téléchargement de l'avatar.");
        }

        const uploadData = await uploadRes.json();
        finalAvatarPath = uploadData.path;
      }

      const userId = user.id || user['@id']?.split('/').pop();
      const response = await securedFetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/merge-patch+json"
        },
        body: JSON.stringify({
          email: formData.email,
          pseudo: formData.pseudo,
          firstname: formData.firstname,
          lastname: formData.lastname,
          birthday_at: formData.birthday_at ? formData.birthday_at : null,
          birthdayAt: formData.birthday_at ? formData.birthday_at : null,
          weight: formData.weight ? formData.weight.toString() : null,
          size: formData.size ? parseInt(formData.size, 10) : null,
          budget: formData.budget !== "" ? parseInt(formData.budget, 10) : null,
          avatar: finalAvatarPath,
          boxeId: formData.boxe ? `/api/boxes/${formData.boxe}` : null,
          levelId: formData.level ? `/api/levels/${formData.level}` : null,
          genderId: formData.gender ? `/api/genders/${formData.gender}` : null,
        })
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      navigate("/my-locker");
    } catch (err) {
      showPopup(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddressSearch = async (e) => {
    const query = e.target.value;
    setAddressQuery(query);
    setSelectedAddress(null);

    if (query.length > 3) {
      try {
        const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`);
        const data = await response.json();
        setAddressSuggestions(data.features || []);
      } catch (err) {
        console.error("Erreur API Adresse", err);
      }
    } else {
      setAddressSuggestions([]);
    }
  };

  const handleSelectAddress = (feature) => {
    const props = feature.properties;
    const geom = feature.geometry.coordinates; // [lon, lat]
    
    // Essayer d'extraire le numéro, sinon mettre "1" par défaut ou vide
    let streetNumber = "0";
    let streetName = props.name;

    if (props.housenumber) {
      streetNumber = props.housenumber;
      streetName = props.street || props.name;
    }

    setSelectedAddress({
      label: "Mon adresse",
      street_number: streetNumber.toString().substring(0, 10),
      street_name: streetName.substring(0, 255),
      postal_code: props.postcode,
      city: props.city,
      country: "France",
      longitude: geom[0].toString(),
      latitude: geom[1].toString()
    });
    setAddressQuery(props.label);
    setAddressSuggestions([]);
  };

  const handleAddAddress = async () => {
    if (!selectedAddress || !user) return;
    setAddressSaving(true);
    try {
      const isUpdating = userAddresses.length > 0;
      const addressId = isUpdating ? (userAddresses[0].id || userAddresses[0]['@id']?.split('/').pop()) : null;
      const url = isUpdating ? `/api/adresses/${addressId}` : "/api/adresses";
      const method = isUpdating ? "PATCH" : "POST";
      const headers = {
        "Content-Type": isUpdating ? "application/merge-patch+json" : "application/ld+json"
      };

      const response = await securedFetch(url, {
        method,
        headers,
        body: JSON.stringify({
          ...selectedAddress,
          user: user['@id'] || `/api/users/${user.id}`
        })
      });

      if (!response.ok) throw new Error(`Erreur lors de ${isUpdating ? "la modification" : "l'ajout"} de l'adresse`);
      
      showPopup(`Adresse ${isUpdating ? "modifiée" : "ajoutée"} avec succès !`, "success");
      setAddressQuery("");
      setSelectedAddress(null);
      
      const userId = user.id || user['@id']?.split('/').pop();
      const adressesRes = await securedFetch(`/api/adresses?user=/api/users/${userId}`);
      if (adressesRes.ok) {
        const aData = await adressesRes.json();
        setUserAddresses(aData['hydra:member'] || aData.member || []);
      }
    } catch (err) {
      showPopup(err.message, "error");
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = (addressId) => {
    setAddressToDelete(addressId);
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;
    
    try {
      const response = await securedFetch(`/api/adresses/${addressToDelete}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression de l'adresse");

      showPopup("Adresse supprimée avec succès !", "success");
      setUserAddresses(prev => prev.filter(addr => (addr.id || addr['@id']?.split('/').pop()) !== addressToDelete));
    } catch (err) {
      showPopup(err.message, "error");
    } finally {
      setAddressToDelete(null);
    }
  };

  const cancelDeleteAddress = () => {
    setAddressToDelete(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-2xl font-inter">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Custom Popup placed in the upper center of the screen */}
      {popup && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down w-[90%] max-w-md">
          <div className={`px-6 py-4 rounded-lg shadow-2xl border flex items-start justify-between gap-3 backdrop-blur-md ${
            popup.type === "error" ? "bg-red-600/20 border-red-600 text-red-500" : "bg-green-600/20 border-green-600 text-green-500"
          }`}>
            <div className="font-inter font-bold flex flex-col gap-1">
              {Array.isArray(popup.message) ? (
                popup.message.map((msg, idx) => <span key={idx}>• {msg}</span>)
              ) : (
                <span>{popup.message}</span>
              )}
            </div>
            <button onClick={() => setPopup(null)} className="ml-4 hover:opacity-70 transition-opacity shrink-0">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Address Deletion */}
      {addressToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-[#0A0A0A] border border-gray-800 p-8 rounded-xl max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-3xl font-bebas uppercase text-white mb-4">Confirmer la suppression</h3>
            <p className="text-gray-400 mb-8 font-inter">
              Êtes-vous sûr de vouloir supprimer cette adresse de votre compte ? Cette action est irréversible.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={cancelDeleteAddress}
                className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bebas uppercase tracking-widest transition-colors rounded-sm"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteAddress}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bebas uppercase tracking-widest transition-colors rounded-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-rayure p-8 border-b border-white/10" style={{ backgroundImage: `url(${IMG_BGRAYURE})` }}>
        <div className="w-full max-w-4xl mx-auto">
          <div className="mb-12 flex items-center">
            <Link to="/my-locker" className="text-white text-4xl font-bebas mr-4">
              <FaChevronLeft /> 
            </Link>
            <h2 className="font-bebas uppercase text-5xl md:text-6xl">Modifier mon profil</h2>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8 pt-12 relative">
        <form onSubmit={handleSubmit} className="space-y-6 bg-[#0A0A0A] p-8 rounded-xl border border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Prénom</label>
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Votre prénom"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Nom</label>
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Votre adresse email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Pseudo</label>
              <input
                type="text"
                name="pseudo"
                value={formData.pseudo}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Votre pseudo"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Date de naissance</label>
            <input
              type="date"
              name="birthday_at"
              value={formData.birthday_at}
              onChange={handleChange}
              className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Genre</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="">Non spécifié</option>
                {genders.map(g => (
                  <option key={g.id || g['@id']} value={g.id || g['@id']?.split('/').pop()}>{g.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Type de boxe</label>
              <select
                name="boxe"
                value={formData.boxe}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="">Non spécifié</option>
                {boxes.map(b => (
                  <option key={b.id || b['@id']} value={b.id || b['@id']?.split('/').pop()}>{b.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Niveau</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="">Non spécifié</option>
                {levels.map(l => (
                  <option key={l.id || l['@id']} value={l.id || l['@id']?.split('/').pop()}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Poids (kg)</label>
              <input
                type="number"
                step="0.1"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Ex: 75.5"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Taille (cm)</label>
              <input
                type="number"
                step="1"
                name="size"
                value={formData.size}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Ex: 180"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Budget (€)</label>
              <input
                type="number"
                step="1"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Ex: 200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Avatar de Profil</label>
            <div className="flex items-center gap-6 bg-[#1A1A1A] p-4 rounded-lg border border-gray-700">
              <div className="shrink-0">
                <img 
                  src={avatarPreview || formData.avatar || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} 
                  alt="Aperçu avatar" 
                  className="w-24 h-24 object-cover rounded-full border-2 border-red-600 shadow-lg" 
                />
              </div>
              <div className="flex-1">
                <label className="cursor-pointer bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-sm text-sm font-bold uppercase transition-colors inline-block mb-2">
                  Choisir une photo
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setAvatarFile(file);
                        setAvatarPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
                <p className="text-xs text-gray-500">Formats acceptés : JPG, PNG, WEBP, GIF. Poids max : 100Ko.</p>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              type="submit"
              disabled={saving}
              className="w-full md:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bebas uppercase tracking-widest text-2xl transition-colors rounded-sm disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>

        <div className="mt-12 bg-[#0A0A0A] p-8 rounded-xl border border-gray-800">
          <h3 className="text-2xl font-bebas uppercase mb-6 text-white border-b-2 border-red-600 inline-block pb-1">
            Mes adresses
          </h3>

          {userAddresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {userAddresses.map((addr, idx) => (
                <div key={addr.id || idx} className="p-4 bg-[#151515] border border-gray-700 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-300 uppercase mb-1">{addr.label || "Adresse"}</p>
                      <p className="font-bold text-white">
                        {addr.street_number || addr.streetNumber} {addr.street_name || addr.streetName}
                      </p>
                      <p className="text-gray-400">
                        {addr.postal_code || addr.postalCode} {addr.city}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">{addr.country}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id || addr['@id']?.split('/').pop())}
                      className="text-red-500 hover:text-red-400 p-2 transition-colors"
                      title="Supprimer cette adresse"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic mb-10">Aucune adresse enregistrée pour le moment.</p>
          )}

          <h3 className="text-2xl font-bebas uppercase mb-6 text-white border-b-2 border-red-600 inline-block pb-1">
            {userAddresses.length > 0 ? "Modifier mon adresse" : "Ajouter une nouvelle adresse"}
          </h3>
          <div className="relative mb-4">
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">
              Rechercher mon adresse (France)
            </label>
            <input
              type="text"
              value={addressQuery}
              onChange={handleAddressSearch}
              className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
              placeholder="Ex: 8 rue de la Paix 75000 Paris"
            />
            {addressSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-lg overflow-hidden">
                {addressSuggestions.map((feature, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleSelectAddress(feature)}
                    className="px-4 py-3 hover:bg-[#252525] cursor-pointer border-b border-gray-800 last:border-b-0"
                  >
                    {feature.properties.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {selectedAddress && (
            <div className="mb-6 p-4 bg-[#151515] border border-gray-700 rounded-lg">
              <p className="text-sm text-gray-400 mb-1 uppercase font-bold">Adresse sélectionnée :</p>
              <p className="font-bold text-white">
                {selectedAddress.street_number} {selectedAddress.street_name}
              </p>
              <p className="text-gray-300">
                {selectedAddress.postal_code} {selectedAddress.city}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleAddAddress}
            disabled={!selectedAddress || addressSaving}
            className="w-full md:w-auto px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bebas uppercase tracking-widest text-xl transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addressSaving ? "Enregistrement en cours..." : (userAddresses.length > 0 ? "Mettre à jour l'adresse" : "Ajouter cette adresse")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
