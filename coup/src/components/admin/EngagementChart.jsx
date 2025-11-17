'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function EngagementChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="day"
          tick={{ fontSize: '0.75rem' }}
          stroke="#9CA3AF"
        />
        <YAxis
          tick={{ fontSize: '0.75rem' }}
          stroke="#9CA3AF"
        />
        <Tooltip
          contentStyle={{
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '0.875rem'
          }}
        />
        <Line
          type="monotone"
          dataKey="engagement"
          stroke="#6366F1"
          name="참여도 (%)"
          strokeWidth={2}
          dot={{ fill: '#6366F1', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

