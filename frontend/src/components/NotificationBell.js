import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import WebSocketService from '../services/WebSocketService';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../styles/NotificationBell.css';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch existing notifications
    fetchNotifications();

    // Connect to WebSocket
    WebSocketService.connect(user.id, user.role, () => {
      console.log('Connected to notifications');
      
      // Subscribe to notifications
      WebSocketService.subscribeToNotifications(user.id, (notification) => {
        console.log('New notification:', notification);
        
        // Show toast
        toast.info(`${notification.title}: ${notification.message}`, {
          position: "top-right",
          autoClose: 5000,
        });
        
        // Add to list
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Play notification sound (optional)
        playNotificationSound();
      });
    });

    // Cleanup on unmount
    return () => {
      WebSocketService.disconnect(user.id, user.role);
    };
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/notifications/user/${user.id}`);
      setNotifications(response.data);
      
      const countResponse = await axios.get(`http://localhost:8080/api/notifications/user/${user.id}/unread-count`);
      setUnreadCount(countResponse.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:8080/api/notifications/${notificationId}/read`);
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`http://localhost:8080/api/notifications/user/${user.id}/read-all`);
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const playNotificationSound = () => {
    // Optional: Add notification sound
    // const audio = new Audio('/notification.mp3');
    // audio.play().catch(e => console.log('Could not play sound'));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'NEW_BOOKING':
      case 'BOOKING_CONFIRMED':
        return '🚗';
      case 'BOOKING_CANCELLED':
      case 'RIDE_UPDATE':
        return '❌';
      case 'BOOKING_RESCHEDULED':
        return '🔄';
      case 'RIDE_STARTED':
        return '🏁';
      case 'RIDE_COMPLETED':
        return '✅';
      case 'PAYMENT_SUCCESS':
        return '💳';
      case 'RIDE_REMINDER':
        return '⏰';
      default:
        return '📧';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div className="notification-bell">
      <button 
        className="bell-button" 
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
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
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notif) => (
                <div 
                  key={notif.id} 
                  className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                  onClick={() => !notif.isRead && markAsRead(notif.id)}
                >
                  <div className="notif-icon">{getNotificationIcon(notif.type)}</div>
                  <div className="notif-content">
                    <div className="notif-title">{notif.title}</div>
                    <div className="notif-message">{notif.message}</div>
                    <div className="notif-time">{formatTime(notif.createdAt)}</div>
                  </div>
                  {!notif.isRead && <div className="unread-dot"></div>}
                </div>
              ))
            )}
          </div>

          {notifications.length > 10 && (
            <div className="dropdown-footer">
              <button onClick={() => setShowDropdown(false)}>View All</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
