import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShieldHalved } from "react-icons/fa6";
import { securedFetch, getCurrentUserId } from '../../utils/api';
import { API_URL } from '../../constants/apiConstante';

const ProductCard = ({ product }) => {
  // Calculer l'état initial des favoris
  const initialFavorite = product.isFavorite !== undefined 
    ? product.isFavorite 
    : (() => {
        const userId = getCurrentUserId();
        if (userId && product.favorites && Array.isArray(product.favorites)) {
          const userIri = `/api/users/${userId}`;
          return product.favorites.some(fav => {
            const favUserIri = typeof fav.users === 'string' ? fav.users : fav.users?.['@id'];
            return favUserIri === userIri;
          });
        }
        return false;
      })();

  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [prevProduct, setPrevProduct] = useState(product);

  // Mettre à jour l'état si la prop product change (évite le useEffect pour synchroniser l'état)
  if (product !== prevProduct) {
    setPrevProduct(product);
    setIsFavorite(initialFavorite);
  }

  const getProductImage = (prod) => {
    if (prod.image) return prod.image;
    if (Array.isArray(prod.images) && prod.images.length > 0) {
      const firstImage = prod.images[0];
      if (firstImage && typeof firstImage === 'object' && firstImage.path) {
        return firstImage.path;
      }
    }
    return null;
  };

  const handleFavoriteClick = async (e) => {
    e.preventDefault(); // Empêche la redirection du Link
    e.stopPropagation(); // Empêche la propagation du clic pour ne pas ouvrir le produit
    
    // Toggle optimiste
    setIsFavorite(!isFavorite);
    
    try {
      const productId = product.id || product['@id']?.split('/').pop();
      const response = await securedFetch(`${API_URL}/products/${productId}/favorite`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        // Revert si erreur
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

  const imgUrl = getProductImage(product) || "https://picsum.photos/seed/product/300/300";
  const stateLabel = product.etat?.label || product.state || 'Neuf';

  return (
    <Link 
      to={`/product/${product.id || product['@id']?.split('/').pop()}`} 
      className="flex flex-col group w-full"
    >
      {/* Conteneur Image */}
      <div className="bg-[#1A1A1A] rounded-sm aspect-square flex justify-center items-center mb-3 relative cursor-pointer hover:bg-[#252525] transition-colors border border-white/5 overflow-hidden">
        <img 
          src={imgUrl} 
          alt={product.title} 
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
        />
        
        {/* Icône Coeur (Bas Droite) */}
        <div 
          onClick={handleFavoriteClick}
          className={`absolute bottom-2 right-2 transition-colors ${isFavorite ? 'text-red-500' : 'text-black hover:text-red-500'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      </div>

      {/* Infos Produit */}
      <h3 className="font-inter text-sm font-bold uppercase tracking-wide text-white truncate">{product.title}</h3>
      <p className="font-inter text-xs text-gray-400 mt-0.5">
        {product.size || 'M'} - {stateLabel}
      </p>
      <div className="mt-1">
        <p className="font-inter text-base font-bold text-white">{product.price}€</p>
        <div className="flex items-center gap-1 mt-0.5 text-gray-500 text-[10px]">
          <FaShieldHalved className="text-emerald-500" />
          <span>+ {(0.7 + product.price * 0.05).toFixed(2)}€ prot. acheteur</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
