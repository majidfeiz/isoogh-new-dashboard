import React from 'react';
import { Row, Col, Card, CardBody, CardTitle } from "reactstrap"

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import SimpleLineChart from '../AllCharts/rechart/SimpleLineChart';
import SimpleAreaChart from '../AllCharts/rechart/SimpleAreaChart';
import MixBarChart from '../AllCharts/rechart/MixBarChart';
import VerticalComposedChart from '../AllCharts/rechart/VerticalComposedChart';
import ThreeDimScatterChart from '../AllCharts/rechart/ThreeDimScatterChart';
import SpecifiedDomainRadarChart from '../AllCharts/rechart/SpecifiedDomainRadarChart';
import SimpleRadialBarChart from '../AllCharts/rechart/SimpleRadialBarChart';
import CustomActiveShapePieChart from '../AllCharts/rechart/CustomActiveShapePieChart';

const ReCharts = () => {

    //meta title
    document.title = "Re Charts | Skote - قالب مدیریتی و داشبورد react"

    return (
      <React.Fragment>
        <React.Fragment>
          <div className="page-content">
            <div className="container-fluid">
              <Breadcrumbs title="نمودارها" breadcrumbItem="نمودار دوباره" />

              <Row>
                <Col xl={6}>
                  <Card>
                    <CardBody>
                      <CardTitle className="mb-4">نمودار خط ساده</CardTitle>
                      <SimpleLineChart />
                    </CardBody>
                  </Card>
                </Col>
                <Col xl={6}>
                  <Card>
                    <CardBody>
                      <CardTitle className="mb-4">نمودار مساحت ساده</CardTitle>
                      <SimpleAreaChart />
                    </CardBody>
                  </Card>
                </Col>
              </Row>
              <Row>
                <Col xl={6}>
                  <Card>
                    <CardBody>
                      <CardTitle className="mb-4">نمودار خط ساده</CardTitle>
                      <MixBarChart />
                    </CardBody>
                  </Card>
                </Col>
                <Col xl={6}>
                  <Card>
                    <CardBody>
                      <CardTitle className="mb-4">نمودار مساحت ساده</CardTitle>
                      <VerticalComposedChart />
                    </CardBody>
                  </Card>
                </Col>
              </Row>
              <Row>
                <Col xl={6}>
                  <Card>
                    <CardBody>
                      <CardTitle className="mb-4">
                        نمودار ThreeDimScatter
                      </CardTitle>
                      <ThreeDimScatterChart />
                    </CardBody>
                  </Card>
                </Col>
                <Col xl={6}>
                  <Card>
                    <CardBody>
                      <CardTitle className="mb-4">
                        نمودار رادار دامنه مشخص شده
                      </CardTitle>
                      <SpecifiedDomainRadarChart />
                    </CardBody>
                  </Card>
                </Col>
              </Row>
              <Row>
                <Col xl={6}>
                  <Card>
                    <CardBody>
                      <CardTitle className="mb-4">نمودار ساده شعاعی</CardTitle>
                      <SimpleRadialBarChart />
                    </CardBody>
                  </Card>
                </Col>
                <Col xl={6}>
                  <Card>
                    <CardBody>
                      <CardTitle className="mb-4">
                        نمودار دایره شکل فعال سفارشی
                      </CardTitle>
                      <CustomActiveShapePieChart />
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </div>
          </div>
        </React.Fragment>
      </React.Fragment>
    );
}

export default ReCharts;