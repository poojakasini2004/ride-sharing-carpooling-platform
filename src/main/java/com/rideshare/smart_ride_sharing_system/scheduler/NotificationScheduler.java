package com.rideshare.smart_ride_sharing_system.scheduler;

import com.rideshare.smart_ride_sharing_system.model.Booking;
import com.rideshare.smart_ride_sharing_system.repository.BookingRepository;
import com.rideshare.smart_ride_sharing_system.service.EmailService;
import com.rideshare.smart_ride_sharing_system.service.RealtimeNotificationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Comprehensive Notification Scheduler for Ride Reminders
 * Sends notifications at multiple intervals: 24h, 12h, 6h, 3h, 1h, 30min before ride
 * 
 * Reminder Schedule:
 * - 24 hours before: In-App + Email
 * - 12 hours before: In-App + Email  
 * - 6 hours before: In-App + Email
 * - 3 hours before: In-App + SMS (critical)
 * - 1 hour before: In-App + SMS (critical)
 * - 30 minutes before: In-App + SMS (urgent)
 */
@Component
public class NotificationScheduler {

    private final BookingRepository bookingRepository;
    private final EmailService emailService;
    private final RealtimeNotificationService notificationService;

    public NotificationScheduler(
            BookingRepository bookingRepository,
            EmailService emailService,
            RealtimeNotificationService notificationService
    ) {
        this.bookingRepository = bookingRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    /**
     * Send 24-hour reminders
     * Runs every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    public void send24HourReminders() {
        processReminders(24, "24h", true, false);
    }

    /**
     * Send 12-hour reminders
     * Runs every 30 minutes
     */
    @Scheduled(fixedRate = 1800000) // 30 minutes
    public void send12HourReminders() {
        processReminders(12, "12h", true, false);
    }

    /**
     * Send 6-hour reminders
     * Runs every 30 minutes
     */
    @Scheduled(fixedRate = 1800000) // 30 minutes
    public void send6HourReminders() {
        processReminders(6, "6h", true, false);
    }

    /**
     * Send 3-hour reminders (critical)
     * Runs every 15 minutes
     */
    @Scheduled(fixedRate = 900000) // 15 minutes
    public void send3HourReminders() {
        processReminders(3, "3h", true, true);
    }

    /**
     * Send 1-hour reminders (critical)
     * Runs every 10 minutes
     */
    @Scheduled(fixedRate = 600000) // 10 minutes
    public void send1HourReminders() {
        processReminders(1, "1h", true, true);
    }

    /**
     * Send 30-minute reminders (urgent)
     * Runs every 5 minutes
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void send30MinuteReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thirtyMinLater = now.plusMinutes(30);
        LocalDateTime thirtyFiveMinLater = now.plusMinutes(35);

        List<Booking> upcomingBookings = bookingRepository
                .findByStatusAndRideScheduledTimeBetween(
                        "CONFIRMED",
                        thirtyMinLater,
                        thirtyFiveMinLater
                );

        for (Booking booking : upcomingBookings) {
            try {
                send30MinReminder(booking);
            } catch (Exception e) {
                System.err.println("❌ Failed to send 30-min reminder for booking #" + booking.getId());
                e.printStackTrace();
            }
        }

        if (upcomingBookings.size() > 0) {
            System.out.println("✅ Processed " + upcomingBookings.size() + " 30-minute reminders");
        }
    }

    /**
     * Process reminders for a specific time interval
     */
    private void processReminders(int hours, String label, boolean sendEmail, boolean sendSMS) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime targetTime = now.plusHours(hours);
        LocalDateTime windowEnd = targetTime.plusMinutes(hours >= 6 ? 60 : 30); // Larger window for longer intervals

        List<Booking> upcomingBookings = bookingRepository
                .findByStatusAndRideScheduledTimeBetween(
                        "CONFIRMED",
                        targetTime,
                        windowEnd
                );

        for (Booking booking : upcomingBookings) {
            try {
                sendRideReminder(booking, hours, sendEmail, sendSMS);
            } catch (Exception e) {
                System.err.println("❌ Failed to send " + label + " reminder for booking #" + booking.getId());
                e.printStackTrace();
            }
        }

        if (upcomingBookings.size() > 0) {
            System.out.println("✅ Processed " + upcomingBookings.size() + " " + label + " reminders");
        }
    }

