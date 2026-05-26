import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const Selection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?isHighlighted=true&status=active');
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText || 'Erreur lors de la récupération des produits'}`);
        }
        const data = await response.json();
        // L'API Platform renvoie les données dans la clé member ou hydra:member
        const items = data['member'] || data['hydra:member'] || [];
        setProducts(items);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="w-full bg-black py-16 px-6 md:px-12 lg:px-24 text-white">
      <div className="mx-auto">
        {/* En-tête */}
        <div className="mb-12 text-left">
          <h2 className="text-4xl font-bold font-bebas uppercase tracking-wide mb-1">
            NOTRE SELECTION
          </h2>
        </div>

        {/* Grille des produits */}
        {loading ? (
          <p className="text-gray-400 font-inter">Chargement des produits mise en avant...</p>
        ) : error ? (
          <p className="text-red-500 font-inter">Erreur: {error}</p>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.slice(0, 5).map((product) => (
              <ProductCard key={product.id || product['@id']} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 font-inter">Aucun produit mise en avant pour le moment.</p>
        )}

        {/* Lien Voir tous les produits */}
        <div className="text-right mt-12">
          <Link to="/marketplace" className="text-red font-inter font-bold uppercase text-sm hover:text-red/80 transition-colors inline-flex items-center gap-2">
            Voir tout le catalogue
            <span className="text-lg">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Selection;
