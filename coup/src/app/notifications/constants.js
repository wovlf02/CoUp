/**
 * 알림 관련 상수 정의
 */

// 알림 타입별 정보 (Prisma schema의 NotificationType enum과 일치)
export const NOTIFICATION_TYPES = {
  JOIN_APPROVED: { 
    icon: '✅', 
    label: '가입 승인', 
    color: '#10b981', 
    bgColor: 'rgba(16, 185, 129, 0.1)' 
  },
  NOTICE: { 
    icon: '📢', 
    label: '공지', 
    color: '#ef4444', 
    bgColor: 'rgba(239, 68, 68, 0.1)' 
  },
  FILE: { 
    icon: '📁', 
    label: '파일', 
    color: '#8b5cf6', 
    bgColor: 'rgba(139, 92, 246, 0.1)' 
  },
  EVENT: { 
    icon: '📅', 
    label: '일정', 
    color: '#f59e0b', 
    bgColor: 'rgba(245, 158, 11, 0.1)' 
  },
  TASK: { 
    icon: '✏️', 
    label: '할일', 
    color: '#3b82f6', 
    bgColor: 'rgba(59, 130, 246, 0.1)' 
  },
  MEMBER: { 
    icon: '👤', 
    label: '멤버', 
    color: '#6366f1', 
    bgColor: 'rgba(99, 102, 241, 0.1)' 
  },
  KICK: { 
    icon: '🚫', 
    label: '강퇴', 
    color: '#dc2626', 
    bgColor: 'rgba(220, 38, 38, 0.1)' 
  },
  CHAT: { 
    icon: '💬', 
    label: '채팅', 
    color: '#06b6d4', 
    bgColor: 'rgba(6, 182, 212, 0.1)' 
  },
  DEFAULT: { 
    icon: '🔔', 
    label: '알림', 
    color: '#6b7280', 
    bgColor: 'rgba(107, 114, 128, 0.1)' 
  }
};

// 필터 상태
export const FILTER_STATUS = {
  ALL: 'all',
  UNREAD: 'unread',
  READ: 'read'
};

// 그룹 라벨
export const GROUP_LABELS = {
  today: '오늘',
  yesterday: '어제',
  thisWeek: '이번 주',
  older: '이전'
};
