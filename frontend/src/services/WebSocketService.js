import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

/**
 * WebSocket Service for Real-Time Updates
 * Handles connections, subscriptions, and messaging
 */
class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = {};
  }

  /**
   * Connect to WebSocket server
   */
  connect(userId, userType, onConnect) {
    const socket = new SockJS('http://localhost:8080/ws');
    
    this.client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: () => {
        console.log('✅ WebSocket Connected');
        this.connected = true;
        
        // Send connection message
        this.client.publish({
          destination: '/app/connect',
          body: JSON.stringify({ userId, userType })
        });
        
        if (onConnect) onConnect();
      },
      
      onDisconnect: () => {
        console.log('❌ WebSocket Disconnected');
        this.connected = false;
      },
      
      onStompError: (frame) => {
        console.error('WebSocket Error:', frame);
      }
    });

    this.client.activate();
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(userId, userType) {
    if (!this.client) return;
    
    try {
      // Only send disconnect message if connected
      if (this.connected && this.client.connected) {
        this.client.publish({
          destination: '/app/disconnect',
          body: JSON.stringify({ userId, userType })
        });
      }
    } catch (error) {
      console.log('Disconnect message not sent (already disconnected)');
    }
    
    // Unsubscribe from all topics
    this.unsubscribeAll();
    
    // Deactivate client
    try {
      this.client.deactivate();
    } catch (error) {
      console.log('Client already deactivated');
    }
    
    this.connected = false;
  }

  /**
   * Subscribe to personal notifications
   */
  subscribeToNotifications(userId, callback) {
    if (!this.client || !this.connected) return;
    
    const subscription = this.client.subscribe(
      `/user/${userId}/queue/notifications`,
      (message) => {
        const notification = JSON.parse(message.body);
        callback(notification);
      }
    );
    
    this.subscriptions['notifications'] = subscription;
  }

  /**
   * Subscribe to driver location updates
   */
  subscribeToDriverLocation(driverId, callback) {
    if (!this.client || !this.connected) return;
    
    const subscription = this.client.subscribe(
      `/topic/driver-location/${driverId}`,
      (message) => {
        const location = JSON.parse(message.body);
        callback(location);
      }
    );
    
    this.subscriptions[`driver-${driverId}`] = subscription;
  }

  /**
   * Subscribe to booking location updates
   */
  subscribeToBookingLocation(bookingId, callback) {
    if (!this.client || !this.connected) return;
    
    const subscription = this.client.subscribe(
      `/topic/booking-location/${bookingId}`,
      (message) => {
        const location = JSON.parse(message.body);
        callback(location);
      }
    );
    
    this.subscriptions[`booking-${bookingId}`] = subscription;
  }

  /**
   * Subscribe to chat messages
   */
  subscribeToChat(bookingId, callback) {
    if (!this.client || !this.connected) return;
    
    const subscription = this.client.subscribe(
      `/topic/chat/${bookingId}`,
      (message) => {
        const chatMessage = JSON.parse(message.body);
        callback(chatMessage);
      }
    );
    
    this.subscriptions[`chat-${bookingId}`] = subscription;
  }

  /**
   * Subscribe to driver status
   */
  subscribeToDriverStatus(driverId, callback) {
    if (!this.client || !this.connected) return;
    
    const subscription = this.client.subscribe(
      `/topic/driver-status/${driverId}`,
      (message) => {
        const status = JSON.parse(message.body);
        callback(status);
      }
    );
    
    this.subscriptions[`driver-status-${driverId}`] = subscription;
  }

  /**
   * Send location update
   */
  sendLocationUpdate(driverId, latitude, longitude, bookingId = null) {
    if (!this.client || !this.connected) return;
    
    const data = {
      driverId,
      latitude,
      longitude,
      timestamp: new Date().toISOString()
    };
    
    if (bookingId) {
      data.bookingId = bookingId;
    }
    
    this.client.publish({
      destination: '/app/location/update',
      body: JSON.stringify(data)
    });
  }

  /**
   * Send chat message
   */
  sendChatMessage(bookingId, senderId, senderType, message) {
    if (!this.client || !this.connected) return;
    
    this.client.publish({
      destination: '/app/chat/send',
      body: JSON.stringify({
        bookingId,
        senderId,
        senderType,
        message
      })
    });
  }

  /**
   * Unsubscribe from specific topic
   */
  unsubscribe(key) {
    if (this.subscriptions[key]) {
      this.subscriptions[key].unsubscribe();
      delete this.subscriptions[key];
    }
  }

  /**
   * Unsubscribe from all topics
   */
  unsubscribeAll() {
    Object.keys(this.subscriptions).forEach(key => {
      this.unsubscribe(key);
    });
  }
}

export default new WebSocketService();
