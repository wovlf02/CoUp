import React from 'react';
import Link from 'next/link';

function SidebarNav() {
  const navItems = [
    { name: '대시보드', href: '/dashboard' },
    { name: '스터디 탐색', href: '/studies' },
    { name: '마이페이지', href: '/me' },
    // Add more navigation items here
  ];

  return (
    <ul className="sidebar-nav-list">
      {navItems.map((item) => (
        <li key={item.name}>
          <Link href={item.href}>
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default SidebarNav;
