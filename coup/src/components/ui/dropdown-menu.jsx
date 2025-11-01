import React, { useState, useRef, useEffect } from 'react';
import styles from './dropdown-menu.module.css';

const DropdownMenu = ({ children, trigger, align = 'end' }) => {
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
      <div onClick={toggleDropdown}>{trigger}</div>
      {isOpen && (
        <div className={`${styles.dropdownContent} ${styles[align]}`}>
          {children}
        </div>
      )}
    </div>
  );
};

const DropdownMenuItem = ({ children, onClick, ...props }) => {
  return (
    <button className={styles.dropdownItem} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

export { DropdownMenu, DropdownMenuItem };
