// src/components/Access/Can.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";

const Can = ({ permission, any, all, children, fallback = null }) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  const allowed =
    permission ? hasPermission(permission)
    : any ? hasAnyPermission(any)
    : all ? hasAllPermissions(all)
    : true;

  return allowed ? children : fallback;
};

export default Can;
