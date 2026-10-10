import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutApi } from "../../services/authService.jsx";
import { setIncomingAvailability } from "../../services/incomingCallService.jsx";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const schoolId = sessionStorage.getItem("incoming_calls_school_id");
    const wasAvailable = sessionStorage.getItem("incoming_calls_available") === "true";
    const leaveShift = schoolId && wasAvailable
      ? setIncomingAvailability(schoolId, false).catch(() => {})
      : Promise.resolve();
    leaveShift.finally(() => {
      sessionStorage.removeItem("incoming_calls_available");
      sessionStorage.removeItem("incoming_calls_school_id");
    }).then(() => logoutApi())
      .catch(() => {})
      .finally(() => {
        navigate("/login", { replace: true });
      });
  }, [navigate]);

  return null;
};

export default Logout;
