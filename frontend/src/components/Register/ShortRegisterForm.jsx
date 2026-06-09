import { Eye, EyeOff } from "lucide-react";
import CustomInput from "../UI/CustomInput";

const ShortRegisterForm = ({
  formData,
  handleChange,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  genders = [],
}) => {
  return (
    <>
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">
          Genre
        </label>
        <select
          name="gender"
          value={formData.gender}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomInput
          label="Pseudo"
          type="text"
          name="pseudo"
          value={formData.pseudo}
          onChange={handleChange}
          required
        />
        <CustomInput
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="off"
          required
        />
      </div>
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
    </>
  );
};

export default ShortRegisterForm;
