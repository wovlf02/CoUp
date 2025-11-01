import React, { useState } from 'react';
import styles from './tabs.module.css';

const Tabs = ({ children, defaultActiveTab }) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab || (children[0] && children[0].props.label));

  const handleTabClick = (label) => {
    setActiveTab(label);
  };

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabList}>
        {React.Children.map(children, (child) => {
          if (!child) return null;
          const { label } = child.props;
          return (
            <button
              key={label}
              className={`${styles.tabButton} ${activeTab === label ? styles.active : ''}`}
              onClick={() => handleTabClick(label)}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className={styles.tabContent}>
        {React.Children.map(children, (child) => {
          if (!child) return null;
          if (child.props.label === activeTab) {
            return child;
          }
          return null;
        })}
      </div>
    </div>
  );
};

const TabPanel = ({ children, label }) => {
  return <div className={styles.tabPanel}>{children}</div>;
};

export { Tabs, TabPanel };
