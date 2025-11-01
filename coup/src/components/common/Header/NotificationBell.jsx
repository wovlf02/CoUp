import React from 'react';

function NotificationBell() {
  const notificationCount = 5; // Example count, replace with actual state

  return (
    <button className="notification-bell">
      <span className="icon">🔔</span>
      {notificationCount > 0 && (
        <span className="badge">{notificationCount}</span>
      )}
    </button>
  );
}

export default NotificationBell;
