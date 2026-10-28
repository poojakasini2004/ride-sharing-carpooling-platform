package com.rideshare.smart_ride_sharing_system.model;

import java.time.LocalDateTime;

/**
 * Driver Location for Real-Time Tracking
 * (In-memory, not persisted to database)
 */
public class DriverLocation {
    
    private Long driverId;
    private Double latitude;
    private Double longitude;
    private Double speed;  // km/h
    private Double heading;  // degrees (0-360)
    private LocalDateTime timestamp;
    private boolean isOnline;
    private Long currentBookingId;

    public DriverLocation() {
        this.timestamp = LocalDateTime.now();
    }

    public DriverLocation(Long driverId, Double latitude, Double longitude) {
        this.driverId = driverId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getSpeed() { return speed; }
    public void setSpeed(Double speed) { this.speed = speed; }

    public Double getHeading() { return heading; }
    public void setHeading(Double heading) { this.heading = heading; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public boolean isOnline() { return isOnline; }
    public void setOnline(boolean online) { isOnline = online; }

    public Long getCurrentBookingId() { return currentBookingId; }
    public void setCurrentBookingId(Long currentBookingId) { this.currentBookingId = currentBookingId; }
}
