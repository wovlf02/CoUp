'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import styles from './UserGrowthChart.module.css'

export default function UserGrowthChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="date"
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
        <Legend
          wrapperStyle={{ fontSize: '0.875rem' }}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#6366F1"
          name="총 사용자"
          strokeWidth={2}
          dot={{ fill: '#6366F1', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="active"
          stroke="#10B981"
          name="활성 사용자"
          strokeWidth={2}
          dot={{ fill: '#10B981', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="new"
          stroke="#3B82F6"
          name="신규 가입"
          strokeWidth={2}
          dot={{ fill: '#3B82F6', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

