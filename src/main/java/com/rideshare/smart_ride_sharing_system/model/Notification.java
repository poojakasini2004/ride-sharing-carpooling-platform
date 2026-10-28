package com.rideshare.smart_ride_sharing_system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Notification Entity for Real-Time Updates
 * 
 * Types:
 * - BOOKING_ACCEPTED: Driver accepted your ride
 * - BOOKING_STARTED: Ride has started
 * - BOOKING_COMPLETED: Ride completed
 * - BOOKING_CANCELLED: Ride cancelled
 * - PAYMENT_SUCCESS: Payment successful
 * - DRIVER_NEARBY: Driver is nearby
 * - CHAT_MESSAGE: New chat message
 */
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "type", nullable = false)
    private String type;  // BOOKING_ACCEPTED, RIDE_STARTED, etc.

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "message", nullable = false, length = 500)
    private String message;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "is_read")
    private boolean isRead = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "data", length = 1000)
    private String data;  // JSON data for additional info

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public Notification() {}

    public Notification(Long userId, String type, String title, String message) {
        this.userId = userId;
        this.type = type;
        this.title = title;
        this.message = message;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getData() { return data; }
    public void setData(String data) { this.data = data; }
}
