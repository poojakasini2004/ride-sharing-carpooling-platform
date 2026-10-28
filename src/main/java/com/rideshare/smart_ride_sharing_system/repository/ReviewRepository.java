package com.rideshare.smart_ride_sharing_system.repository;

import com.rideshare.smart_ride_sharing_system.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    // Find all reviews for a specific user (as reviewee)
    List<Review> findByRevieweeId(Long revieweeId);
    
    // Find all reviews given by a user (as reviewer)
    List<Review> findByReviewerId(Long reviewerId);
    
    // Find review for a specific booking and reviewer type
    Optional<Review> findByBookingIdAndReviewerType(Long bookingId, String reviewerType);
    
    // Find all reviews for a booking
    List<Review> findByBookingId(Long bookingId);
    
    // Calculate average rating for a user
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :userId")
    Double calculateAverageRating(@Param("userId") Long userId);
    
    // Count total reviews for a user
    @Query("SELECT COUNT(r) FROM Review r WHERE r.reviewee.id = :userId")
    Long countReviewsByRevieweeId(@Param("userId") Long userId);
    
    // Get reviews for a user with a specific reviewer type (e.g., only passenger reviews or only driver reviews)
    @Query("SELECT r FROM Review r WHERE r.reviewee.id = :userId AND r.reviewerType = :reviewerType ORDER BY r.createdAt DESC")
    List<Review> findByRevieweeIdAndReviewerType(@Param("userId") Long userId, @Param("reviewerType") String reviewerType);
    
    // Calculate average rating by reviewer type
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :userId AND r.reviewerType = :reviewerType")
    Double calculateAverageRatingByType(@Param("userId") Long userId, @Param("reviewerType") String reviewerType);
    
    // Calculate average rating across all reviews
    @Query("SELECT AVG(r.rating) FROM Review r")
    Double averageRating();
}
