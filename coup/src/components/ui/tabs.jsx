'use client';

import React, { useState } from 'react';
import styles from './tabs.module.css';

const Tabs = ({ children, defaultValue }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleTabClick = (value) => {
    setActiveTab(value);
  };

  return (
    <div className={styles.tabs}>
      <div className={styles.tabList}>
        {React.Children.map(children, (child) => {
          if (child.type === TabTrigger) {
            return React.cloneElement(child, {
              isActive: child.props.value === activeTab,
              onClick: () => handleTabClick(child.props.value),
            });
          }
          return null;
        })}
      </div>
      {React.Children.map(children, (child) => {
        if (child.type === TabContent) {
          return React.cloneElement(child, {
            isActive: child.props.value === activeTab,
          });
        }
        return null;
      })}
    </div>
  );
};

const TabTrigger = ({ value, isActive, onClick, children }) => {
  return (
    <button
      className={`${styles.tabTrigger} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const TabContent = ({ value, isActive, children }) => {
  return isActive ? <div className={styles.tabContent}>{children}</div> : null;
};

export { Tabs, TabTrigger, TabContent };