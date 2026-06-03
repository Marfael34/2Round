import { Eye, EyeOff } from "lucide-react";
import CustomInput from "../UI/CustomInput";

const LongRegisterForm = ({
  formData,
  handleChange,
  currentStep,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  genders,
  boxes,
  levels,
}) => {
  return (
    <>
      {/* Étape 1 : Identité */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <h2 className="font-bebas text-2xl text-white uppercase mb-4">
            Étape 1 : Qui êtes-vous ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomInput
              label="Prénom"
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              required
            />
            <CustomInput
              label="Nom"
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              required
            />
          </div>
          <CustomInput
            label="Pseudo"
            type="text"
            name="pseudo"
            value={formData.pseudo}
            onChange={handleChange}
            required
          />
        </div>
      )}

      {/* Étape 2 : Sécurité */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <h2 className="font-bebas text-2xl text-white uppercase mb-4">
            Étape 2 : Vos identifiants
          </h2>
          <CustomInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="off"
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomInput
              label="Mot de passe"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-white transition-colors m-2"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <CustomInput
              label="Confirmer"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-white transition-colors m-2"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
          </div>
        </div>
      )}

      {/* Étape 3 : Profil Sportif */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <h2 className="font-bebas text-2xl text-white uppercase mb-4">
            Étape 3 : Votre profil
          </h2>
          <CustomInput
            label="Date de naissance"
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            required
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">
                Genre
              </label>
              <select
                name="genderId"
                value={formData.genderId}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                required
              >
                <option value="">Sélectionnez un genre</option>
                {genders.map((g) => (
                  <option key={g.id || g["@id"]} value={g.id || g["@id"]?.split("/").pop()}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">
                Type de boxe
              </label>
              <select
                name="boxeId"
                value={formData.boxeId}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                required
              >
                <option value="">Sélectionnez un type</option>
                {boxes.map((b) => (
                  <option key={b.id || b["@id"]} value={b.id || b["@id"]?.split("/").pop()}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">
                Niveau
              </label>
              <select
                name="levelId"
                value={formData.levelId}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                required
              >
                <option value="">Sélectionnez un niveau</option>
                {levels.map((l) => (
                  <option key={l.id || l["@id"]} value={l.id || l["@id"]?.split("/").pop()}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomInput
              label="Taille (cm)"
              type="number"
              step="1"
              name="size"
              value={formData.size}
              onChange={handleChange}
              placeholder="Ex: 180"
              required
            />
            <CustomInput
              label="Poids (kg)"
              type="number"
              step="0.1"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="Ex: 70.5"
              required
            />
          </div>
        </div>
      )}

      {/* Étape 4 : Préférences */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <h2 className="font-bebas text-2xl text-white uppercase mb-4">
            Étape 4 : Vos préférences
          </h2>
          <CustomInput
            label="Budget (€)"
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="Ex: 500"
            required
          />
        </div>
      )}
      {/* Barre de progression pour la version longue */}
      <div className="w-full bg-[#1A1A1A] h-1 mb-4 mt-6 rounded-full overflow-hidden">
        <div
          className="bg-red-600 h-full transition-all duration-300"
          style={{ width: `${(currentStep / 4) * 100}%` }}
        ></div>
      </div>
    </>
  );
};

export default LongRegisterForm;
