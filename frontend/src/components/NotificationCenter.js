import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { token, userId } = React.useContext(AuthContext);

  useEffect(() => {
    if (userId && token) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userId, token]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/notifications/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.read).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:8080/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`http://localhost:8080/api/notifications/user/${userId}/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'BOOKING_CONFIRMED': return '✅';
      case 'BOOKING_CANCELLED': return '❌';
      case 'RIDE_REMINDER': return '⏰';
      case 'RIDE_UPDATED': return '🔄';
      case 'PAYMENT_SUCCESS': return '💳';
      case 'PAYMENT_FAILED': return '⚠️';
      default: return '🔔';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now - notifTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <>
      <div className="notification-bell" onClick={() => setIsOpen(!isOpen)}>
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </div>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-read">
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <span className="no-notif-icon">🔕</span>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${!notif.read ? 'unread' : ''}`}
                  onClick={() => !notif.read && markAsRead(notif.id)}
                >
                  <div className="notif-icon">{getNotificationIcon(notif.type)}</div>
                  <div className="notif-content">
                    <div className="notif-title">{notif.title}</div>
                    <div className="notif-message">{notif.message}</div>
                    <div className="notif-time">{getTimeAgo(notif.createdAt)}</div>
                  </div>
                  {!notif.read && <div className="unread-dot"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .notification-bell {
          position: relative;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 50%;
          transition: all 0.3s;
        }

        .notification-bell:hover {
          background: rgba(0, 78, 137, 0.1);
        }

        .bell-icon {
          font-size: 24px;
          display: block;
        }

        .notification-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: #dc3545;
          color: white;
          border-radius: 10px;
          padding: 2px 6px;
          font-size: 11px;
          font-weight: 700;
          min-width: 18px;
          text-align: center;
        }

        .notification-dropdown {
          position: absolute;
          top: 60px;
          right: 20px;
          width: 380px;
          max-height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          z-index: 1000;
          overflow: hidden;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 2px solid #f0f0f0;
          background: linear-gradient(135deg, #004E89 0%, #003d6e 100%);
          color: white;
        }

        .notification-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }

        .mark-all-read {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .mark-all-read:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .notification-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .notification-item {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
        }

        .notification-item:hover {
          background: #f8f9fa;
        }

        .notification-item.unread {
          background: #eff6ff;
        }

        .notif-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .notif-content {
          flex: 1;
        }

        .notif-title {
          font-size: 14px;
          font-weight: 700;
          color: #333;
          margin-bottom: 4px;
        }

        .notif-message {
          font-size: 13px;
          color: #666;
          line-height: 1.4;
          margin-bottom: 4px;
        }

        .notif-time {
          font-size: 11px;
          color: #999;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          background: #004E89;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 6px;
        }

        .no-notifications {
          text-align: center;
          padding: 60px 20px;
          color: #999;
        }

        .no-notif-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 16px;
        }

        .no-notifications p {
          margin: 0;
          font-size: 14px;
        }

        @media (max-width: 480px) {
          .notification-dropdown {
            width: calc(100vw - 40px);
            right: 20px;
          }
        }
      `}</style>
    </>
  );
};

export default NotificationCenter;
