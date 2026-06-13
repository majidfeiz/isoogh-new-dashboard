import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutApi } from "../../services/authService.jsx";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    logoutApi()
      .catch(() => {})
      .finally(() => {
        navigate("/login", { replace: true });
      });
  }, [navigate]);

  return null;
};

export default Logout;
