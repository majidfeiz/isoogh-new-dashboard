import React, { useState } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { withTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";

const ProfileMenu = (props) => {
  const [menu, setMenu] = useState(false);
  const { user } = useAuth();

  const displayName = user?.name || user?.username || "کاربر";
  const initial = displayName.trim()[0] || "؟";

  return (
    <React.Fragment>
      <Dropdown
        isOpen={menu}
        toggle={() => setMenu(!menu)}
        className="d-inline-block"
      >
        <DropdownToggle
          className="btn header-item"
          id="page-header-user-dropdown"
          tag="button"
        >
          <div
            className="rounded-circle header-profile-user d-inline-flex align-items-center justify-content-center text-white fw-bold"
            style={{
              background: "linear-gradient(135deg, #556ee6, #34c38f)",
              fontSize: 14,
              verticalAlign: "middle",
            }}
          >
            {initial}
          </div>
          <span className="d-none d-xl-inline-block ms-2 me-1">{displayName}</span>
          <i className="mdi mdi-chevron-down d-none d-xl-inline-block" />
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <DropdownItem tag="a" href="/profile">
            <i className="bx bx-user font-size-16 align-middle me-1" />
            {props.t("پروفایل")}
          </DropdownItem>
          <div className="dropdown-divider" />
          <Link to="/logout" className="dropdown-item">
            <i className="bx bx-power-off font-size-16 align-middle me-1 text-danger" />
            <span>{props.t("خروج")}</span>
          </Link>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

export default withTranslation()(ProfileMenu);
