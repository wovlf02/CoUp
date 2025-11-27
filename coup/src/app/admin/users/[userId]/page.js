// src/app/admin/users/[userId]/page.js
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId

  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [sanctions, setSanctions] = useState(null)
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSanctionModal, setShowSanctionModal] = useState(null) // 'warn', 'suspend', 'unsuspend'

  useEffect(() => {
    fetchUserDetails()
  }, [userId])

  const fetchUserDetails = async () => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`)
      const data = await res.json()

      if (data.success) {
        setUser(data.data.user)
        setStats(data.data.stats)
        setSanctions(data.data.sanctions)
        setReports(data.data.reports)
      } else {
        alert('사용자를 찾을 수 없습니다')
        router.push('/admin/users')
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      alert('사용자 정보를 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleWarn = async (reason) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/warn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, sendEmail: true })
      })
      const data = await res.json()

      if (data.success) {
        alert(`경고가 발송되었습니다 (누적: ${data.data.warningCount}회)`)
        setShowSanctionModal(null)
        fetchUserDetails()
      } else {
        alert(data.error || '경고 발송에 실패했습니다')
      }
    } catch (error) {
      console.error('Failed to warn user:', error)
      alert('경고 발송 중 오류가 발생했습니다')
    }
  }

  const handleSuspend = async (duration, reason) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration, reason, sendEmail: true })
      })
      const data = await res.json()

      if (data.success) {
        alert('사용자가 정지되었습니다')
        setShowSanctionModal(null)
        fetchUserDetails()
      } else {
        alert(data.error || '정지 실행에 실패했습니다')
      }
    } catch (error) {
      console.error('Failed to suspend user:', error)
      alert('정지 실행 중 오류가 발생했습니다')
    }
  }

  const handleUnsuspend = async (reason) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/unsuspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, sendNotification: true })
      })
      const data = await res.json()

      if (data.success) {
        alert('정지가 해제되었습니다')
        setShowSanctionModal(null)
        fetchUserDetails()
      } else {
        alert(data.error || '정지 해제에 실패했습니다')
      }
    } catch (error) {
      console.error('Failed to unsuspend user:', error)
      alert('정지 해제 중 오류가 발생했습니다')
    }
  }

  if (loading) {
    return <div className="text-center py-12">로딩 중...</div>
  }

  if (!user) {
    return <div className="text-center py-12 text-red-600">사용자를 찾을 수 없습니다</div>
  }

  return (
    <div>
      {/* 뒤로가기 */}
      <button
        onClick={() => router.back()}
        className="mb-6 text-indigo-600 hover:text-indigo-800 flex items-center"
      >
        ← 뒤로가기
      </button>

      {/* 사용자 정보 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-20 h-20 rounded-full" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-2xl font-medium">
                {user.name?.[0] || 'U'}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name || '이름 없음'}</h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1">ID: {user.id}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  user.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.status === 'ACTIVE' ? '활성' : user.status === 'SUSPENDED' ? '정지' : '탈퇴'}
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                  {user.role}
                </span>
                <span className="text-xs text-gray-500">
                  {user.provider === 'CREDENTIALS' ? '이메일' : user.provider}
                </span>
              </div>
              {user.status === 'SUSPENDED' && (
                <p className="text-sm text-red-600 mt-2">
                  정지 사유: {user.suspendReason}
                  {user.suspendedUntil && ` (${new Date(user.suspendedUntil).toLocaleDateString('ko-KR')}까지)`}
                </p>
              )}
            </div>
          </div>

          {/* 제재 버튼 */}
          <div className="flex space-x-2">
            <button
              onClick={() => setShowSanctionModal('warn')}
              className="px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200"
            >
              ⚠️ 경고
            </button>
            {user.status === 'SUSPENDED' ? (
              <button
                onClick={() => setShowSanctionModal('unsuspend')}
                className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
              >
                ✅ 정지 해제
              </button>
            ) : (
              <button
                onClick={() => setShowSanctionModal('suspend')}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
              >
                ⛔ 정지
              </button>
            )}
          </div>
        </div>

        {/* 추가 정보 */}
        {user.bio && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-700">{user.bio}</p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">가입일:</span>{' '}
            <span className="font-medium">{new Date(user.createdAt).toLocaleDateString('ko-KR')}</span>
          </div>
          <div>
            <span className="text-gray-600">최근 로그인:</span>{' '}
            <span className="font-medium">
              {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('ko-KR') : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="참여 스터디" value={stats.studyCount} icon="📚" />
        <StatCard title="작성 공지" value={stats.noticeCount} icon="📢" />
        <StatCard title="업로드 파일" value={stats.fileCount} icon="📎" />
        <StatCard title="채팅 메시지" value={stats.messageCount} icon="💬" />
      </div>

      {/* 제재 이력 & 신고 이력 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 제재 이력 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            제재 이력
          </h2>
          <div className="flex space-x-4 mb-4 text-sm">
            <div>
              <span className="text-gray-600">경고:</span>{' '}
              <span className="font-medium text-yellow-600">{sanctions.warningCount}회</span>
            </div>
            <div>
              <span className="text-gray-600">정지:</span>{' '}
              <span className="font-medium text-red-600">{sanctions.suspendCount}회</span>
            </div>
          </div>
          <div className="space-y-3">
            {sanctions.recentSanctions.length === 0 ? (
              <p className="text-sm text-gray-500">제재 이력이 없습니다</p>
            ) : (
              sanctions.recentSanctions.map(sanction => (
                <div key={sanction.id} className="p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {sanction.type === 'WARNING' && '⚠️'}
                      {sanction.type === 'SUSPEND' && '⛔'}
                      {sanction.type === 'UNSUSPEND' && '✅'}
                    </span>
                    <span className="text-sm font-medium">
                      {sanction.type === 'WARNING' && '경고'}
                      {sanction.type === 'SUSPEND' && '정지'}
                      {sanction.type === 'UNSUSPEND' && '정지 해제'}
                    </span>
                    {sanction.duration && (
                      <span className="text-xs text-gray-500">({sanction.duration})</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{sanction.reason}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(sanction.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 신고 이력 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            신고 이력
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 rounded">
              <p className="text-sm font-medium text-red-900">신고당한 횟수</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{reports.reportedCount}회</p>
            </div>
            <div className="p-3 bg-blue-50 rounded">
              <p className="text-sm font-medium text-blue-900">신고한 횟수</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{reports.reporterCount}회</p>
            </div>
          </div>
        </div>
      </div>

      {/* 제재 모달 */}
      {showSanctionModal && (
        <SanctionModal
          type={showSanctionModal}
          onClose={() => setShowSanctionModal(null)}
          onConfirm={(data) => {
            if (showSanctionModal === 'warn') {
              handleWarn(data.reason)
            } else if (showSanctionModal === 'suspend') {
              handleSuspend(data.duration, data.reason)
            } else if (showSanctionModal === 'unsuspend') {
              handleUnsuspend(data.reason)
            }
          }}
        />
      )}
    </div>
  )
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  )
}

function SanctionModal({ type, onClose, onConfirm }) {
  const [reason, setReason] = useState('')
  const [duration, setDuration] = useState('1일')

  const titles = {
    warn: '경고 발송',
    suspend: '사용자 정지',
    unsuspend: '정지 해제'
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (reason.length < 10) {
      alert('사유는 최소 10자 이상 입력해주세요')
      return
    }
    onConfirm({ reason, duration: type === 'suspend' ? duration : undefined })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{titles[type]}</h2>

        <form onSubmit={handleSubmit}>
          {type === 'suspend' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                정지 기간
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="1일">1일</option>
                <option value="3일">3일</option>
                <option value="7일">7일</option>
                <option value="30일">30일</option>
                <option value="영구">영구</option>
              </select>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사유 (10-200자)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="제재 사유를 입력하세요..."
              required
              minLength={10}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{reason.length}/200</p>
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              취소
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-md ${
                type === 'warn' ? 'bg-yellow-600 hover:bg-yellow-700' :
                type === 'suspend' ? 'bg-red-600 hover:bg-red-700' :
                'bg-green-600 hover:bg-green-700'
              }`}
            >
              확인
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

