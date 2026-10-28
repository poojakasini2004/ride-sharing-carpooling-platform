package com.rideshare.smart_ride_sharing_system.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;
    
    @Column(name = "email", unique = true)
    private String email;
    
    @Column(name = "phone")
    private String phone;
    
    @Column(name = "password")
    private String password;
    
    @Column(name = "role")
    private String role;        // "DRIVER" or "PASSENGER"
    
    @Column(name = "verified")
    private boolean verified;   // Email verification status
    
    @Column(name = "email_verified_at")
    private java.time.LocalDateTime emailVerifiedAt;
    
    @Column(name = "is_active")
    private Boolean active = true;
    
    @Column(name = "last_login")
    private java.time.LocalDateTime lastLogin;
    
    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    // Driver-specific fields
    @Column(name = "vehicle_type")
    private String vehicleType;
    
    @Column(name = "vehicle_model")
    private String vehicleModel;
    
    @Column(name = "rating")
    private double rating; // Overall average rating
    
    @Column(name = "total_reviews")
    private Long totalReviews = 0L; // Total number of reviews received
    
    @Column(name = "driver_rating")
    private Double driverRating; // Average rating as a driver
    
    @Column(name = "passenger_rating")
    private Double passengerRating; // Average rating as a passenger

    public User() {}

    public User(String name, String email, String phone, String password, String role, boolean verified) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.role = role;
        this.verified = verified;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    
    public java.time.LocalDateTime getEmailVerifiedAt() { return emailVerifiedAt; }
    public void setEmailVerifiedAt(java.time.LocalDateTime emailVerifiedAt) { this.emailVerifiedAt = emailVerifiedAt; }
    
    public boolean isActive() { return active != null ? active : true; }
    public void setActive(boolean active) { this.active = active; }
    
    public java.time.LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(java.time.LocalDateTime lastLogin) { this.lastLogin = lastLogin; }
    
    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Driver-specific getters and setters
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getVehicleModel() { return vehicleModel; }
    public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }
    
    public Long getTotalReviews() { return totalReviews; }
    public void setTotalReviews(Long totalReviews) { this.totalReviews = totalReviews; }
    
    public Double getDriverRating() { return driverRating; }
    public void setDriverRating(Double driverRating) { this.driverRating = driverRating; }
    
    public Double getPassengerRating() { return passengerRating; }
    public void setPassengerRating(Double passengerRating) { this.passengerRating = passengerRating; }
}