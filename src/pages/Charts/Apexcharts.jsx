import React from "react";

// import apexChart
import LineApexChart from "../AllCharts/apex/chartapex"
import DashedLine from "../AllCharts/apex/dashedLine"
import SplineArea from "../AllCharts/apex/SplineArea"
import Apaexlinecolumn from "../AllCharts/apex/apaexlinecolumn"
import ColumnWithDataLabels from "../AllCharts/apex/ColumnWithDataLabels"
import BarChart from "../AllCharts/apex/barchart"
import LineColumnArea from "../AllCharts/apex/LineColumnArea"
import RadialChart from "../AllCharts/apex/RadialChart"
import PieChart from "../AllCharts/apex/PieChart"
import DonutChart from "../AllCharts/apex/dountchart"
import DumbelColumnChart from "../AllCharts/apex/DumbelColumn";
import RangeAreaChart from "../AllCharts/apex/RangeArea";
import DumbelHorizontalChart from "../AllCharts/apex/DumbellHorizontal";
import FunnelChart from "../AllCharts/apex/FunnelChart";


import { Row, Col, Card, CardBody, CardTitle } from "reactstrap"

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb"

const Apexchart = () => {

  //meta title
  document.title="Apex Charts | Skote - قالب مدیریتی و داشبورد react";

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs title="نمودارها" breadcrumbItem="نمودارهای اوج" />

          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">خط با برچسب های داده</CardTitle>
                  <LineApexChart dataColors='["--bs-primary", "--bs-success"]' />
                </CardBody>
              </Card>
            </Col>

            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">خط چین</CardTitle>
                  <DashedLine dataColors='["--bs-primary", "--bs-danger", "--bs-success"]' />
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4"> منطقه اسپلاین </CardTitle>
                  <SplineArea dataColors='["--bs-primary", "--bs-success"]' />
                </CardBody>
              </Card>
            </Col>

            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4"> نمودار ستونی </CardTitle>
                  <Apaexlinecolumn dataColors='["--bs-danger","--bs-primary", "--bs-success"]' />
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">Dumbbell نمودار ستونی</CardTitle>

                  <DumbelColumnChart dataColors='["--bs-primary", "--bs-success"]' />
                </CardBody>
              </Card>
            </Col>

            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">نمودارهای مساحت محدوده</CardTitle>
                  <RangeAreaChart dataColors='["--bs-primary"]' />
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="card-title mb-4">
                    نمودار جدول زمانی Dumbbell (افقی)
                  </CardTitle>

                  <DumbelHorizontalChart dataColors='["--bs-primary", "--bs-success"]' />
                </CardBody>
              </Card>
            </Col>

            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="card-title mb-4">
                    نمودارهای قیف
                  </CardTitle>

                  <FunnelChart dataColors='["--bs-primary"]' />
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">
                    ستون با برچسب های داده{" "}
                  </CardTitle>
                  <ColumnWithDataLabels dataColors='["--bs-primary"]' />
                </CardBody>
              </Card>
            </Col>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">نمودار میله ای</CardTitle>
                  <BarChart dataColors='["--bs-success"]' />
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">خط، ستون </CardTitle>
                  <LineColumnArea dataColors='["--bs-danger","--bs-primary", "--bs-success"]' />
                </CardBody>
              </Card>
            </Col>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">نمودار شعاعی</CardTitle>
                  <RadialChart dataColors='["--bs-primary","--bs-success", "--bs-danger", "--bs-warning"]' />
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">نمودار دایره ای </CardTitle>
                  <PieChart dataColors='["--bs-success","--bs-primary", "--bs-danger","--bs-info", "--bs-warning"]' />
                </CardBody>
              </Card>
            </Col>
            <Col xl={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">نمودار دوناتی</CardTitle>
                  <DonutChart dataColors='["--bs-success","--bs-primary", "--bs-danger","--bs-info", "--bs-warning"]' />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Apexchart
