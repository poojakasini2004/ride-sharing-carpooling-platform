package com.rideshare.smart_ride_sharing_system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Review Entity for Rating System
 * Stores ratings and reviews from both passengers and drivers
 */
@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer; // The person giving the review

    @ManyToOne
    @JoinColumn(name = "reviewee_id", nullable = false)
    private User reviewee; // The person being reviewed

    @Column(name = "reviewer_type", nullable = false)
    private String reviewerType; // PASSENGER or DRIVER

    @Column(name = "review_type", nullable = false)
    private String reviewType; // PASSENGER_TO_DRIVER or DRIVER_TO_PASSENGER

    @Column(name = "rating", nullable = false)
    private Integer rating; // 1-5 stars (overall)

    @Column(name = "comment", length = 1000)
    private String comment;

    // Multi-dimensional ratings for drivers
    @Column(name = "driving_quality")
    private Integer drivingQuality; // 1-5 stars

    @Column(name = "vehicle_cleanliness")
    private Integer vehicleCleanliness; // 1-5 stars

    @Column(name = "professionalism")
    private Integer professionalism; // 1-5 stars

    @Column(name = "route_efficiency")
    private Integer routeEfficiency; // 1-5 stars

    // Multi-dimensional ratings for passengers
    @Column(name = "punctuality")
    private Integer punctuality; // 1-5 stars

    @Column(name = "respectfulness")
    private Integer respectfulness; // 1-5 stars

    @Column(name = "passenger_cleanliness")
    private Integer passengerCleanliness; // 1-5 stars

    // Quick tags (comma-separated)
    @Column(name = "tags", length = 500)
    private String tags; // e.g., "Great conversation,Clean car,Safe driver"

    // Response from reviewee
    @Column(name = "response", length = 1000)
    private String response;

    @Column(name = "response_at")
    private LocalDateTime responseAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "is_helpful")
    private Boolean isHelpful = false; // Marked as helpful by others

    @Column(name = "helpful_count")
    private Integer helpfulCount = 0;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public Review() {}

    public Review(Booking booking, User reviewer, User reviewee, String reviewerType, Integer rating, String comment) {
        this.booking = booking;
        this.reviewer = reviewer;
        this.reviewee = reviewee;
        this.reviewerType = reviewerType;
        this.reviewType = reviewerType.equals("PASSENGER") ? "PASSENGER_TO_DRIVER" : "DRIVER_TO_PASSENGER";
        this.rating = rating;
        this.comment = comment;
    }

    public Review(Booking booking, User reviewer, User reviewee, String reviewerType, Integer rating, String comment, String tags) {
        this.booking = booking;
        this.reviewer = reviewer;
        this.reviewee = reviewee;
        this.reviewerType = reviewerType;
        this.reviewType = reviewerType.equals("PASSENGER") ? "PASSENGER_TO_DRIVER" : "DRIVER_TO_PASSENGER";
        this.rating = rating;
        this.comment = comment;
        this.tags = tags;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public User getReviewer() {
        return reviewer;
    }

    public void setReviewer(User reviewer) {
        this.reviewer = reviewer;
    }

    public User getReviewee() {
        return reviewee;
    }

    public void setReviewee(User reviewee) {
        this.reviewee = reviewee;
    }

    public String getReviewerType() {
        return reviewerType;
    }

    public void setReviewerType(String reviewerType) {
        this.reviewerType = reviewerType;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Multi-dimensional ratings getters and setters
    public Integer getDrivingQuality() {
        return drivingQuality;
    }

    public void setDrivingQuality(Integer drivingQuality) {
        this.drivingQuality = drivingQuality;
    }

    public Integer getVehicleCleanliness() {
        return vehicleCleanliness;
    }

    public void setVehicleCleanliness(Integer vehicleCleanliness) {
        this.vehicleCleanliness = vehicleCleanliness;
    }

    public Integer getProfessionalism() {
        return professionalism;
    }

    public void setProfessionalism(Integer professionalism) {
        this.professionalism = professionalism;
    }

    public Integer getRouteEfficiency() {
        return routeEfficiency;
    }

    public void setRouteEfficiency(Integer routeEfficiency) {
        this.routeEfficiency = routeEfficiency;
    }

    public Integer getPunctuality() {
        return punctuality;
    }

    public void setPunctuality(Integer punctuality) {
        this.punctuality = punctuality;
    }

    public Integer getRespectfulness() {
        return respectfulness;
    }

    public void setRespectfulness(Integer respectfulness) {
        this.respectfulness = respectfulness;
    }

    public Integer getPassengerCleanliness() {
        return passengerCleanliness;
    }

    public void setPassengerCleanliness(Integer passengerCleanliness) {
        this.passengerCleanliness = passengerCleanliness;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public LocalDateTime getResponseAt() {
        return responseAt;
    }

    public void setResponseAt(LocalDateTime responseAt) {
        this.responseAt = responseAt;
    }

    public Boolean getIsHelpful() {
        return isHelpful;
    }

    public void setIsHelpful(Boolean isHelpful) {
        this.isHelpful = isHelpful;
    }

    public Integer getHelpfulCount() {
        return helpfulCount;
    }

    public void setHelpfulCount(Integer helpfulCount) {
        this.helpfulCount = helpfulCount;
    }

    public String getReviewType() {
        return reviewType;
    }

    public void setReviewType(String reviewType) {
        this.reviewType = reviewType;
    }
}
