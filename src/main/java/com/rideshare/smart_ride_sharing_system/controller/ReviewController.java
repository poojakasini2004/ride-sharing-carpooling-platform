package com.rideshare.smart_ride_sharing_system.controller;

import com.rideshare.smart_ride_sharing_system.model.Review;
import com.rideshare.smart_ride_sharing_system.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Review Management
 */
@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    /**
     * Submit a review from passenger to driver
     * POST /api/reviews/passenger
     * Body: { "bookingId": 1, "passengerId": 2, "rating": 5, "comment": "Great ride!" }
     */
    @PostMapping("/passenger")
    public ResponseEntity<?> submitPassengerReview(@RequestBody Map<String, Object> request) {
        try {
            Long bookingId = Long.valueOf(request.get("bookingId").toString());
            Long passengerId = Long.valueOf(request.get("passengerId").toString());
            Integer rating = Integer.valueOf(request.get("rating").toString());
            String comment = request.get("comment") != null ? request.get("comment").toString() : null;
            String tags = request.get("tags") != null ? request.get("tags").toString() : null;
            
            // Multi-dimensional ratings for driver
            Integer drivingQuality = request.get("drivingQuality") != null ? Integer.valueOf(request.get("drivingQuality").toString()) : null;
            Integer vehicleCleanliness = request.get("vehicleCleanliness") != null ? Integer.valueOf(request.get("vehicleCleanliness").toString()) : null;
            Integer professionalism = request.get("professionalism") != null ? Integer.valueOf(request.get("professionalism").toString()) : null;
            Integer routeEfficiency = request.get("routeEfficiency") != null ? Integer.valueOf(request.get("routeEfficiency").toString()) : null;

            Review review = reviewService.submitPassengerReview(bookingId, passengerId, rating, comment, 
                tags, drivingQuality, vehicleCleanliness, professionalism, routeEfficiency);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review submitted successfully");
            response.put("review", review);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Submit a review from driver to passenger
     * POST /api/reviews/driver
     * Body: { "bookingId": 1, "driverId": 3, "rating": 4, "comment": "Good passenger" }
     */
    @PostMapping("/driver")
    public ResponseEntity<?> submitDriverReview(@RequestBody Map<String, Object> request) {
        try {
            Long bookingId = Long.valueOf(request.get("bookingId").toString());
            Long driverId = Long.valueOf(request.get("driverId").toString());
            Integer rating = Integer.valueOf(request.get("rating").toString());
            String comment = request.get("comment") != null ? request.get("comment").toString() : null;
            String tags = request.get("tags") != null ? request.get("tags").toString() : null;
            
            // Multi-dimensional ratings for passenger
            Integer punctuality = request.get("punctuality") != null ? Integer.valueOf(request.get("punctuality").toString()) : null;
            Integer respectfulness = request.get("respectfulness") != null ? Integer.valueOf(request.get("respectfulness").toString()) : null;
            Integer passengerCleanliness = request.get("passengerCleanliness") != null ? Integer.valueOf(request.get("passengerCleanliness").toString()) : null;

            Review review = reviewService.submitDriverReview(bookingId, driverId, rating, comment,
                tags, punctuality, respectfulness, passengerCleanliness);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review submitted successfully");
            response.put("review", review);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get all reviews for a user (reviews they received)
     * GET /api/reviews/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Review>> getUserReviews(@PathVariable Long userId) {
        List<Review> reviews = reviewService.getUserReviews(userId);
        return ResponseEntity.ok(reviews);
    }

    /**
     * Get reviews given by a user
     * GET /api/reviews/by-user/{userId}
     */
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<List<Review>> getReviewsByUser(@PathVariable Long userId) {
        List<Review> reviews = reviewService.getReviewsByUser(userId);
        return ResponseEntity.ok(reviews);
    }

    /**
     * Get reviews for a specific booking
     * GET /api/reviews/booking/{bookingId}
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<Review>> getBookingReviews(@PathVariable Long bookingId) {
        List<Review> reviews = reviewService.getBookingReviews(bookingId);
        return ResponseEntity.ok(reviews);
    }

    /**
     * Get user rating statistics
     * GET /api/reviews/user/{userId}/stats
     */
    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<Map<String, Object>> getUserRatingStats(@PathVariable Long userId) {
        Map<String, Object> stats = reviewService.getUserRatingStats(userId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Check if user can review a booking
     * GET /api/reviews/can-review/{bookingId}/{userId}
     */
    @GetMapping("/can-review/{bookingId}/{userId}")
    public ResponseEntity<Map<String, Object>> canReviewBooking(
            @PathVariable Long bookingId,
            @PathVariable Long userId) {
        Map<String, Object> result = reviewService.canReviewBooking(bookingId, userId);
        return ResponseEntity.ok(result);
    }

    /**
     * Update user rating (manual trigger for recalculation)
     * PUT /api/reviews/user/{userId}/update-rating
     */
    @PutMapping("/user/{userId}/update-rating")
    public ResponseEntity<?> updateUserRating(@PathVariable Long userId) {
        try {
            reviewService.updateUserRating(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Rating updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
