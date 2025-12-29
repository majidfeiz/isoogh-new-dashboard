import React from 'react';
import ReactApexChart from "react-apexcharts";

import getChartColorsArray from "../../components/Common/ChartsDynamicColor";

const JobWidgetCharts = ({ dataColors, series }) => {
    var areacharteathereumColors = getChartColorsArray(dataColors);

    var options = {
        chart: {
            width: 130,
            height: 46,
            type: "area",
            sparkline: {
                enabled: true,
            },
            toolbar: {
                show: false,
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: "smooth",
            width: 1.5,
        },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                inverseColors: false,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [50, 100, 100, 100],
            },
        },
        tooltip: {
            fixed: {
                enabled: false
            },
            x: {
                show: false
            },
            y: {
                title: {
                    formatter: function (seriesName) {
                        return '';
                    }
                }
            },
            marker: {
                show: false
            }
        },
        colors: areacharteathereumColors,
    };
    return (
        <React.Fragment>
            <ReactApexChart
                options={options}
                series={series}
                type="area"
                height="46"
                width="130"
                className="apex-charts"
            />
        </React.Fragment>
    );
};

const StatisticsApplicationsChart = ({ seriesData, dataColors }) => {
    var statisticsApplicationColors = getChartColorsArray(dataColors);

    const series = [
      {
        name: "شرکت",
        type: "column",
        data: seriesData?.company || [],
      },
      {
        name: "شغل جدید",
        type: "column",
        data: seriesData?.newJobs || [],
      },
      {
        name: "مجموع شغل ها",
        type: "area",
        data: seriesData?.totalJobs || [],
      },
      {
        name: "نمای شغل",
        type: "line",
        data: seriesData?.jobView || [],
      },
    ];
    var options = {
      chart: {
        height: 350,
        type: "line",
        stacked: false,
        toolbar: {
          show: false,
        },
      },
      legend: {
        show: true,
        offsetY: 10,
      },
      stroke: {
        width: [0, 0, 2, 2],
        curve: "smooth",
      },
      plotOptions: {
        bar: {
          columnWidth: "30%",
        },
      },
      fill: {
        opacity: [1, 1, 0.1, 1],
        gradient: {
          inverseColors: false,
          shade: "light",
          type: "vertical",
          opacityFrom: 0.85,
          opacityTo: 0.55,
          stops: [0, 100, 100, 100],
        },
      },
      labels: [
        "01/01/1401",
        "02/01/1401",
        "03/01/1401",
        "04/01/1401",
        "05/01/1401",
        "06/01/1401",
        "07/01/1401",
        "08/01/1401",
        "09/01/1401",
        "10/01/1401",
        "11/01/1401",
      ],
      colors: statisticsApplicationColors,
      markers: {
        size: 0,
      },
      xaxis: {
        type: "datetime",
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function (y) {
            if (typeof y !== "undefined") {
              return y.toFixed(0) + " نقطه";
            }
            return y;
          },
        },
      },
    };
    return (
        <React.Fragment>
            <ReactApexChart
                options={options}
                series={series}
                type="line"
                height="350"
                className="apex-charts pb-3"
            />
        </React.Fragment>
    );
};

const ReceivedTimeCharts = ({ dataColors }) => {
    var ApplicationReveicedTimeColors = getChartColorsArray(dataColors);

    const series = [
      {
        name: "درخواست دریافت کرد",
        data: [34, 44, 54, 21, 12, 43, 33, 80, 66],
      },
    ];
    var options = {
        chart: {
            type: 'line',
            height: 378,
            toolbar: {
                show: false,
            },
        },
        // stroke: {
        //     curve: 'stepline',
        // },
        stroke: {
            width: 3,
            curve: 'smooth'
        },
        labels: ['8 ب.ظ', '9 ب.ظ', '10 ق.ظ', '11 ب.ظ', '12 ب.ظ', '1 ق.ظ', '2 ق.ظ',
            '3 ق.ظ', '4 ق.ظ'
        ],
        dataLabels: {
            enabled: false
        },
        colors: ApplicationReveicedTimeColors,
        markers: {
            hover: {
                sizeOffset: 4
            }
        }
    };
    return (
        <React.Fragment>
            <ReactApexChart
                options={options}
                series={series}
                type="line"
                height="378px"
                width="456px"
                className="apex-charts"
            />
        </React.Fragment>
    );
};

export { JobWidgetCharts, StatisticsApplicationsChart, ReceivedTimeCharts };