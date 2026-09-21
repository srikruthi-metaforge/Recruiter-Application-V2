import React from 'react'
import Plot from 'react-plotly.js'

export interface RecruiterChartMetric {
  name: string
  fullName: string
  totalSubmissions: number
  totalRequirements: number
  firstSubmissions: number
  avgTATDays: number
}

const ALL_RECRUITERS_DATA: RecruiterChartMetric[] = [
  { name: 'lakshmi.v', fullName: 'lakshmi.v Recruiter', totalSubmissions: 143, totalRequirements: 69, firstSubmissions: 53, avgTATDays: 0.62 },
  { name: 'Suresh k.', fullName: 'Suresh kulkarni', totalSubmissions: 40, totalRequirements: 26, firstSubmissions: 13, avgTATDays: 3.31 },
  { name: 'Charlie D.', fullName: 'Charlie Darwin', totalSubmissions: 37, totalRequirements: 27, firstSubmissions: 22, avgTATDays: 3.32 },
  { name: 'Harini S.', fullName: 'Harini Sindey', totalSubmissions: 32, totalRequirements: 13, firstSubmissions: 6, avgTATDays: 0.67 },
  { name: 'rahimoon S.', fullName: 'rahimoon Shaik', totalSubmissions: 24, totalRequirements: 14, firstSubmissions: 11, avgTATDays: 1.18 },
  { name: 'Lingoji P.', fullName: 'Lingoji Pavani', totalSubmissions: 11, totalRequirements: 7, firstSubmissions: 4, avgTATDays: 0.25 },
  { name: 'Viswanath R.', fullName: 'Viswanath Reddy', totalSubmissions: 5, totalRequirements: 4, firstSubmissions: 2, avgTATDays: 2.0 },
  { name: 'Rachana G.', fullName: 'Rachana Golkonda', totalSubmissions: 3, totalRequirements: 3, firstSubmissions: 0, avgTATDays: 0.0 },
  { name: 'Nithya M.', fullName: 'Nithya Maripelly', totalSubmissions: 1, totalRequirements: 1, firstSubmissions: 1, avgTATDays: 4.0 },
]

export function PlotlyRecruiterPerformanceChart() {
  const xNames = ALL_RECRUITERS_DATA.map(d => d.name)
  const submissions = ALL_RECRUITERS_DATA.map(d => d.totalSubmissions)
  const requirements = ALL_RECRUITERS_DATA.map(d => d.totalRequirements)
  const firstSubmissions = ALL_RECRUITERS_DATA.map(d => d.firstSubmissions)
  const tatDays = ALL_RECRUITERS_DATA.map(d => d.avgTATDays)

  return (
    <div className="w-full h-[340px] bg-slate-50/50 rounded-2xl border border-slate-200/80 p-2 overflow-hidden">
      <Plot
        data={[
          {
            x: xNames,
            y: submissions,
            name: 'Total Submissions',
            type: 'bar',
            marker: { color: '#2563EB' },
          },
          {
            x: xNames,
            y: requirements,
            name: 'Total Requirements',
            type: 'bar',
            marker: { color: '#DC2626' },
          },
          {
            x: xNames,
            y: firstSubmissions,
            name: 'First Submissions (won)',
            type: 'bar',
            marker: { color: '#16A34A' },
          },
          {
            x: xNames,
            y: tatDays,
            name: 'Avg First-Sub TAT (days)',
            type: 'scatter',
            mode: 'lines+markers',
            yaxis: 'y2',
            line: { color: '#9333EA', width: 3 },
            marker: { color: '#9333EA', size: 8 },
          },
        ]}
        layout={{
          autosize: true,
          margin: { l: 40, r: 40, t: 30, b: 40 },
          barmode: 'group',
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          showlegend: true,
          legend: { orientation: 'h', y: 1.15, font: { size: 11, family: 'sans-serif' } },
          xaxis: { tickfont: { size: 10, family: 'sans-serif' } },
          yaxis: { title: 'Counts', range: [0, 160], tickfont: { size: 10, family: 'sans-serif' } },
          yaxis2: {
            title: 'TAT (days)',
            overlaying: 'y',
            side: 'right',
            range: [0, 4.5],
            tickfont: { size: 10, color: '#9333EA', family: 'sans-serif' },
          },
        }}
        useResizeHandler={true}
        className="w-full h-full"
        config={{ displayModeBar: true, responsive: true }}
      />
    </div>
  )
}
