import React from "react";
import { Radar, RadarChart, PolarGrid, Legend, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const data = [
  {
    subject: 'ریاضی',
    A: 120,
    B: 110,
    fullMark: 150,
  },
  {
    subject: 'شیمی',
    A: 98,
    B: 130,
    fullMark: 150,
  },
  {
    subject: 'زبان',
    A: 86,
    B: 130,
    fullMark: 150,
  },
  {
    subject: 'جغرافیا',
    A: 99,
    B: 100,
    fullMark: 150,
  },
  {
    subject: 'فیزیک',
    A: 85,
    B: 90,
    fullMark: 150,
  },
  {
    subject: 'تاریخ',
    A: 65,
    B: 85,
    fullMark: 150,
  },
];

export default function SpecifiedDomainRadarChart() {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <RadarChart cx={300} cy={150} outerRadius={150} data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 150]} />
          <Radar name="محمد" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          <Radar name="فاطمه" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
