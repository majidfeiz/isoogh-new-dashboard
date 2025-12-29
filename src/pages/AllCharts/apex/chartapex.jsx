import React from "react";
import ReactApexChart from "react-apexcharts";
import getChartColorsArray from "../../../components/Common/ChartsDynamicColor";

const chartapex = ({ dataColors }) => {
  const apaexlineChartColors = getChartColorsArray(dataColors);

  const series = [
    { name: "بالا - 1402", data: [26, 24, 32, 36, 33, 31, 33] },
    { name: "کم - 1402", data: [14, 11, 16, 12, 17, 13, 12] },
  ];
  const options = {
    chart: {
      height: 380,
      type: "line",
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    colors: apaexlineChartColors,
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: [3, 3],
      curve: "straight",
    },
    series: [
      {
        name: "زیاد - 1402",
        data: [26, 24, 32, 36, 33, 31, 33],
      },
      {
        name: "کم - 1402",
        data: [14, 11, 16, 12, 17, 13, 12],
      },
    ],
    title: {
      text: "میانگین بالا",
      align: "left",
      style: {
        fontWeight: "500",
      },
    },
    grid: {
      row: {
        colors: ["transparent", "transparent"], // takes an array which will be repeated on columns
        opacity: 0.2,
      },
      borderColor: "#f1f1f1",
    },
    markers: {
      style: "inverted",
      size: 6,
    },
    xaxis: {
      categories: [
        "فروردین",
        "اردیبهشت",
        "خرداد",
        "تیر",
        "مرداد",
        "شهریور",
        "مهر",
      ],
      title: {
        text: "ماه",
      },
    },
    yaxis: {
      title: {
        text: "درجه حرارت",
      },
      min: 5,
      max: 40,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      floating: true,
      offsetY: -25,
      offsetX: -5,
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          chart: {
            toolbar: {
              show: false,
            },
          },
          legend: {
            show: false,
          },
        },
      },
    ],
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

export default chartapex;
