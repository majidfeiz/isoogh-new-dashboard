import PropTypes from "prop-types";
import React, { useCallback, useEffect, useMemo, useRef } from "react";

// Scrollbar
import SimpleBar from "simplebar-react";

// MetisMenu
import MetisMenu from "metismenujs";
import { Link, useLocation } from "react-router-dom";
import withRouter from "../Common/withRouter";

// i18n
import { withTranslation } from "react-i18next";

// access control
import Can from "../Access/Can"; // مسیرت اگر فرق دارد تغییر بده
import { useAuth } from "../../context/AuthContext.jsx"; // مسیرت اگر فرق دارد تغییر بده

const SidebarContent = (props) => {
  const path = useLocation();

  // ✅ به جای ref خود SimpleBar، ref روی scrollable node می‌گیریم
  const scrollRef = useRef(null);

  // ✅ اگر provider نبود هم اپ نپره (ولی با App.jsx که درست کردی باید OK باشه)
  const auth = useAuth?.() ?? null;

  // ✅ normalize permissions از /auth/me: می‌تونه string[] یا object[] یا effectivePermissions باشه
  const permissionList = useMemo(() => {
    if (!auth) return [];

    if (Array.isArray(auth.permissions)) return auth.permissions;

    if (Array.isArray(auth.user?.effectivePermissions)) {
      return auth.user.effectivePermissions.filter((x) => typeof x === "string");
    }

    if (Array.isArray(auth.user?.permissions)) {
      return auth.user.permissions
        .map((p) => (typeof p === "string" ? p : p?.name))
        .filter(Boolean);
    }

    return [];
  }, [auth]);

  const hasPermission = useCallback(
    (perm) => permissionList.includes(perm),
    [permissionList]
  );

  const hasAnyPermission = useCallback(
    (perms) => (perms || []).some((p) => permissionList.includes(p)),
    [permissionList]
  );

  const permissionsReady =
    Array.isArray(auth?.permissions) ||
    Array.isArray(auth?.user?.effectivePermissions) ||
    Array.isArray(auth?.user?.permissions);

  const activateParentDropdown = useCallback((item) => {
    if (!item) return;

    item.classList.add("active");
    const parent = item.parentElement;
    const parent2El = parent?.childNodes?.[1];

    if (parent2El && parent2El.id !== "side-menu") {
      parent2El.classList.add("mm-show");
    }

    if (parent) {
      parent.classList.add("mm-active");
      const parent2 = parent.parentElement;

      if (parent2) {
        parent2.classList.add("mm-show"); // ul

        const parent3 = parent2.parentElement; // li
        if (parent3) {
          parent3.classList.add("mm-active");
          parent3.childNodes?.[0]?.classList.add("mm-active");

          const parent4 = parent3.parentElement; // ul
          if (parent4) {
            parent4.classList.add("mm-show");
            const parent5 = parent4.parentElement;
            if (parent5) {
              parent5.classList.add("mm-show");
              parent5.childNodes?.[0]?.classList.add("mm-active");
            }
          }
        }
      }
      scrollElement(item);
    }
  }, []);

  const removeActivation = (items) => {
    if (!items) return;

    for (let i = 0; i < items.length; ++i) {
      const item = items[i];
      const parent = items[i]?.parentElement;

      if (item?.classList?.contains("active")) item.classList.remove("active");

      if (!parent) continue;

      const parent2El =
        parent.childNodes && parent.childNodes.length && parent.childNodes[1]
          ? parent.childNodes[1]
          : null;

      if (parent2El && parent2El.id !== "side-menu") {
        parent2El.classList.remove("mm-show");
      }

      parent.classList.remove("mm-active");

      const parent2 = parent.parentElement;
      if (!parent2) continue;

      parent2.classList.remove("mm-show");

      const parent3 = parent2.parentElement;
      if (!parent3) continue;

      parent3.classList.remove("mm-active");
      parent3.childNodes?.[0]?.classList.remove("mm-active");

      const parent4 = parent3.parentElement;
      if (!parent4) continue;

      parent4.classList.remove("mm-show");

      const parent5 = parent4.parentElement;
      if (!parent5) continue;

      parent5.classList.remove("mm-show");
      parent5.childNodes?.[0]?.classList.remove("mm-active");
    }
  };

  const activeMenu = useCallback(() => {
    const pathName = path?.pathname || "";
    const ul = document.getElementById("side-menu");
    if (!ul) return;

    const items = ul.getElementsByTagName("a");
    if (!items) return;

    removeActivation(items);

    let matchingMenuItem = null;
    for (let i = 0; i < items.length; ++i) {
      if (pathName === items[i].pathname) {
        matchingMenuItem = items[i];
        break;
      }
    }

    if (matchingMenuItem) activateParentDropdown(matchingMenuItem);
  }, [path?.pathname, activateParentDropdown]);

  // ✅ MetisMenu init (safe)
  useEffect(() => {
    const ul = document.getElementById("side-menu");
    if (!ul) return;

    let menuInstance = null;
    try {
      menuInstance = new MetisMenu("#side-menu");
    } catch (e) {
      console.error("MetisMenu init error:", e);
    }

    activeMenu();

    return () => {
      if (menuInstance?.dispose) menuInstance.dispose();
    };
  }, [activeMenu, permissionsReady]);

  useEffect(() => {
    activeMenu();
  }, [activeMenu]);

  function scrollElement(item) {
    if (!item) return;
    const scrollEl = scrollRef.current; // ✅ همین!
    if (!scrollEl) return;

    const currentPosition = item.offsetTop || 0;
    if (currentPosition > window.innerHeight) {
      scrollEl.scrollTop = currentPosition - 300;
    }
  }

  // Menu config
  const menuItems = useMemo(
    () => [
      {
        type: "item",
        label: "داشبورد",
        icon: "bx bx-home-circle",
        to: "/dashboard",
        permission: null,
      },
      {
        type: "group",
        label: "دسترسی",
        icon: "bx bx-lock-alt",
        permissionAny: ["permissions.index", "roles.index"],
        children: [
          { label: "سطح دسترسی ها", to: "/permissions", permission: "permissions.index" },
          { label: "نقش ها", to: "/roles", permission: "roles.index" },
        ],
      },
      {
        type: "group",
        label: "کاربران",
        icon: "bx bx-user",
        permissionAny: ["users.index", "users.create"],
        children: [
          { label: "لیست کاربران", to: "/users", permission: "users.index" },
          { label: "ایجاد کاربر جدید", to: "/users/create", permission: "users.create" },
        ],
      },
      {
        type: "group",
        label: "سرویس وویپ",
        icon: "bx bx-phone",
        permissionAny: ["voip.outbound.index"],
        children: [
          {
            label: "تماس خروجی",
            to: "/voip/outbound-call-histories",
            permission: "voip.outbound.index",
          },
        ],
      },
    ],
    []
  );

  // ✅ اگر permissions هنوز نیومده، فقط آیتم‌های عمومی رو نشون بده
  const filteredMenu = useMemo(() => {
    if (!permissionsReady) {
      return menuItems.filter((x) => x.type === "item" && !x.permission);
    }

    return menuItems
      .map((item) => {
        if (item.type === "group") {
          const children = (item.children || []).filter(
            (ch) => !ch.permission || hasPermission(ch.permission)
          );

          const groupAllowed = item.permissionAny
            ? hasAnyPermission(item.permissionAny)
            : children.length > 0;

          if (!groupAllowed) return null;
          return { ...item, children };
        }

        if (item.permission && !hasPermission(item.permission)) return null;
        return item;
      })
      .filter(Boolean);
  }, [menuItems, permissionsReady, hasPermission, hasAnyPermission]);

  return (
    <React.Fragment>
      <SimpleBar
        className="h-100"
        // ✅ این ref به عنصر اسکرول واقعی وصل میشه
        scrollableNodeProps={{ ref: scrollRef }}
      >
        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            <li className="menu-title">{props.t("منو")}</li>

            {filteredMenu.map((item, idx) => {
              if (item.type === "item") {
                return (
                  <li key={`m-item-${idx}`}>
                    <Link to={item.to}>
                      <i className={item.icon}></i>
                      <span>{props.t(item.label)}</span>
                    </Link>
                  </li>
                );
              }

              return (
                <li key={`m-group-${idx}`}>
                  <Link to="/#" className="has-arrow">
                    <i className={item.icon}></i>
                    <span>{props.t(item.label)}</span>
                  </Link>

                  <ul className="sub-menu" aria-expanded="false">
                    {item.children?.map((ch, cIdx) => (
                      <Can key={`m-child-${idx}-${cIdx}`} permission={ch.permission}>
                        <li>
                          <Link to={ch.to}>{props.t(ch.label)}</Link>
                        </li>
                      </Can>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      </SimpleBar>
    </React.Fragment>
  );
};

SidebarContent.propTypes = {
  location: PropTypes.object,
  t: PropTypes.any,
};

export default withRouter(withTranslation()(SidebarContent));
