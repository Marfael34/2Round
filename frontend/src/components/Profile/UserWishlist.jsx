import { useState, useEffect } from 'react';
import { securedFetch, getCurrentUserId } from '../../utils/api';
import ProductCard from '../Product/ProductCard';

const UserWishlist = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const userId = getCurrentUserId();
        
        if (!userId) {
          setError("Vous devez être connecté pour voir vos favoris.");
          setLoading(false);
          return;
        }

        // Fetch user data to get favorites
        const userRes = await securedFetch(`/api/users/${userId}`);
        if (!userRes.ok) throw new Error("Erreur lors de la récupération de l'utilisateur");
        
        const userData = await userRes.json();
        const userFavorites = userData.favorites || [];
        
        // Resolve favorites if they are IRIs
        const resolvedProducts = [];
        
        for (const fav of userFavorites) {
          let favData = fav;
          
          // If it's an IRI string, fetch the favorite object
          if (typeof fav === 'string') {
            const favRes = await securedFetch(fav);
            if (favRes.ok) {
              favData = await favRes.json();
            } else {
              continue; // Skip if error
            }
          }
          
          // favData.products can be an IRI or an object
          if (favData && favData.products) {
            let productData = favData.products;
            
            // If the product is just an IRI string, fetch the product object
            if (typeof productData === 'string') {
              const prodRes = await securedFetch(productData);
              if (prodRes.ok) {
                productData = await prodRes.json();
              } else {
                continue; // Skip if error
              }
            }
            
            // Force the isFavorite flag since we know it's in the wishlist
            productData.isFavorite = true;
            resolvedProducts.push(productData);
          }
        }
        
        setFavorites(resolvedProducts);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger vos favoris.");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500 font-inter">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full bg-black py-12 sm:py-16 px-6 md:px-20 lg:px-32 xl:px-40">
      <div className="mb-8">
        <h2 className="font-bebas text-3xl md:text-5xl text-white uppercase tracking-wide inline-block pb-1">
          Mes Favoris
        </h2>
      </div>
      
      {favorites.length === 0 ? (
        <div className="text-center py-12 bg-[#1A1A1A] rounded-lg border border-white/5">
          <p className="text-gray-400 font-inter">Vous n'avez pas encore d'articles en favoris.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {favorites.map((product) => (
            <ProductCard 
              key={product.id || product['@id']} 
              product={product} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserWishlist;
