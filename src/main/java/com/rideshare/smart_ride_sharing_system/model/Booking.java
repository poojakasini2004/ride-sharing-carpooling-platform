package com.rideshare.smart_ride_sharing_system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Transient;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Transient
    @JsonProperty("passengerId")
    private Long passengerId;

    @ManyToOne
    @JoinColumn(name = "passenger_id")
    @JsonIgnore
    private User passenger; // Must have role = PASSENGER

    @Transient
    @JsonProperty("rideId")
    private Long rideId;

    @ManyToOne
    @JoinColumn(name = "ride_id")
    private Ride ride;

    private int seatsBooked;
    private LocalDateTime bookingTime;
    private String status; // BOOKED, COMPLETED, CANCELLED
    private Integer rating; // 1-5
    private String feedback;
    private LocalDateTime completedTime;
    
    @Column(name = "total_price")
    private Double totalPrice = 0.0;

    @Column(name = "passenger_name")
    private String passengerName;
    
    @Column(name = "passenger_email")
    private String passengerEmail;
    
    @Column(name = "passenger_phone")
    private String passengerPhone;
    
    @Column(name = "pickup_location")
    private String pickupLocation;
    
    // Reminder tracking fields
    @Column(name = "reminder_24h_sent")
    private Boolean reminder24hSent = false;
    
    @Column(name = "reminder_12h_sent")
    private Boolean reminder12hSent = false;
    
    @Column(name = "reminder_6h_sent")
    private Boolean reminder6hSent = false;
    
    @Column(name = "reminder_3h_sent")
    private Boolean reminder3hSent = false;
    
    @Column(name = "reminder_2h_sent")
    private Boolean reminder2hSent = false;
    
    // Review tracking fields
    @Column(name = "passenger_reviewed")
    private Boolean passengerReviewed = false;
    
    @Column(name = "driver_reviewed")
    private Boolean driverReviewed = false;

    public Booking() {}

    public Booking(User passenger, Ride ride, int seatsBooked, LocalDateTime bookingTime) {
        this.passenger = passenger;
        this.ride = ride;
        this.seatsBooked = seatsBooked;
        this.bookingTime = bookingTime;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    @JsonProperty("passengerId")
    public Long getPassengerId() { 
        if (passengerId != null) return passengerId;
        if (passenger != null) return passenger.getId();
        return null;
    }
    public void setPassengerId(Long passengerId) { this.passengerId = passengerId; }

    public User getPassenger() { return passenger; }
    public void setPassenger(User passenger) { this.passenger = passenger; }

    @JsonProperty("rideId")
    public Long getRideId() { 
        if (rideId != null) return rideId;
        if (ride != null) return ride.getId();
        return null;
    }
    public void setRideId(Long rideId) { this.rideId = rideId; }

    public Ride getRide() { return ride; }
    public void setRide(Ride ride) { this.ride = ride; }

    public int getSeatsBooked() { return seatsBooked; }
    public void setSeatsBooked(int seatsBooked) { this.seatsBooked = seatsBooked; }

    public LocalDateTime getBookingTime() { return bookingTime; }
    public void setBookingTime(LocalDateTime bookingTime) { this.bookingTime = bookingTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public LocalDateTime getCompletedTime() { return completedTime; }
    public void setCompletedTime(LocalDateTime completedTime) { this.completedTime = completedTime; }

    public String getPassengerName() { return passengerName; }
    public void setPassengerName(String passengerName) { this.passengerName = passengerName; }

    public String getPassengerEmail() { return passengerEmail; }
    public void setPassengerEmail(String passengerEmail) { this.passengerEmail = passengerEmail; }

    public String getPassengerPhone() { return passengerPhone; }
    public void setPassengerPhone(String passengerPhone) { this.passengerPhone = passengerPhone; }

    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }
    
    // Reminder tracking getters and setters
    public Boolean isReminder24hSent() { return reminder24hSent != null ? reminder24hSent : false; }
    public void setReminder24hSent(Boolean reminder24hSent) { this.reminder24hSent = reminder24hSent; }
    
    public Boolean isReminder12hSent() { return reminder12hSent != null ? reminder12hSent : false; }
    public void setReminder12hSent(Boolean reminder12hSent) { this.reminder12hSent = reminder12hSent; }
    
    public Boolean isReminder6hSent() { return reminder6hSent != null ? reminder6hSent : false; }
    public void setReminder6hSent(Boolean reminder6hSent) { this.reminder6hSent = reminder6hSent; }
    
    public Boolean isReminder3hSent() { return reminder3hSent != null ? reminder3hSent : false; }
    public void setReminder3hSent(Boolean reminder3hSent) { this.reminder3hSent = reminder3hSent; }
    
    public Boolean isReminder2hSent() { return reminder2hSent != null ? reminder2hSent : false; }
    public void setReminder2hSent(Boolean reminder2hSent) { this.reminder2hSent = reminder2hSent; }
    
    // Review tracking getters and setters
    public Boolean isPassengerReviewed() { return passengerReviewed != null ? passengerReviewed : false; }
    public void setPassengerReviewed(Boolean passengerReviewed) { this.passengerReviewed = passengerReviewed; }
    
    public Boolean isDriverReviewed() { return driverReviewed != null ? driverReviewed : false; }
    public void setDriverReviewed(Boolean driverReviewed) { this.driverReviewed = driverReviewed; }
    
    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
}
