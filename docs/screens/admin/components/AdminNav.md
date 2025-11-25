# AdminNav 컴포넌트
없음 (Server Component)

## 📝 Props

---

- z-index: 10
- 높이: 100vh
- 배경: gray-900
- 너비: 12% (min: 200px, max: 240px)

## 🎨 스타일

---

```
}
  )
    </nav>
      </div>
        </Link>
          메인으로
          <HomeIcon className="w-4 h-4" />
        >
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          href="/" 
        <Link 
      <div className="border-t border-gray-800 p-4">
      {/* 하단 */}
      
      </div>
        ))}
          </Link>
            )}
              </span>
                {item.badge}
              <span className="absolute right-4 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
            {item.badge && (
            <span className="text-sm font-medium">{item.label}</span>
            <item.icon className="w-5 h-5" />
          >
            className="flex items-center gap-3 px-6 py-3 hover:bg-gray-800 transition-colors relative"
            href={item.href}
            key={item.href}
          <Link
        {navItems.map((item) => (
      <div className="flex-1 py-6 overflow-y-auto">
      {/* 메뉴 */}
      
      </div>
        <h1 className="text-xl font-bold">CoUp Admin</h1>
      <div className="h-16 flex items-center justify-center border-b border-gray-800">
      {/* 로고 */}
    <nav className="w-[12%] min-w-[200px] max-w-[240px] bg-gray-900 text-white flex flex-col">
  return (
export default function AdminNav() {
 */
 * @returns {JSX.Element}
 * 관리자 네비게이션 (Server Component)
/**

]
  { icon: Cog6ToothIcon, label: '설정', href: '/admin/settings' }
  { icon: ChartBarIcon, label: '통계', href: '/admin/analytics' },
  { icon: ExclamationTriangleIcon, label: '신고', href: '/admin/reports', badge: 12 },
  { icon: BookOpenIcon, label: '스터디', href: '/admin/studies' },
  { icon: UsersIcon, label: '사용자', href: '/admin/users' },
  { icon: HomeIcon, label: '대시보드', href: '/admin' },
const navItems = [

} from '@heroicons/react/24/outline'
  Cog6ToothIcon 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  BookOpenIcon, 
  UsersIcon, 
  HomeIcon, 
import { 
import Link from 'next/link'
```jsx

## 💻 전체 코드

---

좌측 고정 네비게이션 (12% 너비)

## 📋 설명

---

> **분량**: 약 100줄
> **파일**: `components/admin/layout/AdminNav.js`  
> **타입**: 🔴 Server Component  


