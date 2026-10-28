import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const { token, userId } = React.useContext(AuthContext);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      console.log('🔔 Fetching notifications for user:', userId);
      const response = await axios.get(`http://localhost:8080/api/notifications/user/${userId}`);
      console.log('✅ Notifications loaded:', response.data.length);
      setNotifications(response.data);
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error);
      console.error('Error details:', error.response?.data || error.message);
      if (error.response?.status === 403) {
        toast.error('⚠️ Access denied. Please log in again.');
      } else {
        toast.error('❌ Failed to load notifications');
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:8080/api/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      toast.success('✅ Marked as read');
    } catch (error) {
      console.error('Failed to mark as read:', error);
      toast.error('❌ Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`http://localhost:8080/api/notifications/user/${userId}/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('✅ All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('❌ Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
        return '✅';
      case 'BOOKING_CANCELLED':
        return '❌';
      case 'BOOKING_RESCHEDULED':
        return '🔄';
      case 'RIDE_REMINDER':
        return '⏰';
      case 'RIDE_UPDATE':
        return '🔔';
      case 'RIDE_STARTED':
        return '🏁';
      case 'RIDE_COMPLETED':
        return '🎉';
      case 'PAYMENT_SUCCESS':
        return '💳';
      case 'NEW_BOOKING':
        return '🚗';
      default:
        return '📧';
    }
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return 'N/A';
    const date = new Date(datetime);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hour${Math.floor(diffMins / 60) > 1 ? 's' : ''} ago`;
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)} day${Math.floor(diffMins / 1440) > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  if (loading) {
    return (
      <div className="notification-panel">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading notifications...</p>
        </div>
        <style jsx>{`
          .notification-panel {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
          }
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            color: #004E89;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #004E89;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <h2>🔔 Notifications</h2>
        <div className="header-actions">
          <div className="filter-buttons">
            <button 
              className={filter === 'all' ? 'active' : ''} 
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button 
              className={filter === 'unread' ? 'active' : ''} 
              onClick={() => setFilter('unread')}
            >
              Unread ({notifications.filter(n => !n.read).length})
            </button>
            <button 
              className={filter === 'read' ? 'active' : ''} 
              onClick={() => setFilter('read')}
            >
              Read ({notifications.filter(n => n.read).length})
            </button>
          </div>
          <button onClick={markAllAsRead} className="mark-all-btn">
            Mark All as Read
          </button>
          <button onClick={fetchNotifications} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="no-notifications">
            <div className="no-notifications-icon">🔔</div>
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map((notification, index) => (
            <div 
              key={notification.id} 
              className={`notification-card ${!notification.read ? 'unread' : ''}`}
              style={{animationDelay: `${index * 0.05}s`}}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">{formatDateTime(notification.createdAt)}</div>
              </div>
              {!notification.read && (
                <button 
                  className="mark-read-btn" 
                  onClick={() => markAsRead(notification.id)}
                  title="Mark as read"
                >
                  ✓
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .notification-panel {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #004E89 0%, #003d6e 100%);
          border-radius: 15px;
          color: white;
          box-shadow: 0 10px 30px rgba(0, 78, 137, 0.3);
        }

        .notification-header h2 {
          margin: 0;
          font-size: 28px;
          font-weight: 800;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        .filter-buttons {
          display: flex;
          gap: 5px;
          background: rgba(255, 255, 255, 0.1);
          padding: 5px;
          border-radius: 8px;
        }

        .filter-buttons button {
          background: transparent;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }

        .filter-buttons button.active {
          background: rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
        }

        .filter-buttons button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .mark-all-btn,
        .refresh-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
          backdrop-filter: blur(10px);
        }

        .mark-all-btn:hover,
        .refresh-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .notifications-list {
          display: grid;
          gap: 15px;
        }

        .no-notifications {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 20px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 20px;
          animation: fadeIn 0.5s ease-out;
        }

        .no-notifications-icon {
          font-size: 80px;
          margin-bottom: 20px;
          animation: bounce 2s ease-in-out infinite;
        }

        .no-notifications h3 {
          color: #333;
          font-size: 24px;
          margin: 10px 0;
        }

        .no-notifications p {
          color: #666;
          font-size: 16px;
        }

        .notification-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: flex-start;
          gap: 15px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
          border-left: 4px solid transparent;
          animation: slideUp 0.4s ease-out backwards;
          position: relative;
        }

        .notification-card.unread {
          border-left-color: #004E89;
          background: linear-gradient(to right, rgba(0, 78, 137, 0.05), white);
        }

        .notification-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 78, 137, 0.2);
        }

        .notification-icon {
          font-size: 32px;
          flex-shrink: 0;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 12px;
        }

        .notification-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .notification-title {
          font-size: 16px;
          font-weight: 700;
          color: #333;
        }

        .notification-message {
          font-size: 14px;
          color: #666;
          line-height: 1.5;
        }

        .notification-time {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
        }

        .mark-read-btn {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid #004E89;
          background: white;
          color: #004E89;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mark-read-btn:hover {
          background: #004E89;
          color: white;
          transform: scale(1.1);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationPanel;
