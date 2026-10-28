package com.rideshare.smart_ride_sharing_system.repository;

import com.rideshare.smart_ride_sharing_system.model.Ride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {
    // Find rides by source, destination, and date
    List<Ride> findBySourceAndDestinationAndDatetimeAfter(String source, String destination, LocalDateTime datetime);

    // Search with filters
    @Query("SELECT r FROM Ride r LEFT JOIN FETCH r.driver WHERE r.source = :source AND r.destination = :destination AND r.datetime > :datetime " +
           "AND (:priceMin IS NULL OR r.price >= :priceMin) AND (:priceMax IS NULL OR r.price <= :priceMax) " +
           "AND (:vehicleType IS NULL OR r.driver.vehicleType = :vehicleType) " +
           "AND (:ratingMin IS NULL OR r.driver.rating >= :ratingMin)")
    List<Ride> searchRides(@Param("source") String source, @Param("destination") String destination,
                           @Param("datetime") LocalDateTime datetime,
                           @Param("priceMin") Double priceMin, @Param("priceMax") Double priceMax,
                           @Param("vehicleType") String vehicleType, @Param("ratingMin") Double ratingMin);

    List<Ride> findByDriver_Id(Long driverId);

    @Query("SELECT r FROM Ride r WHERE r.availableSeats > 0 AND r.datetime > CURRENT_TIMESTAMP")
    List<Ride> findAvailableRides();

	// Candidates for matching after a given time, regardless of exact source/destination
	@Query("SELECT r FROM Ride r LEFT JOIN FETCH r.driver WHERE r.datetime >= :fromTime AND r.availableSeats > 0")
	List<Ride> findCandidatesFrom(@Param("fromTime") LocalDateTime fromTime);
	
	// Count rides by status
	long countByStatus(String status);
	
	// Count rides by driver (use driver.id to access the driver's ID)
	long countByDriver_Id(Long driverId);
	
	// Count rides by status and completed after date
	long countByStatusAndCompletedAtAfter(String status, LocalDateTime completedAt);
	
	// Count rides by status and completed between dates
	long countByStatusAndCompletedAtBetween(String status, LocalDateTime start, LocalDateTime end);
	
	// Find rides by status
	List<Ride> findByStatus(String status);
	
	// Find active/available rides that should be completed (datetime has passed)
	// Handles NULL status and any status that's not already completed or cancelled
	@Query("SELECT r FROM Ride r WHERE r.datetime < :currentTime AND (r.status IS NULL OR r.status = 'ACTIVE' OR r.status = 'AVAILABLE' OR r.status NOT IN ('COMPLETED', 'CANCELLED'))")
	List<Ride> findRidesToComplete(@Param("currentTime") LocalDateTime currentTime);
	
	// Find completed rides
	@Query("SELECT r FROM Ride r LEFT JOIN FETCH r.driver WHERE r.status = 'COMPLETED' ORDER BY r.completedAt DESC")
	List<Ride> findCompletedRides();
	
	// Find rides by driver and status
	List<Ride> findByDriver_IdAndStatus(Long driverId, String status);
}
