// src/components/Common/ImpersonationBanner.jsx
import React, { useState } from "react";
import { Button, Spinner } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const ImpersonationBanner = () => {
  const { isSwitched, user, originalUser, switchBack } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!isSwitched) return null;

  const handleSwitchBack = async () => {
    setLoading(true);
    try {
      await switchBack();
      navigate("/users");
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: "#ff8c00",
        color: "#fff",
        padding: "8px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        fontSize: "14px",
        fontWeight: 500,
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
      }}
    >
      <span>
        ⚠️ شما اکنون به عنوان{" "}
        <strong>{user?.name || user?.username || "کاربر"}</strong> وارد شده‌اید
        {originalUser?.name ? ` (ادمین اصلی: ${originalUser.name})` : ""}
      </span>
      <Button
        size="sm"
        color="light"
        onClick={handleSwitchBack}
        disabled={loading}
        style={{ whiteSpace: "nowrap", fontWeight: 600 }}
      >
        {loading ? (
          <>
            <Spinner size="sm" className="me-1" />
            در حال بازگشت...
          </>
        ) : (
          "بازگشت به حساب ادمین"
        )}
      </Button>
    </div>
  );
};

export default ImpersonationBanner;
