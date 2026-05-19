import { Link } from "react-router-dom";

const UserProducts = ({ products, loading }) => {
  const getProductImage = (product) => {
    if (product.image) {
      return product.image;
    }
    if (Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      if (firstImage && typeof firstImage === 'object' && firstImage.path) {
        return firstImage.path;
      }
    }
    return null;
  };

  return (
    <div>
      {loading ? (
        <p className="text-gray-400">Chargement des articles...</p>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {products.map(product => {
            const imgUrl = getProductImage(product);
            const showCertification =
              product.isHighlighted === true ||
              product.isHighlighted === 1 ||
              product.isHighlighted === "1" ||
              product.is_highlighted === true ||
              product.is_highlighted === 1 ||
              product.is_highlighted === "1" ||
              product.highlighted === true ||
              product.highlighted === 1 ||
              product.highlighted === "1";

            return (
              <Link to={`/product/${product.id}`} key={product.id} className="text-white block group hover:opacity-90 transition-opacity">
                <div className="relative mb-4">
                  <div className="aspect-square bg-[#1A1A1A] border border-white/10 overflow-hidden">
                    {imgUrl ? (
                      <img src={imgUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        Pas d'image
                      </div>
                    )}
                  </div>
                  {/* Checkmark icon if verified */}
                  {showCertification && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <span className="text-black text-sm font-bold">✓</span>
                    </div>
                  )}
                </div>
                <h5 className="font-bold uppercase text-xl mb-1 group-hover:text-red-500 transition-colors">{product.title}</h5>
                <p className="text-gray-400 text-sm mb-2">{product.subtitle || 'Description courte'}</p>
                <p className="font-bold text-xl">{product.price}€</p>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-400">Vous n'avez aucun article en vente.</p>
      )}
    </div>
  );
};

export default UserProducts;
