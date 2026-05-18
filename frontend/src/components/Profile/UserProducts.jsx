
const UserProducts = ({ products, loading }) => {
  return (
    <div>
      {loading ? (
        <p className="text-gray-400">Chargement des articles...</p>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {products.map(product => (
            <div key={product.id} className="text-white">
              <div className="relative mb-4">
                <div className="aspect-square bg-[#1A1A1A] border border-white/10 overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      Pas d'image
                    </div>
                  )}
                </div>
                {/* Checkmark icon if verified */}
                <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-black text-sm font-bold">✓</span>
                </div>
              </div>
              <h5 className="font-bold uppercase text-xl mb-1">{product.title}</h5>
              <p className="text-gray-400 text-sm mb-2">{product.subtitle || 'Description courte'}</p>
              <p className="font-bold text-xl">{product.price}€</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">Vous n'avez aucun article en vente.</p>
      )}
    </div>
  );
};

export default UserProducts;
