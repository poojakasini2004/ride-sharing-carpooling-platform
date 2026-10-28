package com.rideshare.smart_ride_sharing_system.repository;

import com.rideshare.smart_ride_sharing_system.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Find payment by booking ID
    Optional<Payment> findByBookingId(Long bookingId);

    // Find all payments by passenger
    List<Payment> findByPassengerId(Long passengerId);

    // Find all payments by driver
    List<Payment> findByDriverId(Long driverId);

    // Find payment by transaction ID
    Optional<Payment> findByTransactionId(String transactionId);

    // Find payment by Razorpay order ID
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    // Find payments by status
    List<Payment> findByPaymentStatus(String paymentStatus);

    // Find payments by passenger and status
    List<Payment> findByPassengerIdAndPaymentStatus(Long passengerId, String paymentStatus);

    // Find payments by driver and status
    List<Payment> findByDriverIdAndPaymentStatus(Long driverId, String paymentStatus);

    // Find payments within date range
    @Query("SELECT p FROM Payment p WHERE p.paymentDate BETWEEN :startDate AND :endDate")
    List<Payment> findPaymentsBetweenDates(@Param("startDate") LocalDateTime startDate, 
                                           @Param("endDate") LocalDateTime endDate);

    // Get total earnings for a driver
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.driver.id = :driverId AND p.paymentStatus = 'SUCCESS'")
    Double getTotalEarningsByDriver(@Param("driverId") Long driverId);

    // Get total spending for a passenger
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.passenger.id = :passengerId AND p.paymentStatus = 'SUCCESS'")
    Double getTotalSpendingByPassenger(@Param("passengerId") Long passengerId);

    // Get recent payments for passenger
    @Query("SELECT p FROM Payment p WHERE p.passenger.id = :passengerId ORDER BY p.paymentDate DESC")
    List<Payment> findRecentPaymentsByPassenger(@Param("passengerId") Long passengerId);

    // Get recent payments for driver
    @Query("SELECT p FROM Payment p WHERE p.driver.id = :driverId ORDER BY p.paymentDate DESC")
    List<Payment> findRecentPaymentsByDriver(@Param("driverId") Long driverId);

    // Count successful payments for driver
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.driver.id = :driverId AND p.paymentStatus = 'SUCCESS'")
    Long countSuccessfulPaymentsByDriver(@Param("driverId") Long driverId);

    // Count successful payments for passenger
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.passenger.id = :passengerId AND p.paymentStatus = 'SUCCESS'")
    Long countSuccessfulPaymentsByPassenger(@Param("passengerId") Long passengerId);
    
    // Count payments by status
    long countByPaymentStatus(String paymentStatus);
    
    // Sum amount by status
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus = :status")
    Double sumAmountByStatus(@Param("status") String status);
    
    // Sum amount by status and created after date
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus = :status AND p.paymentDate >= :createdAt")
    Double sumAmountByStatusAndCreatedAtAfter(@Param("status") String status, @Param("createdAt") LocalDateTime createdAt);
    
    // Sum amount by status and created between dates
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus = :status AND p.paymentDate BETWEEN :start AND :end")
    Double sumAmountByStatusAndCreatedAtBetween(@Param("status") String status, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    // Sum amount by driver and status
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.driver.id = :driverId AND p.paymentStatus = :status")
    Double sumAmountByDriverIdAndStatus(@Param("driverId") Long driverId, @Param("status") String status);
    
    // Count payments by status and created after date
    long countByPaymentStatusAndPaymentDateAfter(String paymentStatus, LocalDateTime paymentDate);
    
    // Count payments by status and created between dates
    long countByPaymentStatusAndPaymentDateBetween(String paymentStatus, LocalDateTime start, LocalDateTime end);
    
    // Count payments created after date
    long countByPaymentDateAfter(LocalDateTime paymentDate);
}
