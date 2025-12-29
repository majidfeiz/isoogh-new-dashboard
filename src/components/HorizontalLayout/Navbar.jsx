import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { Row, Col, Collapse } from "reactstrap";
import { Link } from "react-router-dom";
import withRouter from "../Common/withRouter";
import classname from "classnames";

//i18n
import { withTranslation } from "react-i18next";

import { connect } from "react-redux";

const Navbar = (props) => {
  const [dashboard, setdashboard] = useState(false);
  const [ui, setui] = useState(false);
  const [app, setapp] = useState(false);
  const [email, setemail] = useState(false);
  const [ecommerce, setecommerce] = useState(false);
  const [crypto, setcrypto] = useState(false);
  const [project, setproject] = useState(false);
  const [task, settask] = useState(false);
  const [contact, setcontact] = useState(false);
  const [blog, setBlog] = useState(false);
  const [job, setJob] = useState(false);
  const [candidate, setCandidate] = useState(false);
  const [component, setcomponent] = useState(false);
  const [form, setform] = useState(false);
  const [table, settable] = useState(false);
  const [chart, setchart] = useState(false);
  const [icon, seticon] = useState(false);
  const [map, setmap] = useState(false);
  const [extra, setextra] = useState(false);
  const [invoice, setinvoice] = useState(false);
  const [auth, setauth] = useState(false);
  const [utility, setutility] = useState(false);

  useEffect(() => {
    var matchingMenuItem = null;
    var ul = document.getElementById("navigation");
    var items = ul.getElementsByTagName("a");
    removeActivation(items);
    for (var i = 0; i < items.length; ++i) {
      if (window.location.pathname === items[i].pathname) {
        matchingMenuItem = items[i];
        break;
      }
    }
    if (matchingMenuItem) {
      activateParentDropdown(matchingMenuItem);
    }
  });

  const removeActivation = (items) => {
    for (var i = 0; i < items.length; ++i) {
      var item = items[i];
      const parent = items[i].parentElement;
      if (item && item.classList.contains("active")) {
        item.classList.remove("active");
      }
      if (parent) {
        if (parent.classList.contains("active")) {
          parent.classList.remove("active");
        }
      }
    }
  };

  function activateParentDropdown(item) {
    item.classList.add("active");
    const parent = item.parentElement;
    if (parent) {
      parent.classList.add("active"); // li
      const parent2 = parent.parentElement;
      parent2.classList.add("active"); // li
      const parent3 = parent2.parentElement;
      if (parent3) {
        parent3.classList.add("active"); // li
        const parent4 = parent3.parentElement;
        if (parent4) {
          parent4.classList.add("active"); // li
          const parent5 = parent4.parentElement;
          if (parent5) {
            parent5.classList.add("active"); // li
            const parent6 = parent5.parentElement;
            if (parent6) {
              parent6.classList.add("active"); // li
            }
          }
        }
      }
    }
    return false;
  }

  return (
    <React.Fragment>
      <div className="topnav">
        <div className="container-fluid">
          <nav
            className="navbar navbar-light navbar-expand-lg topnav-menu"
            id="navigation"
          >
            <Collapse
              isOpen={props.leftMenu}
              className="navbar-collapse"
              id="topnav-menu-content"
            >
              <ul className="navbar-nav">
                <li className="nav-item dropdown">
                  <Link
                    className="nav-link  arrow-none"
                    onClick={(e) => {
                      e.preventDefault();
                      setdashboard(!dashboard);
                    }}
                    to="/dashboard"
                  >
                    <i className="bx bx-home-circle me-2"></i>
                    {props.t("Dashboard")} {props.menuOpen}
                    <div className="arrow-down"></div>
                  </Link>
                  <div
                    className={classname("dropdown-menu", { show: dashboard })}
                  >
                    <Link to="/dashboard" className="dropdown-item">
                      {props.t("پیش فرض")}
                    </Link>
                    <Link to="/dashboard-saas" className="dropdown-item">
                      {props.t("Sass")}
                    </Link>
                    <Link to="/dashboard-crypto" className="dropdown-item">
                      {props.t("رمز ارز")}
                    </Link>
                    <Link to="/blog" className="dropdown-item">
                      {props.t("وبلاگ")}
                    </Link>
                    <Link to="/dashboard-job" className="dropdown-item">
                      {props.t("شغل ها")}
                    </Link>
                  </div>
                </li>

                <li className="nav-item dropdown">
                  <Link
                    to="/#"
                    onClick={(e) => {
                      e.preventDefault();
                      setui(!ui);
                    }}
                    className="nav-link dropdown-toggle arrow-none"
                  >
                    <i className="bx bx-tone me-2"></i>
                    {props.t("عناصر رابط کاربری")}{" "}
                    <div className="arrow-down"></div>
                  </Link>
                  <div
                    className={classname(
                      "dropdown-menu mega-dropdown-menu dropdown-menu-left dropdown-mega-menu-xl",
                      { show: ui }
                    )}
                  >
                    <Row>
                      <Col lg={4}>
                        <div>
                          <Link to="/ui-alerts" className="dropdown-item">
                            {props.t("هشدار ها")}
                          </Link>
                          <Link to="/ui-buttons" className="dropdown-item">
                            {props.t("دکمه ها")}
                          </Link>
                          <Link to="/ui-cards" className="dropdown-item">
                            {props.t("کارت ها")}
                          </Link>
                          <Link to="/ui-carousel" className="dropdown-item">
                            {props.t("اسلایدر ها")}
                          </Link>
                          <Link to="/ui-dropdowns" className="dropdown-item">
                            {props.t("فهرست کشویی")}
                          </Link>
                          <Link to="/ui-grid" className="dropdown-item">
                            {props.t("شبکه بندی")}
                          </Link>
                          <Link to="/ui-images" className="dropdown-item">
                            {props.t("تصاویر")}
                          </Link>
                          <Link to="/ui-lightbox" className="dropdown-item">
                            {props.t("جعبه روشن")}
                          </Link>
                        </div>
                      </Col>
                      <Col lg={4}>
                        <div>
                          <Link to="/ui-modals" className="dropdown-item">
                            {props.t("مودال ها")}
                          </Link>
                          <Link to="/ui-offcanvas" className="dropdown-item">
                            {props.t("Offcanvas منو")}
                          </Link>
                          <Link to="/ui-rangeslider" className="dropdown-item">
                            {props.t("اسلایدر لغزنده")}
                          </Link>
                          <Link
                            to="/ui-session-timeout"
                            className="dropdown-item"
                          >
                            {props.t("زمان پایان جلسه")}
                          </Link>
                          <Link to="/ui-progressbars" className="dropdown-item">
                            {props.t("نوارهای پیشرفت")}
                          </Link>
                          <Link to="/ui-placeholders" className="dropdown-item">
                            {/* {props.t("Placeholders")} */}
                            انواع Placeholders
                          </Link>
                          {/* <Link to="/ui-sweet-alert" className="dropdown-item">
                              {props.t("Sweet-Alert")}
                            </Link> */}
                          <Link
                            to="/ui-tabs-accordions"
                            className="dropdown-item"
                          >
                            {/* {props.t("زبانه ها و آکاردئون ها")} */}
                            انواع تب و آکاردیون
                          </Link>
                        </div>
                      </Col>
                      <Col lg={4}>
                        <div>
                          <Link to="/ui-typography" className="dropdown-item">
                            {props.t("تایپوگرافی")}
                          </Link>
                          <Link to="/ui-toasts" className="dropdown-item">
                            {props.t("توست")}
                          </Link>
                          <Link to="/ui-video" className="dropdown-item">
                            {props.t("ویدیو")}
                          </Link>
                          <Link to="/ui-general" className="dropdown-item">
                            {props.t("عمومی")}
                          </Link>
                          <Link to="/ui-colors" className="dropdown-item">
                            {props.t("رنگ ها")}
                          </Link>
                          <Link to="/ui-rating" className="dropdown-item">
                            {props.t("رتبه بندی")}
                          </Link>
                          <Link
                            to="/ui-notifications"
                            className="dropdown-item"
                          >
                            {props.t("Notifications")}
                          </Link>
                          <Link to="/ui-utilities" className="dropdown-item">
                            {props.t("Utilities")}
                          </Link>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </li>

                <li className="nav-item dropdown">
                  <Link
                    to="/#"
                    onClick={(e) => {
                      e.preventDefault();
                      setapp(!app);
                    }}
                    className="nav-link z arrow-none"
                  >
                    <i className="bx bx-customize me-2"></i>
                    {props.t("برنامه ها")} <div className="arrow-down"></div>
                  </Link>
                  <div className={classname("dropdown-menu", { show: app })}>
                    <Link to="/calendar" className="dropdown-item">
                      {props.t("تقویم")}
                    </Link>
                    <Link to="/chat" className="dropdown-item">
                      {props.t("گفتگو")}
                    </Link>
                    <Link to="/apps-filemanager" className="dropdown-item">
                      {props.t("مدیریت فایل ها")}
                    </Link>
                    <div className="dropdown">
                      <Link
                        to="/#"
                        className="dropdown-item  arrow-none"
                        onClick={(e) => {
                          e.preventDefault();
                          setemail(!email);
                        }}
                      >
                        {props.t("ایمیل")} <div className="arrow-down"></div>
                      </Link>
                      <div
                        className={classname("dropdown-menu", { show: email })}
                      >
                        <Link to="/email-inbox" className="dropdown-item">
                          {props.t("صندوق ورودی")}
                        </Link>
                        <Link to="/email-read" className="dropdown-item">
                          {props.t("خواندن ایمیل")}
                        </Link>
                        <div className="dropdown">
                          <Link
                            className="dropdown-item  arrow-none"
                            to="/#"
                            onClick={(e) => {
                              e.preventDefault();
                              setemail(!email);
                            }}
                          >
                            <span key="t-email-templates">قالب ها</span>{" "}
                            <div className="arrow-down"></div>
                          </Link>
                          <div
                            className={classname("dropdown-menu", {
                              show: email,
                            })}
                          >
                            <Link
                              to="/email-template-basic"
                              className="dropdown-item"
                            >
                              {props.t("اقدام اساسی")}
                            </Link>
                            <Link
                              to="/email-template-alert"
                              className="dropdown-item"
                            >
                              {props.t("ایمیل هشدار")}
                            </Link>
                            <Link
                              to="/email-template-billing"
                              className="dropdown-item"
                            >
                              {props.t("ایمیل صورتحساب")}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="dropdown">
                      <Link
                        to="/#"
                        className="dropdown-item  arrow-none"
                        onClick={(e) => {
                          e.preventDefault();
                          setecommerce(!ecommerce);
                        }}
                      >
                        {props.t(" تجارت الکترونیک")}{" "}
                        <div className="arrow-down"></div>
                      </Link>
                      <div
                        className={classname("dropdown-menu", {
                          show: ecommerce,
                        })}
                      >
                        <Link
                          to="/ecommerce-products"
                          className="dropdown-item"
                        >
                          {props.t("محصولات")}
                        </Link>
                        <Link
                          to="/ecommerce-product-detail/1"
                          className="dropdown-item"
                        >
                          {props.t("جزئیات محصول")}
                        </Link>
                        <Link to="/ecommerce-orders" className="dropdown-item">
                          {props.t("سفارشات")}
                        </Link>
                        <Link
                          to="/ecommerce-customers"
                          className="dropdown-item"
                        >
                          {props.t("مشتریان")}
                        </Link>
                        <Link to="/ecommerce-cart" className="dropdown-item">
                          {props.t("سبد خرید")}
                        </Link>
                        <Link
                          to="/ecommerce-checkout"
                          className="dropdown-item"
                        >
                          {props.t("بررسی")}
                        </Link>
                        <Link to="/ecommerce-shops" className="dropdown-item">
                          {props.t("مغازه")}
                        </Link>
                        <Link
                          to="/ecommerce-add-product"
                          className="dropdown-item"
                        >
                          {props.t("افزودن محصول")}
                        </Link>
                      </div>
                    </div>

                    <div className="dropdown">
                      <Link
                        to="/#"
                        className="dropdown-item  arrow-none"
                        onClick={(e) => {
                          e.preventDefault();
                          setcrypto(!crypto);
                        }}
                      >
                        {props.t("رمز ارز")} <div className="arrow-down"></div>
                      </Link>
                      <div
                        className={classname("dropdown-menu", { show: crypto })}
                      >
                        <Link to="/crypto-wallet" className="dropdown-item">
                          {props.t("کیف پول")}
                        </Link>
                        <Link to="/crypto-buy-sell" className="dropdown-item">
                          {props.t("خرید / فروش")}
                        </Link>
                        <Link to="/crypto-exchange" className="dropdown-item">
                          {props.t("تبادل")}
                        </Link>
                        <Link to="/crypto-lending" className="dropdown-item">
                          {props.t("امانت دادن")}
                        </Link>
                        <Link to="/crypto-orders" className="dropdown-item">
                          {props.t("سفارشات")}
                        </Link>
                        <Link
                          to="/crypto-kyc-application"
                          className="dropdown-item"
                        >
                          {props.t("KYC برنامه")}
                        </Link>
                        <Link
                          to="/crypto-ico-landing"
                          className="dropdown-item"
                        >
                          {props.t("ICO لندینگ")}
                        </Link>
                      </div>
                    </div>

                    <div className="dropdown">
                      <Link
                        to="/#"
                        className="dropdown-item  arrow-none"
                        onClick={(e) => {
                          e.preventDefault();
                          setproject(!project);
                        }}
                      >
                        {props.t("پروژه ها")} <div className="arrow-down"></div>
                      </Link>
                      <div
                        className={classname("dropdown-menu", {
                          show: project,
                        })}
                      >
                        <Link to="/projects-grid" className="dropdown-item">
                          {props.t("شبکه بندی پروژه ها")}
                        </Link>
                        <Link to="/projects-list" className="dropdown-item">
                          {props.t("لیست پروژه ها")}
                        </Link>
                        <Link to="/projects-overview" className="dropdown-item">
                          {props.t("بررسی اجمالی پروژه")}
                        </Link>
                        <Link to="/projects-create" className="dropdown-item">
                          {props.t("ایجاد")}
                        </Link>
                      </div>
                    </div>
                    <div className="dropdown">
                      <Link
                        to="/#"
                        className="dropdown-item  arrow-none"
                        onClick={(e) => {
                          e.preventDefault();
                          settask(!task);
                        }}
                      >
                        {props.t("وظایف")} <div className="arrow-down"></div>
                      </Link>
                      <div
                        className={classname("dropdown-menu", { show: task })}
                      >
                        <Link to="/tasks-list" className="dropdown-item">
                          {props.t("لیست وظایف")}
                        </Link>
                        <Link to="/tasks-kanban" className="dropdown-item">
                          {props.t("وظایف کانبان")}
                        </Link>
                        <Link to="/tasks-create" className="dropdown-item">
                          {props.t("ایجاد وظیفه")}
                        </Link>
                      </div>
                    </div>
                    <div className="dropdown">
                      <Link
                        to="/#"
                        className="dropdown-item  arrow-none"
                        onClick={(e) => {
                          e.preventDefault();
                          setcontact(!contact);
                        }}
                      >
                        {props.t("مخاطبان")} <div className="arrow-down"></div>
                      </Link>
                      <div
                        className={classname("dropdown-menu", {
                          show: contact,
                        })}
                      >
                        <Link to="/contacts-grid" className="dropdown-item">
                          {props.t("شبکه بندی کاربران")}
                        </Link>
                        <Link to="/contacts-list" className="dropdown-item">
                          {props.t("لیست کاربران")}
                        </Link>
                        <Link to="/contacts-profile" className="dropdown-item">
                          {props.t("پروفایل")}
                        </Link>
                      </div>
                    </div>
                    <div className="dropdown">
                      <Link
                        to="/#"
                        className="dropdown-item  arrow-none"
                        onClick={(e) => {
                          e.preventDefault();
                          setBlog(!blog);
                        }}
                      >
                        {props.t("وبلاگ")} <div className="arrow-down" />
                      </Link>
                      <div
                        className={classname("dropdown-menu", {
                          show: blog,
                        })}
                      >
                        <Link to="/blog-list" className="dropdown-item">
                          {props.t("لیست وبلاگ")}
                        </Link>
                        <Link to="/blog-grid" className="dropdown-item">
                          {props.t("شبکه بندی ویلاگ")}
                        </Link>
                        <Link to="/blog-details" className="dropdown-item">
                          {props.t("جزئیات وبلاگ")}
                        </Link>
                      </div>
                    </div>

                    <div className="dropdown">
                      <Link
                        to="/#"
                        className="dropdown-item arrow-none"
                        onClick={(e) => {
                          e.preventDefault();
                          setJob(!job);
                        }}
                      >
                        {props.t("مشاغل")} <div className="arrow-down"></div>
                      </Link>
                      <div
                        className={classname("dropdown-menu", { show: job })}
                      >
                        <Link to="/job-list" className="dropdown-item">
                          {props.t("لیست مشاغل")}
                        </Link>
                        <Link to="/job-grid" className="dropdown-item">
                          {props.t("شبکه بندی مشاغل")}
                        </Link>
                        <Link to="/job-apply" className="dropdown-item">
                          {props.t("درخواست مشاغل")}
                        </Link>
                        <Link to="/job-details" className="dropdown-item">
                          {props.t("جزئیات مشاغل")}
                        </Link>
                        <Link to="/job-categories" className="dropdown-item">
                          {props.t("دسته بندی مشاغل")}
                        </Link>

                        <div className="dropdown">
                          <Link
                            className="dropdown-item dropdown-toggle arrow-none"
                            to="/#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCandidate(!candidate);
                            }}
                          >
                            <span key="t-candidate">نامزد ها</span>{" "}
                            <div className="arrow-down"></div>
                          </Link>
                          <div
                            className={classname("dropdown-menu", {
                              show: candidate,
                            })}
                          >
                            <Link
                              to="/candidate-list"
                              className="dropdown-item"
                            >
                              {props.t("لیست")}
                            </Link>
                            <Link
                              to="/candidate-overview"
                              className="dropdown-item"
                            >
                              {props.t("بررسی اجممالی")}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>

                <li className="nav-item dropdown">
                  <Link
                    to="/#"
                    className="nav-link  arrow-none"
                    onClick={(e) => {
                      e.preventDefault();
                      setcomponent(!component);
                    }}
                  >
                    <i className="bx bx-collection me-2"></i>
                    {props.t("اجزاء")} <div className="arrow-down"></div>
                  </Link>
                  <div
                    className={classname("dropdown-menu", { show: component })}
                  >
                    <div className="dropdown">
                      <Link
                        to="/#"
                        className="dropdown-item  arrow-none"
                        onClick={(e) => {
                          e.preventDefault();
                          setform(!form);
                        }}
                      >
                        {props.t("فرم ها  ")} <div className="arrow-down"></div>
                      </Link>
                      <div
                        className={classname("dropdown-menu", { show: form })}
                      >
                        <Link to="/form-elements" className="dropdown-item">
                          {props.t("عناصر فرم")}
                        </Link>
                        <Link to="/form-layouts" className="dropdown-item">
                          {props.t("چیدمان فرم")}
                        </Link>
                        <Link to="/form-validation" className="dropdown-item">
                          {props.t("اعتبار سنجی فرم")}
                        </Link>
                        <Link to="/form-advanced" className="dropdown-item">
                          {props.t("فرم پیشرفته")}
                        </Link>
                        <Link to="/form-editors" className="dropdown-item">
                          {props.t("ویرایشگر فرم ")}
                        </Link>
                        <Link to="/form-uploads" className="dropdown-item">
                          {props.t("فرم آپلود فایل")}{" "}
                        </Link>
                        <Link to="/form-repeater" className="dropdown-item">
                          {props.t("تکرار فرم")}
                        </Link>
                        <Link to="/form-wizard" className="dropdown-item">
                          {props.t("فرم ویزارد")}
                        </Link>
                        <Link to="/form-mask" className="dropdown-item">
                          {props.t("فرم ماسک")}
                        </Link>
                      </div>
                    </div>
                    <div className="dropdown">
                      <Link
                        to="/#"
                        className="dropdown-item  arrow-none"
                        onClick={(e) => {
                          e.preventDefault();
                          settable(!table);
                        }}
                      >
                        {props.t("جدول")} <div className="arrow-down"></div>
                      </Link>
                      <div
                        className={classname("dropdown-menu", { show: table })}
                      >
                        <Link to="/tables-basic" className="dropdown-item">
                          {props.t("جدول پایه")}
                        </Link>
                        <Link to="/tables-datatable" className="dropdown-item">
                          {props.t("جدول اطلاعات")}
                        </Link>
                        {/* <Link to="/tables-responsive" className="dropdown-item">
                          {props.t("Responsive Table")}
                        </Link> */}
                        {/* <Link to="/tables-dragndrop" className="dropdown-item">
                          {props.t("Drag & Drop Table")}
                        </Link> */}
                      </div>
                    </div>
                    <div className="dropdown">
                      <Link
                        to="/#"
                        className="dropdown-item  arrow-none"
                        onClick={(e) => {
                          e.preventDefault();
                          setchart(!chart);
                        }}
                      >
                        {props.t("نمودار ها")}{" "}
                        <div className="arrow-down"></div>
                      </Link>
                      <div
                        className={classname("dropdown-menu", { show: chart })}
                      >
                        <Link to="/apex-charts" className="dropdown-item">
                          {" "}
                          {props.t("Apex نمودار های")}
                        </Link>
                        <Link to="/chartjs-charts" className="dropdown-item">
                          {" "}
                          {props.t("Chartjs نمودار های")}
                        </Link>

                        <Link to="/charts-knob" className="dropdown-item">
                          {props.t("Knob نمودار های")}
                        </Link>
                        <Link to="/re-charts" className="dropdown-item">
                          {props.t("Re نمودار های")}
                        </Link>
                        <Link to="/sparkline-charts" className="dropdown-item">
                          {" "}
                          {props.t("Sparkline نمودار های")}
                        </Link>
                      </div>
                    </div>
                    <div className="dropdown">
                      <Link
                        to="/#"
                        className="dropdown-item  arrow-none"
                        onClick={(e) => {
                          e.preventDefault();
                          seticon(!icon);
                        }}
                      >
                        {props.t("آیکون ها")} <div className="arrow-down"></div>
                      </Link>
                      <div
                        className={classname("dropdown-menu", { show: icon })}
                      >
                        <Link to="/icons-boxicons" className="dropdown-item">
                          {props.t("Boxicons")}
                        </Link>
                        <Link
                          to="/icons-materialdesign"
                          className="dropdown-item"
                        >
                          {props.t("Material Design")}
                        </Link>
                        <Link to="/icons-dripicons" className="dropdown-item">
                          {props.t("Dripicons")}
                        </Link>
                        <Link to="/icons-fontawesome" className="dropdown-item">
                          {props.t("Font awesome")}{" "}
                        </Link>
                      </div>
                    </div>
                    <div className="dropdown">
                      <Link
                        to="/#"
                        className="dropdown-item  arrow-none"
                        onClick={(e) => {
                          e.preventDefault();
                          setmap(!map);
                        }}
                      >
                        {props.t("نقشه ها")} <div className="arrow-down"></div>
                      </Link>
                      <div
                        className={classname("dropdown-menu", { show: map })}
                      >
                        <Link to="/maps-google" className="dropdown-item">
                          {props.t("نقشه ی گوگل")}{" "}
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>

                <li className="nav-item dropdown">
                  <Link
                    className="nav-link  arrow-none"
                    to="/#"
                    onClick={(e) => {
                      e.preventDefault();
                      setextra(!extra);
                    }}
                  >
                    <i className="bx bx-file me-2"></i>
                    {props.t("صفحات اضافی")} <div className="arrow-down"></div>
                  </Link>
                  <div className={classname("dropdown-menu", { show: extra })}>
                    <div className="dropdown">
                      <Link
                        to="/#"
                        className="dropdown-item  arrow-none"
                        onClick={(e) => {
                          e.preventDefault();
                          setinvoice(!invoice);
                        }}
                      >
                        {props.t("فاکتورها")} <div className="arrow-down"></div>
                      </Link>
                      <div
                        className={classname("dropdown-menu", {
                          show: invoice,
                        })}
                      >
                        <Link to="/invoices-list" className="dropdown-item">
                          {props.t("لیست فاکتورها")}
                        </Link>
                        <Link to="/invoices-detail" className="dropdown-item">
                          {props.t("جزئیات فاکتورها")}
                        </Link>
                      </div>
                    </div>

                    <div className="dropdown">
                      <Link
                        to="/#"
                        className="dropdown-item  arrow-none"
                        onClick={(e) => {
                          e.preventDefault();
                          setauth(!auth);
                        }}
                      >
                        {props.t("احراز هویت")}{" "}
                        <div className="arrow-down"></div>
                      </Link>
                      <div
                        className={classname("dropdown-menu", { show: auth })}
                      >
                        <Link to="/pages-login" className="dropdown-item">
                          {props.t("ورود")}
                        </Link>
                        <Link to="/pages-login-2" className="dropdown-item">
                          {props.t("ورود 2")}
                        </Link>
                        <Link to="/pages-register" className="dropdown-item">
                          {props.t("ثبت نام")}
                        </Link>
                        <Link to="/pages-register-2" className="dropdown-item">
                          {props.t("ثبت نام 2")}
                        </Link>
                        <Link to="/page-recoverpw" className="dropdown-item">
                          {props.t("بازیابی رمز عبور")}
                        </Link>
                        <Link to="/page-recoverpw-2" className="dropdown-item">
                          {props.t("بازیابی رمز عبور 2")}
                        </Link>
                        <Link to="/auth-lock-screen" className="dropdown-item">
                          {props.t("صفحه قفل")}
                        </Link>
                        <Link
                          to="/auth-lock-screen-2"
                          className="dropdown-item"
                        >
                          {props.t("صفحه قفل 2")}
                        </Link>
                        <Link to="/page-confirm-mail" className="dropdown-item">
                          {props.t("تایید ایمیل")}
                        </Link>
                        <Link
                          to="/page-confirm-mail-2"
                          className="dropdown-item"
                        >
                          {props.t("تایید ایمیل 2")}
                        </Link>
                        <Link
                          to="/auth-email-verification"
                          className="dropdown-item"
                        >
                          {props.t("تایید ایمیل")}
                        </Link>
                        <Link
                          to="/auth-email-verification-2"
                          className="dropdown-item"
                        >
                          {props.t("تایید ایمیل 2")}
                        </Link>
                        <Link
                          to="/auth-two-step-verification"
                          className="dropdown-item"
                        >
                          {props.t("تایید هویت دو مرحله ای")}
                        </Link>
                        <Link
                          to="/auth-two-step-verification-2"
                          className="dropdown-item"
                        >
                          {props.t("تایید هویت دو مرحله ای 2")}
                        </Link>
                      </div>
                    </div>

                    <div className="dropdown">
                      <Link
                        className="dropdown-item  arrow-none"
                        to="/#"
                        onClick={(e) => {
                          e.preventDefault();
                          setutility(!utility);
                        }}
                      >
                        {props.t("سودمند")} <div className="arrow-down"></div>
                      </Link>
                      <div
                        className={classname("dropdown-menu", {
                          show: utility,
                        })}
                      >
                        <Link to="/pages-starter" className="dropdown-item">
                          {props.t("صفحه ی شروع")}
                        </Link>
                        <Link to="/pages-maintenance" className="dropdown-item">
                          {props.t("نگهداری")}
                        </Link>
                        <Link to="/pages-comingsoon" className="dropdown-item">
                          {props.t("به زودی")}
                        </Link>
                        <Link to="/pages-timeline" className="dropdown-item">
                          {props.t("خط زمانی")}
                        </Link>
                        <Link to="/pages-faqs" className="dropdown-item">
                          {props.t("سوالات متداول")}
                        </Link>
                        <Link to="/pages-pricing" className="dropdown-item">
                          {props.t("قیمت گذاری")}
                        </Link>
                        <Link to="/pages-404" className="dropdown-item">
                          {props.t("ارور 404")}
                        </Link>
                        <Link to="/pages-500" className="dropdown-item">
                          {props.t("ارور 500")}
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </Collapse>
          </nav>
        </div>
      </div>
    </React.Fragment>
  );
};

Navbar.propTypes = {
  leftMenu: PropTypes.any,
  location: PropTypes.any,
  menuOpen: PropTypes.any,
  t: PropTypes.any,
};

const mapStatetoProps = (state) => {
  const { leftMenu } = state.Layout;
  return { leftMenu };
};

export default withRouter(
  connect(mapStatetoProps, {})(withTranslation()(Navbar))
);
