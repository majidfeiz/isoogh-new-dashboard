import React, { useState } from "react"

import {
  Container,
  Row,
  Col,
  Table,
  Input,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Card,
  Form,
  FormGroup,
  Label,
  CardBody,
  CardTitle,
} from "reactstrap"
import Select from "react-select"
import { Link } from "react-router-dom"

import classnames from "classnames"

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb"

//Import Images
import img1 from "../../assets/images/product/img-1.png"
import img7 from "../../assets/images/product/img-7.png"

// PatternFormat
import { PatternFormat } from "react-number-format";

const optionGroup = [
  {
    label: "پیک نیک",
    options: [
      { label: "سس خردل", value: "Mustard" },
      { label: "سس گوجه", value: "Ketchup" },
      { label: "ترشی", value: "Relish" },
    ],
  },
  {
    label: "چادر زدن",
    options: [
      { label: "چادر", value: "Tent" },
      { label: "چراغ قوه", value: "Flashlight" },
      { label: "دستمال توالت", value: "Toilet Paper" },
    ],
  },
];

const orderSummary = [
  {
    id: 1,
    img: img1,
    productTitle: "تی شرت نیم آستین ",
    price: 450,
    qty: 1,
  },
  { id: 2, img: img7, productTitle: "هدفون بی سیم", price: 225, qty: 1 },
];

