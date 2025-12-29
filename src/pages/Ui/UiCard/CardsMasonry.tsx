import React from "react";
import { Card, CardBody, Col, Row } from "reactstrap";
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';

// img
import img3 from "../../../assets/images/small/img-3.jpg";
import img5 from "../../../assets/images/small/img-5.jpg";
import img7 from "../../../assets/images/small/img-7.jpg";

const CardsMasonry = () => {
    return (
      <React.Fragment>
        <Row>
          <Col sm={12}>
            <h4 className="my-3">سنگ تراشی کارت</h4>
            <Row data-masonry='{"percentPosition": true }'>
              <ResponsiveMasonry
                columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
              >
                <Masonry columnsCount={3} gutter="24px">
                  <Card>
                    <img src={img3} className="card-img-top" alt="..." />
                    <CardBody>
                      <h5 className="card-title">
                        عنوان کارت که به یک خط جدید بسته می شود
                      </h5>
                      <p className="card-text">
                        این یک کارت طولانی‌تر با متن پشتیبانی در زیر است هدایت
                        طبیعی به محتوای اضافی این محتوا یک است کمی طولانی تر
                      </p>
                    </CardBody>
                  </Card>
                  <Card>
                    <img src={img5} className="card-img-top" alt="..." />
                    <CardBody>
                      <h5 className="card-title">عنوان کارت</h5>
                      <p className="card-text">
                        این کارت دارای متن پشتیبانی در زیر به عنوان ورودی طبیعی
                        است به محتوای اضافی
                      </p>
                      <p className="card-text">
                        <small className="text-muted">
                          آخرین به روز رسانی 3 دقیقه قبل
                        </small>
                      </p>
                    </CardBody>
                  </Card>
                  <Card>
                    <img src={img7} className="card-img-top" alt="..." />
                  </Card>
                  <Card>
                    <CardBody>
                      <blockquote className="blockquote font-size-14 mb-0">
                        <p>
                          لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت
                          چاپ و با استفاده از طراحان گرافیک است.
                        </p>
                        <footer className="blockquote-footer mt-0 font-size-12">
                          شخصی معروف در{" "}
                          <cite title="Source Title">عنوان منبع</cite>
                        </footer>
                      </blockquote>
                    </CardBody>
                  </Card>
                  <div className="card bg-primary text-white text-center p-3">
                    <blockquote className="card-blockquote font-size-14 mb-0">
                      <p>
                        لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت
                        چاپ و با استفاده از طراحان گرافیک است.
                      </p>
                      <footer className="blockquote-footer mt-0 text-white font-size-12 mb-0">
                        شخصی معروف در{" "}
                        <cite title="Source Title">عنوان منبع</cite>
                      </footer>
                    </blockquote>
                  </div>
                  <div className="card p-3 text-end">
                    <blockquote className="blockquote blockquote-reverse  mb-0">
                      <p>
                        لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت
                        چاپ و با استفاده از طراحان گرافیک است.
                      </p>
                      <footer className="blockquote-footer mt-0">
                        <small className="text-muted">
                          شخصی معروف در{" "}
                          <cite title="Source Title">عنوان منبع</cite>
                        </small>
                      </footer>
                    </blockquote>
                  </div>
                  <Card>
                    <CardBody>
                      <h5 className="card-title">عنوان کارت</h5>
                      <p className="card-text">
                        این یک کارت دیگر با عنوان و متن پشتیبانی است زیر این
                        کارت دارای محتوای اضافی برای ساخت آن است در کل کمی
                        بلندتر
                      </p>
                      <p className="card-text">
                        <small className="text-muted">
                          آخرین به روز رسانی 3 دقیقه قبل
                        </small>
                      </p>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody>
                      <h5 className="card-title">عنوان کارت</h5>
                      <p className="card-text">
                        این کارت دارای عنوان منظم و پاراگراف کوتاهی از متن زیر
                        آن
                      </p>
                      <p className="card-text">
                        <small className="text-muted">
                          آخرین به روز رسانی 3 دقیقه قبل
                        </small>
                        آخرین به روز رسانی 3 دقیقه قبل
                      </p>
                    </CardBody>
                  </Card>
                </Masonry>
              </ResponsiveMasonry>
            </Row>
          </Col>
        </Row>
      </React.Fragment>
    );
}

export default CardsMasonry;