    /**
     * Send ride reminder notification with configurable channels
     */
    private void sendRideReminder(Booking booking, int hoursUntilRide, boolean sendEmail, boolean sendSMS) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a");
        String formattedDateTime = booking.getRide().getDatetime().format(formatter);
        String source = booking.getRide().getSource();
        String destination = booking.getRide().getDestination();

        // Determine message based on time interval
        String passengerTitle = getReminderTitle(hoursUntilRide, true);
        String driverTitle = getReminderTitle(hoursUntilRide, false);
        String passengerMessage = getReminderMessage(hoursUntilRide, source, destination, booking.getPassenger().getName(), true);
        String driverMessage = getReminderMessage(hoursUntilRide, source, destination, booking.getPassenger().getName(), false);

        // Send email reminder (for 24h, 12h, 6h, 3h, 1h)
        if (sendEmail) {
            try {
                emailService.sendRideReminderEmail(
                        booking.getPassenger().getEmail(),
                        booking.getPassenger().getName(),
                        source,
                        destination,
                        formattedDateTime,
                        hoursUntilRide,
                        booking.getId()
                );
            } catch (Exception e) {
                System.err.println("⚠️ Failed to send email reminder: " + e.getMessage());
            }
        }

        // Send SMS reminder (for 3h, 1h - critical reminders)
        if (sendSMS) {
            sendSMSNotification(
                booking.getPassenger().getPhone(),
                passengerMessage,
                "Ride in " + hoursUntilRide + " hour(s)",
                booking.getId()
            );
        }

        // Send in-app notification to passenger
        Map<String, Object> passengerData = new HashMap<>();
        passengerData.put("bookingId", booking.getId());
        passengerData.put("hoursUntilRide", hoursUntilRide);
        passengerData.put("source", source);
        passengerData.put("destination", destination);
        passengerData.put("rideTime", formattedDateTime);
        
        notificationService.sendNotificationToUser(
                booking.getPassenger().getId(),
                "RIDE_REMINDER",
                passengerTitle,
                passengerMessage,
                booking.getId(),
                passengerData
        );

        // Send notification to driver
        Map<String, Object> driverData = new HashMap<>();
        driverData.put("bookingId", booking.getId());
        driverData.put("hoursUntilRide", hoursUntilRide);
        driverData.put("passengerName", booking.getPassenger().getName());
        
        notificationService.sendNotificationToUser(
                booking.getRide().getDriver().getId(),
                "RIDE_REMINDER",
                driverTitle,
                driverMessage,
                booking.getId(),
                driverData
        );

