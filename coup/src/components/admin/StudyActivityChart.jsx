'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import styles from './StudyActivityChart.module.css'

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function StudyActivityChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="category"
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
        {/* Note: Recharts Tooltip requires contentStyle prop - cannot be moved to CSS */}
        <Bar dataKey="count" name="스터디 수" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

