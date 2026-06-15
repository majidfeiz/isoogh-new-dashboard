import React from "react";
import { useAppVersion } from "../../hooks/useAppVersion.jsx";
import pkg from "../../../package.json";

const AppVersionBadge = () => {
  const { version, build, isLoading } = useAppVersion();

  return (
    <div
      style={{
        fontSize: "11px",
        color: "rgba(255,255,255,0.3)",
        textAlign: "center",
        padding: "0 8px 4px",
        lineHeight: "1.6",
        userSelect: "none",
        direction: "ltr",
      }}
    >
      <div>App v{pkg.version}</div>
      {!isLoading && version && (
        <div>
          API v{version}
          {build ? ` · ${build}` : ""}
        </div>
      )}
    </div>
  );
};

export default AppVersionBadge;
