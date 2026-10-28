package com.rideshare.smart_ride_sharing_system.service;

import com.rideshare.smart_ride_sharing_system.model.Booking;
import com.rideshare.smart_ride_sharing_system.model.Ride;
import com.rideshare.smart_ride_sharing_system.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Service to send ride reminders to passengers
 * Checks every hour for upcoming rides and sends reminders
 */
@Service
public class RideReminderService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RealtimeNotificationService notificationService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserService userService;

    /**
     * Check for upcoming rides and send reminders
     * Runs every hour
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour at minute 0
    public void sendRideReminders() {
        LocalDateTime now = LocalDateTime.now();
        
        // Get all booked rides
        List<Booking> bookings = bookingRepository.findByStatus("BOOKED");
        
        System.out.println("🔔 Checking ride reminders for " + bookings.size() + " booked rides");
        
        for (Booking booking : bookings) {
            Ride ride = booking.getRide();
            if (ride != null && ride.getDatetime() != null) {
                LocalDateTime rideTime = ride.getDatetime();
                
                // Skip past rides
                if (rideTime.isBefore(now)) {
                    continue;
                }
                
                long hoursUntilRide = ChronoUnit.HOURS.between(now, rideTime);
                
                String source = ride.getSource() != null ? ride.getSource() : "Unknown";
                String destination = ride.getDestination() != null ? ride.getDestination() : "Unknown";
                String rideDetails = "From " + source + " to " + destination;
                
                boolean reminderSent = false;
                
                // 24 hour reminder (send if between 24-25 hours before ride)
                if (hoursUntilRide >= 24 && hoursUntilRide < 25 && !booking.isReminder24hSent()) {
                    sendReminderToParties(booking, ride, 24, rideDetails);
                    booking.setReminder24hSent(true);
                    reminderSent = true;
                    System.out.println("📅 Sent 24h reminder for booking #" + booking.getId());
                }
                // 12 hour reminder (send if between 12-13 hours before ride)
                else if (hoursUntilRide >= 12 && hoursUntilRide < 13 && !booking.isReminder12hSent()) {
                    sendReminderToParties(booking, ride, 12, rideDetails);
                    booking.setReminder12hSent(true);
                    reminderSent = true;
                    System.out.println("📅 Sent 12h reminder for booking #" + booking.getId());
                }
                // 6 hour reminder (send if between 6-7 hours before ride)
                else if (hoursUntilRide >= 6 && hoursUntilRide < 7 && !booking.isReminder6hSent()) {
                    sendReminderToParties(booking, ride, 6, rideDetails);
                    booking.setReminder6hSent(true);
                    reminderSent = true;
                    System.out.println("📅 Sent 6h reminder for booking #" + booking.getId());
                }
                // 3 hour reminder (send if between 3-4 hours before ride)
                else if (hoursUntilRide >= 3 && hoursUntilRide < 4 && !booking.isReminder3hSent()) {
                    sendReminderToParties(booking, ride, 3, rideDetails);
                    booking.setReminder3hSent(true);
                    reminderSent = true;
                    System.out.println("📅 Sent 3h reminder for booking #" + booking.getId());
                }
                // 2 hour reminder (send if between 2-3 hours before ride)
                else if (hoursUntilRide >= 2 && hoursUntilRide < 3 && !booking.isReminder2hSent()) {
                    sendReminderToParties(booking, ride, 2, rideDetails);
                    booking.setReminder2hSent(true);
                    reminderSent = true;
                    System.out.println("📅 Sent 2h reminder for booking #" + booking.getId());
                }
                
                // Save booking if reminder was sent
                if (reminderSent) {
                    bookingRepository.save(booking);
                }
            }
        }
    }
    
    /**
     * Helper method to send reminders to both passenger and driver
     */
    private void sendReminderToParties(Booking booking, Ride ride, int hours, String rideDetails) {
        // Send reminder to passenger
        notificationService.sendRideReminder(
            booking.getPassengerId(),
            booking.getId(),
            hours,
            rideDetails
        );
        
        // Send email reminder to passenger
        try {
            userService.getUserById(booking.getPassengerId()).ifPresent(passenger -> {
                emailService.sendRideReminderEmail(
                    passenger.getEmail(),
                    passenger.getName(),
                    ride.getSource(),
                    ride.getDestination(),
                    ride.getDatetime().toString(),
                    hours,
                    booking.getId()
                );
            });
        } catch (Exception e) {
            System.err.println("Failed to send passenger reminder email: " + e.getMessage());
        }
        
        // Also send reminder to driver (if driver exists)
        if (ride.getDriver() != null) {
            notificationService.sendRideReminder(
                ride.getDriver().getId(),
                booking.getId(),
                hours,
                rideDetails
            );
            
            // Send email reminder to driver
            try {
                emailService.sendRideReminderEmail(
                    ride.getDriver().getEmail(),
                    ride.getDriver().getName(),
                    ride.getSource(),
                    ride.getDestination(),
                    ride.getDatetime().toString(),
                    hours,
                    booking.getId()
                );
            } catch (Exception e) {
                System.err.println("Failed to send driver reminder email: " + e.getMessage());
            }
        }
    }

    /**
     * Manual method to send ride reminder
     * Can be called from API endpoint for testing
     */
    public void sendManualReminder(Long bookingId, int hoursUntilRide) {
        bookingRepository.findById(bookingId).ifPresent(booking -> {
            Ride ride = booking.getRide();
            if (ride != null) {
                String source = ride.getSource() != null ? ride.getSource() : "Unknown";
                String destination = ride.getDestination() != null ? ride.getDestination() : "Unknown";
                String rideDetails = "From " + source + " to " + destination;
                
                notificationService.sendRideReminder(
                    booking.getPassengerId(),
                    booking.getId(),
                    hoursUntilRide,
                    rideDetails
                );
            }
        });
    }
}