const EcommerceCheckout = () => {

  //meta title
  document.title = "Checkout | Skote - قالب مدیریتی و داشبورد Vite React ";

  const [activeTab, setactiveTab] = useState("1")
  const [selectedGroup, setselectedGroup] = useState(null)

  function handleSelectGroup(selectedGroup) {
    setselectedGroup(selectedGroup)
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumb */}
          <Breadcrumbs title="تجارت الکترونیک" breadcrumbItem="وارسی" />

          <div className="checkout-tabs">
            <Row>
              <Col xl="2" sm="3">
                <Nav className="flex-column" pills>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "1" })}
                      onClick={() => {
                        setactiveTab("1");
                      }}
                    >
                      <i className="bx bxs-truck d-block check-nav-icon mt-4 mb-2" />
                      <p className="fw-bold mb-4">اطلاعات حمل و نقل</p>
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "2" })}
                      onClick={() => {
                        setactiveTab("2");
                      }}
                    >
                      <i className="bx bx-money d-block check-nav-icon mt-4 mb-2" />
                      <p className="fw-bold mb-4">اطلاعات پرداخت</p>
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "3" })}
                      onClick={() => {
                        setactiveTab("3");
                      }}
                    >
                      <i className="bx bx-badge-check d-block check-nav-icon mt-4 mb-2" />
                      <p className="fw-bold mb-4">تائیدیه</p>
                    </NavLink>
                  </NavItem>
                </Nav>
              </Col>
              <Col xl="10" sm="9">
                <Card>
                  <CardBody>
                    <TabContent activeTab={activeTab}>
                      <TabPane tabId="1">
                        <div>
                          <CardTitle>اطلاعات حمل و نقل</CardTitle>
                          <p className="card-title-desc">
                            تمام اطلاعات زیر را پر کنید
                          </p>
                          <Form>
                            <FormGroup className="mb-4" row>
                              <Label
                                htmlFor="billing-name"
                                md="2"
                                className="col-form-label"
                              >
                                نام
                              </Label>
                              <Col md="10">
                                <Input
                                  type="text"
                                  className="form-control"
                                  id="billing-name"
                                  placeholder="نام خود را وارد کنید"
                                />
                              </Col>
                            </FormGroup>
                            <FormGroup className="mb-4" row>
                              <Label
                                htmlFor="billing-email-address"
                                md="2"
                                className="col-form-label"
                              >
                                آدرس ایمیل
                              </Label>
                              <Col md="10">
                                <Input
                                  type="email"
                                  className="form-control"
                                  id="billing-email-address"
                                  placeholder="ایمیل خود را وارد کنید"
                                />
                              </Col>
                            </FormGroup>
                            <FormGroup className="mb-4" row>
                              <Label
                                htmlFor="billing-phone"
                                md="2"
                                className="col-form-label"
                              >
                                تلفن همراه
                              </Label>
                              <Col md={10}>
                                <PatternFormat
                                  className="form-control"
                                  name="phone"
                                  placeholder="درج شماره تلفن"
                                  format="###-###-####"
                                />
                                {/* <input
                                  type="text"
                                  className="form-control"
                                  id="billing-phone"
                                  placeholder="Enter your Phone no."
                                /> */}
                              </Col>
                            </FormGroup>
                            <FormGroup className="mb-4" row>
                              <Label
                                htmlFor="billing-address"
                                md="2"
                                className="col-form-label"
                              >
                                آدرس
                              </Label>
                              <Col md="10">
                                <textarea
                                  className="form-control"
                                  id="billing-address"
                                  rows="3"
                                  placeholder="وارد کردن آدرس"
                                />
                              </Col>
                            </FormGroup>

                            <FormGroup className="select2-container mb-4" row>
                              <Label md="2" className="col-form-label">
                                کشور
                              </Label>
                              <Col md="10">
                                <select
                                  className="form-control select2"
                                  title="Country"
                                >
                                  <option value="0">انتخاب کشور</option>
                                  <option value="AF">افغانستان</option>
                                  <option value="AL">آلبانی</option>
                                  <option value="DZ">الجزایر</option>
                                  <option value="AS">ساموآی آمریکایی</option>
                                  <option value="AD">آندورا</option>
                                  <option value="AO">آنگولا</option>
                                  <option value="AI">آنگویلا</option>
                                  <option value="AQ">جنوبگان</option>
                                  <option value="AR">آرژانتین</option>
                                  <option value="AM">ارمنستان</option>
                                  <option value="AW">آروبا</option>
                                  <option value="AU">استرالیا</option>
                                  <option value="AT">اتریش</option>
                                  <option value="AZ">آذربایجان</option>
                                  <option value="BS">باهاما</option>
                                  <option value="BH">بحرین</option>
                                  <option value="BD">بنگلادش</option>
                                  <option value="BB">باربادوس</option>
                                  <option value="BY">بلاروس</option>
                                  <option value="BE">بلژیک</option>
                                  <option value="BZ">برزیل</option>
                                  <option value="BJ">بنین</option>
                                  <option value="BM">برمودا</option>
                                  <option value="BT">بوتان</option>
                                  <option value="BO">بولیوی</option>
                                  <option value="BW">بوتسوانا</option>
                                  <option value="BV">جزیره بووه</option>
                                  <option value="BR">برزیل</option>
                                  <option value="BN">برونئی دارالسلام</option>
                                  <option value="BG">بلغارستان</option>
                                  <option value="BF">بورکینافاسو</option>
                                  <option value="BI">بوروندی</option>
                                  <option value="KH">کامبوج</option>
                                  <option value="CM">کامرون</option>
                                  <option value="CA">کانادا</option>
                                  <option value="CV">کیپ ورد</option>
                                  <option value="KY">جزایر کیمن</option>
                                  <option value="CF">
                                    جمهوری آفریقای مرکزی
                                  </option>
                                  <option value="TD">چاد</option>
                                  <option value="CL">شیلی</option>
                                  <option value="CN">چین</option>
                                  <option value="CX">جزیره کریسمس</option>
                                  <option value="CC">
                                    جزایر کوکوس (کیلینگ)
                                  </option>
                                  <option value="CO">کلمبیا</option>
                                  <option value="KM">کومور</option>
                                  <option value="CG">کنگو</option>
                                  <option value="CK">جزایر کوک</option>
                                  <option value="CR">کاستاریکا</option>
                                  <option value="CI">کوت دی</option>
                                  <option value="HR">کرواسی </option>
                                  <option value="CU">کوبا</option>
                                  <option value="CY">قبرس</option>
                                  <option value="CZ">جمهوری چک</option>
                                  <option value="DK">دانمارک</option>
                                  <option value="DJ">جیبوتی</option>
                                  <option value="DM">دومینیکا</option>
                                  <option value="DO">جمهوری دومینیکن</option>
                                  <option value="EC">اکوادور</option>
                                  <option value="EG">مصر</option>
                                  <option value="SV">السالوادور</option>
                                  <option value="GQ">گینه استوایی</option>
                                  <option value="ER">اریتره</option>
                                  <option value="EE">استونی</option>
                                  <option value="ET">اتیوپی</option>
                                  <option value="FK">
                                    جزایر فالکلند (مالویناس)
                                  </option>
                                  <option value="FO">جزایر فارو</option>
                                  <option value="FJ">فیجی</option>
                                  <option value="FI">فنلاند</option>
                                  <option value="FR">فرانسه</option>
                                  <option value="GF">گویان فرانسه</option>
                                  <option value="PF">پلینزی فرانسه</option>
                                  <option value="GA">گابن</option>
                                  <option value="GM">گامبیا</option>
                                  <option value="GE">گرجستان</option>
                                  <option value="DE">آلمان</option>
                                  <option value="GH">غنا</option>
                                  <option value="GI">جبل الطارق</option>
                                  <option value="GR">یونان</option>
                                  <option value="GL">گرینلند</option>
                                  <option value="GD">گرانادا</option>
                                  <option value="GP">گوادلوپ</option>
                                  <option value="GU">گوام</option>
                                  <option value="GT">گواتمالا</option>
                                  <option value="GN">گینه</option>
                                  <option value="GW">گینه بیسائو</option>
                                  <option value="GY">گویان</option>
                                  <option value="HT">هائیتی</option>
                                  <option value="HN">هندوراس</option>
                                  <option value="HK">هنگ کنگ</option>
                                  <option value="HU">مجارستان</option>
                                  <option value="IS">ایسلند</option>
                                  <option value="IN">هندوستان</option>
                                  <option value="ID">اندونزی</option>
                                  <option value="IQ">عراق</option>
                                  <option value="IE">ایرلند</option>
                                  <option value="IL">اسرائيل</option>
                                  <option value="IT">ایتالیا</option>
                                  <option value="JM">جامائیکا</option>
                                  <option value="JP">ژاپن</option>
                                  <option value="JO">جردن</option>
                                  <option value="KZ">قزاقستان</option>
                                  <option value="KE">کنیا</option>
                                  <option value="KI">کیریباتی</option>
                                  <option value="KR">جمهوری کره</option>
                                  <option value="KW">کویت</option>
                                  <option value="KG">قرقیزستان</option>
                                  <option value="LV">لتونی</option>
                                  <option value="LB">لبنان</option>
                                  <option value="LS">لسوتو</option>
                                  <option value="LR">لیبریا</option>
                                  <option value="LY">جماهیریه عربی لیبی</option>
                                  <option value="LI">لیختن اشتاین</option>
                                  <option value="LT">لیتوانی</option>
                                  <option value="LU">لوکزامبورگ</option>
                                  <option value="MO">ماکائو</option>
                                  <option value="MG">ماداگاسکار</option>
                                  <option value="MW">مالاوی</option>
                                  <option value="MY">مالزی</option>
                                  <option value="MV">مالدیو</option>
                                  <option value="ML">مالی</option>
                                  <option value="MT">مالت</option>
                                  <option value="MH">جزایر مارشال</option>
                                  <option value="MQ">مارتینیک</option>
                                  <option value="MR">موریتانی</option>
                                  <option value="MU">موریس</option>
                                  <option value="YT">مایوت</option>
                                  <option value="MX">مکزیک</option>
                                  <option value="MD">مولداوی، جمهوری</option>
                                  <option value="MC">موناکو</option>
                                  <option value="MN">مغولستان</option>
                                  <option value="MS">مونتسرات</option>
                                  <option value="MA">مراکش</option>
                                  <option value="MZ">موزامبیک</option>
                                  <option value="MM">میانمار</option>
                                  <option value="NA">نامیبیا</option>
                                  <option value="NR">نائورو</option>
                                  <option value="NP">نپال</option>
                                  <option value="NL">هلند</option>
                                  <option value="AN">آنتیل هلند</option>
                                  <option value="NC">کالدونیای جدید</option>
                                  <option value="NZ">نیوزلند</option>
                                  <option value="NI">نیکاراگوئه</option>
                                  <option value="NE">نیجر</option>
                                  <option value="NG">نیجریه</option>
                                  <option value="NU">نیوئه</option>
                                  <option value="NF">جزیره نورفولک</option>
                                  <option value="MP">
                                    جزایر ماریانای شمالی
                                  </option>
                                  <option value="NO">نروژ</option>
                                  <option value="OM">عمان</option>
                                  <option value="PW">پالائو</option>
                                  <option value="PA">پاپوآ گینه نو</option>
                                  <option value="PG">پاپوآ گینه نو</option>
                                  <option value="PY">پاراگوئه</option>
                                  <option value="PE">پرو</option>
                                  <option value="PH">فیلیپین</option>
                                  <option value="PN">پیتکرن</option>
                                  <option value="PL">لهستان</option>
                                  <option value="PT">پرتغال</option>
                                  <option value="PR">پوئرو ریکو</option>
                                  <option value="QA">قطر</option>
                                  <option value="RE">تجدید دیدار</option>
                                  <option value="RO">رومانی</option>
                                  <option value="RU">فدراسیون روسیه</option>
                                  <option value="RW">رواندا</option>
                                  <option value="KN">سنت کیتس و نویس</option>
                                  <option value="LC">سنت لوسیا</option>
                                  <option value="WS">ساموآ</option>
                                  <option value="SM">سن مارینو</option>
                                  <option value="ST">سائوتومه و پرنسیپ</option>
                                  <option value="SA">عربستان سعودی</option>
                                  <option value="SN">سنگال</option>
                                  <option value="SC">سیشل</option>
                                  <option value="SL">سیرا لئون</option>
                                  <option value="SG">سنگاپور</option>
                                  <option value="SK">
                                    اسلواکی (جمهوری اسلواکی)
                                  </option>
                                  <option value="SI">اسلوونی</option>
                                  <option value="SB">جزایر سلیمان</option>
                                  <option value="SO">سومالی</option>
                                  <option value="ZA">آفریقای جنوبی</option>
                                  <option value="ES">اسپانیا</option>
                                  <option value="LK">سری لانکا</option>
                                  <option value="SH">سنت هلنا</option>
                                  <option value="PM">سنت پیر و میکلون</option>
                                  <option value="SD">سودان</option>
                                  <option value="SR">سورینام</option>
                                  <option value="SZ">سوازیلند</option>
                                  <option value="SE">سوئد</option>
                                  <option value="CH">سوئیس</option>
                                  <option value="SY">جمهوری عربی سوریه</option>
                                  <option value="TW">تایوان، استان چین</option>
                                  <option value="TJ">تاجیکستان</option>
                                  <option value="TZ">
                                    تانزانیا، جمهوری متحده
                                  </option>
                                  <option value="TH">تایلند</option>
                                  <option value="TG">توگو</option>
                                  <option value="TK">توکلائو</option>
                                  <option value="TO">تونگا</option>
                                  <option value="TT">ترینیداد و توباگو</option>
                                  <option value="TN">تونس</option>
                                  <option value="TR">ترکیه</option>
                                  <option value="TM">ترکمنستان</option>
                                  <option value="TC">
                                    جزایر تورکس و کایکوس
                                  </option>
                                  <option value="TV">تووالو</option>
                                  <option value="UG">اوگاندا</option>
                                  <option value="UA">اوکراین</option>
                                  <option value="AE">امارات متحده عربی</option>
                                  <option value="GB">انگلستان</option>
                                  <option value="US">ایالات متحده</option>
                                  <option value="UY">اروگوئه</option>
                                  <option value="UZ">ازبکستان</option>
                                  <option value="VU">وانواتو</option>
                                  <option value="VE">ونزوئلا</option>
                                  <option value="VN">ویتنام</option>
                                  <option value="VG">
                                    جزایر ویرجین (بریتانیا)
                                  </option>
                                  <option value="VI">
                                    جزایر ویرجین (ایالات متحده آمریکا)
                                  </option>
                                  <option value="WF">
                                    جزایر والیس و فوتونا
                                  </option>
                                  <option value="EH">صحرای غربی</option>
                                  <option value="YE">یمن</option>
                                  <option value="ZM">زامبیا</option>
                                  <option value="ZW">زیمبابوه</option>
                                </select>
                              </Col>
                            </FormGroup>

                            <FormGroup className="select2-container mb-4" row>
                              <Label md="2" className="col-form-label">
                                استان
                              </Label>
                              <Col md="10">
                                <Select
                                  value={selectedGroup}
                                  onChange={(s) => {
                                    handleSelectGroup(s);
                                  }}
                                  options={optionGroup}
                                  placeholder="انتخاب استان"
                                  classNamePrefix="select2-selection"
                                />
                              </Col>
                            </FormGroup>
                            <FormGroup className="mb-0" row>
                              <Label
                                htmlFor="example-textarea"
                                md="2"
                                className="col-form-label"
                              >
                                نکات سفارش:
                              </Label>
                              <Col md="10">
                                <textarea
                                  className="form-control"
                                  id="example-textarea"
                                  rows="3"
                                  placeholder="نوشتن یادداشت ... "
                                />
                              </Col>
                            </FormGroup>
                          </Form>
                        </div>
                      </TabPane>
                      <TabPane
                        tabId="2"
                        id="v-pills-payment"
                        role="tabpanel"
                        aria-labelledby="v-pills-payment-tab"
                      >
                        <div>
                          <CardTitle>اطلاعات پرداخت</CardTitle>
                          <p className="card-title-desc">
                            تمام اطلاعات زیر را پر کنید
                          </p>
                          <div>
                            <div className="form-check form-check-inline font-size-16">
                              <Input
                                type="radio"
                                value="1"
                                id="customRadioInline1"
                                name="customRadioInline1"
                                className="form-check-input"
                                defaultChecked
                              />
                              <Label
                                className="form-check-label font-size-13"
                                htmlFor="customRadioInline1"
                              >
                                <i className="fab fa-cc-mastercard me-1 font-size-20 align-top" />{" "}
                                کارت اعتباری / بدهی
                              </Label>
                            </div>
                            <div className="form-check form-check-inline font-size-16">
                              <Input
                                type="radio"
                                value="2"
                                id="customRadioInline2"
                                name="customRadioInline1"
                                className="form-check-input"
                              />
                              <Label
                                className="form-check-label font-size-13"
                                htmlFor="customRadioInline2"
                              >
                                <i className="fab fa-cc-paypal me-1 font-size-20 align-top" />{" "}
                                پی پال
                              </Label>
                            </div>
                            <div className="form-check form-check-inline font-size-16">
                              <Input
                                type="radio"
                                value="3"
                                id="customRadioInline3"
                                name="customRadioInline1"
                                className="form-check-input"
                              />
                              <Label
                                className="form-check-label font-size-13"
                                htmlFor="customRadioInline3"
                              >
                                <i className="far fa-money-bill-alt me-1 font-size-20 align-top" />{" "}
                                پرداخت نقدی هنگام تحویل
                              </Label>
                            </div>
                          </div>

                          <h5 className="mt-5 mb-3 font-size-15">
                            برای پرداخت کارت
                          </h5>
                          <div className="p-4 border">
                            <Form>
                              <FormGroup className="mb-0">
                                <Label htmlFor="cardnumberInput">
                                  شماره کارت
                                </Label>
                                <Input
                                  type="text"
                                  className="form-control"
                                  id="cardnumberInput"
                                  placeholder="0000 0000 0000 0000"
                                />
                              </FormGroup>
                              <Row>
                                <Col lg="6">
                                  <FormGroup className="mt-4 mb-0">
                                    <Label htmlFor="cardnameInput">
                                      نام کارت
                                    </Label>
                                    <Input
                                      type="text"
                                      className="form-control"
                                      id="cardnameInput"
                                      placeholder="نام روی کارت"
                                    />
                                  </FormGroup>
                                </Col>
                                <Col lg="3">
                                  <FormGroup className=" mt-4 mb-0">
                                    <Label htmlFor="expirydateInput">
                                      تاریخ انقضا
                                    </Label>
                                    <Input
                                      type="text"
                                      className="form-control"
                                      id="expirydateInput"
                                      placeholder="0000/00/00"
                                    />
                                  </FormGroup>
                                </Col>
                                <Col lg="3">
                                  <FormGroup className="mt-4 mb-0">
                                    <Label htmlFor="cvvcodeInput">CVV کد</Label>
                                    <Input
                                      type="text"
                                      className="form-control"
                                      id="cvvcodeInput"
                                      placeholder="کد CVV را وارد کنید"
                                    />
                                  </FormGroup>
                                </Col>
                              </Row>
                            </Form>
                          </div>
                        </div>
                      </TabPane>
                      <TabPane tabId="3" id="v-pills-confir" role="tabpanel">
                        <Card className="shadow-none border mb-0">
                          <CardBody>
                            <CardTitle className="mb-4">خلاصه سفارش</CardTitle>

                            <div className="table-responsive">
                              <Table className="table align-middle mb-0 table-nowrap">
                                <thead className="table-light">
                                  <tr>
                                    <th scope="col">محصول</th>
                                    <th scope="col">توصیف محصول</th>
                                    <th scope="col">قیمت</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {orderSummary.map((orderitem, key) => (
                                    <tr key={"_orderSummary_" + key}>
                                      <th scope="row">
                                        <img
                                          src={orderitem.img}
                                          alt="product-img"
                                          title="product-img"
                                          className="avatar-md"
                                        />
                                      </th>
                                      <td>
                                        <h5 className="font-size-14 text-truncate">
                                          <Link
                                            to="/ecommerce-product-detail"
                                            className="text-dark"
                                          >
                                            {orderitem.productTitle}{" "}
                                          </Link>
                                        </h5>
                                        <p className="text-muted mb-0">
                                          تومان {orderitem.price} x{" "}
                                          {orderitem.qty}
                                        </p>
                                      </td>
                                      <td>
                                        تومان {orderitem.price * orderitem.qty}
                                      </td>
                                    </tr>
                                  ))}
                                  <tr>
                                    <td colSpan="2">
                                      <h6 className="m-0 text-end">
                                        مجموع فرعی:
                                      </h6>
                                    </td>
                                    <td>تومان 675</td>
                                  </tr>
                                  <tr>
                                    <td colSpan="3">
                                      <div className="bg-primary-subtle p-3 rounded">
                                        <h5 className="font-size-14 text-primary mb-0">
                                          <i className="fas fa-shipping-fast me-2" />{" "}
                                          حمل دریایی{" "}
                                          <span className="float-end">
                                            رایگان
                                          </span>
                                        </h5>
                                      </div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td colSpan="2">
                                      <h6 className="m-0 text-end">جمع:</h6>
                                    </td>
                                    <td>تومان 675</td>
                                  </tr>
                                </tbody>
                              </Table>
                            </div>
                          </CardBody>
                        </Card>
                      </TabPane>
                    </TabContent>
                  </CardBody>
                </Card>
                <Row className="mt-4">
                  <Col sm="6">
                    <Link
                      to="/ecommerce-cart"
                      className="btn text-muted d-none d-sm-inline-block btn-link"
                    >
                      <i className="mdi mdi-arrow-right me-1" />
                      بازگشت به سبدخرید
                    </Link>
                  </Col>
                  <Col sm="6">
                    <div className="text-sm-end">
                      <Link
                        to="/ecommerce-checkout"
                        className="btn btn-success"
                      >
                        <i className="mdi mdi-truck-fast me-1" />
                        تکمیل خرید
                      </Link>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
}

export default EcommerceCheckout
