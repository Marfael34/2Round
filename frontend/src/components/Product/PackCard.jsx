

const PackCard = ({ title = "Pack", type, imageUrl = "/images/default_pack.png" }) => {
  return (
    <div className="flex flex-col group">
      <div className="bg-[#1A1A1A] rounded-md h-full flex justify-center items-center mb-4 relative cursor-pointer hover:bg-[#252525] transition-colors border border-white/5 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={`${title} ${type}`} 
          className="w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity" 
        />
      </div>
      <h3 className="font-bebas text-xl font-bold uppercase">{title}</h3>
      <p className="font-inter text-sm text-gray-400">{type}</p>
    </div>
  );
};

export default PackCard;
