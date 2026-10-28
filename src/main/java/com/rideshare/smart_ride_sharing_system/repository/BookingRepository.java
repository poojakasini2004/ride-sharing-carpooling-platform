package com.rideshare.smart_ride_sharing_system.repository;

import com.rideshare.smart_ride_sharing_system.model.Booking;
import com.rideshare.smart_ride_sharing_system.model.User;
import com.rideshare.smart_ride_sharing_system.model.Ride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByPassenger(User passenger);
    List<Booking> findByRide(Ride ride);
    List<Booking> findByStatus(String status);

    @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.ride r LEFT JOIN FETCH r.driver WHERE b.passenger.id = :passengerId")
    List<Booking> findByPassenger_Id(@Param("passengerId") Long passengerId);

    @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.ride r LEFT JOIN FETCH r.driver WHERE r.driver.id = :driverId")
    List<Booking> findByRide_Driver_Id(@Param("driverId") Long driverId);
    
    // Count bookings by status
    long countByStatus(String status);
    
    // Count bookings by passenger (use passenger.id to access the passenger's ID)
    long countByPassenger_Id(Long passengerId);
    
    // Count bookings after a specific date
    long countByBookingTimeAfter(LocalDateTime bookingTime);
    
    // Find bookings by status and ride scheduled time between dates (for reminders)
    @Query("SELECT b FROM Booking b WHERE b.status = :status AND b.ride.datetime BETWEEN :startTime AND :endTime")
    List<Booking> findByStatusAndRideScheduledTimeBetween(
        @Param("status") String status,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    // Find bookings by ride ID
    List<Booking> findByRide_Id(Long rideId);
    
    // Find bookings by ride ID and status
    List<Booking> findByRide_IdAndStatus(Long rideId, String status);
    
    // Find completed bookings
    @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.ride r LEFT JOIN FETCH r.driver WHERE b.status = 'COMPLETED' ORDER BY b.completedTime DESC")
    List<Booking> findCompletedBookings();
    
    // Find bookings that should be completed (ride time has passed but status is still BOOKED)
    @Query("SELECT b FROM Booking b WHERE b.status = 'BOOKED' AND b.ride.datetime < :currentTime")
    List<Booking> findBookingsToComplete(@Param("currentTime") LocalDateTime currentTime);
}
