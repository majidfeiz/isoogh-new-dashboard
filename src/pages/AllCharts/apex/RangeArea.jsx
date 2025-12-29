import React from "react"
import ReactApexChart from "react-apexcharts"
import getChartColorsArray from "../../../components/Common/ChartsDynamicColor";

const RangeAreaChart = ({dataColors}) => {
  const RangeAreaChartColors = getChartColorsArray(dataColors);

  const series= [
    {
        name: 'New York Temperature',
        data: [
            {
                x: 'فروردین',
                y: [-2, 4]
            },
            {
                x: 'اردیبهشت',
                y: [-1, 6]
            },
            {
                x: 'خرداد',
                y: [3, 10]
            },
            {
                x: 'تیر',
                y: [8, 16]
            },
            {
                x: 'مرداد',
                y: [13, 22]
            },
            {
                x: 'شهریور',
                y: [18, 26]
            },
            {
                x: 'مهر',
                y: [21, 29]
            },
            {
                x: 'آبان',
                y: [21, 28]
            },
            {
                x: 'آذر',
                y: [17, 24]
            },
            {
                x: 'دی',
                y: [11, 18]
            },
            {
                x: 'بهمن',
                y: [6, 12]
            },
            {
                x: 'اسفند',
                y: [1, 7]
            }
        ]
    }
];
  const options = {
    chart: {
      height: 350,
      type: "rangeArea",
    },
    colors: RangeAreaChartColors,
    stroke: {
      curve: "straight",
    },
    title: {
      text: "دمای تهران (در تمام طول سال)",
    },
    markers: {
      hover: {
        sizeOffset: 5,
      },
    },
    dataLabels: {
      enabled: false,
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          return val + "°C";
        },
      },
    },
  };

  return (
    <ReactApexChart options={options} series={series} type="rangeArea" height="365" />
  )
}

export default RangeAreaChart