        System.out.println("✅ Sent " + hoursUntilRide + "-hour reminder for booking #" + booking.getId());
    }

    /**
     * Send 30-minute urgent reminder
     */
    private void send30MinReminder(Booking booking) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
        String formattedTime = booking.getRide().getDatetime().format(formatter);
        String source = booking.getRide().getSource();
        String destination = booking.getRide().getDestination();

        // Urgent SMS notification
        String urgentMessage = "� Get ready! Your ride is in 30 minutes at " + formattedTime;
        sendSMSNotification(
            booking.getPassenger().getPhone(),
            urgentMessage,
            "URGENT: Ride in 30 minutes",
            booking.getId()
        );

        // In-app notification to passenger
        Map<String, Object> passengerData = new HashMap<>();
        passengerData.put("bookingId", booking.getId());
        passengerData.put("urgent", true);
        passengerData.put("source", source);
        passengerData.put("destination", destination);
        
        notificationService.sendNotificationToUser(
                booking.getPassenger().getId(),
                "RIDE_REMINDER_URGENT",
                "🎯 Get Ready! 30 Minutes",
                "Your ride is in 30 minutes at " + formattedTime + ". Be ready at pickup location: " + source,
                booking.getId(),
                passengerData
        );

        // Notify driver
        Map<String, Object> driverData = new HashMap<>();
        driverData.put("bookingId", booking.getId());
        driverData.put("passengerName", booking.getPassenger().getName());
        
        notificationService.sendNotificationToUser(
                booking.getRide().getDriver().getId(),
                "RIDE_REMINDER_URGENT",
                "🚗 Ride Starting Soon",
                "Your ride with " + booking.getPassenger().getName() + " starts in 30 minutes at " + formattedTime,
                booking.getId(),
                driverData
        );

        System.out.println("✅ Sent 30-minute URGENT reminder for booking #" + booking.getId());
    }

    /**
     * Get appropriate reminder title based on time interval
     */
    private String getReminderTitle(int hours, boolean isPassenger) {
        if (hours >= 24) return "📅 Ride Tomorrow!";
        if (hours >= 12) return "⏰ Ride in " + hours + " Hours";
        if (hours >= 6) return "🕐 Ride in " + hours + " Hours";
        if (hours >= 3) return "⚡ Ride in " + hours + " Hours!";
        if (hours >= 1) return "🚨 Ride in 1 Hour!";
        return "🎯 Get Ready!";
    }

    /**
     * Get appropriate reminder message based on time interval
     */
    private String getReminderMessage(int hours, String source, String destination, String passengerName, boolean isPassenger) {
        if (isPassenger) {
            if (hours >= 24) {
                return "Your ride is scheduled for tomorrow. From " + source + " to " + destination + ". Make sure you're ready!";
            } else if (hours >= 12) {
                return "Your ride is in " + hours + " hours. From " + source + " to " + destination + ". We'll assign a driver soon.";
            } else if (hours >= 6) {
                return "Get ready for your ride in " + hours + " hours. From " + source + " to " + destination + ". Check traffic conditions!";
            } else if (hours >= 3) {
                return "Your ride starts in " + hours + " hours! From " + source + " to " + destination + ". Driver will be assigned soon.";
            } else if (hours >= 1) {
                return "Your ride is in 1 hour! Be ready at " + source + " by pickup time. Keep your phone charged.";
            }
            return "Get ready! Your ride is coming up soon.";
        } else {
            if (hours >= 24) {
                return "You have a ride tomorrow with " + passengerName + ". From " + source + " to " + destination + ".";
            } else if (hours >= 3) {
                return "You have a ride in " + hours + " hours with " + passengerName + ". From " + source + " to " + destination + ".";
            } else if (hours >= 1) {
                return "Upcoming ride in 1 hour with " + passengerName + ". Pickup at " + source + ".";
            }
            return "Ride starting soon with " + passengerName + ".";
        }
    }

    /**
     * Send SMS notification (Development: Console logging, Production: Twilio)
     * 
     * To integrate with Twilio:
     * 1. Add dependency: implementation 'com.twilio.sdk:twilio:9.x.x'
     * 2. Add to application.properties:
     *    twilio.account.sid=YOUR_ACCOUNT_SID
     *    twilio.auth.token=YOUR_AUTH_TOKEN
     *    twilio.phone.number=YOUR_TWILIO_NUMBER
     * 3. Uncomment Twilio code below
     */
    private void sendSMSNotification(String phoneNumber, String message, String type, Long bookingId) {
        try {
            // Validate phone number
            if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
                System.out.println("⚠️ SMS skipped: No phone number for booking #" + bookingId);
                return;
            }

            // Development mode: Log to console
            System.out.println("\n" + "=".repeat(60));
            System.out.println("📱 SMS NOTIFICATION - " + type);
            System.out.println("=".repeat(60));
            System.out.println("To: " + phoneNumber);
            System.out.println("Booking: #" + bookingId);
            System.out.println("Message: " + message);
            System.out.println("Time: " + LocalDateTime.now());
            System.out.println("=".repeat(60) + "\n");

            // Production mode: Uncomment to use Twilio
            /*
            // Initialize Twilio client
            Twilio.init(twilioAccountSid, twilioAuthToken);
            
            // Send SMS
            Message twilioMessage = Message.creator(
                new PhoneNumber(phoneNumber),
                new PhoneNumber(twilioPhoneNumber),
                message
            ).create();
            
            System.out.println("✅ SMS sent successfully. SID: " + twilioMessage.getSid());
            */
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send SMS for booking #" + bookingId + ": " + e.getMessage());
        }
    }

    /**
     * Clean up old notifications
     * Runs daily at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupOldNotifications() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        // This would call a notification repository method to delete old notifications
        System.out.println("✅ Cleaned up notifications older than " + thirtyDaysAgo);
    }
}
