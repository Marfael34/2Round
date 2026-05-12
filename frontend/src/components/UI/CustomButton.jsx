import { Link } from 'react-router-dom';

const CustomButton = ({ 
  children, 
  to, 
  onClick, 
  hoverColor = "hover:bg-orange/80", 
  textColor = "text-white",
  className = "", 
  type = "button" 
}) => {
  

  const baseClasses = `px-6 py-3 font-bold shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-orange/30 text-center flex justify-center items-center gap-2 ${hoverColor} ${textColor} ${className}`;

  if (to) {
    return (
      <Link to={to} className={baseClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={baseClasses}>
      {children}
    </button>
  );
};

export default CustomButton;