// src/app/admin/unauthorized/page.js
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-8">
        <div className="mb-6">
          <span className="text-6xl">🚫</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          접근 권한이 없습니다
        </h1>

        <p className="text-gray-600 mb-8">
          이 페이지는 관리자 권한이 필요합니다.<br />
          일반 사용자는 접근할 수 없습니다.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            ← 이전 페이지
          </button>

          <Link
            href="/dashboard"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            대시보드로 이동
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            관리자 권한이 필요하신가요?<br />
            시스템 관리자에게 문의하세요.
          </p>
        </div>
      </div>
    </div>
  )
}

