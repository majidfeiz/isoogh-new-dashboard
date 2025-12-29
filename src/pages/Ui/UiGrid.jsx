import React from "react"

import {
  Col,
  Row,
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  Container,
} from "reactstrap"

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb"

const UiGrid = () => {

  //meta title
  document.title = "Grid | Skote - قالب مدیریتی و داشبورد Vite React ";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="المنت های UI" breadcrumbItem="گرید بندی" />

          <Row>
            <Col className="col-12">
              <Card>
                <CardBody>
                  <CardTitle className="h4">گزینه های شبکه بندی</CardTitle>
                  <p className="card-title-desc">
                    ببینید چگونه جنبه های سیستم شبکه بوت استرپ در سراسر جهان کار
                    می کند چندین دستگاه با یک میز دستی
                  </p>

                  <div className="table-responsive">
                    <table className="table table-bordered table-striped table-nowrap mb-0">
                      <thead>
                        <tr>
                          <th scope="col"></th>
                          <th scope="col" className="text-center">
                            xs
                            <br />
                            <span className="fw-normal">&lt;576px</span>
                          </th>
                          <th scope="col" className="text-center">
                            sm
                            <br />
                            <span className="fw-normal">≥576px</span>
                          </th>
                          <th scope="col" className="text-center">
                            md
                            <br />
                            <span className="fw-normal">≥768px</span>
                          </th>
                          <th scope="col" className="text-center">
                            lg
                            <br />
                            <span className="fw-normal">≥992px</span>
                          </th>
                          <th scope="col" className="text-center">
                            xl
                            <br />
                            <span className="fw-normal">≥1200px</span>
                          </th>
                          <th scope="col" className="text-center">
                            xxl
                            <br />
                            <span className="fw-normal">≥1400px</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th className="text-nowrap" scope="row">
                            رفتار شبکه بندی
                          </th>
                          <td>افقی در همه حال</td>
                          <td colSpan="5">
                            برای شروع جمع شدن، افقی بالای نقاط شکست
                          </td>
                        </tr>
                        <tr>
                          <th className="text-nowrap" scope="row">
                            حداکثر عرض
                          </th>
                          <td>هیچ کدام (auto)</td>
                          <td>540px</td>
                          <td>720px</td>
                          <td>960px</td>
                          <td>1140px</td>
                          <td>1320px</td>
                        </tr>
                        <tr>
                          <th className="text-nowrap" scope="row">
                            Class پیشوند
                          </th>
                          <td>
                            <code>.col-</code>
                          </td>
                          <td>
                            <code>.col-sm-</code>
                          </td>
                          <td>
                            <code>.col-md-</code>
                          </td>
                          <td>
                            <code>.col-lg-</code>
                          </td>
                          <td>
                            <code>.col-xl-</code>
                          </td>
                          <td>
                            <code>.col-xxl-</code>
                          </td>
                        </tr>
                        <tr>
                          <th className="text-nowrap" scope="row">
                            # از ستون ها
                          </th>
                          <td colSpan="6">12</td>
                        </tr>
                        <tr>
                          <th className="text-nowrap" scope="row">
                            عرض ناودان
                          </th>
                          <td colSpan="6">24px (12px در هر طرف یک ستون)</td>
                        </tr>
                        <tr>
                          <th className="text-nowrap" scope="row">
                            ناودان های سفارشی
                          </th>
                          <td colSpan="6">بله</td>
                        </tr>
                        <tr>
                          <th className="text-nowrap" scope="row">
                            تودرتو
                          </th>
                          <td colSpan="6">بله</td>
                        </tr>
                        <tr>
                          <th className="text-nowrap" scope="row">
                            Offsets
                          </th>
                          <td colSpan="6">بله</td>
                        </tr>
                        <tr>
                          <th className="text-nowrap" scope="row">
                            ترتیب ستون
                          </th>
                          <td colSpan="6">بله</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}

export default UiGrid
