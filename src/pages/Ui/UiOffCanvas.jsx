import React, { useState } from 'react';
import {
    Col,
    Row,
    Button,
    Card,
    CardBody,
    CardTitle,
    Offcanvas,
    OffcanvasHeader,
    OffcanvasBody,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from "reactstrap";
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

const UiDrawer = () => {

    //meta title
    document.title = "OffCanvas | Skote - قالب مدیریتی و داشبورد Vite React ";

    const [open, setOpen] = useState(false);
    const [isTop, setIsTop] = useState(false);
    const [isRight, setIsRight] = useState(false);
    const [isBottom, setIsBottom] = useState(false);
    const [isEnableScroll, setIsEnableScroll] = useState(false);
    const [isBackdrop, setIsBackdrop] = useState(false);
    const [isScrollBackDrop, setIsScrollBackDrop] = useState(false);

    const toggleLeftCanvas = () => {
        setOpen(!open);
    };

    const toggleTopCanvas = () => {
        setIsTop(!isTop);
    };
    const toggleRightCanvas = () => {
        setIsRight(!isRight);
    };
    const toggleBottomCanvas = () => {
        setIsBottom(!isBottom);
    };

    const toggleEnableScroll = () => {
        setIsEnableScroll(!isEnableScroll);
    };
    const toggleBackdrop = () => {
        setIsBackdrop(!isBackdrop);
    };
    const toggleScrollBackDrop = () => {
        setIsScrollBackDrop(!isScrollBackDrop);
    };
    return (
      <React.Fragment>
        <div className="page-content">
          <div className="container-fluid">
            <Breadcrumbs title="المنت های UI" breadcrumbItem="منوی جانبی" />
            <Row>
              <Col lg={6}>
                <Card>
                  <CardBody>
                    <CardTitle className="h4">دمو</CardTitle>
                    <p className="card-title-desc">
                      از دکمه های زیر برای نمایش و پنهان کردن یک عنصر offcanvas
                      از طریق جاوا اسکریپت استفاده کنید که <code>.show</code> را
                      تغییر می دهد. کلاس روی یک عنصر با کلاس{" "}
                      <code>.offcanvas</code>
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                      <Button
                        color="primary"
                        onClick={toggleLeftCanvas}
                        className="me-2"
                      >
                        لینک با href
                      </Button>
                      <Button
                        color="primary"
                        type="button"
                        onClick={toggleLeftCanvas}
                      >
                        دکمه با data-bs-target
                      </Button>
                      <Offcanvas isOpen={open} toggle={toggleLeftCanvas}>
                        <OffcanvasHeader toggle={toggleLeftCanvas}>
                          منوی جانبی
                        </OffcanvasHeader>
                        <OffcanvasBody>
                          <div>
                            برخی از متن ها به عنوان جایگیر. در زندگی واقعی شما
                            می توانید داشته باشید عناصری که انتخاب کرده اید
                            لایک، متن، عکس، لیست ها و غیره
                          </div>
                          <UncontrolledDropdown className="mt-3">
                            <DropdownToggle
                              color="primary"
                              type="button"
                              id="dropdownMenuButton"
                            >
                              دکمه کشویی{" "}
                              <i className="mdi mdi-chevron-down"></i>
                            </DropdownToggle>
                            <DropdownMenu>
                              <li>
                                <DropdownItem>اقدامات</DropdownItem>
                              </li>
                              <li>
                                <DropdownItem>اقدامات دیگر</DropdownItem>
                              </li>
                              <li>
                                <DropdownItem>چیز های دیگر</DropdownItem>
                              </li>
                            </DropdownMenu>
                          </UncontrolledDropdown>
                        </OffcanvasBody>
                      </Offcanvas>
                    </div>
                  </CardBody>
                </Card>
              </Col>

              <Col lg={6}>
                <Card>
                  <CardBody>
                    <CardTitle className="h4">تعیین سطح</CardTitle>
                    <p className="card-title-desc">
                      نمونه قرارگیری متفاوت در خارج از بوم: بالا، انتهای
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                      <Button color="primary" onClick={toggleTopCanvas}>
                        باز شدن منوی کشویی به سمت بالا
                      </Button>
                      <Button color="primary" onClick={toggleRightCanvas}>
                        باز شدن منوی کشویی به سمت راست
                      </Button>
                      <Button color="primary" onClick={toggleBottomCanvas}>
                        باز شدن منوی کشویی به سمت پایین
                      </Button>
                    </div>
                    {/* Top offcanvas */}
                    <Offcanvas
                      isOpen={isTop}
                      direction="top"
                      toggle={toggleTopCanvas}
                    >
                      <OffcanvasHeader toggle={toggleTopCanvas}>
                        منوی کشویی بالا
                      </OffcanvasHeader>
                      <OffcanvasBody>...</OffcanvasBody>
                    </Offcanvas>
                    {/* Right offcanvas */}
                    <Offcanvas
                      isOpen={isRight}
                      direction="end"
                      toggle={toggleRightCanvas}
                    >
                      <OffcanvasHeader toggle={toggleRightCanvas}>
                        منوی کشویی راست
                      </OffcanvasHeader>
                      <OffcanvasBody>...</OffcanvasBody>
                    </Offcanvas>
                    {/* Bottom offcanvas */}
                    <Offcanvas
                      isOpen={isBottom}
                      direction="bottom"
                      toggle={toggleBottomCanvas}
                    >
                      <OffcanvasHeader toggle={toggleBottomCanvas}>
                        منوی کشویی پایین
                      </OffcanvasHeader>
                      <OffcanvasBody>...</OffcanvasBody>
                    </Offcanvas>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col lg={12}>
                <Card>
                  <CardBody>
                    <CardTitle className="h5">واکنش گرا</CardTitle>
                    <p className="card-title-desc">
                      کلاس‌های پاسخگو منوی کشویی برای هر کدام در دسترس هستند
                      نقطه شکست
                    </p>

                    <div className="d-flex flex-wrap gap-2">
                      <button
                        className="btn btn-primary d-lg-none"
                        type="button"
                      >
                        جا به جایی منوی کشویی
                      </button>
                    </div>
                    <div className="alert alert-info d-none d-lg-block">
                      اندازه مرورگر خود را تغییر دهید تا منوی کشویی پاسخگو نشان
                      داده شود تغییر وضعیت
                    </div>

                    <div
                      className="offcanvas-lg offcanvas-end"
                      id="offcanvasResponsive"
                    >
                      <div className="offcanvas-header">
                        <h5
                          className="offcanvas-title"
                          id="offcanvasResponsiveLabel"
                        >
                          منوی کشویی واکنش گرا
                        </h5>
                        <button type="button" className="btn-close"></button>
                      </div>
                      <div className="offcanvas-body">
                        <p className="mb-0">
                          This is content within an <code>.offcanvas-lg</code>.
                        </p>
                      </div>
                    </div>

                    <p className="card-title-desc mt-3 mb-2">
                      کلاس‌های پاسخگو منوی کشویی برای هر کدام در دسترس هستند
                      نقطه شکست
                    </p>
                    <ul className="mb-0 list-inline">
                      <li className="list-inline-item">
                        <code>.offcanvas</code>,
                      </li>{" "}
                      <li className="list-inline-item">
                        <code>.offcanvas-sm</code>,
                      </li>{" "}
                      <li className="list-inline-item">
                        <code>.offcanvas-md</code>,
                      </li>{" "}
                      <li className="list-inline-item">
                        <code>.offcanvas-lg</code>,
                      </li>{" "}
                      <li className="list-inline-item">
                        <code>.offcanvas-xl</code>,
                      </li>{" "}
                      <li className="list-inline-item">
                        <code>.offcanvas-xxl</code>
                      </li>{" "}
                    </ul>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col lg={12}>
                <Card>
                  <CardBody>
                    <CardTitle className="h4">Baپس زمینهckdrop</CardTitle>
                    <p className="card-title-desc">
                      پیمایش عنصر <code>&lt;body&gt;</code> است هنگامی که یک
                      offcanvas و پس زمینه آن قابل مشاهده است غیرفعال می شود. از
                      ویژگی <code>data bs scroll</code> برای جابجایی استفاده
                      کنید
                      <code>&lt;body&gt;</code> پیمایش و <code>backdrop</code>{" "}
                      برای تغییر حالت پس زمینه
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                      <Button color="primary" onClick={toggleEnableScroll}>
                        پیمایش بدنه را فعال کنید
                      </Button>
                      <Button color="primary" onClick={toggleBackdrop}>
                        فعال کردن پس‌زمینه (پیش‌فرض)
                      </Button>
                      <Button color="primary" onClick={toggleScrollBackDrop}>
                        هر دو پیمایش را فعال کنید
                      </Button>
                    </div>
                    <Offcanvas
                      isOpen={isEnableScroll}
                      scrollable
                      backdrop={false}
                      toggle={toggleEnableScroll}
                    >
                      <OffcanvasHeader toggle={toggleEnableScroll}>
                        رنگی با پیمایش
                      </OffcanvasHeader>
                      <OffcanvasBody>
                        <p>
                          سعی کنید بقیه صفحه را اسکرول کنید تا این گزینه را
                          ببینید در عمل
                        </p>
                      </OffcanvasBody>
                    </Offcanvas>

                    <Offcanvas isOpen={isBackdrop} toggle={toggleBackdrop}>
                      <OffcanvasHeader toggle={toggleBackdrop}>
                        منوی کشویی با پس زمینه
                      </OffcanvasHeader>
                      <OffcanvasBody>
                        <p>.....</p>
                      </OffcanvasBody>
                    </Offcanvas>

                    <Offcanvas
                      isOpen={isScrollBackDrop}
                      scrollable
                      toggle={toggleScrollBackDrop}
                    >
                      <OffcanvasHeader toggle={toggleScrollBackDrop}>
                        پس زمینه با پیمایش
                      </OffcanvasHeader>
                      <OffcanvasBody>
                        <p>
                          سعی کنید بقیه صفحه را اسکرول کنید تا این گزینه را
                          ببینید در عمل
                        </p>
                      </OffcanvasBody>
                    </Offcanvas>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </React.Fragment>
    );
};

export default UiDrawer;