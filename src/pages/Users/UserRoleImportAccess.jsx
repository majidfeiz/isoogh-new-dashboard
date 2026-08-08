import React from "react";
import { useAuth } from "../../context/AuthContext.jsx";

const UserRoleImportAccess = ({ children }) => {
  const { hasPermission } = useAuth();
  return hasPermission("users.roles.import") ? children : null;
};

export default UserRoleImportAccess;
