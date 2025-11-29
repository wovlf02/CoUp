# 빈 상태 처리

대시보드에서 데이터가 없을 때의 빈 상태(Empty State) UI/UX 처리를 다룹니다.

---

## 📋 목차

1. [스터디 없음](#스터디-없음)
2. [활동 없음](#활동-없음)
3. [일정 없음](#일정-없음)
4. [할일 없음](#할일-없음)
5. [알림 없음](#알림-없음)
6. [EmptyState 컴포넌트](#emptystate-컴포넌트)
7. [CTA 버튼 디자인](#cta-버튼-디자인)

---

## 스터디 없음

### 개요

신규 사용자가 처음 대시보드에 접속했을 때 참여 중인 스터디가 없는 상태

### 현재 구현

**파일**: `coup/src/components/dashboard/EmptyState.jsx`

```jsx
export default function EmptyState({ type = 'studies' }) {
  const content = {
    studies: {
      emoji: '📚',
      title: '아직 참여 중인 스터디가 없어요',
      description: '지금 바로 스터디를 찾아보세요!',
      buttonText: '스터디 둘러보기',
      link: '/studies/explore'
    },
    // ...
  }

  const data = content[type] || content.studies

  return (
    <div className={styles.emptyState}>
      <div className={styles.emoji}>{data.emoji}</div>
      <h3 className={styles.title}>{data.title}</h3>
      <p className={styles.description}>{data.description}</p>
      <Link href={data.link} className={styles.button}>
        {data.buttonText} →
      </Link>
    </div>
  )
}
```

### 개선 사항

#### 1. 개인화된 메시지

```jsx
export default function EmptyState({ type = 'studies', userName }) {
  const content = {
    studies: {
      emoji: '📚',
      title: `${userName}님, 환영합니다! 👋`,
      description: '함께 공부할 스터디를 찾아보세요',
      buttonText: '스터디 탐색하기',
      link: '/studies',
      secondaryAction: {
        text: '스터디 만들기',
        link: '/studies/create'
      }
    },
    // ...
  }

  const data = content[type] || content.studies

  return (
    <div className={styles.emptyState}>
      <div className={styles.emoji}>{data.emoji}</div>
      <h3 className={styles.title}>{data.title}</h3>
      <p className={styles.description}>{data.description}</p>
      
      <div className={styles.actions}>
        <Link href={data.link} className={styles.primaryButton}>
          {data.buttonText} →
        </Link>
        
        {data.secondaryAction && (
          <Link 
            href={data.secondaryAction.link} 
            className={styles.secondaryButton}
          >
            {data.secondaryAction.text}
          </Link>
        )}
      </div>

      {/* 도움말 섹션 */}
      <div className={styles.helpSection}>
        <h4>💡 스터디를 찾는 방법</h4>
        <ul className={styles.helpList}>
          <li>관심 카테고리로 필터링하기</li>
          <li>인기 스터디 둘러보기</li>
          <li>검색으로 원하는 스터디 찾기</li>
        </ul>
      </div>
    </div>
  )
}
```

#### 2. 일러스트레이션 추가

```jsx
import Image from 'next/image'

export default function EmptyState({ type = 'studies' }) {
  // ...

  return (
    <div className={styles.emptyState}>
      {/* 일러스트레이션 */}
      {data.illustration && (
        <div className={styles.illustration}>
          <Image
            src={data.illustration}
            alt={data.title}
            width={200}
            height={200}
          />
        </div>
      )}

      {/* 또는 SVG 애니메이션 */}
      <div className={styles.animatedIcon}>
        <svg className={styles.bookAnimation}>
          {/* SVG 애니메이션 */}
        </svg>
      </div>

      {/* 나머지 콘텐츠 */}
    </div>
  )
}
```

**CSS 애니메이션**:
```css
.animatedIcon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}
```

---

## 활동 없음

### 개요

최근 활동(알림)이 없는 상태

### 구현

```jsx
// coup/src/components/dashboard/DashboardClient.jsx

{recentActivities.length === 0 ? (
  <EmptyState
    type="activities"
    userName={user.name}
  />
) : (
  <ActivitiesList activities={recentActivities} />
)}
```

**EmptyState 콘텐츠**:
```jsx
activities: {
  emoji: '🔔',
  title: '아직 활동 내역이 없어요',
  description: '스터디에 참여하고 활동을 시작해보세요!',
  buttonText: '스터디 찾기',
  link: '/studies',
  tips: [
    '스터디에 가입하면 알림을 받을 수 있어요',
    '할일을 완료하면 활동 내역에 표시돼요',
    '채팅을 보내면 실시간으로 알림이 와요'
  ]
}
```

### 개선: 타임라인 스타일

```jsx
export default function ActivitiesEmptyState() {
  return (
    <div className={styles.timelineEmpty}>
      <div className={styles.timelineIcon}>📝</div>
      <h3>활동을 시작해보세요</h3>
      <p>스터디 활동이 여기에 표시됩니다</p>
      
      <div className={styles.exampleTimeline}>
        <div className={styles.exampleItem}>
          <span className={styles.dot}>•</span>
          <span>할일 완료</span>
        </div>
        <div className={styles.exampleItem}>
          <span className={styles.dot}>•</span>
          <span>채팅 메시지</span>
        </div>
        <div className={styles.exampleItem}>
          <span className={styles.dot}>•</span>
          <span>스터디 참여</span>
        </div>
      </div>
    </div>
  )
}
```

---

## 일정 없음

### 개요

다가오는 일정이 없는 상태 (3일 이내)

### 구현

```jsx
{upcomingEvents.length === 0 ? (
  <div className={styles.noEvents}>
    <span className={styles.icon}>📅</span>
    <p>다가오는 일정이 없습니다</p>
    <Link href="/my-studies" className={styles.link}>
      스터디 일정 만들기 →
    </Link>
  </div>
) : (
  <EventsList events={upcomingEvents} />
)}
```

### 개선: 캘린더 뷰 제안

```jsx
export default function EventsEmptyState() {
  return (
    <div className={styles.eventsEmpty}>
      <div className={styles.calendarIcon}>
        <svg>
          {/* 캘린더 아이콘 SVG */}
        </svg>
      </div>
      
      <h3>일정을 만들어보세요</h3>
      <p>스터디 멤버들과 함께할 일정을 추가해보세요</p>
      
      <div className={styles.suggestions}>
        <div className={styles.suggestionCard}>
          <span>🎯</span>
          <span>주간 목표 회의</span>
        </div>
        <div className={styles.suggestionCard}>
          <span>📝</span>
          <span>과제 제출 마감</span>
        </div>
        <div className={styles.suggestionCard}>
          <span>🎉</span>
          <span>마일스톤 축하</span>
        </div>
      </div>

      <Link href="/my-studies" className={styles.createButton}>
        일정 만들기
      </Link>
    </div>
  )
}
```

---

## 할일 없음

### 개요

긴급 할일이 없는 상태 (3일 이내 마감)

### 구현

```jsx
// coup/src/components/dashboard/widgets/UrgentTasks.jsx

if (urgentTasks.length === 0) {
  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>✅ 급한 할일</h3>
      <div className={styles.emptyState}>
        <span className={styles.emoji}>✨</span>
        <p>급한 할일이 없습니다!</p>
        <p className={styles.subtext}>여유롭게 계획을 세워보세요</p>
      </div>
    </div>
  )
}
```

### 개선: 긍정적인 피드백

```jsx
export default function UrgentTasksEmpty() {
  const messages = [
    {
      emoji: '✨',
      title: '완벽해요!',
      description: '급한 할일이 없습니다',
      tip: '새로운 목표를 세워보는 건 어떨까요?'
    },
    {
      emoji: '🎯',
      title: '잘하고 계세요!',
      description: '모든 할일을 제때 완료하고 있어요',
      tip: '이 상태를 유지해보세요!'
    },
    {
      emoji: '🌟',
      title: '여유가 있네요',
      description: '급한 일이 없어요',
      tip: '장기 목표를 계획해보세요'
    }
  ]

  const [currentMessage] = useState(() => 
    messages[Math.floor(Math.random() * messages.length)]
  )

  return (
    <div className={styles.positiveEmpty}>
      <div className={styles.emoji}>{currentMessage.emoji}</div>
      <h4>{currentMessage.title}</h4>
      <p>{currentMessage.description}</p>
      <p className={styles.tip}>💡 {currentMessage.tip}</p>
      
      <Link href="/tasks" className={styles.link}>
        전체 할일 보기 →
      </Link>
    </div>
  )
}
```

---

## 알림 없음

### 개요

읽지 않은 알림이 없는 상태

### 구현

```jsx
{stats.unreadNotifications === 0 && (
  <div className={styles.allCaughtUp}>
    <span className={styles.icon}>✅</span>
    <p>모든 알림을 확인했어요!</p>
  </div>
)}
```

### 개선: 축하 메시지

```jsx
export default function NotificationsEmpty() {
  return (
    <div className={styles.allClear}>
      <div className={styles.celebrationIcon}>
        🎉
      </div>
      <h3>완벽합니다!</h3>
      <p>모든 알림을 확인했어요</p>
      
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.number}>0</span>
          <span className={styles.label}>읽지 않은 알림</span>
        </div>
      </div>

      <p className={styles.encouragement}>
        계속 이렇게 활발히 활동해주세요! 💪
      </p>
    </div>
  )
}
```

---

## EmptyState 컴포넌트

### 통합 EmptyState 컴포넌트

**파일**: `coup/src/components/common/EmptyState.jsx`

```jsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import styles from './EmptyState.module.css'

export default function EmptyState({
  // 기본 props
  icon,
  emoji,
  illustration,
  title,
  description,
  
  // 액션
  actionText,
  actionHref,
  onAction,
  secondaryActionText,
  secondaryActionHref,
  
  // 도움말
  tips,
  helpTitle,
  
  // 스타일
  variant = 'default', // 'default', 'positive', 'minimal'
  size = 'medium', // 'small', 'medium', 'large'
  
  // 기타
  children,
}) {
  const renderIcon = () => {
    if (illustration) {
      return (
        <div className={styles.illustration}>
          <Image
            src={illustration}
            alt={title}
            width={200}
            height={200}
          />
        </div>
      )
    }

    if (icon) {
      return <div className={styles.icon}>{icon}</div>
    }

    if (emoji) {
      return <div className={styles.emoji}>{emoji}</div>
    }

    return null
  }

  return (
    <div className={`${styles.emptyState} ${styles[variant]} ${styles[size]}`}>
      {renderIcon()}

      {title && <h3 className={styles.title}>{title}</h3>}
      {description && <p className={styles.description}>{description}</p>}

      {/* 액션 버튼 */}
      {(actionText || onAction) && (
        <div className={styles.actions}>
          {actionHref ? (
            <Link href={actionHref} className={styles.primaryButton}>
              {actionText} →
            </Link>
          ) : (
            <button onClick={onAction} className={styles.primaryButton}>
              {actionText}
            </button>
          )}

          {secondaryActionText && secondaryActionHref && (
            <Link 
              href={secondaryActionHref} 
              className={styles.secondaryButton}
            >
              {secondaryActionText}
            </Link>
          )}
        </div>
      )}

      {/* 도움말 */}
      {tips && tips.length > 0 && (
        <div className={styles.tips}>
          {helpTitle && <h4 className={styles.tipsTitle}>{helpTitle}</h4>}
          <ul className={styles.tipsList}>
            {tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 커스텀 콘텐츠 */}
      {children}
    </div>
  )
}
```

### 사용 예제

```jsx
// 기본 사용
<EmptyState
  emoji="📚"
  title="스터디가 없습니다"
  description="새로운 스터디를 시작해보세요"
  actionText="스터디 만들기"
  actionHref="/studies/create"
/>

// 도움말 포함
<EmptyState
  emoji="🔔"
  title="알림이 없습니다"
  description="활동을 시작하면 알림을 받을 수 있어요"
  tips={[
    '스터디에 참여하기',
    '할일 완료하기',
    '채팅 보내기'
  ]}
  helpTitle="알림을 받으려면?"
/>

// 긍정적인 변형
<EmptyState
  variant="positive"
  emoji="✨"
  title="완벽해요!"
  description="모든 할일을 완료했습니다"
/>

// 최소 변형
<EmptyState
  variant="minimal"
  size="small"
  emoji="📭"
  description="데이터가 없습니다"
/>
```

---

## CTA 버튼 디자인

### 버튼 스타일 가이드

```css
/* coup/src/components/common/EmptyState.module.css */

.primaryButton {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary-color, #3b82f6);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.primaryButton:hover {
  background: var(--primary-hover, #2563eb);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.primaryButton:active {
  transform: translateY(0);
}

.secondaryButton {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.secondaryButton:hover {
  background: var(--bg-secondary, #f9fafb);
  border-color: var(--border-hover, #d1d5db);
}
```

### 버튼 마이크로 인터랙션

```jsx
import { useState } from 'react'

function AnimatedButton({ children, onClick, href }) {
  const [isPressed, setIsPressed] = useState(false)

  const handleClick = (e) => {
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 200)
    onClick?.(e)
  }

  return (
    <Link
      href={href}
      className={`${styles.button} ${isPressed ? styles.pressed : ''}`}
      onClick={handleClick}
    >
      {children}
      <span className={styles.arrow}>→</span>
    </Link>
  )
}
```

---

## 접근성 (A11y)

### ARIA 레이블

```jsx
<div 
  className={styles.emptyState}
  role="status"
  aria-live="polite"
  aria-label={`${title}: ${description}`}
>
  {/* 콘텐츠 */}
</div>
```

### 키보드 네비게이션

```jsx
<div 
  className={styles.emptyState}
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' && actionHref) {
      router.push(actionHref)
    }
  }}
>
  {/* 콘텐츠 */}
</div>
```

---

## 테스트

```javascript
// __tests__/EmptyState.test.jsx
import { render, screen } from '@testing-library/react'
import EmptyState from '../EmptyState'

describe('EmptyState', () => {
  it('제목과 설명을 표시한다', () => {
    render(
      <EmptyState
        title="테스트 제목"
        description="테스트 설명"
      />
    )

    expect(screen.getByText('테스트 제목')).toBeInTheDocument()
    expect(screen.getByText('테스트 설명')).toBeInTheDocument()
  })

  it('액션 버튼을 표시한다', () => {
    render(
      <EmptyState
        actionText="버튼 텍스트"
        actionHref="/test"
      />
    )

    const button = screen.getByRole('link')
    expect(button).toHaveAttribute('href', '/test')
    expect(button).toHaveTextContent('버튼 텍스트')
  })
})
```

---

**다음 문서**: [05-performance-optimization.md](./05-performance-optimization.md)

