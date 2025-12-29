import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const Authmiddleware = ({ children }) => {
  const location = useLocation();

  // چک کردن وجود توکن
  const token = localStorage.getItem("isoogh_access_token");

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
