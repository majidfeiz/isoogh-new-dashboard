import React, { useState } from "react";
import { Card, CardBody, Col, Input, Label } from "reactstrap";

const BootstrapMaxLength = () => {

    const [disBadge, setDisBadge] = useState(true);
    const [disThresh, setDisThresh] = useState(false);
    const [placementBadge, setPlacementBadge] = useState(false);
    const [textCount, setTextCount] = useState(0);
    const [optionCount, setOptionCount] = useState(0);
    const [placementCount, setPlacementCount] = useState(0);
    const [threshHold, setThreshHold] = useState(0);
    const [threshHoldCount, setThreshHoldCount] = useState(0);
    const [disDefault, setDisDefault] = useState(0);
    const [textareaBadge, setTextAreaBadge] = useState(0);

    const max_len = 25;

    const threshHoldChange = (event) => {
        const count = event.target.value.length;
        const remain_val = max_len - 20;

        if (remain_val <= count) {
            setDisThresh(true);
        } else {
            setDisThresh(false);
        }
        setThreshHoldCount(event.target.value.length);
    }

    const threshHoldDefault = (event) => {
        const count = event.target.value.length;
        if (count > 0) {
            setDisDefault(true);
        } else {
            setDisDefault(false);
        }
        setThreshHold(event.target.value.length);
    }

    const optionChange = (event) => {
        const count = event.target.value.length;
        if (count > 0) {
            setDisBadge(true);
        } else {
            setDisBadge(false);
        }
        setOptionCount(event.target.value.length);
    }

    const placementChange = (event) => {
        const count = event.target.value.length;
        if (count > 0) {
            setPlacementBadge(true);
        } else {
            setPlacementBadge(false);
        }
        setPlacementCount(event.target.value.length);
    }

    const textareaChange = (event) => {
        const count = event.target.value.length;
        if (count > 0) {
            setTextAreaBadge(true);
        } else {
            setTextAreaBadge(false);
        }
        setTextCount(event.target.value.length);
    }


    return (
      <React.Fragment>
        <Col xl="6">
          <Card>
            <CardBody>
              <h4 className="card-title">Bootstrap بیشترین طول</h4>
              <p className="card-title-desc">
                این افزونه به طور پیش فرض با بوت استرپ توییتر ادغام می شود
                استفاده از نشان ها برای نمایش حداکثر طول فیلد جایی که کاربر در
                حال وارد کردن متن است.{" "}
              </p>
              <Label>استفاده پیش فرض</Label>
              <p className="text-muted m-b-15">
                وقتی نویسه‌های باقی‌مانده هستند، نشان به‌طور پیش‌فرض نشان داده
                می‌شود 10 یا کمتر:
              </p>
              <Input
                type="text"
                maxLength="25"
                name="defaultconfig"
                onChange={(e) => {
                  threshHoldDefault(e);
                }}
                id="defaultconfig"
              />
              {disDefault ? (
                <span className="badgecount badge bg-success">
                  {threshHold} / 25{" "}
                </span>
              ) : null}

              <div className="mt-3">
                <Label>Threshold مقدار</Label>
                <p className="text-muted m-b-15">
                  آیا می خواهید نشان زمانی که 20 نویسه وجود دارد نشان داده شود
                  یا کمتر؟ از گزینه <code>threshold</code> استفاده کنید:
                </p>
                <Input
                  type="text"
                  maxLength={max_len}
                  onChange={(e) => {
                    threshHoldChange(e);
                  }}
                  name="thresholdconfig"
                  id="thresholdconfig"
                />
                {disThresh ? (
                  <span className="badgecount badge bg-success">
                    {threshHoldCount} / 25{" "}
                  </span>
                ) : null}
              </div>

              <div className="mt-3">
                <Label>همه گزینه ها</Label>
                <p className="text-muted m-b-15">
                  لطفاً توجه داشته باشید: اگر گزینه <code>alwaysShow</code> فعال
                  باشد، گزینه <code>آستانه</code> نادیده گرفته می شود
                </p>
                <Input
                  type="text"
                  maxLength="25"
                  // onChange={(e) => {
                  //     optionChange(e);
                  // }}
                  name="alloptions"
                  id="alloptions"
                />
              </div>

              <div className="mt-3">
                <Label>موقعیت</Label>
                <p className="text-muted m-b-15">
                  تنها کاری که باید انجام دهید این است که <code>مکان</code> را
                  مشخص کنید. گزینه، با یکی از آن رشته ها. اگر هیچ کدام مشخص نشده
                  باشد، موقعیت یابی به
                </p>
                <Input
                  type="text"
                  maxLength="25"
                  onChange={(e) => {
                    placementChange(e);
                  }}
                  name="placement"
                  id="placement"
                />
                {placementBadge ? (
                  <span
                    style={{ float: "right" }}
                    className="badgecount badge bg-success"
                  >
                    {placementCount} / 25{" "}
                  </span>
                ) : null}
              </div>

              <div className="mt-3">
                <Label>Textarea</Label>
                <p className="text-muted m-b-15">
                  Bootstrap maxlength از textarea و همچنین ورودی ها پشتیبانی می
                  کند. زوج در IE قدیمی
                </p>
                <Input
                  type="textarea"
                  id="textarea"
                  onChange={(e) => {
                    textareaChange(e);
                  }}
                  maxLength="225"
                  rows="3"
                  placeholder="این ناحیه متنی دارای محدودیت 225 کاراکتر است"
                />
                {textareaBadge ? (
                  <span className="badgecount badge bg-success">
                    {" "}
                    {textCount} / 225{" "}
                  </span>
                ) : null}
              </div>
            </CardBody>
          </Card>
        </Col>
      </React.Fragment>
    );
}

export default BootstrapMaxLength;