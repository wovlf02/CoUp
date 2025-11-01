import React, { useState } from 'react';
import Avatar from '@/components/ui/avatar'; // Assuming Avatar component is available

function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="user-profile-dropdown">
      <button onClick={handleToggle} className="profile-button">
        <Avatar src="/path/to/user-image.jpg" alt="User Avatar" /> {/* Replace with actual user image */}
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <ul>
            <li><a href="/me">마이페이지</a></li>
            <li><a href="/settings">설정</a></li>
            <li><button>로그아웃</button></li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default UserProfileDropdown;
