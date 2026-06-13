import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAccessToken } from "../helpers/authStorage.jsx";

const Authmiddleware = ({ children }) => {
  const location = useLocation();

  const token = getAccessToken(); // localStorage یا sessionStorage

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <>{children}</>;
};

export default Authmiddleware;
