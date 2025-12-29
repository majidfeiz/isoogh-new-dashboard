import React from "react"
import ReactApexChart from "react-apexcharts"
import getChartColorsArray from "../../../components/Common/ChartsDynamicColor";

const DumbelHorizontalChart = ({dataColors}) => {
  const DumbelHorizontalChartColors = getChartColorsArray(dataColors);

  const series = [
    {
      data: [
        {
          x: "عملیات",
          y: [2800, 4500],
        },
        {
          x: "موفقیت مشتری",
          y: [3200, 4100],
        },
        {
          x: "مهندسی",
          y: [2950, 7800],
        },
        {
          x: "بازار یابی",
          y: [3000, 4600],
        },
        {
          x: "محصول",
          y: [3500, 4100],
        },
        {
          x: "علم داده",
          y: [4500, 6500],
        },
        {
          x: "حراجی",
          y: [4100, 5600],
        },
      ],
    },
  ];
  const options = {
    chart: {
      zoom: {
        enabled: false,
      },
    },
    colors: DumbelHorizontalChartColors,
    plotOptions: {
      bar: {
        horizontal: true,
        isDumbbell: true,
        dumbbellColors: DumbelHorizontalChartColors,
      },
    },
    title: {
      text: "نابرابری Paygap",
    },
    legend: {
      show: true,
      showForSingleSeries: true,
      position: "top",
      horizontalAlign: "left",
      customLegendItems: ["زن", "مرد"],
    },
    fill: {
      type: "gradient",
      gradient: {
        gradientToColors: ["#36BDCB"],
        inverseColors: false,
        stops: [0, 100],
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
  };

  return (
    <ReactApexChart options={options} series={series} type="rangeBar" height="390" />
  )
}

export default DumbelHorizontalChart
