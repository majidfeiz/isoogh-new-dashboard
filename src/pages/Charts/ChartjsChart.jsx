import React from "react"

import { Row, Col, Card, CardBody, CardTitle, Container } from "reactstrap"
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb"

// import chartJs
import LineChart from "../AllCharts/chartjs/linechart"
import DountChart from "../AllCharts/chartjs/dountchart"
import PieChart from "../AllCharts/chartjs/piechart"
import BarChart from "../AllCharts/chartjs/barchart"
import RadarChart from "../AllCharts/chartjs/radarchart"
import PolarChart from "../AllCharts/chartjs/polarchart"

const ChartjsChart = () => {
  //meta title
  document.title = "Chartjs Charts | Skote - قالب مدیریتی و داشبورد react"

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="نمودارها" breadcrumbItem="نمودارهای Chartjs" />
          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">نمودار خطی</CardTitle>
                  <Row className="justify-content-center">
                    <Col sm={4}>
                      <div className="text-center">
                        <h5 className="mb-0">86541</h5>
                        <p className="text-muted text-truncate">فعال شده</p>
                      </div>
                    </Col>
                    <Col sm={4}>
                      <div className="text-center">
                        <h5 className="mb-0">2541</h5>
                        <p className="text-muted text-truncate">در انتظار</p>
                      </div>
                    </Col>
                    <Col sm={4}>
                      <div className="text-center">
                        <h5 className="mb-0">102030</h5>
                        <p className="text-muted text-truncate">غیرفعال شده</p>
                      </div>
                    </Col>
                  </Row>
                  <LineChart dataColors='["--bs-primary-rgb, 0.2", "--bs-primary", "--bs-light-rgb, 0.2", "--bs-light"]' />
                </CardBody>
              </Card>
            </Col>

            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">نمودار میله ای</CardTitle>
                  <Row className="justify-content-center">
                    <Col sm={4}>
                      <div className="text-center">
                        <h5 className="mb-0">2541</h5>
                        <p className="text-muted text-truncate">فعال شده</p>
                      </div>
                    </Col>
                    <Col sm={4}>
                      <div className="text-center">
                        <h5 className="mb-0">84845</h5>
                        <p className="text-muted text-truncate">در انتظار</p>
                      </div>
                    </Col>
                    <Col sm={4}>
                      <div className="text-center">
                        <h5 className="mb-0">12001</h5>
                        <p className="text-muted text-truncate">غیرفعال شده</p>
                      </div>
                    </Col>
                  </Row>

                  <BarChart dataColors='["--bs-success-rgb, 0.8", "--bs-success"]' />
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">نمودار دایره ای</CardTitle>
                  <Row className="justify-content-center">
                    <Col sm={4}>
                      <div className="text-center">
                        <h5 className="mb-0">2536</h5>
                        <p className="text-muted text-truncate">فعال شده</p>
                      </div>
                    </Col>
                    <Col sm={4}>
                      <div className="text-center">
                        <h5 className="mb-0">69421</h5>
                        <p className="text-muted text-truncate">در انتظار</p>
                      </div>
                    </Col>
                    <Col sm={4}>
                      <div className="text-center">
                        <h5 className="mb-0">89854</h5>
                        <p className="text-muted text-truncate">غیرفعال شده</p>
                      </div>
                    </Col>
                  </Row>

                  <PieChart dataColors='["--bs-success", "#ebeff2"]' />
                </CardBody>
              </Card>
            </Col>

            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">نمودار دوناتی</CardTitle>
                  <Row className="justify-content-center">
                    <Col sm={4}>
                      <div className="text-center">
                        <h5 className="mb-0">9595</h5>
                        <p className="text-muted text-truncate">فعال شده</p>
                      </div>
                    </Col>
                    <Col sm={4}>
                      <div className="text-center">
                        <h5 className="mb-0">36524</h5>
                        <p className="text-muted text-truncate">در انتظار</p>
                      </div>
                    </Col>
                    <Col sm={4}>
                      <div className="text-center">
                        <h5 className="mb-0">62541</h5>
                        <p className="text-muted text-truncate">غیر فعال شده</p>
                      </div>
                    </Col>
                  </Row>

                  <DountChart dataColors='["--bs-primary", "#ebeff2"]' />
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">نمودار قطبی</CardTitle>
                  <Row className="justify-content-center">
                    <Col sm={4}>
                      <div className="text-center">
                        <h5 className="mb-0">4852</h5>
                        <p className="text-muted text-truncate">فعال شده</p>
                      </div>
                    </Col>
                    <Col sm={4}>
                      <div className="text-center">
                        <h5 className="mb-0">3652</h5>
                        <p className="text-muted text-truncate">در انتظار</p>
                      </div>
                    </Col>
                    <Col sm={4}>
                      <div className="text-center">
                        <h5 className="mb-0">85412</h5>
                        <p className="text-muted text-truncate">غیر فعال شده</p>
                      </div>
                    </Col>
                  </Row>
                  <PolarChart dataColors='["--bs-danger", "--bs-success", "--bs-warning", "--bs-primary"]' />
                </CardBody>
              </Card>
            </Col>

            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">نمودار رادار</CardTitle>
                  <Row className="justify-content-center">
                    <Col sm={4}>
                      <div className="text-center">
                        <h5 className="mb-0">694</h5>
                        <p className="text-muted text-truncate">فعال شده</p>
                      </div>
                    </Col>
                    <Col sm={4}>
                      <div className="text-center">
                        <h5 className="mb-0">55210</h5>
                        <p className="text-muted text-truncate">در انتظار</p>
                      </div>
                    </Col>
                    <Col sm={4}>
                      <div className="text-center">
                        <h5 className="mb-0">489498</h5>
                        <p className="text-muted text-truncate">غیر فعال شده</p>
                      </div>
                    </Col>
                  </Row>

                  <RadarChart dataColors='["--bs-success-rgb, 0.2", "--bs-success", "--bs-primary-rgb, 0.2", "--bs-primary"]' />
                </CardBody>
              </Card>
            </Col>
          </Row>{" "}
        </Container>
      </div>
    </React.Fragment>
  );
}

export default ChartjsChart
