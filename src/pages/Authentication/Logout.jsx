import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthData } from "../../helpers/authStorage.jsx";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      // پاک کردن تمام داده‌های احراز هویت و هر داده‌ی ذخیره‌شده
      clearAuthData();
      localStorage.clear();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[Logout] failed to clear storage", e);
    } finally {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return null;
};

export default Logout;
