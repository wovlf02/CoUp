// src/lib/api/client.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.error || 'API 요청 실패',
        response.status,
        data
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError('네트워크 오류가 발생했습니다', 500, null)
  }
}

export const api = {
  // GET 요청
  get: (endpoint, params) => {
    if (params) {
      // undefined, null, 빈 문자열 제거
      const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value
        }
        return acc
      }, {})

      const queryString =
        Object.keys(cleanParams).length > 0
          ? '?' + new URLSearchParams(cleanParams).toString()
          : ''
      return fetchAPI(endpoint + queryString, { method: 'GET' })
    }
    return fetchAPI(endpoint, { method: 'GET' })
  },

  // POST 요청
  post: (endpoint, data) => {
    return fetchAPI(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // PATCH 요청
  patch: (endpoint, data) => {
    return fetchAPI(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  // DELETE 요청
  delete: (endpoint) => {
    return fetchAPI(endpoint, {
      method: 'DELETE',
    })
  },

  // 파일 업로드
  upload: (endpoint, formData) => {
    return fetchAPI(endpoint, {
      method: 'POST',
      headers: {}, // Content-Type을 자동으로 설정
      body: formData,
    })
  },
}

export { ApiError }
