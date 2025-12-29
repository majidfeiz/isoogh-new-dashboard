// src/components/Access/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ permission, children }) => {
  const { hasPermission } = useAuth();

  if (!permission) return children;
  return hasPermission(permission) ? children : <Navigate to="/403" replace />;
};

export default ProtectedRoute;
