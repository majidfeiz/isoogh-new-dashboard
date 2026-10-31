// src/components/Access/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ permission, roles, children }) => {
  const { user, hasPermission } = useAuth();

  const roleNames = (user?.roles || []).map((role) => typeof role === "string" ? role : role?.name).filter(Boolean);
  const roleAllowed = !roles?.length || roles.some((role) => roleNames.includes(role));
  const permissionAllowed = !permission || hasPermission(permission);
  return roleAllowed && permissionAllowed ? children : <Navigate to="/403" replace />;
};

export default ProtectedRoute;
