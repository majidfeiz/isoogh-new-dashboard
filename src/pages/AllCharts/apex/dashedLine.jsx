import React from "react";
import ReactApexChart from "react-apexcharts";
import getChartColorsArray from "../../../components/Common/ChartsDynamicColor";

const DashedLine = ({ dataColors }) => {
  const dashedLineChartColors = getChartColorsArray(dataColors);

  const series = [
    {
      name: "مدت زمان جلسه",
      data: [45, 52, 38, 24, 33, 26, 21, 20, 6, 8, 15, 10],
    },
    {
      name: "بازدید از صفحه",
      data: [36, 42, 60, 42, 13, 18, 29, 37, 36, 51, 32, 35],
    },
    {
      name: "مجموع بازدیدها",
      data: [89, 56, 74, 98, 72, 38, 64, 46, 84, 58, 46, 49],
    },
  ];
  const options = {
    chart: { zoom: { enabled: !1 }, toolbar: { show: !1 } },
    colors: dashedLineChartColors,
    dataLabels: { enabled: !1 },
    stroke: { width: [3, 4, 3], curve: "straight", dashArray: [0, 8, 5] },
    title: { text: "آمار صفحه", align: "left" },
    markers: { size: 0, hover: { sizeOffset: 6 } },
    xaxis: {
      categories: [
        "01 فروردین",
        "02 فروردین",
        "03 فروردین",
        "04 فروردین",
        "05 فروردین",
        "06 فروردین",
        "07 فروردین",
        "08 فروردین",
        "09 فروردین",
        "10 فروردین",
        "11 فروردین",
        "12 فروردین",
      ],
    },
    tooltip: {
      y: [
        {
          title: {
            formatter: function (e) {
              return e + " (دقیقه)";
            },
          },
        },
        {
          title: {
            formatter: function (e) {
              return e + " در هر جلسه";
            },
          },
        },
        {
          title: {
            formatter: function (e) {
              return e;
            },
          },
        },
      ],
    },
    grid: { borderColor: "#f1f1f1" },
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="line"
      height="380"
      className="apex-charts"
    />
  );
};

export default DashedLine;
