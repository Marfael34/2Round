import React from "react";
import { NavLink } from "react-router-dom";

const Navlinks = ({ data, marginTop, handleClick, userId = 0 }) => {

  
  return (
    <div className={marginTop}>
      {/* ici  on map le tableau de data pour afficher les liens */}
      {data &&
        data.map((item) => (
          <NavLink
            key={item.title}
            to={item.path.replace(":id", userId)}
            end
            className={""}
            onClick={() => handleClick && handleClick()}
          >
            {<item.icon className="mr-2" />}
            {item.title}
          </NavLink>
        ))}
    </div>
  );
};

export default Navlinks;