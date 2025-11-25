'use client'

import { useState, useEffect } from 'react'
import styles from './CurrentTimeWidget.module.css'

export default function CurrentTimeWidget() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const weekdays = ['일', '월', '화', '수', '목', '금', '토']
    const weekday = weekdays[date.getDay()]

    return `${year}년 ${month}월 ${day}일 (${weekday})`
  }

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `${hours}:${minutes}:${seconds}`
  }

  return (
    <div className={styles.timeWidget}>
      <div className={styles.timeIcon}>🕐</div>
      <div className={styles.timeContent}>
        <div className={styles.timeDisplay}>{formatTime(currentTime)}</div>
        <div className={styles.timeDate}>{formatDate(currentTime)}</div>
      </div>
    </div>
  )
}

