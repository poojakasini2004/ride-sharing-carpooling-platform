package com.rideshare.smart_ride_sharing_system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "rides")
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonProperty("origin")
    @Column(name = "source")
    private String source;
    
    @Column(name = "destination")
    private String destination;

    @JsonProperty("departureTime")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    @Column(name = "datetime")
    private LocalDateTime datetime;
    
    @Column(name = "available_seats")
    private int availableSeats;
    
    @Column(name = "price")
    private double price;

    @Column(name = "distance_km")
    private Double distanceKm;

    @Column(name = "duration_minutes")
    private Double durationMinutes;

    @Column(name = "base_fare")
    private Double baseFare;

    @Column(name = "per_km_rate")
    private Double perKmRate;

    @Column(name = "status")
    private String status = "ACTIVE"; // ACTIVE, COMPLETED, CANCELLED

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Transient
    @JsonProperty("driverId")
    private Long driverId;

    @Transient
    @JsonProperty("vehicleType")
    private String vehicleType;

    @ManyToOne
    @JoinColumn(name = "driver_id")
    @JsonIgnore
    private User driver;   // Must have role = DRIVER

    // Expose driver details without circular reference
    @JsonProperty("driver")
    public Map<String, Object> getDriverDetails() {
        if (driver == null) return null;
        Map<String, Object> driverInfo = new HashMap<>();
        driverInfo.put("id", driver.getId());
        driverInfo.put("name", driver.getName());
        driverInfo.put("email", driver.getEmail());
        driverInfo.put("phone", driver.getPhone());
        driverInfo.put("vehicleType", driver.getVehicleType());
        driverInfo.put("vehicleModel", driver.getVehicleModel());
        return driverInfo;
    }

    public Ride() {}

    public Ride(String source, String destination, LocalDateTime datetime, int availableSeats, User driver) {
        this.source = source;
        this.destination = destination;
        this.datetime = datetime;
        this.availableSeats = availableSeats;
        this.driver = driver;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    @JsonProperty("origin")
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    @JsonProperty("departureTime")
    public LocalDateTime getDatetime() { return datetime; }
    public void setDatetime(LocalDateTime datetime) { this.datetime = datetime; }

    public int getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(int availableSeats) { this.availableSeats = availableSeats; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    @JsonProperty("driverId")
    public Long getDriverId() { 
        if (driverId != null) return driverId;
        if (driver != null) return driver.getId();
        return null;
    }
    public void setDriverId(Long driverId) { this.driverId = driverId; }

    public User getDriver() { return driver; }
    public void setDriver(User driver) { this.driver = driver; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public Double getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Double durationMinutes) { this.durationMinutes = durationMinutes; }

    public Double getBaseFare() { return baseFare; }
    public void setBaseFare(Double baseFare) { this.baseFare = baseFare; }

    public Double getPerKmRate() { return perKmRate; }
    public void setPerKmRate(Double perKmRate) { this.perKmRate = perKmRate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
