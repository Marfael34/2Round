import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { securedFetch } from '../utils/api';
import { API_URL } from '../constants/apiConstante';
import ProductCard from '../components/Product/ProductCard';
import { FaChevronLeft, FaChevronRight, FaChevronDown } from 'react-icons/fa6';

const MarketPlace = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const textQuery = searchParams.get('search')?.toLowerCase() || '';

  // Data states
  const [products, setProducts] = useState([]);
  const [dbColors, setDbColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Dropdown state ('category', 'size', 'brand', 'state', 'color', 'price')
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Filters State
  const categoryQuery = searchParams.get('category');
  const initialCategory = categoryQuery ? [categoryQuery] : [];
  const [selectedCategories, setSelectedCategories] = useState(initialCategory);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  // Pagination (Mocked for visual representation)
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Fetch data (products and colors)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [productsRes, colorsRes] = await Promise.all([
          securedFetch(`${API_URL}/products?status=active`),
          securedFetch(`${API_URL}/colors`)
        ]);

        if (!productsRes.ok) throw new Error("Impossible de charger les articles de la marketplace.");
        
        const productsData = await productsRes.json();
        const pItems = productsData.member || productsData['hydra:member'] || (Array.isArray(productsData) ? productsData : []);
        setProducts(pItems);

        if (colorsRes.ok) {
          const colorsData = await colorsRes.json();
          const cItems = colorsData.member || colorsData['hydra:member'] || (Array.isArray(colorsData) ? colorsData : []);
          setDbColors(cItems.map(c => c.label).filter(Boolean));
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  // 2. Dynamic Unique Filter values extraction + Static Defaults
  const DEFAULT_CATEGORIES = ['Gants de boxe', 'Casques', 'Chaussures', 'Vêtements', 'Protections', 'Sacs de frappe', 'Accessoires'];
  const DEFAULT_BRANDS = ['Cleto Reyes', 'Winning', 'Everlast', 'Venum', 'Title Boxing', 'Rival', 'Hayabusa', 'Fairtex', 'Twins Special', 'Adidas', 'Nike', 'Leone 1947'];
  const DEFAULT_STATES = ['Neuf avec étiquette', 'Neuf sans étiquette', 'Très bon état', 'Bon état', 'Satisfaisant'];

  // Tailles dynamiques en fonction des catégories sélectionnées
  let dynamicDefaultSizes = [];
  if (selectedCategories.length === 0) {
    dynamicDefaultSizes = ['8 oz', '10 oz', '12 oz', '14 oz', '16 oz', '18 oz', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '43', '44', '45', '46', 'Unique'];
  } else {
    if (selectedCategories.includes('Gants de boxe')) {
      dynamicDefaultSizes.push('8 oz', '10 oz', '12 oz', '14 oz', '16 oz', '18 oz');
    }
    if (selectedCategories.includes('Chaussures')) {
      dynamicDefaultSizes.push('38', '39', '40', '41', '42', '43', '44', '45', '46');
    }
    if (selectedCategories.some(c => ['Vêtements', 'Protections', 'Casques'].includes(c))) {
      dynamicDefaultSizes.push('XS', 'S', 'M', 'L', 'XL', 'XXL');
    }
    if (selectedCategories.some(c => ['Sacs de frappe', 'Accessoires'].includes(c))) {
      dynamicDefaultSizes.push('Unique');
    }
    dynamicDefaultSizes = [...new Set(dynamicDefaultSizes)];
  }

  // Produits à considérer pour extraire des tailles (seulement les catégories sélectionnées si applicable)
  const relevantProductsForSizes = selectedCategories.length > 0 
    ? products.filter(p => selectedCategories.includes(p.type)) 
    : products;

  const categories = Array.from(new Set([...DEFAULT_CATEGORIES, ...products.map(p => p.type).filter(Boolean)]));
  const sizes = Array.from(new Set([...dynamicDefaultSizes, ...relevantProductsForSizes.map(p => p.size).filter(Boolean)]));
  const brands = Array.from(new Set([...DEFAULT_BRANDS, ...products.map(p => p.brand).filter(Boolean)]));
  const states = Array.from(new Set([...DEFAULT_STATES, ...products.map(p => p.etat?.label || p.state).filter(Boolean)]));
  const productColors = products.flatMap(p => p.colors?.map(c => c.label) || []);
  const colors = Array.from(new Set([...dbColors, ...productColors])).filter(Boolean);

  // Group sizes for better UI understanding
  const groupedSizes = sizes.reduce((acc, sz) => {
    let group = 'Autres';
    if (sz.includes('oz')) group = 'Gants (oz)';
    else if (['XS', 'S', 'M', 'L', 'XL', 'XXL'].includes(sz.toUpperCase())) group = 'Vêtements / Protections';
    else if (!isNaN(sz)) group = 'Chaussures (EU)';
    
    if (!acc[group]) acc[group] = [];
    acc[group].push(sz);
    return acc;
  }, {});

  // 3. Render-time Filter & Sort Logic (no useEffect, no cascading renders)
  const filteredProducts = products.filter(p => {
    // 3.1 Text Search Filter
    if (textQuery) {
      const matchTitle = p.title?.toLowerCase().includes(textQuery);
      const matchType = p.type?.toLowerCase().includes(textQuery);
      const matchBrand = p.brand?.toLowerCase().includes(textQuery);
      const matchSize = p.size?.toLowerCase().includes(textQuery);
      const matchColor = p.colors?.some(c => c.label?.toLowerCase().includes(textQuery));
      if (!matchTitle && !matchType && !matchBrand && !matchSize && !matchColor) {
        return false;
      }
    }

    if (selectedCategories.length > 0 && !selectedCategories.includes(p.type)) {
      return false;
    }
    if (selectedSizes.length > 0 && !selectedSizes.includes(p.size)) {
      return false;
    }
    if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) {
      return false;
    }
    const sLabel = p.etat?.label || p.state;
    if (selectedStates.length > 0 && !selectedStates.includes(sLabel)) {
      return false;
    }
    if (selectedColors.length > 0) {
      const pColors = (p.colors || []).map(c => c.label);
      if (!pColors.some(c => selectedColors.includes(c))) {
        return false;
      }
    }
    if (priceMin !== '' && Number(p.price) < Number(priceMin)) {
      return false;
    }
    if (priceMax !== '' && Number(p.price) > Number(priceMax)) {
      return false;
    }
    return true;
  }).sort((a, b) => b.id - a.id);

  // Pagination Logic
  const ITEMS_PER_PAGE = 24;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

  // Reset to page 1 if filtered products change and current page is out of bounds
  const [prevFilteredLength, setPrevFilteredLength] = useState(filteredProducts.length);
  if (filteredProducts.length !== prevFilteredLength) {
    setPrevFilteredLength(filteredProducts.length);
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }

  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Pagination rendering helper
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    let pages = [];
    // Always show first page, last page, current page, and 1 page before/after current
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (
        i === currentPage - 2 || 
        i === currentPage + 2
      ) {
        pages.push('...');
      }
    }

    // Remove duplicate ellipsis
    pages = pages.filter((page, index) => {
      return page !== '...' || pages[index - 1] !== '...';
    });

    return (
      <div className="flex justify-center items-center gap-2 sm:gap-4 mt-16 pt-8 border-t border-white/5 text-xs font-bold text-gray-500 shrink-0 select-none flex-wrap">
        <button 
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          className="hover:text-white disabled:opacity-30 transition-colors cursor-pointer px-2 py-1"
        >
          <FaChevronLeft />
        </button>
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
          {pages.map((p, index) => (
            p === '...' ? (
              <span key={`ellipsis-${index}`}>...</span>
            ) : (
              <span 
                key={`page-${p}`}
                className={`cursor-pointer px-1 sm:px-2 py-1 ${currentPage === p ? 'text-white border-b-2 border-red-600 pb-0.5' : 'hover:text-white transition-colors'}`} 
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </span>
            )
          ))}
        </div>
        <button 
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          className="hover:text-white disabled:opacity-30 transition-colors cursor-pointer px-2 py-1"
        >
          <FaChevronRight />
        </button>
      </div>
    );
  };


  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedBrands([]);
    setSelectedStates([]);
    setSelectedColors([]);
    setPriceMin('');
    setPriceMax('');
    setActiveDropdown(null);
  };

  // Toggle helpers
  const handleToggleFilter = (item, selectedList, setSelectedList) => {
    if (selectedList.includes(item)) {
      setSelectedList(selectedList.filter(i => i !== item));
    } else {
      setSelectedList([...selectedList, item]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-inter">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Chargement du catalogue...</p>
        </div>
      </div>
    );
  }

  // Count active filters
  const activeFiltersCount = 
    selectedCategories.length + 
    selectedSizes.length + 
    selectedBrands.length + 
    selectedStates.length + 
    selectedColors.length + 
    (priceMin !== '' ? 1 : 0) + 
    (priceMax !== '' ? 1 : 0);

  return (
    <div className="min-h-screen bg-black text-white font-inter flex flex-col relative overflow-x-hidden">
      
      {/* 1. Header with Diagonal Stripe Pattern */}
      <div 
        className="w-full py-10 px-4 md:px-8 border-b border-white/5 relative"
        style={{
          backgroundImage: `repeating-linear-gradient(-45deg, #070707, #070707 4px, #0e0e0e 4px, #0e0e0e 8px)`
        }}
      >
        <div className="max-w-[1000px] mx-auto">
          {/* Back button */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 text-xs font-bold uppercase tracking-widest transition-colors"
          >
            <FaChevronLeft className="text-[10px]" /> Catalogue
          </Link>

          {/* Title */}
          <h1 className="font-bebas text-5xl md:text-6xl tracking-wider uppercase mb-8">
            Catalogue
          </h1>

          {/* Filter Pills Grid */}
          <div className="flex flex-wrap gap-3 items-center relative">
            
            {/* Pill: Categorie */}
            <div className="relative">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
                className={`flex items-center gap-2 bg-black border ${selectedCategories.length > 0 ? 'border-red-600 text-red-500' : 'border-white/20 text-white'} px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer hover:border-white/40 transition-colors`}
              >
                Catégorie {selectedCategories.length > 0 && `(${selectedCategories.length})`} <FaChevronDown className="text-[10px]" />
              </button>
              {activeDropdown === 'category' && (
                <div className="absolute left-0 mt-2 w-56 bg-[#0c0c0c] border border-white/10 p-4 rounded-sm shadow-2xl z-30 space-y-2">
                  {categories.length > 0 ? categories.map(cat => (
                    <label key={cat} className="flex items-center gap-3 text-xs uppercase tracking-wide text-gray-300 hover:text-white cursor-pointer py-1">
                      <input 
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => handleToggleFilter(cat, selectedCategories, setSelectedCategories)}
                        className="accent-red-600 rounded bg-black border-white/25"
                      />
                      {cat}
                    </label>
                  )) : <p className="text-[10px] text-gray-500">Aucune catégorie</p>}
                </div>
              )}
            </div>

            {/* Pill: Taille */}
            <div className="relative">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'size' ? null : 'size')}
                className={`flex items-center gap-2 bg-black border ${selectedSizes.length > 0 ? 'border-red-600 text-red-500' : 'border-white/20 text-white'} px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer hover:border-white/40 transition-colors`}
              >
                Taille {selectedSizes.length > 0 && `(${selectedSizes.length})`} <FaChevronDown className="text-[10px]" />
              </button>
              {activeDropdown === 'size' && (
                <div className="absolute left-0 mt-2 w-64 bg-[#0c0c0c] border border-white/10 p-4 rounded-sm shadow-2xl z-30 max-h-80 overflow-y-auto">
                  {Object.keys(groupedSizes).length > 0 ? (
                    Object.entries(groupedSizes).map(([groupName, groupSizes]) => (
                      <div key={groupName} className="mb-4 last:mb-0">
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 border-b border-white/10 pb-1">
                          {groupName}
                        </div>
                        <div className="space-y-2">
                          {groupSizes.map(sz => (
                            <label key={sz} className="flex items-center gap-3 text-xs uppercase tracking-wide text-gray-300 hover:text-white cursor-pointer py-1">
                              <input 
                                type="checkbox"
                                checked={selectedSizes.includes(sz)}
                                onChange={() => handleToggleFilter(sz, selectedSizes, setSelectedSizes)}
                                className="accent-red-600 rounded bg-black border-white/25"
                              />
                              {sz}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-gray-500">Aucune taille</p>
                  )}
                </div>
              )}
            </div>

            {/* Pill: Marque */}
            <div className="relative">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'brand' ? null : 'brand')}
                className={`flex items-center gap-2 bg-black border ${selectedBrands.length > 0 ? 'border-red-600 text-red-500' : 'border-white/20 text-white'} px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer hover:border-white/40 transition-colors`}
              >
                Marque {selectedBrands.length > 0 && `(${selectedBrands.length})`} <FaChevronDown className="text-[10px]" />
              </button>
              {activeDropdown === 'brand' && (
                <div className="absolute left-0 mt-2 w-56 bg-[#0c0c0c] border border-white/10 p-4 rounded-sm shadow-2xl z-30 max-h-60 overflow-y-auto space-y-2">
                  {brands.length > 0 ? brands.map(br => (
                    <label key={br} className="flex items-center gap-3 text-xs uppercase tracking-wide text-gray-300 hover:text-white cursor-pointer py-1">
                      <input 
                        type="checkbox"
                        checked={selectedBrands.includes(br)}
                        onChange={() => handleToggleFilter(br, selectedBrands, setSelectedBrands)}
                        className="accent-red-600 rounded bg-black border-white/25"
                      />
                      {br}
                    </label>
                  )) : <p className="text-[10px] text-gray-500">Aucune marque</p>}
                </div>
              )}
            </div>

            {/* Pill: Etat */}
            <div className="relative">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'state' ? null : 'state')}
                className={`flex items-center gap-2 bg-black border ${selectedStates.length > 0 ? 'border-red-600 text-red-500' : 'border-white/20 text-white'} px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer hover:border-white/40 transition-colors`}
              >
                Etat {selectedStates.length > 0 && `(${selectedStates.length})`} <FaChevronDown className="text-[10px]" />
              </button>
              {activeDropdown === 'state' && (
                <div className="absolute left-0 mt-2 w-56 bg-[#0c0c0c] border border-white/10 p-4 rounded-sm shadow-2xl z-30 space-y-2">
                  {states.length > 0 ? states.map(st => (
                    <label key={st} className="flex items-center gap-3 text-xs uppercase tracking-wide text-gray-300 hover:text-white cursor-pointer py-1">
                      <input 
                        type="checkbox"
                        checked={selectedStates.includes(st)}
                        onChange={() => handleToggleFilter(st, selectedStates, setSelectedStates)}
                        className="accent-red-600 rounded bg-black border-white/25"
                      />
                      {st}
                    </label>
                  )) : <p className="text-[10px] text-gray-500">Aucun état</p>}
                </div>
              )}
            </div>

            {/* Pill: Couleur */}
            <div className="relative">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'color' ? null : 'color')}
                className={`flex items-center gap-2 bg-black border ${selectedColors.length > 0 ? 'border-red-600 text-red-500' : 'border-white/20 text-white'} px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer hover:border-white/40 transition-colors`}
              >
                Couleurs {selectedColors.length > 0 && `(${selectedColors.length})`} <FaChevronDown className="text-[10px]" />
              </button>
              {activeDropdown === 'color' && (
                <div className="absolute left-0 mt-2 w-56 bg-[#0c0c0c] border border-white/10 p-4 rounded-sm shadow-2xl z-30 max-h-60 overflow-y-auto space-y-2">
                  {colors.length > 0 ? colors.map(col => (
                    <label key={col} className="flex items-center gap-3 text-xs uppercase tracking-wide text-gray-300 hover:text-white cursor-pointer py-1">
                      <input 
                        type="checkbox"
                        checked={selectedColors.includes(col)}
                        onChange={() => handleToggleFilter(col, selectedColors, setSelectedColors)}
                        className="accent-red-600 rounded bg-black border-white/25"
                      />
                      {col}
                    </label>
                  )) : <p className="text-[10px] text-gray-500">Aucune couleur</p>}
                </div>
              )}
            </div>

            {/* Pill: Prix */}
            <div className="relative">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'price' ? null : 'price')}
                className={`flex items-center gap-2 bg-black border ${(priceMin !== '' || priceMax !== '') ? 'border-red-600 text-red-500' : 'border-white/20 text-white'} px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer hover:border-white/40 transition-colors`}
              >
                Prix {(priceMin !== '' || priceMax !== '') && `(Filtre)`} <FaChevronDown className="text-[10px]" />
              </button>
              {activeDropdown === 'price' && (
                <div className="absolute right-0 lg:left-0 mt-2 w-64 bg-[#0c0c0c] border border-white/10 p-4 rounded-sm shadow-2xl z-30 space-y-4">
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <span className="block text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">Min (€)</span>
                      <input 
                        type="number"
                        placeholder="Ex: 20"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        className="w-full bg-black border border-white/10 focus:border-red-600 outline-none p-2 rounded-sm text-xs text-white"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="block text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">Max (€)</span>
                      <input 
                        type="number"
                        placeholder="Ex: 200"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        className="w-full bg-black border border-white/10 focus:border-red-600 outline-none p-2 rounded-sm text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Clear Filters Link */}
            {activeFiltersCount > 0 && (
              <button 
                onClick={clearAllFilters}
                className="text-red-500 hover:text-red-400 text-xs font-bold tracking-wide cursor-pointer transition-colors block ml-2 border-b border-transparent hover:border-red-400"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Global Transparent Backdrop to close open Dropdowns */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-20 cursor-default" 
          onClick={() => setActiveDropdown(null)}
        />
      )}

      {/* 2. Main Content Area */}
      <div className="max-w-[1000px] w-full mx-auto px-4 md:px-8 py-8 flex-1 flex flex-col">
        
        {/* Results count label */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            {filteredProducts.length} {filteredProducts.length > 1 ? 'résultats' : 'résultat'}
            {textQuery && (
              <span className="ml-2 text-white normal-case">
                pour la recherche "{searchParams.get('search')}"
              </span>
            )}
          </div>
          {textQuery && (
            <button 
              onClick={() => navigate('/marketplace')}
              className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase tracking-widest transition-colors cursor-pointer"
            >
              Effacer la recherche
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-800 text-red-500 p-4 mb-6 rounded-sm text-sm">
            {error}
          </div>
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {paginatedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center border border-white/5 rounded-sm bg-[#050505] flex flex-col items-center justify-center p-8">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Aucun article</span>
              <p className="text-xs text-gray-600 max-w-xs leading-relaxed">
                Aucun produit ne correspond à ces critères. Modifiez vos filtres ou réinitialisez les.
              </p>
              <button 
                onClick={clearAllFilters}
                className="mt-6 bg-white hover:bg-gray-200 text-black text-xs font-bold py-2 px-4 rounded-sm uppercase tracking-wider transition-colors cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>

        {/* 3. Pagination (Centered) */}
        {renderPagination()}

      </div>

      {/* 4. Boxer Resale Promotion Banner */}
      <div 
        className="w-full py-16 px-4 md:px-8 border-t border-b border-white/5 mt-12 bg-black shrink-0 relative"
      >
        <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <h2 className="font-bebas text-4xl md:text-5xl uppercase tracking-wider leading-none text-white">
              Ton matériel peut <br className="hidden md:inline" />
              <span className="text-red-600">encore</span> faire des <br className="hidden md:inline" />
              rounds
            </h2>
            
            {/* White pill items */}
            <div className="flex flex-wrap gap-2.5">
              <span className="border border-white/40 text-white font-inter font-bold text-[9px] uppercase tracking-wider py-1.5 px-3 rounded-full">
                Gagne de l'argent
              </span>
              <span className="border border-white/40 text-white font-inter font-bold text-[9px] uppercase tracking-wider py-1.5 px-3 rounded-full">
                Aide un boxeur
              </span>
              <span className="border border-white/40 text-white font-inter font-bold text-[9px] uppercase tracking-wider py-1.5 px-3 rounded-full">
                Évite le gaspillage
              </span>
              <span className="border border-white/40 text-white font-inter font-bold text-[9px] uppercase tracking-wider py-1.5 px-3 rounded-full">
                Vente simple et rapide
              </span>
            </div>
          </div>

          <button 
            onClick={() => navigate('/resale')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-8 rounded-full flex items-center gap-3 uppercase tracking-wider text-xs transition-colors cursor-pointer shadow-lg shadow-red-600/10 hover:shadow-red-600/20"
          >
            Revendre <FaChevronRight className="text-[10px]" />
          </button>
        </div>
      </div>

      {/* 5. Custom 2Round Footer */}
      <footer className="w-full bg-[#050505] border-t border-white/5 py-12 px-4 md:px-8 shrink-0">
        <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          {/* Logo */}
          <div className="font-bebas text-3xl uppercase tracking-widest text-white">
            2Round
          </div>

          {/* Links columns */}
          <div className="flex flex-wrap gap-x-12 gap-y-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <div className="flex flex-col gap-2">
              <Link to="/profile" className="hover:text-white transition-colors">Créer mon profil</Link>
              <Link to="/resale" className="hover:text-white transition-colors">Commencer à vendre</Link>
            </div>
            <div className="flex flex-col gap-2">
              <Link to="/packs" className="hover:text-white transition-colors">Les Packs</Link>
              <Link to="/guide" className="hover:text-white transition-colors">Les Guides</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default MarketPlace;