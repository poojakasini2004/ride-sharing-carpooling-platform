package com.rideshare.smart_ride_sharing_system.service;

import com.rideshare.smart_ride_sharing_system.model.Booking;
import com.rideshare.smart_ride_sharing_system.model.Review;
import com.rideshare.smart_ride_sharing_system.model.Ride;
import com.rideshare.smart_ride_sharing_system.model.User;
import com.rideshare.smart_ride_sharing_system.repository.BookingRepository;
import com.rideshare.smart_ride_sharing_system.repository.ReviewRepository;
import com.rideshare.smart_ride_sharing_system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service for managing reviews and ratings
 */
@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RealtimeNotificationService notificationService;

    /**
     * Submit a review from passenger to driver (simple version)
     */
    @Transactional
    public Review submitPassengerReview(Long bookingId, Long passengerId, Integer rating, String comment) {
        return submitPassengerReview(bookingId, passengerId, rating, comment, null, null, null, null, null);
    }

    /**
     * Submit a review from passenger to driver (with multi-dimensional ratings and tags)
     */
    @Transactional
    public Review submitPassengerReview(Long bookingId, Long passengerId, Integer rating, String comment, 
                                       String tags, Integer drivingQuality, Integer vehicleCleanliness, 
                                       Integer professionalism, Integer routeEfficiency) {
        // Validate booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Verify booking is completed
        if (!"COMPLETED".equals(booking.getStatus())) {
            throw new RuntimeException("Can only review completed rides");
        }

        // Verify passenger owns this booking
        if (!booking.getPassengerId().equals(passengerId)) {
            throw new RuntimeException("You can only review your own bookings");
        }

        // Check if already reviewed
        Optional<Review> existingReview = reviewRepository.findByBookingIdAndReviewerType(bookingId, "PASSENGER");
        if (existingReview.isPresent()) {
            throw new RuntimeException("You have already reviewed this ride");
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Rating must be between 1 and 5 stars");
        }

        // Get passenger and driver
        User passenger = userRepository.findById(passengerId)
                .orElseThrow(() -> new RuntimeException("Passenger not found"));
        
        Ride ride = booking.getRide();
        User driver = ride.getDriver();

        // Create review
        Review review = new Review(booking, passenger, driver, "PASSENGER", rating, comment, tags);
        
        // Set multi-dimensional ratings if provided
        if (drivingQuality != null) review.setDrivingQuality(drivingQuality);
        if (vehicleCleanliness != null) review.setVehicleCleanliness(vehicleCleanliness);
        if (professionalism != null) review.setProfessionalism(professionalism);
        if (routeEfficiency != null) review.setRouteEfficiency(routeEfficiency);
        
        Review savedReview = reviewRepository.save(review);

        // Mark booking as passenger reviewed
        booking.setPassengerReviewed(true);
        bookingRepository.save(booking);

        // Update driver's rating
        updateUserRating(driver.getId());

        // Send notification to driver
        notificationService.sendNotificationToUser(
            driver.getId(),
            "NEW_REVIEW",
            "New Review Received! ⭐",
            passenger.getName() + " rated you " + rating + " stars",
            bookingId,
            null
        );

        System.out.println("✅ Passenger review submitted: " + rating + " stars for driver #" + driver.getId());

        return savedReview;
    }

    /**
     * Submit a review from driver to passenger (simple version)
     */
    @Transactional
    public Review submitDriverReview(Long bookingId, Long driverId, Integer rating, String comment) {
        return submitDriverReview(bookingId, driverId, rating, comment, null, null, null, null);
    }

    /**
     * Submit a review from driver to passenger (with multi-dimensional ratings and tags)
     */
    @Transactional
    public Review submitDriverReview(Long bookingId, Long driverId, Integer rating, String comment,
                                    String tags, Integer punctuality, Integer respectfulness, 
                                    Integer passengerCleanliness) {
        // Validate booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Verify booking is completed
        if (!"COMPLETED".equals(booking.getStatus())) {
            throw new RuntimeException("Can only review completed rides");
        }

        // Verify driver owns this ride
        Ride ride = booking.getRide();
        if (!ride.getDriver().getId().equals(driverId)) {
            throw new RuntimeException("You can only review your own rides");
        }

        // Check if already reviewed
        Optional<Review> existingReview = reviewRepository.findByBookingIdAndReviewerType(bookingId, "DRIVER");
        if (existingReview.isPresent()) {
            throw new RuntimeException("You have already reviewed this passenger");
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Rating must be between 1 and 5 stars");
        }

        // Get driver and passenger
        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        
        // Get passenger - handle case where passenger object might be null
        User passenger = booking.getPassenger();
        if (passenger == null) {
            // Fetch passenger using passengerId from booking
            Long passengerIdFromBooking = booking.getPassengerId();
            if (passengerIdFromBooking == null) {
                throw new RuntimeException("Passenger information not found in booking");
            }
            passenger = userRepository.findById(passengerIdFromBooking)
                    .orElseThrow(() -> new RuntimeException("Passenger not found"));
        }

        // Create review
        Review review = new Review(booking, driver, passenger, "DRIVER", rating, comment, tags);
        
        // Set multi-dimensional ratings if provided
        if (punctuality != null) review.setPunctuality(punctuality);
        if (respectfulness != null) review.setRespectfulness(respectfulness);
        if (passengerCleanliness != null) review.setPassengerCleanliness(passengerCleanliness);
        
        Review savedReview = reviewRepository.save(review);

        // Mark booking as driver reviewed
        booking.setDriverReviewed(true);
        bookingRepository.save(booking);

        // Update passenger's rating
        updateUserRating(passenger.getId());

        // Send notification to passenger
        notificationService.sendNotificationToUser(
            passenger.getId(),
            "NEW_REVIEW",
            "New Review Received! ⭐",
            driver.getName() + " rated you " + rating + " stars",
            bookingId,
            null
        );

        System.out.println("✅ Driver review submitted: " + rating + " stars for passenger #" + passenger.getId());

        return savedReview;
    }

    /**
     * Update user's overall rating and review counts
     */
    @Transactional
    public void updateUserRating(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Calculate overall average rating
        Double avgRating = reviewRepository.calculateAverageRating(userId);
        Long totalReviews = reviewRepository.countReviewsByRevieweeId(userId);

        // Calculate driver rating (reviews from passengers)
        Double driverRating = reviewRepository.calculateAverageRatingByType(userId, "PASSENGER");

        // Calculate passenger rating (reviews from drivers)
        Double passengerRating = reviewRepository.calculateAverageRatingByType(userId, "DRIVER");

        // Update user
        user.setRating(avgRating != null ? avgRating : 0.0);
        user.setTotalReviews(totalReviews != null ? totalReviews : 0L);
        user.setDriverRating(driverRating);
        user.setPassengerRating(passengerRating);

        userRepository.save(user);

        System.out.println("📊 Updated ratings for user #" + userId + 
                         " - Overall: " + user.getRating() + 
                         ", Driver: " + driverRating + 
                         ", Passenger: " + passengerRating);
    }

    /**
     * Get all reviews for a user
     */
    public List<Review> getUserReviews(Long userId) {
        return reviewRepository.findByRevieweeId(userId);
    }

    /**
     * Get reviews given by a user
     */
    public List<Review> getReviewsByUser(Long userId) {
        return reviewRepository.findByReviewerId(userId);
    }

    /**
     * Get reviews for a specific booking
     */
    public List<Review> getBookingReviews(Long bookingId) {
        return reviewRepository.findByBookingId(bookingId);
    }

    /**
     * Get user rating statistics
     */
    public Map<String, Object> getUserRatingStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> stats = new HashMap<>();
        stats.put("userId", userId);
        stats.put("name", user.getName());
        stats.put("overallRating", user.getRating());
        stats.put("totalReviews", user.getTotalReviews());
        stats.put("driverRating", user.getDriverRating());
        stats.put("passengerRating", user.getPassengerRating());

        // Get recent reviews
        List<Review> recentReviews = reviewRepository.findByRevieweeId(userId);
        stats.put("recentReviews", recentReviews);

        return stats;
    }

    /**
     * Check if user can review a booking
     */
    public Map<String, Object> canReviewBooking(Long bookingId, Long userId) {
        Map<String, Object> result = new HashMap<>();
        
        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        if (booking == null) {
            result.put("canReview", false);
            result.put("reason", "Booking not found");
            return result;
        }

        if (!"COMPLETED".equals(booking.getStatus())) {
            result.put("canReview", false);
            result.put("reason", "Ride not completed yet");
            return result;
        }

        Ride ride = booking.getRide();
        boolean isPassenger = booking.getPassengerId().equals(userId);
        boolean isDriver = ride.getDriver().getId().equals(userId);

        if (!isPassenger && !isDriver) {
            result.put("canReview", false);
            result.put("reason", "You are not part of this booking");
            return result;
        }

        if (isPassenger && booking.isPassengerReviewed()) {
            result.put("canReview", false);
            result.put("reason", "You have already reviewed this ride");
            return result;
        }

        if (isDriver && booking.isDriverReviewed()) {
            result.put("canReview", false);
            result.put("reason", "You have already reviewed this passenger");
            return result;
        }

        result.put("canReview", true);
        result.put("userType", isPassenger ? "PASSENGER" : "DRIVER");
        result.put("passengerReviewed", booking.isPassengerReviewed());
        result.put("driverReviewed", booking.isDriverReviewed());
        
        return result;
    }
}
