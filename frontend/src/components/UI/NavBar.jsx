import React, { useState } from 'react';
import { FiSearch, FiCamera, FiUser, FiChevronDown, FiSend, FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import { GiLockers } from 'react-icons/gi';
import { MdFavoriteBorder } from "react-icons/md";
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/Logo.png';


const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const navigate = useNavigate();


  return (
    <nav className="bg-black text-white px-6 py-4 flex items-center justify-between border-b border-gray-800 fixed top0 left-0 w-full z-50">
      {/* Logo */}
      <div className="text-2xl font-bold tracking-tighter">
        <img className="w-20 md:w-30" src={logo} alt="logo" onClick={() => navigate('/')}/>
      </div>

      {/* Search Bar (Desktop) */}
      <div className="flex-1 max-w-2xl mx-6 relative hidden md:block">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Recherche des articles"
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
          <div className="flex items-center cursor-pointer hover:text-gray-300 transition-colors" onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}>
            <FiUser className="h-6 w-6" />
            <FiChevronDown className={`h-4 w-4 ml-1 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-lg py-2 z-50">
              <Link to="/my-locker" className="flex items-center px-4 py-2 hover:bg-gray-800 transition-colors text-sm" onClick={() => setIsUserDropdownOpen(false)}>
                <GiLockers className="h-4 w-4 mr-2" />
                Mon Vestiaire
              </Link>
              <Link to="/my-customised" className="flex items-center px-4 py-2 hover:bg-gray-800 transition-colors text-sm" onClick={() => setIsUserDropdownOpen(false)}>
                <MdFavoriteBorder className="h-4 w-4 mr-2" />
                Mon Round Personnalisé
              </Link>
            </div>
          )}
        </div>

        {/* Messages / Send */}
        <div className="cursor-pointer hover:text-gray-300 transition-colors">
          <FiSend className="h-6 w-6" />
          <Link to="/conversation"></Link>
        </div>

        {/* Cart */}
        <div className="cursor-pointer hover:text-gray-300 transition-colors">
          <FiShoppingCart className="h-6 w-6" />
        </div>
      </div>

      {/* Burger Menu Icon (Mobile Only) */}
      <div className="md:hidden cursor-pointer hover:text-gray-300 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
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
              <div className="flex items-center justify-between p-3 hover:bg-[#1A1A1A] rounded-lg cursor-pointer transition-colors" onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}>
                <div className="flex items-center space-x-3">
                  <FiUser className="h-6 w-6" />
                  <span className="text-sm font-medium">Profil</span>
                </div>
                <FiChevronDown className={`h-4 w-4 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isUserDropdownOpen && (
                <div className="pl-12 flex flex-col space-y-2 mt-1">
                  <Link to="/my-locker" className="flex py-2 text-sm text-gray-400 hover:text-white transition-colors" onClick={() => { setIsMenuOpen(false); setIsUserDropdownOpen(false); }}>
                    <GiLockers className="h-4 w-4 mr-2" />
                    Mon Vestiaire
                  </Link>
                  <Link to="/my-customised" className="flex py-2 text-sm text-gray-400 hover:text-white transition-colors" onClick={() => { setIsMenuOpen(false); setIsUserDropdownOpen(false); }}>
                    <MdFavoriteBorder className="h-4 w-4 mr-2" />
                    Mon Round Personnalisé
                  </Link>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3 p-3 hover:bg-[#1A1A1A] rounded-lg cursor-pointer transition-colors">
              <FiSend className="h-6 w-6" />
              <span className="text-sm font-medium">Messages</span>
            </div>

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