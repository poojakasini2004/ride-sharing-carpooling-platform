package com.rideshare.smart_ride_sharing_system.controller;

import com.rideshare.smart_ride_sharing_system.model.ChatMessage;
import com.rideshare.smart_ride_sharing_system.model.DriverLocation;
import com.rideshare.smart_ride_sharing_system.model.Notification;
import com.rideshare.smart_ride_sharing_system.service.ChatService;
import com.rideshare.smart_ride_sharing_system.service.LocationTrackingService;
import com.rideshare.smart_ride_sharing_system.service.RealtimeNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Real-Time WebSocket Controller
 * Handles WebSocket messages and REST endpoints for real-time features
 */
@RestController
@RequestMapping("/api/realtime")
@CrossOrigin(origins = "*")
public class RealtimeController {

    @Autowired
    private RealtimeNotificationService notificationService;

    @Autowired
    private LocationTrackingService locationService;

    @Autowired
    private ChatService chatService;

    // ==================== NOTIFICATIONS ====================

    /**
     * Get all notifications for user
     * GET /api/realtime/notifications/{userId}
     */
    @GetMapping("/notifications/{userId}")
    public ResponseEntity<?> getUserNotifications(@PathVariable Long userId) {
        List<Notification> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Get unread notification count
     * GET /api/realtime/notifications/{userId}/unread-count
     */
    @GetMapping("/notifications/{userId}/unread-count")
    public ResponseEntity<?> getUnreadCount(@PathVariable Long userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Mark notification as read
     * PUT /api/realtime/notifications/{notificationId}/read
     */
    @PutMapping("/notifications/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * Mark all notifications as read
     * PUT /api/realtime/notifications/{userId}/read-all
     */
    @PutMapping("/notifications/{userId}/read-all")
    public ResponseEntity<?> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // ==================== LOCATION TRACKING ====================

    /**
     * Update driver location (REST endpoint)
     * POST /api/realtime/location/update
     */
    @PostMapping("/location/update")
    public ResponseEntity<?> updateLocation(@RequestBody Map<String, Object> request) {
        Long driverId = Long.valueOf(request.get("driverId").toString());
        Double latitude = Double.valueOf(request.get("latitude").toString());
        Double longitude = Double.valueOf(request.get("longitude").toString());
        
        Double speed = request.containsKey("speed") ? 
            Double.valueOf(request.get("speed").toString()) : null;
        Double heading = request.containsKey("heading") ? 
            Double.valueOf(request.get("heading").toString()) : null;

        locationService.updateDriverLocation(driverId, latitude, longitude, speed, heading);
        
        return ResponseEntity.ok(Map.of("success", true, "message", "Location updated"));
    }

    /**
     * Update driver location via WebSocket
     * Client sends to: /app/location/update
     */
    @MessageMapping("/location/update")
    public void updateLocationViaWebSocket(@Payload Map<String, Object> locationData) {
        Long driverId = Long.valueOf(locationData.get("driverId").toString());
        Double latitude = Double.valueOf(locationData.get("latitude").toString());
        Double longitude = Double.valueOf(locationData.get("longitude").toString());
        
        Double speed = locationData.containsKey("speed") ? 
            Double.valueOf(locationData.get("speed").toString()) : null;
        Double heading = locationData.containsKey("heading") ? 
            Double.valueOf(locationData.get("heading").toString()) : null;

        if (locationData.containsKey("bookingId")) {
            Long bookingId = Long.valueOf(locationData.get("bookingId").toString());
            locationService.updateDriverLocationForBooking(driverId, bookingId, latitude, longitude);
        } else {
            locationService.updateDriverLocation(driverId, latitude, longitude, speed, heading);
        }
    }

    /**
     * Get driver location
     * GET /api/realtime/location/{driverId}
     */
    @GetMapping("/location/{driverId}")
    public ResponseEntity<?> getDriverLocation(@PathVariable Long driverId) {
        DriverLocation location = locationService.getDriverLocation(driverId);
        if (location == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(location);
    }

    /**
     * Set driver online/offline status
     * POST /api/realtime/driver/status
     */
    @PostMapping("/driver/status")
    public ResponseEntity<?> setDriverStatus(@RequestBody Map<String, Object> request) {
        Long driverId = Long.valueOf(request.get("driverId").toString());
        boolean isOnline = Boolean.parseBoolean(request.get("isOnline").toString());
        
        locationService.setDriverOnlineStatus(driverId, isOnline);
        
        return ResponseEntity.ok(Map.of("success", true, "status", isOnline ? "online" : "offline"));
    }

    // ==================== CHAT ====================

    /**
     * Send chat message (REST endpoint)
     * POST /api/realtime/chat/send
     */
    @PostMapping("/chat/send")
    public ResponseEntity<?> sendChatMessage(@RequestBody Map<String, Object> request) {
        Long bookingId = Long.valueOf(request.get("bookingId").toString());
        Long senderId = Long.valueOf(request.get("senderId").toString());
        String senderType = request.get("senderType").toString();
        String message = request.get("message").toString();

        ChatMessage chatMessage = chatService.sendMessage(bookingId, senderId, senderType, message);
        
        return ResponseEntity.ok(chatMessage);
    }

    /**
     * Send chat message via WebSocket
     * Client sends to: /app/chat/send
     */
    @MessageMapping("/chat/send")
    public void sendChatMessageViaWebSocket(@Payload Map<String, Object> messageData) {
        Long bookingId = Long.valueOf(messageData.get("bookingId").toString());
        Long senderId = Long.valueOf(messageData.get("senderId").toString());
        String senderType = messageData.get("senderType").toString();
        String message = messageData.get("message").toString();

        chatService.sendMessage(bookingId, senderId, senderType, message);
    }

    /**
     * Get chat messages for booking
     * GET /api/realtime/chat/{bookingId}
     */
    @GetMapping("/chat/{bookingId}")
    public ResponseEntity<?> getChatMessages(@PathVariable Long bookingId) {
        List<ChatMessage> messages = chatService.getBookingMessages(bookingId);
        return ResponseEntity.ok(messages);
    }

    /**
     * Mark chat messages as read
     * PUT /api/realtime/chat/{bookingId}/read
     */
    @PutMapping("/chat/{bookingId}/read")
    public ResponseEntity<?> markChatAsRead(@PathVariable Long bookingId) {
        chatService.markMessagesAsRead(bookingId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * Get unread chat count
     * GET /api/realtime/chat/{bookingId}/unread-count
     */
    @GetMapping("/chat/{bookingId}/unread-count")
    public ResponseEntity<?> getUnreadChatCount(@PathVariable Long bookingId) {
        long count = chatService.getUnreadCount(bookingId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    // ==================== CONNECTION EVENTS ====================

    /**
     * Handle user connection
     */
    @MessageMapping("/connect")
    public void handleConnect(@Payload Map<String, Object> connectionData, SimpMessageHeaderAccessor headerAccessor) {
        Long userId = Long.valueOf(connectionData.get("userId").toString());
        String userType = connectionData.get("userType").toString();
        
        System.out.println("✅ User connected: " + userId + " (" + userType + ")");
        
        // Store user info in session
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        if (sessionAttributes != null) {
            sessionAttributes.put("userId", userId);
            sessionAttributes.put("userType", userType);
        }
    }

    /**
     * Handle user disconnection
     */
    @MessageMapping("/disconnect")
    public void handleDisconnect(@Payload Map<String, Object> disconnectionData) {
        Long userId = Long.valueOf(disconnectionData.get("userId").toString());
        String userType = disconnectionData.get("userType").toString();
        
        System.out.println("❌ User disconnected: " + userId + " (" + userType + ")");
        
        // If driver, set offline
        if ("DRIVER".equals(userType)) {
            locationService.setDriverOnlineStatus(userId, false);
        }
    }
}
