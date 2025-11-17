// Admin Dashboard Mock Data

export const adminStats = {
  totalUsers: 1234,
  totalUsersChange: 12,
  activeStudies: 156,
  activeStudiesChange: 8,
  newSignupsToday: 45,
  pendingReports: 12
}

export const userGrowthData = [
  { date: '11/1', total: 1100, active: 1050, new: 12, churned: 3 },
  { date: '11/5', total: 1120, active: 1070, new: 18, churned: 5 },
  { date: '11/9', total: 1150, active: 1100, new: 25, churned: 7 },
  { date: '11/13', total: 1180, active: 1130, new: 22, churned: 4 },
  { date: '11/17', total: 1200, active: 1150, new: 20, churned: 6 },
  { date: '11/21', total: 1220, active: 1170, new: 15, churned: 3 },
  { date: '11/25', total: 1234, active: 1180, new: 12, churned: 2 }
]

export const studyActivitiesData = [
  { category: '프로그래밍', count: 45, percentage: 38 },
  { category: '취업/자격증', count: 28, percentage: 24 },
  { category: '어학', count: 15, percentage: 13 },
  { category: '운동/취미', count: 8, percentage: 7 },
  { category: '디자인', count: 5, percentage: 4 },
  { category: '기타', count: 5, percentage: 4 }
]

export const recentReports = [
  {
    id: 1,
    type: 'SPAM',
    targetType: 'STUDY',
    targetId: 1,
    targetName: '코딩테스트 스터디',
    reporter: { id: 5, name: '김철수', email: 'kim@example.com' },
    reason: '광고성 게시물 반복',
    createdAt: '2025-11-17T08:30:00Z',
    status: 'PENDING',
    priority: 'URGENT'
  },
  {
    id: 2,
    type: 'HARASSMENT',
    targetType: 'USER',
    targetId: 2,
    targetName: '박민수',
    reporter: { id: 6, name: '이영희', email: 'lee@example.com' },
    reason: '욕설 및 비방',
    createdAt: '2025-11-17T05:30:00Z',
    status: 'PENDING',
    priority: 'HIGH'
  },
  {
    id: 3,
    type: 'INAPPROPRIATE',
    targetType: 'STUDY',
    targetId: 3,
    targetName: '디자인 스터디',
    reporter: { id: 7, name: '최지은', email: 'choi@example.com' },
    reason: '부적절한 콘텐츠',
    createdAt: '2025-11-16T10:00:00Z',
    status: 'RESOLVED',
    priority: 'MEDIUM'
  }
]

export const recentUsers = [
  {
    id: 1,
    name: '김철수',
    email: 'kim@example.com',
    imageUrl: null,
    provider: 'GOOGLE',
    createdAt: '2025-11-17T09:55:00Z'
  },
  {
    id: 2,
    name: '이영희',
    email: 'lee@example.com',
    imageUrl: null,
    provider: 'GITHUB',
    createdAt: '2025-11-17T09:00:00Z'
  },
  {
    id: 3,
    name: '박민수',
    email: 'park@example.com',
    imageUrl: null,
    provider: 'EMAIL',
    createdAt: '2025-11-17T08:00:00Z'
  }
]

export const systemStatus = {
  status: 'HEALTHY',
  cpu: 45,
  memory: 62,
  disk: 38
}

// Admin Users Management Mock Data
export const adminUsers = [
  {
    id: 1,
    name: '김철수',
    email: 'kim@example.com',
    imageUrl: null,
    provider: 'GOOGLE',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2025-11-01T00:00:00Z',
    lastLoginAt: '2025-11-17T09:55:00Z',
    studyCount: 3,
    messageCount: 145
  },
  {
    id: 2,
    name: '이영희',
    email: 'lee@example.com',
    imageUrl: null,
    provider: 'GITHUB',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2025-11-02T00:00:00Z',
    lastLoginAt: '2025-11-17T08:30:00Z',
    studyCount: 2,
    messageCount: 89
  },
  {
    id: 3,
    name: '박민수',
    email: 'park@example.com',
    imageUrl: null,
    provider: 'EMAIL',
    role: 'USER',
    status: 'SUSPENDED',
    createdAt: '2025-11-03T00:00:00Z',
    lastLoginAt: '2025-11-14T10:00:00Z',
    studyCount: 1,
    messageCount: 34
  },
  {
    id: 4,
    name: '최지은',
    email: 'choi@example.com',
    imageUrl: null,
    provider: 'GOOGLE',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2025-11-04T00:00:00Z',
    lastLoginAt: '2025-11-17T07:15:00Z',
    studyCount: 4,
    messageCount: 203
  },
  {
    id: 5,
    name: '정소현',
    email: 'jung@example.com',
    imageUrl: null,
    provider: 'GITHUB',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2025-11-05T00:00:00Z',
    lastLoginAt: '2025-11-17T06:45:00Z',
    studyCount: 2,
    messageCount: 67
  }
]

