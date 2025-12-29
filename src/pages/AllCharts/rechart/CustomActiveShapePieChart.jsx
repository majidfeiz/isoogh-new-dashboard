import React from "react";
import { ResponsiveContainer, PieChart, Pie } from "recharts";

const data = [
  { name: "گروه A", value: 400 },
  { name: "گروه B", value: 300 },
  { name: "گروه C", value: 300 },
  { name: "گروه D", value: 200 },
];


export default function SimpleTreeMap() {

  return (
    <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie dataKey="value" data={data} fill="#8884d8" label />
          </PieChart>
        </ResponsiveContainer>
      </div>
  );
}