import React from "react";
import { handleLogout } from "./Auth/authentication";
import { FiPower } from "react-icons/fi";

const Navbar = () => {
  const fetchUser = () => {
    const info = window.localStorage.getItem("userData");
    return info ? JSON.parse(info) : localStorage.clear();
  };

  return (
    <div className="navbar">
      <div className="nav">
        <h5>{fetchUser()?.name}</h5>
        <button onClick={() => handleLogout()} title="logout">
          <FiPower />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
