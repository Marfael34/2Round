import { useState } from "react";
import {
  FiSearch,
  FiCamera,
  FiUser,
  FiChevronDown,
  FiSend,
  FiShoppingCart,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { GiLockers } from "react-icons/gi";
import { MdFavoriteBorder } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { IMG_LOGO } from "../../constants/appConstante";
import { FaWallet } from "react-icons/fa6";

const NavBar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const decodeToken = (token) => {
    if (!token) return null;
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const decodedUser = decodeToken(user);
  const isAdmin = decodedUser && decodedUser.roles && decodedUser.roles.includes("ROLE_ADMIN");

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      setIsMenuOpen(false);
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // --- Fonction de déconnexion ---
  const handleLogout = async () => {
    // Plus d'appel Axios inutile qui cause le 404 !
    if (onLogout) onLogout(); // Ça va mettre 'user' à null et le AuthContext supprimera le cookie
    setIsMenuOpen(false);
    navigate("/login");
  };

  return (
    <nav className="bg-black text-white px-6 py-4 flex items-center justify-between border-b border-gray-800 fixed top0 left-0 w-full z-50">
      {/* Logo */}
      <div className="text-2xl font-bold tracking-tighter">
        <img
          className="w-20 md:w-30"
          src={IMG_LOGO}
          alt="logo"
          onClick={() => navigate("/")}
        />
      </div>

      {/* Search Bar (Desktop) */}
      <div className="flex-1 max-w-2xl mx-6 relative hidden md:block">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Recherche des articles"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyPress}
          className="w-full bg-[#1A1A1A] border border-gray-700 rounded-full py-2.5 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors text-sm"
        />
        <div className="absolute inset-y-0 right-4 flex items-center">
          <FiCamera className="h-5 w-5 text-gray-400 cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>

      {/* Desktop Icons (Hidden on mobile) */}
      <div className="hidden md:flex items-center space-x-6">
        {/* User Profile */}
        <div className="relative">
          <div
            className="flex items-center cursor-pointer hover:text-gray-300 transition-colors"
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
          >
            <FiUser className="h-6 w-6" />
            <FiChevronDown
              className={`h-4 w-4 ml-1 transition-transform ${isUserDropdownOpen ? "rotate-180" : ""}`}
            />
          </div>

          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-lg py-2 z-50">
              <Link
                to="/mycustomised"
                className="flex items-center px-4 py-2 hover:bg-gray-800 transition-colors text-sm"
                onClick={() => setIsUserDropdownOpen(false)}
              >
                <MdFavoriteBorder className="h-4 w-4 mr-2" />
                Mon Round Personnalisé
              </Link>
              <div className=" h-px bg-gray-300 mx-5"></div>
              <Link
                to="/my-locker"
                className="flex items-center px-4 py-2 hover:bg-gray-800 transition-colors text-sm"
                onClick={() => setIsUserDropdownOpen(false)}
              >
                <GiLockers className="h-4 w-4 mr-2" />
                Mon Vestiaire
              </Link>
              <Link
                to="/wallet"
                className="flex items-center px-4 py-2 hover:bg-gray-800 transition-colors text-sm"
                onClick={() => setIsUserDropdownOpen(false)}
              >
                <FaWallet  className="h-4 w-4 mr-2 flex items-center justify-center" />
                Mon Portefeuille
              </Link>
              <Link
                to="/invoices"
                className="flex items-center px-4 py-2 hover:bg-gray-800 transition-colors text-sm"
                onClick={() => setIsUserDropdownOpen(false)}
              >
                <span className="h-4 w-4 mr-2 flex items-center justify-center">📄</span>
                Mes Factures
              </Link>
              {isAdmin && (
                <>
                  <div className=" h-px bg-gray-300 mx-5 my-1"></div>
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center px-4 py-2 hover:bg-gray-800 transition-colors text-sm text-red-400 font-bold"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    <span className="h-4 w-4 mr-2 flex items-center justify-center">🛡️</span>
                    Dashboard Admin
                  </Link>
                </>
              )}
              {/* Bouton Déconnexion */}
              {user && (
                <>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-800 text-red-500 hover:text-red-400 font-bold text-sm transition-colors"
                  >
                    Se déconnecter
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Messages / Send */}
        <div className="cursor-pointer hover:text-gray-300 transition-colors">
          <Link to="/conversation">
            <FiSend className="h-6 w-6" />
          </Link>
        </div>

        {/* Cart */}
        <div className="cursor-pointer hover:text-gray-300 transition-colors">
          <FiShoppingCart className="h-6 w-6" />
        </div>
      </div>

      {/* Burger Menu Icon (Mobile Only) */}
      <div
        className="md:hidden cursor-pointer hover:text-gray-300 transition-colors"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? (
          <FiX className="h-6 w-6" />
        ) : (
          <FiMenu className="h-6 w-6" />
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-black border-b border-gray-800 flex flex-col p-4 space-y-4 md:hidden z-50">
          {/* Search Bar (Mobile) */}
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Recherche des articles"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              className="w-full bg-[#1A1A1A] border border-gray-700 rounded-full py-2.5 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors text-sm"
            />
            <div className="absolute inset-y-0 right-4 flex items-center">
              <FiCamera className="h-5 w-5 text-gray-400 cursor-pointer hover:text-white transition-colors" />
            </div>
          </div>

          {/* Links with names */}
          <div className="flex flex-col space-y-2">
            {/* User Profile Mobile */}
            <div>
              <div
                className="flex items-center justify-between p-3 hover:bg-[#1A1A1A] rounded-lg cursor-pointer transition-colors"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                <div className="flex items-center space-x-3">
                  <FiUser className="h-6 w-6" />
                  <span className="text-sm font-medium">Profil</span>
                </div>
                <FiChevronDown
                  className={`h-4 w-4 transition-transform ${isUserDropdownOpen ? "rotate-180" : ""}`}
                />
              </div>

              {isUserDropdownOpen && (
                <div className="pl-12 flex flex-col space-y-2 mt-1">
                  <Link
                    to="/myCustomised"
                    className="flex py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsUserDropdownOpen(false);
                    }}
                  >
                    <MdFavoriteBorder className="h-4 w-4 mr-2" />
                    Mon Round Personnalisé
                  </Link>

                  <div className=" h-px bg-gray-300 w-full"></div>

                  <Link
                    to="/my-locker"
                    className="flex py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsUserDropdownOpen(false);
                    }}
                  >
                    <GiLockers className="h-4 w-4 mr-2" />
                    Mon Vestiaire
                  </Link>
                  <Link
                    to="/wallet"
                    className="flex py-2 text-sm transition-colors text-gray-400 hover:text-white"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsUserDropdownOpen(false);
                    }}
                  >
                    <FaWallet  className="h-4 w-4 mr-2 flex items-center justify-center" />
                    Mon Portefeuille
                  </Link>
                  <Link
                    to="/invoices"
                    className="flex py-2 text-sm transition-colors text-gray-400 hover:text-white"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsUserDropdownOpen(false);
                    }}
                  >
                    <span className="h-4 w-4 mr-2 flex items-center justify-center">📄</span>
                    Mes Factures
                  </Link>

                  {isAdmin && (
                    <>
                      <div className="h-px bg-gray-800 w-full my-1"></div>
                      <Link
                        to="/admin/dashboard"
                        className="flex py-2 text-sm text-red-400 hover:text-red-300 font-bold transition-colors"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsUserDropdownOpen(false);
                        }}
                      >
                        <span className="h-4 w-4 mr-2 flex items-center justify-center">🛡️</span>
                        Dashboard Admin
                      </Link>
                    </>
                  )}

                  {user && (
                    <>
                      <div className="h-px bg-gray-800 w-full my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex py-2 text-sm text-red-500 hover:text-red-400 font-bold transition-colors text-left"
                      >
                        Se déconnecter
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <Link
                to="/conversation"
                className="flex py-2 text-sm text-gray-400 hover:text-white transition-colors"
                onClick={() => {
                      setIsMenuOpen(false);
                      setIsUserDropdownOpen(false);
                    }}
                    
              >
            <div className="flex items-center space-x-3 p-3 hover:bg-[#1A1A1A] rounded-lg cursor-pointer transition-colors">
              
              <FiSend className="h-6 w-6" />
              <span className="text-sm font-medium pl-3">Messages</span>
              
              
            </div>
            </Link>

            <div className="flex items-center space-x-3 p-3 hover:bg-[#1A1A1A] rounded-lg cursor-pointer transition-colors">
              <FiShoppingCart className="h-6 w-6" />
              <span className="text-sm font-medium">Panier</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
