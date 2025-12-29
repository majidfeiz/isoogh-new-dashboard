import React, { useState } from "react";

import { Button, Card, CardBody, CardTitle, Col, Container, Label, Row } from "reactstrap";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

const UiNotifications = () => {
  const [showEasing, setshowEasing] = useState("تاب خوردن");
  const [hideEasing, sethideEasing] = useState("خطی");
  const [showMethod, setshowMethod] = useState("محو شدن به سمت داخل");
  const [hideMethod, sethideMethod] = useState("محو شدن به سمت بیرون");
  const [showDuration, setshowDuration] = useState(300);
  const [hideDuration, sethideDuration] = useState(1000);
  const [timeOut, settimeOut] = useState(5000);
  const [extendedTimeOut, setextendedTimeOut] = useState(1000);

  function showToast() {
    const ele = document.getElementsByName("toastType");
    const position = document.getElementsByName("positions");
    let toastType;
    const title = document.getElementById("title").value;
    let message = "از طوفان به قلعه لذت ببرید";

    if (document.getElementById("message").value !== "")
      message = document.getElementById("message").value;

    //Close Button
    const closeButton = document.getElementById("closeButton").checked;

    //Debug
    const debug = document.getElementById("debugInfo").checked;

    //Progressbar
    const progressBar = document.getElementById("progressBar").checked;

    //Duplicates
    const preventDuplicates = document.getElementById("preventDuplicates").checked;

    //Newest on Top
    const newestOnTop = document.getElementById("newestOnTop").checked;

    //position class
    let positionClass = "toast-top-right";

    //Fetch position
    for (let p = 0; p < position.length; p++) {
      if (position[p].checked) positionClass = position[p].value;
    }

    //Show Easing
    const showEasing = document.getElementById("showEasing").value;

    //Hide Easing
    const hideEasing = document.getElementById("hideEasing").value;

    //show method
    const showMethod = document.getElementById("showMethod").value;

    //Hide method
    const hideMethod = document.getElementById("hideMethod").value;

    //show duration
    const showDuration = document.getElementById("showDuration").value;

    //Hide duration
    const hideDuration = document.getElementById("hideDuration").value;

    //timeout
    const timeOut = document.getElementById("timeOut").value;

    //extended timeout
    const extendedTimeOut = document.getElementById("extendedTimeOut").value;

    //Fetch checked Type
    for (let i = 0; i < ele.length; i++) {
      if (ele[i].checked) toastType = ele[i].value;
    }

    toastr.options = {
      positionClass: positionClass,
      timeOut: timeOut,
      extendedTimeOut: extendedTimeOut,
      closeButton: closeButton,
      debug: debug,
      progressBar: progressBar,
      preventDuplicates: preventDuplicates,
      newestOnTop: newestOnTop,
      showEasing: showEasing,
      hideEasing: hideEasing,
      showMethod: showMethod,
      hideMethod: hideMethod,
      showDuration: showDuration,
      hideDuration: hideDuration
    };

    // setTimeout(() => toastr.success(`Settings updated `), 300)
    //Toaster Types
    if (toastType === "اطلاعات") toastr.info(message, title);
    else if (toastType === "هشدار") toastr.warning(message, title);
    else if (toastType === "ارور") toastr.error(message, title);
    else toastr.success(message, title);
  }

  function clearToast() {
    toastr.clear();
  }

  return (
    <>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="المنت های UI" breadcrumbItem="اعلانات" />

          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <CardTitle>اعلانات</CardTitle>
                  <p className="card-title-desc">
                    توست ها اعلان های سبک وزنی هستند که برای تقلید از اعلان های
                    فشاری طراحی شده اند
                  </p>
                  <Row>
                    <Col xl="4">
                      <div className="control-group">
                        <div className="controls">
                          <div className="mb-3">
                            <Label className="form-label">عنوان</Label>
                            <input
                              id="title"
                              type="text"
                              className="input-large form-control"
                              placeholder="عنوان را وارد کنید ..."
                            />
                          </div>
                          <div className="mb-3">
                            <Label className="form-label">پیام</Label>
                            <textarea
                              className="input-large form-control"
                              id="message"
                              rows="3"
                              placeholder="پیام را وارد کنید ..."
                            />
                          </div>
                        </div>
                      </div>
                      <div className="control-group my-4">
                        <div className="form-check mb-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="closeButton"
                            value="checked"
                          />
                          <Label
                            className="form-check-label"
                            htmlFor="closeButton"
                          >
                            دکمه بستن
                          </Label>
                        </div>

                        <div className="form-check mb-2">
                          <input
                            type="checkbox"
                            className="form-check-input input-mini"
                            id="addBehaviorOnToastClick"
                            value="checked"
                          />
                          <Label
                            className="form-check-label"
                            htmlFor="addBehaviorOnToastClick"
                          >
                            رفتار را در کلیک توست اضافه کنید
                          </Label>
                        </div>

                        <div className="form-check mb-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="debugInfo"
                            value="checked"
                          />
                          <Label
                            className="form-check-label"
                            htmlFor="debugInfo"
                          >
                            اشکال یابی
                          </Label>
                        </div>

                        <div className="form-check mb-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="progressBar"
                            value="checked"
                          />
                          <Label
                            className="form-check-label"
                            htmlFor="progressBar"
                          >
                            نوار پیشرفت
                          </Label>
                        </div>

                        <div className="form-check mb-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="preventDuplicates"
                            value="checked"
                          />
                          <Label
                            className="form-check-label"
                            htmlFor="preventDuplicates"
                          >
                            جلوگیری از تکراری شدن
                          </Label>
                        </div>

                        <div className="form-check mb-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="addClear"
                            value="checked"
                          />
                          <Label
                            className="form-check-label"
                            htmlFor="addClear"
                          >
                            دکمه اضافه کردن به اجبار پاک کردن توست بدون توجه به
                            تمرکز
                          </Label>
                        </div>

                        <div className="form-check mb-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="newestOnTop"
                            value="checked"
                          />
                          <Label
                            className="form-check-label"
                            htmlFor="newestOnTop"
                          >
                            جدیدترین در بالا
                          </Label>
                        </div>
                      </div>
                    </Col>

                    <Col xl="2">
                      <div className="control-group" id="toastTypeGroup">
                        <div className="controls mb-4">
                          <Label>نوع توست</Label>

                          <div className="form-check mb-2">
                            <input
                              type="radio"
                              id="radio1"
                              name="toastType"
                              className="form-check-input"
                              value="success"
                              defaultChecked
                            />
                            <Label
                              className="form-check-label"
                              htmlFor="radio1"
                            >
                              موفقیت
                            </Label>
                          </div>

                          <div className="form-check mb-2">
                            <input
                              type="radio"
                              id="radio2"
                              name="toastType"
                              className="form-check-input"
                              value="info"
                            />
                            <Label
                              className="form-check-label"
                              htmlFor="radio2"
                            >
                              اطلاعات
                            </Label>
                          </div>

                          <div className="form-check mb-2">
                            <input
                              type="radio"
                              id="radio3"
                              name="toastType"
                              className="form-check-input"
                              value="warning"
                            />
                            <Label
                              className="form-check-label"
                              htmlFor="radio3"
                            >
                              هشدار
                            </Label>
                          </div>

                          <div className="form-check mb-2">
                            <input
                              type="radio"
                              id="radio4"
                              name="toastType"
                              className="form-check-input"
                              value="error"
                            />
                            <Label
                              className="form-check-label"
                              htmlFor="radio4"
                            >
                              ارور
                            </Label>
                          </div>
                        </div>
                      </div>
                      <div className="control-group" id="positionGroup">
                        <div className="controls mb-4">
                          <Label>موقعیت</Label>

                          <div className="form-check mb-2">
                            <input
                              type="radio"
                              id="radio5"
                              name="positions"
                              className="form-check-input"
                              value="toast-top-right"
                              defaultChecked
                            />
                            <Label
                              className="form-check-label"
                              htmlFor="radio5"
                            >
                              بالا راست
                            </Label>
                          </div>

                          <div className="form-check mb-2">
                            <input
                              type="radio"
                              id="radio6"
                              name="positions"
                              className="form-check-input"
                              value="toast-bottom-right"
                            />
                            <Label
                              className="form-check-label"
                              htmlFor="radio6"
                            >
                              پایین راست
                            </Label>
                          </div>

                          <div className="form-check mb-2">
                            <input
                              type="radio"
                              id="radio7"
                              name="positions"
                              className="form-check-input"
                              value="toast-bottom-left"
                            />
                            <Label
                              className="form-check-label"
                              htmlFor="radio7"
                            >
                              پایین چپ
                            </Label>
                          </div>

                          <div className="form-check mb-2">
                            <input
                              type="radio"
                              id="radio8"
                              name="positions"
                              className="form-check-input"
                              value="toast-top-left"
                            />
                            <Label
                              className="form-check-label"
                              htmlFor="radio8"
                            >
                              بالا چپ
                            </Label>
                          </div>

                          <div className="form-check mb-2">
                            <input
                              type="radio"
                              id="radio9"
                              name="positions"
                              className="form-check-input"
                              value="toast-top-full-width"
                            />
                            <Label
                              className="form-check-label"
                              htmlFor="radio9"
                            >
                              بالا عرض کامل
                            </Label>
                          </div>

                          <div className="form-check mb-2">
                            <input
                              type="radio"
                              id="radio10"
                              name="positions"
                              className="form-check-input"
                              value="toast-bottom-full-width"
                            />
                            <Label
                              className="form-check-label"
                              htmlFor="radio10"
                            >
                              پایین عرض کامل
                            </Label>
                          </div>

                          <div className="form-check mb-2">
                            <input
                              type="radio"
                              id="radio11"
                              name="positions"
                              className="form-check-input"
                              value="toast-top-center"
                            />
                            <Label
                              className="form-check-label"
                              htmlFor="radio11"
                            >
                              بالا وسط
                            </Label>
                          </div>

                          <div className="form-check mb-2">
                            <input
                              type="radio"
                              id="radio12"
                              name="positions"
                              className="form-check-input"
                              value="toast-bottom-center"
                            />
                            <Label
                              className="form-check-label"
                              htmlFor="radio12"
                            >
                              پایین وسط
                            </Label>
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col xl="3">
                      <div className="control-group">
                        <div className="controls">
                          <div className="mb-3">
                            <Label htmlFor="showEasing">نمایش Easing</Label>
                            <input
                              id="showEasing"
                              type="text"
                              placeholder="نوسان، خطی"
                              className="input-mini form-control"
                              value={showEasing}
                              onChange={(e) => {
                                setshowEasing(e.target.value);
                              }}
                            />
                          </div>
                          <div className="mb-3">
                            <Label htmlFor="hideEasing">
                              پنهان کردن Easing
                            </Label>
                            <input
                              id="hideEasing"
                              type="text"
                              placeholder="نوسان، خطی"
                              className="input-mini form-control"
                              value={hideEasing}
                              onChange={(e) => {
                                sethideEasing(e.target.value);
                              }}
                            />
                          </div>
                          <div className="mb-3">
                            <Label htmlFor="showMethod">نمایش روش</Label>
                            <input
                              id="showMethod"
                              type="text"
                              placeholder="نمایش, fadeIn, slideDown"
                              className="input-mini form-control"
                              value={showMethod}
                              onChange={(e) => {
                                setshowMethod(e.target.value);
                              }}
                            />
                          </div>
                          <div className="mb-3">
                            <Label htmlFor="hideMethod">روش پنهان کردن</Label>
                            <input
                              id="hideMethod"
                              type="text"
                              placeholder="پنهان کردن, محو شدن, slideUp"
                              className="input-mini form-control"
                              value={hideMethod}
                              onChange={(e) => {
                                sethideMethod(e.target.value);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col xl="3">
                      <div className="control-group">
                        <div className="controls">
                          <div className="mb-3">
                            <Label htmlFor="showDuration">نمایش مدت زمان</Label>
                            <input
                              id="showDuration"
                              type="text"
                              placeholder="ms"
                              className="input-mini form-control"
                              value={showDuration}
                              onChange={(e) => {
                                setshowDuration(e.target.value);
                              }}
                            />
                          </div>
                          <div className="mb-3">
                            <Label htmlFor="hideDuration">
                              پنهان کردن مدت زمان
                            </Label>
                            <input
                              id="hideDuration"
                              type="text"
                              placeholder="ms"
                              className="input-mini form-control"
                              value={hideDuration}
                              onChange={(e) => {
                                sethideDuration(e.target.value);
                              }}
                            />
                          </div>
                          <div className="mb-3">
                            <Label htmlFor="timeOut">زمان پایان</Label>
                            <input
                              id="timeOut"
                              type="text"
                              placeholder="ms"
                              className="input-mini form-control"
                              value={timeOut}
                              onChange={(e) => {
                                settimeOut(e.target.value);
                              }}
                            />
                          </div>
                          <div className="mb-3">
                            <Label htmlFor="extendedTimeOut">
                              زمان تمدید شده
                            </Label>
                            <input
                              id="extendedTimeOut"
                              type="text"
                              placeholder="ms"
                              className="input-mini form-control"
                              value={extendedTimeOut}
                              onChange={(e) => {
                                setextendedTimeOut(e.target.value);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <Row className="mt-4">
                    <Col md="12">
                      <div className="d-flex flex-wrap gap-2">
                        <Button
                          type="button"
                          color="primary"
                          id="showtoast"
                          onClick={() => {
                            showToast();
                          }}
                        >
                          نمایش توست
                        </Button>{" "}
                        <Button
                          type="button"
                          color="danger"
                          id="cleartoasts"
                          onClick={() => {
                            clearToast();
                          }}
                        >
                          پاک کردن توست
                        </Button>{" "}
                        <Button
                          type="button"
                          color="danger"
                          id="clearlasttoast"
                        >
                          پاک کردن اخرین توست
                        </Button>
                      </div>
                    </Col>
                  </Row>

                  <div className="mt-3">
                    <Col md="12">
                      <pre id="toastrOptions" className="toastr-options" />
                    </Col>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default UiNotifications;
