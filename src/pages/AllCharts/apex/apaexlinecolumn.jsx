import React from "react";
import ReactApexChart from "react-apexcharts";
import getChartColorsArray from "../../../components/Common/ChartsDynamicColor";

const Apaexlinecolumn = ({ dataColors }) => {
  const apaexlineColumnColors = getChartColorsArray(dataColors);
  const series = [
    {
      name: "سود خالص",
      data: [46, 57, 59, 54, 62, 58, 64, 60, 66],
    },
    {
      name: "درآمد",
      data: [74, 83, 102, 97, 86, 106, 93, 114, 94],
    },
    {
      name: "جریان ازاد نقدینگی",
      data: [37, 42, 38, 26, 47, 50, 54, 55, 43],
    },
  ];
  const options = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },

    colors: apaexlineColumnColors,
    xaxis: {
      categories: [
        "فروردین",
        "اردیبهشت",
        "خرداد",
        "تیر",
        "مرداد",
        "شهریور",
        "مهر",
        "آبان",
        "آذر",
      ],
    },
    yaxis: {
      title: {
        text: "تومان (هزاران)",
      },
    },
    grid: {
      borderColor: "#f1f1f1",
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return "تومان " + val + " هزاران";
        },
      },
    },
  };

  return (
    <ReactApexChart options={options} series={series} type="bar" height={350} />
  );
};

export default Apaexlinecolumn;
