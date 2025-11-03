'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './dropdown-menu.module.css';

const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      {React.Children.map(children, (child) => {
        if (child.type === DropdownMenuTrigger) {
          return React.cloneElement(child, { onClick: toggleDropdown });
        }
        return child;
      })}
      {isOpen && (
        <div className={styles.dropdownContent}>
          {React.Children.map(children, (child) => {
            if (child.type === DropdownMenuContent) {
              return React.cloneElement(child, { setIsOpen });
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
};

const DropdownMenuTrigger = ({ children, onClick }) => {
  return (
    <div className={styles.dropdownTrigger} onClick={onClick}>
      {children}
    </div>
  );
};

const DropdownMenuContent = ({ children, setIsOpen }) => {
  const handleItemClick = (e) => {
    // Prevent closing if the item itself handles navigation or complex logic
    // and wants to keep the menu open temporarily.
    // For simple clicks, close the menu.
    if (!e.defaultPrevented) {
      setIsOpen(false);
    }
  };

  return (
    <div className={styles.dropdownMenuContent} onClick={handleItemClick}>
      {children}
    </div>
  );
};

const DropdownMenuItem = ({ children, onClick, ...props }) => {
  return (
    <div className={styles.dropdownMenuItem} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

const DropdownMenuSeparator = () => {
  return <div className={styles.dropdownMenuSeparator} />;
};

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator };