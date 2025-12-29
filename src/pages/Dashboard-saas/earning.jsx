import React, { useEffect, useState } from "react";
import { Row, Col, Card, CardBody } from "reactstrap";
import { Link } from "react-router-dom";
import ReactApexChart from "react-apexcharts";

//actions
import { getEarningChartsData } from "../../store/actions";

//redux
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";

import getChartColorsArray from "../../components/Common/ChartsDynamicColor";

const Earning = ({ dataColors }) => {
  const dispatch = useDispatch();
  const apexlineColors = getChartColorsArray(dataColors);

  const DashboardsaasProperties = createSelector(
    (state) => state.DashboardSaas,
      (dashboardSaas) => ({
        earningChartData: dashboardSaas.earningChartData,
      })
  );

  const {
    earningChartData
  } = useSelector(DashboardsaasProperties);

  

  const options = {
    chart: {
      toolbar: "false",
      dropShadow: {
        enabled: !0,
        color: "#000",
        top: 18,
        left: 7,
        blur: 8,
        opacity: 0.2,
      },
    },
    dataLabels: {
      enabled: !1,
    },
    colors: apexlineColors,
    stroke: {
      curve: "smooth",
      width: 3,
    },
  };

  const series = [
    {
      name: "شماره سریال",
      data: [...earningChartData],
    },
  ];

  /*
  call api action to receive data
  */
  useEffect(() => {
    dispatch(getEarningChartsData("jan"));
  }, [dispatch]);

  const [seletedMonth, setSeletedMonth] = useState("jan");
  const onChangeMonth = (value) => {
    setSeletedMonth(value);
    dispatch(getEarningChartsData(value));
  };

  return (
    <React.Fragment>
      <Col xl="8">
        <Card>
          <CardBody>
            <div className="clearfix">
              <div className="float-end">
                <div className="input-group input-group-sm">
                  <select
                    className="form-select form-select-sm"
                    value={seletedMonth}
                    onChange={(e) => {
                      onChangeMonth(e.target.value);
                    }}
                  >
                    <option value="jan">فروردین</option>
                    <option value="dec">اردیبهشت</option>
                    <option value="nov">خرداد</option>
                    <option value="oct">تیر</option>
                  </select>
                  <label className="input-group-text">ماه</label>
                </div>
              </div>
              <h4 className="card-title mb-4">درآمد</h4>
            </div>

            <Row>
              <Col lg="4">
                <div className="text-muted">
                  <div className="mb-4">
                    <p>این ماه</p>
                    <h4>245.335.000 تومان</h4>
                    <div>
                      <span className="badge badge-soft-success font-size-12 me-1">
                        {" "}
                        + 0.2%{" "}
                      </span>{" "}
                      از دوره قبل
                    </div>
                  </div>

                  <div>
                    <Link to="#" className="btn btn-primary  btn-sm">
                      دیدن جزئیات{" "}
                      <i className="mdi mdi-chevron-left ms-1"></i>
                    </Link>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2">ماه گذشته</p>
                    <h5>228.104.000 تومان</h5>
                  </div>
                </div>
              </Col>

              <Col lg="8">
                <div id="line-chart" dir="ltr">
                  <ReactApexChart
                    series={series}
                    options={options}
                    type="line"
                    height={320}
                    className="apex-charts"
                  />
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  );
};

export default Earning;
