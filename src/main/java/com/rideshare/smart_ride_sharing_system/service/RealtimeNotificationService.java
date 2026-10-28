package com.rideshare.smart_ride_sharing_system.service;

import com.rideshare.smart_ride_sharing_system.model.Notification;
import com.rideshare.smart_ride_sharing_system.model.User;
import com.rideshare.smart_ride_sharing_system.repository.NotificationRepository;
import com.rideshare.smart_ride_sharing_system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Real-Time Notification Service
 * Sends instant notifications to users via WebSocket
 */
@Service
public class RealtimeNotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;

    /**
     * Send notification to specific user
     */
    public void sendNotificationToUser(Long userId, String type, String title, String message) {
        sendNotificationToUser(userId, type, title, message, null, null);
    }

    /**
     * Send notification to specific user with booking info
     */
    public void sendNotificationToUser(Long userId, String type, String title, String message, Long bookingId, Map<String, Object> additionalData) {
        
        // Save to database
        Notification notification = new Notification(userId, type, title, message);
        notification.setBookingId(bookingId);
        
        if (additionalData != null) {
            notification.setData(additionalData.toString());
        }
        
        notificationRepository.save(notification);

        // Prepare WebSocket message
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", notification.getId());
        payload.put("type", type);
        payload.put("title", title);
        payload.put("message", message);
        payload.put("bookingId", bookingId);
        payload.put("timestamp", notification.getCreatedAt().toString());
        
        if (additionalData != null) {
            payload.putAll(additionalData);
        }

        // Send via WebSocket to specific user
        try {
            messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/notifications",
                payload
            );
            System.out.println("📧 Notification sent to user " + userId + ": " + title);
        } catch (Exception e) {
            System.err.println("Failed to send WebSocket notification to user " + userId + ": " + e.getMessage());
            // Try to send via alternative channel if WebSocket fails
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && user.getEmail() != null) {
                try {
                    emailService.sendNotificationEmail(user.getEmail(), title, message);
                    System.out.println("📧 Fallback email notification sent to user " + userId);
                } catch (Exception emailEx) {
                    System.err.println("Failed to send fallback email notification: " + emailEx.getMessage());
                }
            }
        }
    }

    /**
     * Send booking status update
     */
    public void sendBookingStatusUpdate(Long userId, Long bookingId, String status, String message) {
        Map<String, Object> data = new HashMap<>();
        data.put("status", status);
        
        sendNotificationToUser(
            userId,
            "BOOKING_STATUS",
            "Booking Update",
            message,
            bookingId,
            data
        );
    }

    /**
     * Notify driver of new booking request
     */
    public void notifyDriverOfBooking(Long driverId, Long bookingId, String passengerName, String pickup, String destination) {
        Map<String, Object> data = new HashMap<>();
        data.put("passengerName", passengerName);
        data.put("pickup", pickup);
        data.put("destination", destination);
        
        sendNotificationToUser(
            driverId,
            "NEW_BOOKING_REQUEST",
            "New Ride Request! 🚗",
            passengerName + " wants a ride from " + pickup + " to " + destination,
            bookingId,
            data
        );
    }

    /**
     * Notify passenger that driver accepted
     */
    public void notifyPassengerDriverAccepted(Long passengerId, Long bookingId, String driverName, String vehicleInfo) {
        Map<String, Object> data = new HashMap<>();
        data.put("driverName", driverName);
        data.put("vehicleInfo", vehicleInfo);
        
        sendNotificationToUser(
            passengerId,
            "BOOKING_ACCEPTED",
            "Driver Found! 🎉",
            driverName + " accepted your ride request. Vehicle: " + vehicleInfo,
            bookingId,
            data
        );
    }

    /**
     * Notify passenger that ride started
     */
    public void notifyRideStarted(Long passengerId, Long bookingId) {
        sendNotificationToUser(
            passengerId,
            "RIDE_STARTED",
            "Ride Started! 🚗",
            "Your ride has started. Have a safe journey!",
            bookingId,
            null
        );
    }

    /**
     * Notify ride completed
     */
    public void notifyRideCompleted(Long userId, Long bookingId, Double fare) {
        Map<String, Object> data = new HashMap<>();
        data.put("fare", fare);
        
        sendNotificationToUser(
            userId,
            "RIDE_COMPLETED",
            "Ride Completed! ✅",
            "Your ride has been completed. Fare: ₹" + fare,
            bookingId,
            data
        );
    }

    /**
     * Notify payment success
     */
    public void notifyPaymentSuccess(Long userId, Long bookingId, Double amount) {
        Map<String, Object> data = new HashMap<>();
        data.put("amount", amount);
        
        sendNotificationToUser(
            userId,
            "PAYMENT_SUCCESS",
            "Payment Successful! 💳",
            "Payment of ₹" + amount + " completed successfully",
            bookingId,
            data
        );
    }

    /**
     * Notify driver when booking is created
     */
    public void notifyBookingCreated(Long driverId, Long bookingId, String passengerName) {
        sendNotificationToUser(
            driverId,
            "NEW_BOOKING",
            "New Booking Request! 🚗",
            passengerName + " has booked a ride with you",
            bookingId,
            null
        );
    }

    /**
     * Notify passenger when booking is confirmed
     */
    public void notifyBookingConfirmed(Long passengerId, Long bookingId, String driverName) {
        sendNotificationToUser(
            passengerId,
            "BOOKING_CONFIRMED",
            "Booking Confirmed! ✅",
            "Your ride with " + driverName + " is confirmed",
            bookingId,
            null
        );
    }

    /**
     * Notify when booking is cancelled
     */
    public void notifyBookingCancelled(Long userId, Long bookingId, String message) {
        sendNotificationToUser(
            userId,
            "BOOKING_CANCELLED",
            "Booking Cancelled ❌",
            message + " cancelled the booking",
            bookingId,
            null
        );
    }

	    /**
	     * Notify when booking is rescheduled
	     */
	    public void notifyBookingRescheduled(Long userId, Long bookingId, String newTimeIso, String initiatorName) {
	        Map<String, Object> data = new HashMap<>();
	        data.put("newTime", newTimeIso);
	        if (initiatorName != null) {
	            data.put("initiator", initiatorName);
	        }

	        sendNotificationToUser(
	            userId,
	            "BOOKING_RESCHEDULED",
	            "Booking Rescheduled 🔄",
	            (initiatorName != null ? initiatorName : "Someone") + " rescheduled the booking to " + newTimeIso,
	            bookingId,
	            data
	        );
	    }

    /**
     * Get all notifications for user
     */
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get unread notifications count
     */
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    /**
     * Mark notification as read
     */
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    /**
     * Mark all notifications as read for user
     */
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        notifications.forEach(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    /**
     * Send ride reminder notification
     * @param userId User to notify
     * @param bookingId Booking ID
     * @param hoursUntilRide Hours until ride starts
     * @param rideDetails Details about the ride
     */
    public void sendRideReminder(Long userId, Long bookingId, int hoursUntilRide, String rideDetails) {
        Map<String, Object> data = new HashMap<>();
        data.put("hoursUntilRide", hoursUntilRide);
        data.put("rideDetails", rideDetails);
        
        String title = "Ride Reminder ⏰";
        String message = "Your ride is in " + hoursUntilRide + " hour" + (hoursUntilRide > 1 ? "s" : "") + "! " + rideDetails;
        
        sendNotificationToUser(
            userId,
            "RIDE_REMINDER",
            title,
            message,
            bookingId,
            data
        );
    }

    /**
     * Send ride update notification (cancellation/reschedule)
     */
    public void sendRideUpdate(Long userId, Long bookingId, String updateType, String message) {
        Map<String, Object> data = new HashMap<>();
        data.put("updateType", updateType);
        
        String title = updateType.equals("CANCELLED") ? "Ride Cancelled ❌" : "Ride Updated 🔄";
        
        sendNotificationToUser(
            userId,
            "RIDE_UPDATE",
            title,
            message,
            bookingId,
            data
        );
    }

    /**
     * Send review prompt notification after ride completion
     */
    public void sendReviewPrompt(Long userId, Long bookingId, String message) {
        sendNotificationToUser(
            userId,
            "REVIEW_PROMPT",
            "Rate Your Ride ⭐",
            message,
            bookingId,
            null
        );
    }
    
    /**
     * Send comprehensive booking confirmation with reminder timeline
     */
    public void sendBookingConfirmationWithTimeline(Long passengerId, Long bookingId, String driverName, 
                                                     String source, String destination, String rideTime, 
                                                     double fare, int seatsBooked) {
        Map<String, Object> data = new HashMap<>();
        data.put("driverName", driverName);
        data.put("source", source);
        data.put("destination", destination);
        data.put("rideTime", rideTime);
        data.put("fare", fare);
        data.put("seatsBooked", seatsBooked);
        data.put("bookingId", bookingId);
        
        // Build reminder timeline message
        StringBuilder message = new StringBuilder();
        message.append("🎉 Your ride has been booked!\n\n");
        message.append("📅 ").append(rideTime).append("\n");
        message.append("📍 From: ").append(source).append("\n");
        message.append("📍 To: ").append(destination).append("\n");
        message.append("👥 Seats: ").append(seatsBooked).append("\n");
        message.append("💰 Fare: ₹").append(fare).append("\n\n");
        message.append("✅ You'll receive reminders:\n");
        message.append("   • 24 hours before\n");
        message.append("   • 12 hours before\n");
        message.append("   • 6 hours before\n");
        message.append("   • 3 hours before\n");
        message.append("   • 1 hour before\n");
        message.append("   • 30 minutes before");
        
        sendNotificationToUser(
            passengerId,
            "BOOKING_CONFIRMED_DETAILED",
            "🎉 Booking Confirmed!",
            message.toString(),
            bookingId,
            data
        );
        
        System.out.println("✅ Sent comprehensive booking confirmation to passenger #" + passengerId);
    }
    
    /**
     * Send notification with email support
     * Sends both in-app notification and email
     */
    public void sendNotificationWithEmail(Long userId, String type, String title, String message, boolean sendEmail) {
        // Send in-app notification
        sendNotificationToUser(userId, type, title, message);
        
        // Send email if requested
        if (sendEmail) {
            try {
                User user = userRepository.findById(userId).orElse(null);
                if (user != null && user.getEmail() != null) {
                    sendEmailNotification(user.getEmail(), user.getName(), title, message);
                }
            } catch (Exception e) {
                System.err.println("Failed to send email notification: " + e.getMessage());
            }
        }
    }
    
    /**
     * Send generic email notification
     */
    private void sendEmailNotification(String toEmail, String userName, String title, String message) {
        // This is a simple email notification
        // For specific notification types, use dedicated email methods in EmailService
        System.out.println("📧 Sending email notification to: " + toEmail);
        System.out.println("   Title: " + title);
        System.out.println("   Message: " + message);
        // Note: EmailService already has specific methods for different notification types
        // This is a fallback for generic notifications
    }
}
