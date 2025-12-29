import React from "react";
import { Button, Card, CardBody, CardTitle, Col, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";

const BasicModal = () => {
    return (
      <React.Fragment>
        <Row>
          <Col className="col-12">
            <Card>
              <CardBody>
                <CardTitle className="h4">نمونه های مدال</CardTitle>
                <p className="card-title-desc">
                  مدال‌ها ساده‌سازی شده‌اند، اما پیام‌های گفتگوی منعطف توسط آن
                  ارائه می‌شوند جاوا اسکریپت. آنها تعدادی از موارد استفاده از
                  کاربر را پشتیبانی می کنند اطلاع رسانی به محتوای کاملا سفارشی و
                  ویژگی الف تعداد انگشت شماری از مولفه های فرعی مفید، اندازه ها
                  و موارد دیگر
                </p>

                <div className="modal bs-example-modal" role="dialog">
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">عنوان مدال</h5>
                        <button
                          type="button"
                          className="btn-close"
                          data-dismiss="modal"
                          aria-label="Close"
                        ></button>
                      </div>
                      <ModalBody>
                        <p>پیدا کردن مودال مناسب</p>
                      </ModalBody>
                      <ModalFooter>
                        <Button type="button" color="primary">
                          ذخیره تغییرات
                        </Button>
                        <Button
                          type="button"
                          color="secondary"
                          data-dismiss="modal"
                        >
                         بستن
                        </Button>
                      </ModalFooter>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    );
}

export default BasicModal;