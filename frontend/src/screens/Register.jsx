import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { IMG_BOXE } from "../constants/appConstante";
import { API_URL } from "../constants/apiConstante";

import ShortRegisterForm from "../components/Register/ShortRegisterForm";
import LongRegisterForm from "../components/Register/LongRegisterForm";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      const from = location.state?.from || "/my-locker";
      navigate(from);
    }
  }, [navigate, location]);
  const [formType, setFormType] = useState("short"); // 'short' or 'long'
  const [currentStep, setCurrentStep] = useState(1); // 1 to 4 for long form

  const [boxes, setBoxes] = useState([]);
  const [levels, setLevels] = useState([]);
  const [genders, setGenders] = useState([]);

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const [boxesRes, levelsRes, gendersRes] = await Promise.all([
          fetch(`${API_URL}/dictionaries?type=boxe`),
          fetch(`${API_URL}/dictionaries?type=level`),
          fetch(`${API_URL}/dictionaries?type=gender`),
        ]);
        if (boxesRes.ok) {
          const bData = await boxesRes.json();
          setBoxes(bData["hydra:member"] || bData.member || []);
        }
        if (levelsRes.ok) {
          const lData = await levelsRes.json();
          setLevels(lData["hydra:member"] || lData.member || []);
        }
        if (gendersRes.ok) {
          const gData = await gendersRes.json();
          setGenders(gData["hydra:member"] || gData.member || []);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des références", err);
      }
    };
    fetchReferences();
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    pseudo: "",
    firstname: "",
    lastname: "",
    birthday: "",
    weight: "",
    size: "",
    budget: "",
    boxe: "",
    level: "",
    gender: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formType === "short" || currentStep >= 2) {
      if (formData.password !== formData.confirmPassword) {
        setError("Les mots de passe ne correspondent pas");
        return;
      }
    }

    if (formType === "long" && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      return;
    }

    const dataToSend = { ...formData };
    delete dataToSend.confirmPassword;

    // Set default value for isActive
    dataToSend.isActive = true;
    
    // Set default avatar
    dataToSend.avatar = "pdp_1.webp";

    // Map birthday to birthday_at
    if (dataToSend.birthday) {
      dataToSend.birthday_at = dataToSend.birthday;
      delete dataToSend.birthday;
    }

    if (dataToSend.boxe) {
      dataToSend.boxe = `/api/dictionaries/${dataToSend.boxe}`;
    } else {
      delete dataToSend.boxe;
    }

    if (dataToSend.level) {
      dataToSend.level = `/api/dictionaries/${dataToSend.level}`;
    } else {
      delete dataToSend.level;
    }

    if (dataToSend.gender) {
      dataToSend.gender = `/api/dictionaries/${dataToSend.gender}`;
    } else {
      delete dataToSend.gender;
    }

    // Sanitize optional fields
    const optionalFields = ["birthday_at", "weight", "size", "budget"];
    optionalFields.forEach((field) => {
      if (dataToSend[field] === "" || dataToSend[field] === undefined) {
        delete dataToSend[field];
      } else if (field === "budget") {
        dataToSend[field] = parseFloat(dataToSend[field]);
      } else if (field === "weight") {
        dataToSend[field] = String(dataToSend[field]);
      } else if (field === "size") {
        const sizeNum = parseInt(dataToSend[field], 10);
        if (isNaN(sizeNum) || sizeNum < 50 || sizeNum > 300) {
          setError(
            "Veuillez saisir une taille valide en centimètres (entre 50 et 300 cm).",
          );
          throw new Error("Taille invalide"); // Stop execution
        }
        dataToSend[field] = sizeNum;
      }
    });

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/ld+json",
        },
        body: JSON.stringify(dataToSend),
      });

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(
          `Le serveur a renvoyé un format non supporté. Détails: ${text.substring(0, 50)}...`,
        );
      }

      if (!response.ok) {
        const errorMessage =
          data["hydra:description"] ||
          data.message ||
          `Erreur serveur (${response.status})`;
        throw new Error(errorMessage);
      }

      // Vider les champs
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        pseudo: "",
        firstname: "",
        lastname: "",
        birthday: "",
        weight: "",
        size: "",
        budget: "",
        boxe: "",
        level: "",
        gender: "",
      });

      // Rediriger vers la page de connexion
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div
      className="w-full min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-12 bg-cover bg-left"
      style={{ backgroundImage: `url(${IMG_BOXE})` }}
    >
      <div className="w-full max-w-2xl bg-black/60 backdrop-blur-lg border border-white/10 rounded-sm p-8 md:p-12 shadow-2xl my-4">
        {/* Sélecteur de version */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#1A1A1A] p-1 rounded-full flex gap-2">
            <button
              onClick={() => {
                setFormType("short");
                setCurrentStep(1);
              }}
              className={`py-2 px-6 rounded-full text-sm font-inter font-bold uppercase transition-colors ${formType === "short" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Rapide
            </button>
            <button
              onClick={() => setFormType("long")}
              className={`py-2 px-6 rounded-full text-sm font-inter font-bold uppercase transition-colors ${formType === "long" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Complète
            </button>
          </div>
        </div>

        {/* En-tête */}
        <div className="text-center mb-10">
          <h1 className="font-bebas text-5xl font-bold uppercase tracking-wide mb-2">
            Créer un profil
          </h1>
          <p className="font-inter text-gray-400 text-sm">
            {formType === "short"
              ? "Inscription rapide en quelques secondes"
              : `Inscription complète — Étape ${currentStep} sur 4`}
          </p>
        </div>

        {error && (
          <div className="bg-red-600/10 border border-red-600 text-red-600 text-sm p-4 rounded-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* VERSION COURTE */}
          {formType === "short" && (
            <ShortRegisterForm
              formData={formData}
              handleChange={handleChange}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              genders={genders}
            />
          )}

          {/* VERSION LONGUE (4 ÉTAPES) */}
          {formType === "long" && (
            <LongRegisterForm
              formData={formData}
              handleChange={handleChange}
              currentStep={currentStep}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              genders={genders}
              boxes={boxes}
              levels={levels}
            />
          )}

          {/* Boutons de navigation */}
          <div className="flex justify-between gap-4 pt-4">
            {formType === "long" && currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="w-1/2 bg-transparent border border-white/20 text-white font-inter font-bold uppercase py-3.5 rounded-sm hover:bg-white/5 transition-colors text-sm"
              >
                Retour
              </button>
            )}

            <button
              type="submit"
              className={`${formType === "long" && currentStep > 1 ? "w-1/2" : "w-full"} bg-red-600 text-white font-inter font-bold uppercase py-3.5 rounded-sm hover:bg-red-700 transition-colors text-sm`}
            >
              {formType === "short"
                ? "S'inscrire"
                : currentStep === 4
                  ? "Terminer"
                  : "Suivant"}
            </button>
          </div>

          <div className="text-center text-xs text-gray-500 font-inter mt-4">
            Déjà inscrit ?{" "}
            <Link
              to="/login"
              className="text-white hover:text-red-600 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
