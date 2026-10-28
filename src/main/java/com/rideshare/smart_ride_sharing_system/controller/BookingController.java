package com.rideshare.smart_ride_sharing_system.controller;

import com.rideshare.smart_ride_sharing_system.model.Booking;
import com.rideshare.smart_ride_sharing_system.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // ✅ Create Booking
    @PostMapping("/create")
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {
        try {
            System.out.println("\n=== Creating Booking ===");
            System.out.println("  Ride ID: " + booking.getRideId());
            System.out.println("  Passenger ID: " + booking.getPassengerId());
            System.out.println("  Seats: " + booking.getSeatsBooked());
            System.out.println("  Passenger Name: " + booking.getPassengerName());
            System.out.println("  Passenger Email: " + booking.getPassengerEmail());
            System.out.println("  Passenger Phone: " + booking.getPassengerPhone());
            System.out.println("  Pickup Location: " + booking.getPickupLocation());
            
            // Validate required fields
            if (booking.getRideId() == null) {
                System.err.println("ERROR: Ride ID is null");
                java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
                errorResponse.put("error", "Validation Error");
                errorResponse.put("message", "Ride ID is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            if (booking.getPassengerId() == null) {
                System.err.println("ERROR: Passenger ID is null");
                java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
                errorResponse.put("error", "Validation Error");
                errorResponse.put("message", "Passenger ID is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            if (booking.getSeatsBooked() <= 0) {
                System.err.println("ERROR: Invalid seats booked: " + booking.getSeatsBooked());
                java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
                errorResponse.put("error", "Validation Error");
                errorResponse.put("message", "Valid number of seats is required (must be > 0)");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            Booking created = bookingService.createBooking(booking);
            System.out.println("✅ Booking created with ID: " + created.getId());
            System.out.println("=== Booking Creation Complete ===\n");
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            System.err.println("❌ ERROR creating booking:");
            System.err.println("Error type: " + e.getClass().getName());
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Booking Creation Failed");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("type", e.getClass().getSimpleName());
            return ResponseEntity.status(400).body(errorResponse);
        } catch (Exception e) {
            System.err.println("❌ UNEXPECTED ERROR creating booking:");
            System.err.println("Error type: " + e.getClass().getName());
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", "An unexpected error occurred: " + e.getMessage());
            errorResponse.put("type", e.getClass().getSimpleName());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // ✅ Get all bookings
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // ✅ Get booking by ID
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        return bookingService.getBookingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Get bookings by passenger
    @GetMapping("/passenger/{passengerId}")
    public ResponseEntity<?> getBookingsByPassenger(@PathVariable Long passengerId) {
        System.out.println("\n========================================");
        System.out.println("BookingController: GET /api/bookings/passenger/" + passengerId);
        System.out.println("Timestamp: " + java.time.LocalDateTime.now());
        try {
            List<Booking> bookings = bookingService.getBookingsByPassenger(passengerId);
            System.out.println("✅ Found " + bookings.size() + " bookings for passenger " + passengerId);
            System.out.println("========================================\n");
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            System.out.println("❌ ERROR in getBookingsByPassenger:");
            System.out.println("Error type: " + e.getClass().getName());
            System.out.println("Error message: " + e.getMessage());
            System.out.println("Stack trace:");
            e.printStackTrace();
            System.out.println("========================================\n");
            return ResponseEntity.status(500).body("Error fetching bookings: " + e.getMessage());
        }
    }

    // ✅ Get bookings by driver
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<Booking>> getBookingsByDriver(@PathVariable Long driverId) {
        return ResponseEntity.ok(bookingService.getBookingsByDriver(driverId));
    }

    // Cancel booking
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }

    // Cancel booking by driver
    @PutMapping("/{id}/cancel-by-driver")
    public ResponseEntity<Booking> cancelBookingByDriver(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBookingByDriver(id));
    }

    // Reschedule booking (notification-only)
    @PutMapping("/{id}/reschedule")
    public ResponseEntity<Booking> rescheduleBooking(@PathVariable Long id, @RequestBody RescheduleRequest request) {
        return ResponseEntity.ok(bookingService.rescheduleBooking(id, request.getNewTimeIso(), request.isInitiatedByDriver()));
    }

    // Complete booking
    @PutMapping("/{id}/complete")
    public ResponseEntity<Booking> completeBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.completeBooking(id));
    }

    // Add feedback
    @PutMapping("/{id}/feedback")
    public ResponseEntity<Booking> addFeedback(@PathVariable Long id, @RequestBody FeedbackRequest feedback) {
        return ResponseEntity.ok(bookingService.addFeedback(id, feedback.getRating(), feedback.getFeedback()));
    }

    // Get completed bookings
    @GetMapping("/completed")
    public ResponseEntity<List<Booking>> getCompletedBookings() {
        return ResponseEntity.ok(bookingService.getCompletedBookings());
    }

    // Get bookings by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Booking>> getBookingsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(bookingService.getBookingsByStatus(status));
    }

    public static class FeedbackRequest {
        private Integer rating;
        private String feedback;

        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }
        public String getFeedback() { return feedback; }
        public void setFeedback(String feedback) { this.feedback = feedback; }
    }

    public static class RescheduleRequest {
        private String newTimeIso;
        private boolean initiatedByDriver;

        public String getNewTimeIso() { return newTimeIso; }
        public void setNewTimeIso(String newTimeIso) { this.newTimeIso = newTimeIso; }
        public boolean isInitiatedByDriver() { return initiatedByDriver; }
        public void setInitiatedByDriver(boolean initiatedByDriver) { this.initiatedByDriver = initiatedByDriver; }
    }
}
