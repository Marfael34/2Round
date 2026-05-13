import { useState } from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = (e) => {
    e.preventDefault(); // Empêche la redirection du Link
    e.stopPropagation(); // Empêche la propagation du clic pour ne pas ouvrir le produit
    
    setIsFavorite(!isFavorite);
    
    // Mock de l'appel API ou console.log pour le moment
    console.log(`Produit ${product.id} ${!isFavorite ? 'ajouté aux' : 'retiré des'} favoris`);
    
    // TODO: Une fois l'auth implémentée, faire l'appel fetch('/api/favorites')
  };

  return (
    <Link 
      to={`/product/${product.id || product['@id']?.split('/').pop()}`} 
      className="flex flex-col group w-full"
    >
      {/* Conteneur Image */}
      <div className="bg-[#1A1A1A] rounded-sm h-[220px] flex justify-center items-center mb-3 relative cursor-pointer hover:bg-[#252525] transition-colors border border-white/5 overflow-hidden">
        <img 
          src={product.image || "https://picsum.photos/seed/product/300/300"} 
          alt={product.title} 
          className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity" 
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
        {product.size || 'M'} - {product.state || 'Neuf'}
      </p>
      <p className="font-inter text-base font-bold mt-1 text-white">{product.price}€</p>
    </Link>
  );
};

export default ProductCard;
