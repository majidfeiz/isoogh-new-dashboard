import React, { useEffect } from "react";
import { Row, Col, Card, CardBody } from "reactstrap";
import { Link } from "react-router-dom";
import ReactApexChart from "react-apexcharts";

//actions
import { getWalletbalanceData } from "../../store/actions";

//redux
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";

import getChartColorsArray from "../../components/Common/ChartsDynamicColor";

const WalletBalance = ({ dataColors }) => {
  const dispatch = useDispatch();

  const DashboardblogProperties = createSelector(
    (state) => state.DashboardCrypto,
    (dashboardCrypto) => ({
      walletbalanceData: dashboardCrypto.walletbalanceData
    })
  );

  const {
    walletbalanceData
  } = useSelector(DashboardblogProperties);

  const walletBalanceChartColors = getChartColorsArray(dataColors);
  const cryptoChartData = walletbalanceData[0];
  const series = cryptoChartData?.series || [];
  const availablebalance = cryptoChartData?.availablebalance;
  const income = cryptoChartData?.income;
  const expense = cryptoChartData?.Expense;
  const ethereum = cryptoChartData?.Ethereum;
  const bitcoin = cryptoChartData?.Bitcoin;
  const litecoin = cryptoChartData?.Litecoin;
  /*
call api action to receive data
*/
  useEffect(() => {
    dispatch(getWalletbalanceData("1"));
  }, [dispatch]);

  const handleChangesearies = (ele) => {
    dispatch(getWalletbalanceData(ele.value))
  }

  const walletOptions = {
    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: 0,
        endAngle: 270,
        hollow: {
          margin: 5,
          size: "35%",
          background: "transparent",
          image: void 0,
        },
        track: {
          show: !0,
          startAngle: void 0,
          endAngle: void 0,
          background: "#f2f2f2",
          strokeWidth: "97%",
          opacity: 1,
          margin: 12,
          dropShadow: {
            enabled: !1,
            top: 0,
            left: 0,
            blur: 3,
            opacity: 0.5,
          },
        },
        dataLabels: {
          name: {
            show: !0,
            fontSize: "16px",
            fontWeight: 600,
            offsetY: -10,
          },
          value: {
            show: !0,
            fontSize: "14px",
            offsetY: 4,
            formatter: function (e) {
              return e + "%";
            },
          },
          total: {
            show: !0,
            label: "مجموع",
            color: "#373d3f",
            fontSize: "16px",
            fontFamily: void 0,
            fontWeight: 600,
            formatter: function (e) {
              return (
                e.globals.seriesTotals.reduce(function (e, t) {
                  return e + t;
                }, 0) + "%"
              );
            },
          },
        },
      },
    },
    stroke: {
      lineCap: "round",
    },
    colors: walletBalanceChartColors,
    labels: ["اتریوم", "بیت کوین", "اتریوم"],
    legend: { show: !1 },
  };

  return (
    <React.Fragment>
      <Col xl="8">
        <Card>
          <CardBody>
            <div className="float-end">
              <select
                defaultValue="MA"
                className="form-select form-select-sm ms-2"
                onChange={(e) => handleChangesearies(e.target)}
              >
                <option value="1">مهر</option>
                <option value="2">آبان</option>
                <option value="3">آذر</option>
                <option value="4">دی</option>
              </select>
            </div>
            <h4 className="card-title mb-3">موجودی کیف پول</h4>

            <Row>
              <Col lg="4">
                <div className="mt-4">
                  <p>موجودی موجود</p>
                  <h4>تومان {availablebalance}</h4>

                  <p className="text-muted mb-4">
                    {" "}
                    + 0.0012.23 ( 0.2 % ){" "}
                    <i className="mdi mdi-arrow-up ms-1 text-success" />
                  </p>

                  <Row>
                    <Col xs="6">
                      <div>
                        <p className="mb-2">درآمد</p>
                        <h5>تومان {income}</h5>
                      </div>
                    </Col>
                    <Col xs="6">
                      <div>
                        <p className="mb-2">هزینه</p>
                        <h5>تومان {expense}</h5>
                      </div>
                    </Col>
                  </Row>

                  <div className="mt-4">
                    <Link to="#" className="btn btn-primary btn-sm">
                      مشاهده بیشتر <i className="mdi mdi-arrow-left ms-1" />
                    </Link>
                  </div>
                </div>
              </Col>

              <Col lg="4" sm="6">
                <div>
                  <div id="wallet-balance-chart">
                    <ReactApexChart
                      options={walletOptions}
                      series={series}
                      type="radialBar"
                      height={300}
                      className="apex-charts"
                    />
                  </div>
                </div>
              </Col>

              <Col lg={4} sm={6} className="align-self-center">
                <div>
                  <p className="mb-2">
                    <i className="mdi mdi-circle align-middle font-size-10 me-2 text-primary" />{" "}
                    اتریوم
                  </p>
                  <h5>
                    {ethereum ? ethereum["ETH"] : ""} ETH =
                    <span className="text-muted font-size-14">
                     تومان {ethereum ? ethereum["Dollar"] : ""}
                    </span>
                  </h5>
                </div>

                <div className="mt-4 pt-2">
                  <p className="mb-2">
                    <i className="mdi mdi-circle align-middle font-size-10 me-2 text-warning" />{" "}
                    بیت کوین
                  </p>
                  <h5>
                    {bitcoin ? bitcoin["BTC"] : ""} BTC =
                    <span className="text-muted font-size-14">
                     تومان {bitcoin ? bitcoin["Dollar"] : ""}
                    </span>
                  </h5>
                </div>

                <div className="mt-4 pt-2">
                  <p className="mb-2">
                    <i className="mdi mdi-circle align-middle font-size-10 me-2 text-info" />{" "}
                    لایت کوین
                  </p>
                  <h5>
                    {litecoin ? litecoin["LTC"] : ""} LTC =
                    <span className="text-muted font-size-14">
                      تومان {litecoin ? litecoin["Dollar"] : ""}
                    </span>
                  </h5>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  );
};

export default WalletBalance;
