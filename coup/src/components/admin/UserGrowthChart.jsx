'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// 차트 커스텀 툴팁
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '0.875rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{ fontWeight: '600', marginBottom: '8px', color: '#111827' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color, margin: '4px 0' }}>
            {entry.name}: <strong>{entry.value.toLocaleString()}</strong>명
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function UserGrowthChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: '0.75rem', fill: '#6B7280' }}
          stroke="#9CA3AF"
        />
        <YAxis
          tick={{ fontSize: '0.75rem', fill: '#6B7280' }}
          stroke="#9CA3AF"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '0.875rem', paddingTop: '20px' }}
          iconType="line"
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#6366F1"
          name="총 사용자"
          strokeWidth={3}
          dot={{ fill: '#6366F1', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="active"
          stroke="#10B981"
          name="활성 사용자"
          strokeWidth={3}
          dot={{ fill: '#10B981', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="new"
          stroke="#3B82F6"
          name="신규 가입"
          strokeWidth={3}
          dot={{ fill: '#3B82F6', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

