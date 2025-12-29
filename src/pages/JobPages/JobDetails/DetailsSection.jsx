import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Col } from 'reactstrap';

//import images
import wechat from "../../../assets/images/companies/wechat.svg";

const DetailsSection = () => {
    return (
      <React.Fragment>
        <Col xl={9}>
          <Card>
            <CardBody className="border-bottom">
              <div className="d-flex">
                <img src={wechat} alt="" height="50" />
                <div className="flex-grow-1 ms-3">
                  <h5 className="fw-semibold">توسعه دهنده Magento</h5>
                  <ul className="list-unstyled hstack gap-2 mb-0">
                    <li>
                      <i className="bx bx-building-house"></i>{" "}
                      <span className="text-muted">نام تجاری قالب</span>
                    </li>
                    <li>
                      <i className="bx bx-map"></i>{" "}
                      <span className="text-muted">تهران</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardBody>
            <CardBody>
              <h5 className="fw-semibold mb-3">توضیحات</h5>
              <p className="text-muted">
                ما به دنبال استخدام یک توسعه دهنده ماهر مجنتو برای ساخت و وب
                سایت های تجارت الکترونیک را برای مشتریان خود حفظ کنید. به عنوان
                یک مجنتو توسعه دهنده، شما مسئول ارتباط با طراحی خواهید بود تیم،
                راه اندازی سایت های مجنتو 1x و 2x، ساخت ماژول ها و سفارشی سازی
                افزونه ها، آزمایش عملکرد هر سایت، و حفظ امنیت و به روز رسانی
                ویژگی ها بعد از نصب کامل است
              </p>

              <h5 className="fw-semibold mb-3">مسئولیت ها:</h5>
              <ul className="vstack gap-3 job-vstack">
                <li>ملاقات با تیم طراحی برای بحث در مورد نیازهای شرکت</li>
                <li>
                  ساخت و پیکربندی وب سایت های تجارت الکترونیک Magento 1x و 2x
                </li>
                <li>کدنویسی قالب های Magento </li>
                <li>
                  توسعه ماژول های مجنتو در PHP با استفاده از بهترین روش ها
                </li>
                <li>طراحی تم ها و رابط ها</li>
                <li>تعیین وظایف و اهداف عملکرد</li>
                <li>به روز رسانی ویژگی های وب سایت و وصله های امنیتی</li>
              </ul>

              <h5 className="fw-semibold mb-3">الزامات:</h5>
              <ul className="vstack gap-3 job-vstack">
                <li>Baلیسانس در رشته کامپیوتر یا رشته های مرتبط.</li>
                <li>
                  دانش پیشرفته Magento، JavaScript، HTML، PHP، CSS و MySQL
                </li>
                <li>تجربه توسعه کامل چرخه حیات تجارت الکترونیک</li>
                <li>درک روندهای مدرن UI/UX</li>
                <li>
                  آشنایی با گوگل تگ منیجر، سئو، گوگل آنالیتیکس، PPC، و تست A/B
                </li>
                <li>دانش کار خوب Adobe Photoshop و Adobe تصویرگر</li>
                <li>توجه شدید به جزئیات</li>
                <li>توانایی مدیریت پروژه و کار در مهلت های زمانی دقیق</li>
                <li>توانایی کار در محیط تیمی</li>
              </ul>

              <h5 className="fw-semibold mb-3">صلاحیت:</h5>
              <ul className="vstack gap-3 job-vstack">
                <li>
                  B.C.A / M.C.A under National University course complete.
                </li>
                <li>3 سال یا بیشتر تجربه طراحی حرفه ای</li>
                <li>مدرک پیشرفته یا تجربه معادل در گرافیک و وب طرح</li>
              </ul>

              <h5 className="fw-semibold mb-3">مهارت و تجربیات:</h5>
              <ul className="vstack gap-3 mb-0 job-vstack">
                <li>درک اصل طراحی کلید</li>
                <li>تسلط بر HTML، CSS، Bootstrap</li>
                <li>وردپرس: 1 سال (الزامی)</li>
                <li>طراحی و توسعه وب سایت های طراحی ریسپانسیو را تجربه کنید</li>
                <li>طراحی وب سایت: 1 سال (ترجیحا)</li>
              </ul>

              <div className="mt-4">
                <span className="badge badge-soft-warning me-1">PHP</span>
                <span className="badge badge-soft-warning me-1">Magento</span>
                <span className="badge badge-soft-warning me-1">
                  بازار یابی
                </span>
                <span className="badge badge-soft-warning me-1">وردپرس</span>
                <span className="badge badge-soft-warning">بوت استرپ</span>
              </div>

              <div className="mt-4">
                <ul className="list-inline mb-0">
                  <li className="list-inline-item mt-1">
                    این شغل را به اشتراک بگذارید:
                  </li>
                  <li className="list-inline-item mt-1">
                    <Link to="#" className="btn btn-outline-primary btn-hover">
                      <i className="uil uil-facebook-f"></i> Facebook
                    </Link>
                  </li>
                  <li className="list-inline-item mt-1">
                    <Link to="#" className="btn btn-outline-danger btn-hover">
                      <i className="uil uil-google"></i> گوگل+
                    </Link>
                  </li>
                  <li className="list-inline-item mt-1">
                    <Link to="#" className="btn btn-outline-success btn-hover">
                      <i className="uil uil-linkedin-alt"></i> لینکدین
                    </Link>
                  </li>
                </ul>
              </div>
            </CardBody>
          </Card>
        </Col>
      </React.Fragment>
    );
}

export default DetailsSection;