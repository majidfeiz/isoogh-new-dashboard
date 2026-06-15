// src/components/Common/SwitchUserButton.jsx
import React, { useState } from "react";
import { Button, Spinner } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const SwitchUserButton = ({ userId, userName }) => {
  const { hasPermission, isSwitched, switchToUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // only visible with the right permission and only when not already switched
  if (!hasPermission("user-switch.create") || isSwitched) return null;

  const handleSwitch = async () => {
    setLoading(true);
    try {
      await switchToUser(userId);
      navigate("/dashboard");
    } catch {
      // httpClient already shows a toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      color="warning"
      size="sm"
      onClick={handleSwitch}
      disabled={loading}
      title={`ورود به حساب ${userName || userId}`}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : (
        <>
          <i className="bx bx-transfer me-1" />
          سوییچ
        </>
      )}
    </Button>
  );
};

export default SwitchUserButton;
