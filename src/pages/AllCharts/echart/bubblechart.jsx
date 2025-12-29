import React from "react";
import ReactEcharts from "echarts-for-react";
// import echarts from "echarts";
import * as echarts from 'echarts'

const Bubble = () => {

  const data = [
    [
      [28604, 77, 17096869, "ایران", 1990],
      [31163, 77.4, 27662440, "قطر", 1990],
      [1516, 68, 1154605773, "چین", 1990],
      [13670, 74.7, 10582082, "کوبا", 1990],
      [28599, 75, 4986705, "فنلاند", 1990],
      [29476, 77.1, 56943299, "کویت", 1990],
      [31476, 75.4, 78958237, "سوریه", 1990],
      [28666, 78.1, 254830, "عربستان", 1990],
      [1777, 57.7, 870601776, "هند", 1990],
      [29550, 79.1, 122249285, "ژاپن", 1990],
      [2076, 67.9, 20194354, "کره شمالی", 1990],
      [12087, 72, 42972254, "کره جنوبی", 1990],
      [24021, 75.4, 3397534, "نیوزلند", 1990],
      [43296, 76.8, 4240375, "آذربایجان", 1990],
      [10088, 70.8, 38195258, "تایوان", 1990],
      [19349, 69.6, 147568552, "روسیه", 1990],
      [10670, 67.3, 53994605, "ترکیه", 1990],
      [26424, 75.7, 57110117, "انگلیس", 1990],
      [37062, 75.4, 252847810, "آمریکا", 1990],
    ],
    [
      [44056, 81.8, 23968973, "ایران", 2015],
      [43294, 81.7, 35939927, "قطر", 2015],
      [13334, 76.9, 1376048943, "کوبا", 2015],
      [21291, 78.5, 11389562, "فنلاند", 2015],
      [38923, 80.8, 5503457, "کویت", 2015],
      [37599, 81.9, 64395345, "سوریه", 2015],
      [44053, 81.1, 80688545, "عربستان", 2015],
      [42182, 82.8, 329425, "هند", 2015],
      [5903, 66.8, 1311050527, "ژاپن", 2015],
      [36162, 83.5, 126573481, "کوبا", 2015],
      [1390, 71.4, 25155317, "کره ی شمالی", 2015],
      [34644, 80.7, 50293439, "کره ی جنوبی", 2015],
      [34186, 80.6, 4528526, "نیوزلند", 2015],
      [64304, 81.6, 5210967, "آذربایجان", 2015],
      [24787, 77.3, 38611794, "تایوان", 2015],
      [23038, 73.13, 143456918, "روسیه", 2015],
      [19360, 76.5, 78665830, "ترکیه", 2015],
      [38225, 81.4, 64715810, "انگلیس", 2015],
      [53354, 79.1, 321773631, "آمریکا", 2015],
    ],
  ];

  const optionsData = {
    tooltip: {
      trigger: "axis",
      show: false,
    },
    toolbox: {
      show: false,
    },
    grid: {
      zlevel: 0,
      x: 50,
      x2: 50,
      y: 30,
      y2: 30,
      borderWidth: 0,
      backgroundColor: "rgba(0,0,0,0)",
      borderColor: "rgba(0,0,0,0)",
    },
    legend: {
      right: 10,
      data: ["2018", "2019"],
    },
    xAxis: {
      splitLine: {
        lineStyle: {
          type: "dashed",
        },
      },
      axisLine: {
        lineStyle: {
          color: "#8791af",
        },
      },
    },
    yAxis: {
      splitLine: {
        lineStyle: {
          type: "dashed",
        },
      },
      scale: true,
      axisLine: {
        lineStyle: {
          color: "#8791af",
        },
      },
    },
    series: [
      {
        name: "2018",
        data: data[0],
        type: "scatter",
        symbolSize: function (data) {
          return Math.sqrt(data[2]) / 5e2;
        },
        label: {
          emphasis: {
            show: true,
            formatter: function (param) {
              return param.data[3];
            },
            position: "top",
          },
        },
        itemStyle: {
          normal: {
            shadowBlur: 10,
            shadowColor: "rgba(85, 110, 230, 0.5)",
            shadowOffsetY: 5,
            color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
              {
                offset: 0,
                color: "rgb(85, 110, 230, 0.1)",
              },
              {
                offset: 1,
                color: "rgb(85, 110, 230)",
              },
            ]),
          },
        },
      },
      {
        name: "1400",
        data: data[1],
        type: "scatter",
        symbolSize: function (data) {
          return Math.sqrt(data[2]) / 5e2;
        },
        label: {
          emphasis: {
            show: true,
            formatter: function (param) {
              return param.data[3];
            },
            position: "top",
          },
        },
        itemStyle: {
          normal: {
            shadowBlur: 10,
            shadowColor: "rgba(116, 120, 141, 0.5)",
            shadowOffsetY: 5,
            color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
              {
                offset: 0,
                color: "rgb(111, 255, 203, 0.1)",
              },
              {
                offset: 1,
                color: "rgb(52, 195, 143)",
              },
            ]),
          },
        },
      },
    ],
  };

  return (
    <React.Fragment>
      <ReactEcharts style={{ height: "350px" }} option={optionsData} />
    </React.Fragment>
  );
};

export default Bubble;
