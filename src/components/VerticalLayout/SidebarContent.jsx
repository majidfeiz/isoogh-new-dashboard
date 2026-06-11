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

  // normalize permissions از /auth/me: می‌تونه string[] یا object[] یا effectivePermissions باشه
  const permissionList = useMemo(() => {
    if (!auth) return [];

    const toStrings = (list) =>
      (list || []).map((p) => (typeof p === "string" ? p.trim() : p?.name?.trim())).filter(Boolean);

    // همه منابع ممکن را جمع کن (context state + user object)
    const sources = [
      auth.permissions,
      auth.user?.effectivePermissions,
      auth.user?.permissions,
    ];

    const merged = new Set();
    for (const src of sources) {
      if (Array.isArray(src)) {
        toStrings(src).forEach((p) => merged.add(p));
      }
    }

    return Array.from(merged);
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
    permissionList.length > 0 ||
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
        label: "مدیران",
        icon: "bx bx-id-card",
        permissionAny: ["managers.index", "managers.create"],
        children: [
          { label: "لیست مدیران", to: "/managers", permission: "managers.index" },
          { label: "ایجاد مدیر جدید", to: "/managers/create", permission: "managers.create" },
        ],
      },
      {
        type: "group",
        label: "مشاوران",
        icon: "bx bx-user-voice",
        permissionAny: ["advisers.index"],
        children: [
          { label: "لیست مشاوران", to: "/advisers", permission: "advisers.index" },
        ],
      },
      {
        type: "group",
        label: "دانش‌آموزان",
        icon: "bx bx-book-open",
        permissionAny: ["students.index", "students.create"],
        children: [
          { label: "لیست دانش‌آموزان", to: "/students", permission: "students.index" },
          { label: "ایجاد دانش‌آموز جدید", to: "/students/create", permission: "students.create" },
        ],
      },
      {
        type: "group",
        label: "پایه‌ها",
        icon: "bx bx-layer",
        permissionAny: ["grades.index", "grades.create"],
        children: [
          { label: "لیست پایه‌ها", to: "/grades", permission: "grades.index" },
          { label: "ایجاد پایه جدید", to: "/grades/create", permission: "grades.create" },
        ],
      },
      {
        type: "group",
        label: "تگ‌ها",
        icon: "bx bx-purchase-tag-alt",
        permissionAny: ["parent-tags.index", "parent-tags.create"],
        children: [
          { label: "لیست تگ‌ها", to: "/parent-tags", permission: "parent-tags.index" },
          { label: "ایجاد تگ جدید", to: "/parent-tags/create", permission: "parent-tags.create" },
        ],
      },
      {
        type: "group",
        label: "مدارس",
        icon: "bx bxs-school",
        permissionAny: ["schools.index", "schools.create"],
        children: [
          { label: "لیست مدارس", to: "/schools", permission: "schools.index" },
          { label: "ایجاد مدرسه جدید", to: "/schools/create", permission: "schools.create" },
        ],
      },
      {
        type: "group",
        label: "فرم تماس",
        icon: "bx bx-support",
        permissionAny: ["support-forms.index", "support-forms.create"],
        children: [
          {
            label: "لیست فرم‌های تماس",
            to: "/support-forms",
            permission: "support-forms.index",
          },
          {
            label: "ایجاد فرم تماس",
            to: "/support-forms/create",
            permission: "support-forms.create",
          },
        ],
      },
      {
        type: "group",
        label: "فایل‌ها",
        icon: "bx bx-file",
        permissionAny: ["files.index", "files.create"],
        children: [
          {
            label: "لیست فایل‌ها",
            to: "/files",
            permission: "files.index",
          },
          {
            label: "ایجاد فایل",
            to: "/files/create",
            permission: "files.create",
          },
        ],
      },
      {
        type: "group",
        label: "اعلانات",
        icon: "bx bx-bell",
        permissionAny: ["notifications.index", "notifications.send", "notifications.broadcast"],
        children: [
          {
            label: "همه اعلانات",
            to: "/notifications",
            permission: "notifications.index",
          },
          {
            label: "ارسال پیام",
            to: "/notifications/compose",
            permission: "notifications.send",
          },
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
          {
            label: "تماس خروجی آنلاین",
            to: "/voip/outbound-call-histories/online",
            permission: "voip.outbound.index",
          },
        ],
      },
      {
        type: "group",
        label: "وب‌هوک تماس",
        icon: "bx bx-link-external",
        permissionAny: ["voip-webhooks.index", "voip-webhooks.create", "voip-webhooks.logs"],
        children: [
          {
            label: "لیست وب‌هوک‌ها",
            to: "/voip-webhooks",
            permission: "voip-webhooks.index",
          },
          {
            label: "لاگ ارسال‌ها",
            to: "/voip-webhooks/logs",
            permission: "voip-webhooks.logs",
          },
        ],
      },
      {
        type: "group",
        label: "API خارجی",
        icon: "bx bx-key",
        permissionAny: ["external-api.index", "external-api.create", "external-api.logs"],
        children: [
          {
            label: "کلاینت‌های API",
            to: "/external-api-clients",
            permission: "external-api.index",
          },
          {
            label: "لاگ درخواست‌ها",
            to: "/external-api-clients/logs",
            permission: "external-api.logs",
          },
          {
            label: "مستندات",
            to: "/external-api-clients/docs",
            permission: "external-api.index",
          },
        ],
      },
      {
        type: "group",
        label: "تماس مشاوران",
        icon: "bx bx-headphone",
        permissionAny: ["adviser-portal.schools.index"],
        children: [
          {
            label: "مجموعه‌ها",
            to: "/adviser-calls",
            permission: "adviser-portal.schools.index",
          },
          {
            label: "لاگ تماس‌های من",
            to: "/adviser-calls/logs",
            permission: "adviser-portal.schools.index",
          },
          {
            label: "آمار",
            to: "/adviser-calls/stats",
            permission: "adviser-portal.schools.index",
          },
        ],
      },
      {
        type: "group",
        label: "سر مشاور",
        icon: "bx bx-crown",
        permissionAny: [
          "super-adviser-portal.schools.index",
          "super-adviser-portal.advisers.index",
          "super-adviser-portal.support-forms.index",
          "super-adviser-portal.students.index",
          "super-adviser-portal.performance-report.index",
          "super-adviser-portal.monitoring.index",
          "super-adviser-portal.salary.index",
          "super-adviser-portal.answer-sheet.index",
        ],
        children: [
          {
            label: "مدارس",
            to: "/super-adviser-portal/schools",
            permission: "super-adviser-portal.schools.index",
          },
          {
            label: "مشاوران",
            to: "/super-adviser-portal/advisers",
            permission: "super-adviser-portal.advisers.index",
          },
          {
            label: "فرم‌های تماس",
            to: "/super-adviser-portal/support-forms",
            permission: "super-adviser-portal.support-forms.index",
          },
          {
            label: "دانش‌آموزان",
            to: "/super-adviser-portal/students",
            permission: "super-adviser-portal.students.index",
          },
          {
            label: "گزارش عملکرد",
            to: "/super-adviser-portal/performance-report",
            permission: "super-adviser-portal.performance-report.index",
          },
          {
            label: "نظارت",
            to: "/super-adviser-portal/monitoring",
            permission: "super-adviser-portal.monitoring.index",
          },
          {
            label: "حقوق",
            to: "/super-adviser-portal/salary",
            permission: "super-adviser-portal.salary.index",
          },
          {
            label: "پاسخنامه فرم‌ها",
            to: "/super-adviser-portal/support-forms",
            permission: "super-adviser-portal.answer-sheet.index",
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

  // نگه داشتن instance در ref تا dispose همیشه درست انجام بشه
  const menuInstanceRef = useRef(null);

  // MetisMenu فقط وقتی ساختار منو عوض میشه (filteredMenu) init میشه
  useEffect(() => {
    // setTimeout(0) ضروری است: React DOM را commit می‌کند، بعد MetisMenu bind می‌کند
    // بدون این تاخیر، در render بعد از login آخرین آیتم‌ها bind نمی‌شوند
    const timer = setTimeout(() => {
      const ul = document.getElementById("side-menu");
      if (!ul) return;

      if (menuInstanceRef.current?.dispose) {
        try { menuInstanceRef.current.dispose(); } catch {}
        menuInstanceRef.current = null;
      }

      try {
        menuInstanceRef.current = new MetisMenu("#side-menu");
      } catch (e) {
        console.error("MetisMenu init error:", e);
      }

      activeMenu();
    }, 0);

    return () => clearTimeout(timer);
  }, [filteredMenu]); // eslint-disable-line react-hooks/exhaustive-deps

  // active item رو روی هر navigation آپدیت کن بدون re-init کردن MetisMenu
  useEffect(() => {
    activeMenu();
  }, [activeMenu]);

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
