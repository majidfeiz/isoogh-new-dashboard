import React from "react"

import ReactApexChart from "react-apexcharts"

const areachart = () => {
  const options = {
    colors: ["#ccc", "#3c4ccf", "#02a499"],
    chart: {
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 0.1,
    },
    grid: {
      borderColor: "#f8f8fa",
      row: {
        colors: ["transparent", "transparent"], // takes an array which will be repeated on columns
        opacity: 0.5,
      },
    },
    xaxis: {
      categories: ["1398", "1398", "1399", "1400", "1401", "1402", "1402"],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: false,
    },
  }
  const series = [
    {
      name: "سری A",
      data: [0, 150, 60, 180, 90, 75, 30],
    },
    {
      name: "سری B",
      data: [0, 45, 150, 36, 60, 240, 30],
    },
    {
      name: "سری C",
      data: [0, 15, 195, 21, 360, 120, 30],
    },
  ];

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="area"
      height="290"
    />
  )
}

export default areachart
