package com.rideshare.smart_ride_sharing_system.service;

import com.rideshare.smart_ride_sharing_system.model.DriverLocation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Location Tracking Service for Real-Time Driver Tracking
 * Stores driver locations in memory and broadcasts via WebSocket
 */
@Service
public class LocationTrackingService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // In-memory storage for driver locations
    private final Map<Long, DriverLocation> driverLocations = new ConcurrentHashMap<>();

    /**
     * Update driver location
     */
    public void updateDriverLocation(Long driverId, Double latitude, Double longitude) {
        updateDriverLocation(driverId, latitude, longitude, null, null);
    }

    /**
     * Update driver location with speed and heading
     */
    public void updateDriverLocation(Long driverId, Double latitude, Double longitude, Double speed, Double heading) {
        
        DriverLocation location = driverLocations.getOrDefault(driverId, new DriverLocation());
        location.setDriverId(driverId);
        location.setLatitude(latitude);
        location.setLongitude(longitude);
        location.setSpeed(speed);
        location.setHeading(heading);
        location.setTimestamp(LocalDateTime.now());
        location.setOnline(true);

        driverLocations.put(driverId, location);

        // Broadcast location update via WebSocket
        Map<String, Object> payload = new HashMap<>();
        payload.put("driverId", driverId);
        payload.put("latitude", latitude);
        payload.put("longitude", longitude);
        payload.put("speed", speed);
        payload.put("heading", heading);
        payload.put("timestamp", location.getTimestamp().toString());

        // Send to topic so all interested clients can receive
        messagingTemplate.convertAndSend("/topic/driver-location/" + driverId, payload);

        System.out.println("📍 Driver " + driverId + " location updated: (" + latitude + ", " + longitude + ")");
    }

    /**
     * Update driver location for specific booking
     */
    public void updateDriverLocationForBooking(Long driverId, Long bookingId, Double latitude, Double longitude) {
        
        DriverLocation location = driverLocations.getOrDefault(driverId, new DriverLocation());
        location.setDriverId(driverId);
        location.setLatitude(latitude);
        location.setLongitude(longitude);
        location.setTimestamp(LocalDateTime.now());
        location.setCurrentBookingId(bookingId);
        location.setOnline(true);

        driverLocations.put(driverId, location);

        // Send location update to booking-specific topic
        Map<String, Object> payload = new HashMap<>();
        payload.put("driverId", driverId);
        payload.put("bookingId", bookingId);
        payload.put("latitude", latitude);
        payload.put("longitude", longitude);
        payload.put("timestamp", location.getTimestamp().toString());

        messagingTemplate.convertAndSend("/topic/booking-location/" + bookingId, payload);

        System.out.println("📍 Driver " + driverId + " location for booking " + bookingId + ": (" + latitude + ", " + longitude + ")");
    }

    /**
     * Get driver's current location
     */
    public DriverLocation getDriverLocation(Long driverId) {
        return driverLocations.get(driverId);
    }

    /**
     * Set driver online status
     */
    public void setDriverOnlineStatus(Long driverId, boolean isOnline) {
        DriverLocation location = driverLocations.getOrDefault(driverId, new DriverLocation());
        location.setDriverId(driverId);
        location.setOnline(isOnline);
        location.setTimestamp(LocalDateTime.now());

        driverLocations.put(driverId, location);

        // Broadcast status change
        Map<String, Object> payload = new HashMap<>();
        payload.put("driverId", driverId);
        payload.put("isOnline", isOnline);
        payload.put("timestamp", location.getTimestamp().toString());

        messagingTemplate.convertAndSend("/topic/driver-status/" + driverId, payload);

        System.out.println("🟢 Driver " + driverId + " is now " + (isOnline ? "ONLINE" : "OFFLINE"));
    }

    /**
     * Remove driver location (when driver goes offline)
     */
    public void removeDriverLocation(Long driverId) {
        driverLocations.remove(driverId);
        setDriverOnlineStatus(driverId, false);
    }

    /**
     * Get all online drivers
     */
    public Map<Long, DriverLocation> getAllOnlineDrivers() {
        Map<Long, DriverLocation> onlineDrivers = new HashMap<>();
        driverLocations.forEach((driverId, location) -> {
            if (location.isOnline()) {
                onlineDrivers.put(driverId, location);
            }
        });
        return onlineDrivers;
    }

    /**
     * Calculate distance between two points (Haversine formula)
     */
    public double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        final int R = 6371; // Radius of the earth in km

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c; // Distance in km
    }

    /**
     * Check if driver is nearby passenger (within 1 km)
     */
    public boolean isDriverNearby(Long driverId, Double passengerLat, Double passengerLon) {
        DriverLocation driverLocation = driverLocations.get(driverId);
        if (driverLocation == null) {
            return false;
        }

        double distance = calculateDistance(
            driverLocation.getLatitude(),
            driverLocation.getLongitude(),
            passengerLat,
            passengerLon
        );

        return distance <= 1.0; // Within 1 km
    }
}