export const adminStudies = [
  {
    id: 1,
    name: '코딩테스트 스터디',
    category: 'PROGRAMMING',
    subCategory: 'ALGORITHM',
    icon: '💻',
    visibility: 'PUBLIC',
    owner: { id: 1, name: '김철수', provider: 'GOOGLE' },
    memberCount: 12,
    maxMembers: 20,
    isHidden: false,
    reportCount: 2,
    createdAt: '2025-11-01T00:00:00Z',
    lastActivity: '2025-11-17T09:30:00Z'
  },
  {
    id: 2,
    name: '취업 준비',
    category: 'JOB_PREP',
    icon: '💼',
    visibility: 'PUBLIC',
    owner: { id: 2, name: '이영희', provider: 'GITHUB' },
    memberCount: 8,
    maxMembers: 15,
    isHidden: false,
    reportCount: 0,
    createdAt: '2025-11-02T00:00:00Z',
    lastActivity: '2025-11-17T08:00:00Z'
  },
  {
    id: 3,
    name: '운동 루틴',
    category: 'EXERCISE',
    icon: '🏃',
    visibility: 'PRIVATE',
    owner: { id: 3, name: '박민수', provider: 'EMAIL' },
    memberCount: 5,
    maxMembers: 10,
    isHidden: false,
    reportCount: 0,
    createdAt: '2025-11-03T00:00:00Z',
    lastActivity: '2025-11-17T07:00:00Z'
  },
  {
    id: 4,
    name: '디자인 스터디',
    category: 'DESIGN',
    icon: '🎨',
    visibility: 'PUBLIC',
    owner: { id: 4, name: '최지은', provider: 'GOOGLE' },
    memberCount: 12,
    maxMembers: 20,
    isHidden: false,
    reportCount: 1,
    createdAt: '2025-11-04T00:00:00Z',
    lastActivity: '2025-11-17T06:30:00Z'
  }
]

export const adminReports = [
  {
    id: 1,
    type: 'SPAM',
    targetType: 'STUDY',
    targetId: 1,
    targetName: '코딩테스트 스터디',
    reporter: { id: 5, name: '김철수', email: 'kim@example.com', trustScore: 85 },
    reason: '광고성 메시지 반복',
    evidence: {
      screenshots: ['screenshot1.png', 'screenshot2.png'],
      messages: [
        { id: 123, content: '상품 구매하세요...', timestamp: '2025-11-16T10:30:00Z' }
      ]
    },
    priority: 'URGENT',
    status: 'PENDING',
    assignee: null,
    createdAt: '2025-11-17T08:30:00Z',
    targetReportCount: 3
  },
  {
    id: 2,
    type: 'HARASSMENT',
    targetType: 'USER',
    targetId: 2,
    targetName: '박민수',
    reporter: { id: 6, name: '이영희', email: 'lee@example.com', trustScore: 90 },
    reason: '욕설 및 비방',
    evidence: {
      screenshots: ['screenshot3.png'],
      messages: []
    },
    priority: 'HIGH',
    status: 'PENDING',
    assignee: null,
    createdAt: '2025-11-17T05:30:00Z',
    targetReportCount: 1
  },
  {
    id: 3,
    type: 'INAPPROPRIATE',
    targetType: 'STUDY',
    targetId: 3,
    targetName: '디자인 스터디',
    reporter: { id: 7, name: '최지은', email: 'choi@example.com', trustScore: 75 },
    reason: '부적절한 콘텐츠',
    evidence: {
      screenshots: [],
      messages: []
    },
    priority: 'MEDIUM',
    status: 'RESOLVED',
    assignee: { id: 1, name: 'admin@coup.com' },
    createdAt: '2025-11-16T10:00:00Z',
    resolvedAt: '2025-11-16T14:30:00Z',
    targetReportCount: 0
  }
]

export const analyticsData = {
  conversionFunnel: [
    { stage: 'visit', count: 1000, conversionRate: 100 },
    { stage: 'signup', count: 900, conversionRate: 90 },
    { stage: 'create', count: 450, conversionRate: 50 },
    { stage: 'active', count: 360, conversionRate: 80 }
  ],
  engagementTrend: [
    { day: 'Mon', engagement: 75 },
    { day: 'Tue', engagement: 78 },
    { day: 'Wed', engagement: 85 },
    { day: 'Thu', engagement: 80 },
    { day: 'Fri', engagement: 72 },
    { day: 'Sat', engagement: 65 },
    { day: 'Sun', engagement: 68 }
  ],
  deviceDistribution: [
    { device: 'desktop', count: 580, percentage: 47 },
    { device: 'mobile', count: 540, percentage: 44 },
    { device: 'tablet', count: 114, percentage: 9 }
  ],
  popularFeatures: [
    { feature: '채팅', count: 3456 },
    { feature: '공지사항', count: 2345 },
    { feature: '파일', count: 1234 },
    { feature: '캘린더', count: 987 },
    { feature: '할일', count: 876 },
    { feature: '화상 통화', count: 543 },
    { feature: '설정', count: 321 }
  ]
}

export const systemSettings = {
  service: {
    status: 'OPERATIONAL',
    maintenanceStart: null,
    maintenanceEnd: null,
    maintenanceMessage: '',
    signupEnabled: true,
    studyCreationEnabled: true,
    socialLoginEnabled: true,
    publicBrowsingEnabled: true
  },
  limits: {
    maxStudiesPerUser: 5,
    maxMembersPerStudy: 50,
    maxFileSize: 52428800,
    maxStoragePerStudy: 1073741824,
    maxMessageLength: 2000,
    messageRateLimit: { count: 10, period: 60 }
  },
  admins: [
    {
      id: 1,
      email: 'admin@coup.com',
      role: 'SUPER_ADMIN',
      addedAt: '2025-10-01T00:00:00Z',
      lastLogin: '2025-11-17T10:25:00Z'
    },
    {
      id: 2,
      email: 'moderator@coup.com',
      role: 'MODERATOR',
      addedAt: '2025-11-01T00:00:00Z',
      lastLogin: '2025-11-17T09:00:00Z'
    }
  ]
}

