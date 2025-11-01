import React from 'react';
import SidebarNav from './SidebarNav';
import styles from './Sidebar.module.css';

function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <nav className={styles['sidebar-nav']}>
        <SidebarNav />
      </nav>
    </aside>
  );
}

export default Sidebar;
