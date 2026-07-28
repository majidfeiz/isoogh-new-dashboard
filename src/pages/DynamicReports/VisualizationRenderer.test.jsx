import React from "react";
import { render, screen } from "@testing-library/react";
import VisualizationRenderer, {
  buildChartModel,
} from "./VisualizationRenderer.jsx";

test("KPI renders displaySummary instead of the raw visualization value", () => {
  render(
    <VisualizationRenderer
      allowed={["kpi"]}
      visualization={{
        type: "kpi",
        data: [{ dimension: null, values: { lastCall: 1783656337 } }],
      }}
      summary={{ lastCall: "1405/04/19 11:05:37" }}
      summaryIsDisplay
    />
  );

  expect(screen.getByText("1405/04/19 11:05:37")).toBeInTheDocument();
  expect(screen.queryByText("1783656337")).not.toBeInTheDocument();
});

test("chart model continues to consume the raw normalized visualization dataset", () => {
  const visualization = {
    type: "line",
    data: [
      { dimension: 1783656000, values: { count: 3 } },
      { dimension: 1783656337, values: { count: 5 } },
    ],
  };

  const model = buildChartModel(visualization);

  expect(model.categories).toEqual([1783656000, 1783656337]);
  expect(model.series).toEqual([{ name: "count", data: [3, 5] }]);
});
