import React from "react";
import ReactEcharts from "echarts-for-react";
import getChartColorsArray from "../../../components/Common/ChartsDynamicColor";

const LineBar = ({ dataColors }) => {
  const spineareaChartColors = getChartColorsArray(dataColors);

  const options = {
    grid: {
      zlevel: 0,
      x: 80,
      x2: 50,
      y: 30,
      y2: 30,
      borderWidth: 0,
      backgroundColor: "rgba(0,0,0,0)",
      borderColor: "rgba(0,0,0,0)",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        crossStyle: {
          color: "#999",
        },
      },
    },
    toolbox: {
      orient: "center",
      left: 0,
      top: 20,
      feature: {
        dataView: { show: true, readOnly: false, title: "مشاهده داده ها" },
        magicType: {
          show: true,
          type: ["line", "bar"],
          title: { line: "برای نمودار خطی", bar: "برای نمودار میله ای" },
        },
        restore: { show: true, title: "بازگرداندن" },
        saveAsImage: { show: true, title: "دانلود تصویر" },
      },
    },
    color: spineareaChartColors,
    legend: {
      data: ["تبخیر", "ته نشینی", "میانگین دما"],
      textStyle: {
        color: ["#8791af"],
      },
    },
    xAxis: [
      {
        type: "category",
        data: [
          "فروردین",
          "اردیبهشت",
          "خرداد",
          "تیر",
          "مرداد",
          "شهریور",
          "مهر",
          "آبان",
        ],
        axisPointer: {
          type: "shadow",
        },
        axisLine: {
          lineStyle: {
            color: "#8791af",
          },
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        name: "حجم آب",
        min: 0,
        max: 250,
        interval: 50,
        axisLine: {
          lineStyle: {
            color: "#8791af",
          },
        },
        splitLine: {
          lineStyle: {
            color: "rgba(166, 176, 207, 0.1)",
          },
        },
        axisLabel: {
          formatter: "{value} ml",
        },
      },
      {
        type: "value",
        name: "دما",
        min: 0,
        max: 25,
        interval: 5,
        axisLine: {
          lineStyle: {
            color: "#8791af",
          },
        },
        splitLine: {
          lineStyle: {
            color: "rgba(166, 176, 207, 0.1)",
          },
        },
        axisLabel: {
          formatter: "{value} Ã‚Â°C",
        },
      },
    ],
    series: [
      {
        name: "تبخیر",
        type: "bar",
        data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2],
      },
      {
        name: "ته نشینی",
        type: "bar",
        data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2],
      },
      {
        name: "میانگین دما",
        type: "line",
        yAxisIndex: 1,
        data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4],
      },
    ],
    textStyle: {
      color: ["#74788d"],
    },
  };

  return (
    <React.Fragment>
      <ReactEcharts style={{ height: "350px" }} option={options} />
    </React.Fragment>
  );
};

export default LineBar;
