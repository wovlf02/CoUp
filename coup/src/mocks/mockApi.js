// Mock API 헬퍼 함수

// Mock API 지연 시뮬레이션
export const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock API Response 래퍼
export const mockApiCall = async (data, shouldFail = false, delayMs = 500) => {
  await delay(delayMs)

  if (shouldFail) {
    throw new Error('Mock API Error')
  }

  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  }
}

// 로컬 스토리지 기반 Mock DB
export class MockDB {
  static get(key) {
    if (typeof window === 'undefined') return null
    const data = localStorage.getItem(`mock_${key}`)
    return data ? JSON.parse(data) : null
  }

  static set(key, value) {
    if (typeof window === 'undefined') return
    localStorage.setItem(`mock_${key}`, JSON.stringify(value))
  }

  static clear(key) {
    if (typeof window === 'undefined') return
    localStorage.removeItem(`mock_${key}`)
  }

  static clearAll() {
    if (typeof window === 'undefined') return
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('mock_')) {
        localStorage.removeItem(key)
      }
    })
  }
}

