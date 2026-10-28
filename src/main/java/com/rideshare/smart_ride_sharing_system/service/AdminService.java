package com.rideshare.smart_ride_sharing_system.service;

import com.rideshare.smart_ride_sharing_system.dto.AdminDashboardStats;
import com.rideshare.smart_ride_sharing_system.dto.UserManagementDTO;
import com.rideshare.smart_ride_sharing_system.model.User;
import com.rideshare.smart_ride_sharing_system.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Admin Service for Dashboard and User Management
 */
@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RideRepository rideRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private RealtimeNotificationService notificationService;

    /**
     * Get comprehensive dashboard statistics
     */
    public AdminDashboardStats getDashboardStats() {
        AdminDashboardStats stats = new AdminDashboardStats();
        
        System.out.println("\u23f3 Fetching admin dashboard statistics...");
        
        // User Statistics
        try {
            long totalUsers = userRepository.count();
            stats.setTotalUsers(totalUsers);
            stats.setTotalDrivers(userRepository.countByRole("DRIVER"));
            stats.setTotalPassengers(userRepository.countByRole("PASSENGER"));
            stats.setActiveUsers(userRepository.countByActive(true));
            stats.setVerifiedDrivers(userRepository.countByRoleAndVerified("DRIVER", true));
            stats.setBlockedUsers(userRepository.countByActive(false));
            System.out.println("✅ User stats fetched: Total users = " + totalUsers);
        } catch (Exception e) {
            System.err.println("❌ Error fetching user statistics: " + e.getMessage());
            e.printStackTrace();
            stats.setTotalUsers(0);
            stats.setTotalDrivers(0);
            stats.setTotalPassengers(0);
            stats.setActiveUsers(0);
            stats.setVerifiedDrivers(0);
            stats.setBlockedUsers(0);
        }
        
        // Ride Statistics
        try {
            long totalRides = rideRepository.count();
            long activeRides = rideRepository.countByStatus("ACTIVE");
            long completedRides = rideRepository.countByStatus("COMPLETED");
            long cancelledRides = rideRepository.countByStatus("CANCELLED");
            
            stats.setTotalRides(totalRides);
            stats.setActiveRides(activeRides);
            stats.setCompletedRides(completedRides);
            stats.setCancelledRides(cancelledRides);
            
            System.out.println("✅ Ride stats fetched: Total = " + totalRides + 
                             ", Active = " + activeRides + 
                             ", Completed = " + completedRides + 
                             ", Cancelled = " + cancelledRides);
        } catch (Exception e) {
            System.err.println("❌ Error fetching ride statistics: " + e.getMessage());
            e.printStackTrace();
            stats.setTotalRides(0);
            stats.setActiveRides(0);
            stats.setCompletedRides(0);
            stats.setCancelledRides(0);
        }
        
        // Booking Statistics
        try {
            long totalBookings = bookingRepository.count();
            long pendingBookings = bookingRepository.countByStatus("PENDING");
            long confirmedBookings = bookingRepository.countByStatus("CONFIRMED");
            long completedBookings = bookingRepository.countByStatus("COMPLETED");
            long cancelledBookings = bookingRepository.countByStatus("CANCELLED");
            
            stats.setTotalBookings(totalBookings);
            stats.setPendingBookings(pendingBookings);
            stats.setConfirmedBookings(confirmedBookings);
            stats.setCompletedBookings(completedBookings);
            stats.setCancelledBookings(cancelledBookings);
            
            System.out.println("✅ Booking stats fetched: Total = " + totalBookings + 
                             ", Pending = " + pendingBookings + 
                             ", Confirmed = " + confirmedBookings + 
                             ", Completed = " + completedBookings + 
                             ", Cancelled = " + cancelledBookings);
        } catch (Exception e) {
            System.err.println("❌ Error fetching booking statistics: " + e.getMessage());
            e.printStackTrace();
            stats.setTotalBookings(0);
            stats.setPendingBookings(0);
            stats.setConfirmedBookings(0);
            stats.setCompletedBookings(0);
            stats.setCancelledBookings(0);
        }
        
        // Payment Statistics
        try {
            Double totalEarnings = paymentRepository.sumAmountByStatus("SUCCESS");
            stats.setTotalEarnings(totalEarnings != null ? totalEarnings : 0.0);
            
            LocalDateTime todayStart = LocalDate.now().atStartOfDay();
            Double todayEarnings = paymentRepository.sumAmountByStatusAndCreatedAtAfter("SUCCESS", todayStart);
            stats.setTodayEarnings(todayEarnings != null ? todayEarnings : 0.0);
            
            LocalDateTime weekStart = LocalDate.now().minusDays(7).atStartOfDay();
            Double weekEarnings = paymentRepository.sumAmountByStatusAndCreatedAtAfter("SUCCESS", weekStart);
            stats.setWeekEarnings(weekEarnings != null ? weekEarnings : 0.0);
            
            LocalDateTime monthStart = LocalDate.now().minusDays(30).atStartOfDay();
            Double monthEarnings = paymentRepository.sumAmountByStatusAndCreatedAtAfter("SUCCESS", monthStart);
            stats.setMonthEarnings(monthEarnings != null ? monthEarnings : 0.0);
            
            stats.setTotalPayments(paymentRepository.count());
            stats.setSuccessfulPayments(paymentRepository.countByPaymentStatus("SUCCESS"));
            stats.setFailedPayments(paymentRepository.countByPaymentStatus("FAILED"));
        } catch (Exception e) {
            System.err.println("Error fetching payment statistics: " + e.getMessage());
            stats.setTotalEarnings(0.0);
            stats.setTodayEarnings(0.0);
            stats.setWeekEarnings(0.0);
            stats.setMonthEarnings(0.0);
            stats.setTotalPayments(0);
            stats.setSuccessfulPayments(0);
            stats.setFailedPayments(0);
        }
        
        // Review Statistics
        try {
            long totalReviews = reviewRepository.count();
            Double avgRating = reviewRepository.averageRating();
            stats.setTotalReviews(totalReviews);
            stats.setAverageRating(avgRating != null ? avgRating : 0.0);
            System.out.println("✅ Review stats fetched: Total = " + totalReviews + 
                             ", Avg Rating = " + (avgRating != null ? avgRating : 0.0));
        } catch (Exception e) {
            System.err.println("❌ Error fetching review statistics: " + e.getMessage());
            e.printStackTrace();
            stats.setTotalReviews(0);
            stats.setAverageRating(0.0);
        }
        
        // Recent Activity
        try {
            LocalDateTime todayStart = LocalDate.now().atStartOfDay();
            stats.setNewUsersToday(userRepository.countByCreatedAtAfter(todayStart));
            stats.setRidesCompletedToday(rideRepository.countByStatusAndCompletedAtAfter("COMPLETED", todayStart));
        } catch (Exception e) {
            System.err.println("Error fetching recent activity: " + e.getMessage());
            stats.setNewUsersToday(0);
            stats.setRidesCompletedToday(0);
        }
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        stats.setBookingsToday(bookingRepository.countByBookingTimeAfter(todayStart));
        
        // Trend Data (last 7 days)
        stats.setRidesPerDay(getRidesPerDay(7));
        stats.setEarningsPerDay(getEarningsPerDay(7));
        stats.setNewUsersPerDay(getNewUsersPerDay(7));
        
        return stats;
    }

    /**
     * Get rides per day for the last N days
     */
    private Map<String, Long> getRidesPerDay(int days) {
        Map<String, Long> ridesPerDay = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
            
            long count = rideRepository.countByStatusAndCompletedAtBetween("COMPLETED", startOfDay, endOfDay);
            ridesPerDay.put(date.format(formatter), count);
        }
        
        return ridesPerDay;
    }

    /**
     * Get earnings per day for the last N days
     */
    private Map<String, Double> getEarningsPerDay(int days) {
        Map<String, Double> earningsPerDay = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
            
            Double earnings = paymentRepository.sumAmountByStatusAndCreatedAtBetween("SUCCESS", startOfDay, endOfDay);
            earningsPerDay.put(date.format(formatter), earnings != null ? earnings : 0.0);
        }
        
        return earningsPerDay;
    }

    /**
     * Get new users per day for the last N days
     */
    private Map<String, Long> getNewUsersPerDay(int days) {
        Map<String, Long> usersPerDay = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
            
            long count = userRepository.countByCreatedAtBetween(startOfDay, endOfDay);
            usersPerDay.put(date.format(formatter), count);
        }
        
        return usersPerDay;
    }

    /**
     * Get all users with management details
     */
    public List<UserManagementDTO> getAllUsers() {
        try {
            System.out.println("Fetching all users...");
            List<User> users = userRepository.findAll();
            System.out.println("Found " + users.size() + " users");
            return users.stream()
                .map(user -> {
                    try {
                        return convertToUserManagementDTO(user);
                    } catch (Exception e) {
                        System.err.println("Error converting user " + user.getId() + ": " + e.getMessage());
                        e.printStackTrace();
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error in getAllUsers: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch users: " + e.getMessage(), e);
        }
    }

    /**
     * Get users by role
     */
    public List<UserManagementDTO> getUsersByRole(String role) {
        List<User> users = userRepository.findByRole(role);
        return users.stream().map(this::convertToUserManagementDTO).collect(Collectors.toList());
    }

    /**
     * Get user details by ID
     */
    public UserManagementDTO getUserDetails(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToUserManagementDTO(user);
    }

    /**
     * Convert User to UserManagementDTO with additional stats
     */
    private UserManagementDTO convertToUserManagementDTO(User user) {
        UserManagementDTO dto = new UserManagementDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setVerified(user.isVerified());
        dto.setActive(user.isActive());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setLastLogin(user.getLastLogin());
        dto.setVehicleType(user.getVehicleType());
        dto.setVehicleModel(user.getVehicleModel());
        dto.setRating(user.getRating());
        dto.setTotalReviews(user.getTotalReviews());
        
        // Calculate additional stats
        if ("DRIVER".equals(user.getRole())) {
            dto.setTotalRides(rideRepository.countByDriver_Id(user.getId()));
            Double earnings = paymentRepository.sumAmountByDriverIdAndStatus(user.getId(), "SUCCESS");
            dto.setTotalEarnings(earnings != null ? earnings : 0.0);
        } else {
            dto.setTotalBookings(bookingRepository.countByPassenger_Id(user.getId()));
        }
        
        return dto;
    }

    /**
     * Block/Unblock user
     */
    @Transactional
    public void toggleUserStatus(Long userId, boolean active, String reason) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setActive(active);
        userRepository.save(user);
        
        // Send notification to user
        String title = active ? "Account Activated" : "Account Suspended";
        String message = active 
            ? "Your account has been activated. You can now use the platform."
            : "Your account has been suspended. Reason: " + reason;
        
        notificationService.sendNotificationToUser(userId, "ACCOUNT_STATUS", title, message);
        
        // Send email notification
        try {
            emailService.sendAccountStatusEmail(user.getEmail(), user.getName(), active, reason);
        } catch (Exception e) {
            System.err.println("Failed to send account status email: " + e.getMessage());
        }
    }

    /**
     * Verify driver
     */
    @Transactional
    public void verifyDriver(Long driverId) {
        User driver = userRepository.findById(driverId)
            .orElseThrow(() -> new RuntimeException("Driver not found"));
        
        if (!"DRIVER".equals(driver.getRole())) {
            throw new RuntimeException("User is not a driver");
        }
        
        driver.setVerified(true);
        driver.setEmailVerifiedAt(LocalDateTime.now());
        userRepository.save(driver);
        
        // Send notification
        notificationService.sendNotificationToUser(
            driverId, 
            "DRIVER_VERIFIED", 
            "Driver Verification Approved ✅", 
            "Congratulations! Your driver profile has been verified. You can now accept ride requests."
        );
        
        // Send email
        try {
            emailService.sendDriverVerificationEmail(driver.getEmail(), driver.getName(), true);
        } catch (Exception e) {
            System.err.println("Failed to send driver verification email: " + e.getMessage());
        }
    }

    /**
     * Reject driver verification
     */
    @Transactional
    public void rejectDriverVerification(Long driverId, String reason) {
        User driver = userRepository.findById(driverId)
            .orElseThrow(() -> new RuntimeException("Driver not found"));
        
        if (!"DRIVER".equals(driver.getRole())) {
            throw new RuntimeException("User is not a driver");
        }
        
        driver.setVerified(false);
        userRepository.save(driver);
        
        // Send notification
        notificationService.sendNotificationToUser(
            driverId, 
            "DRIVER_VERIFICATION_REJECTED", 
            "Driver Verification Rejected ❌", 
            "Your driver verification was rejected. Reason: " + reason
        );
        
        // Send email
        try {
            emailService.sendDriverVerificationEmail(driver.getEmail(), driver.getName(), false, reason);
        } catch (Exception e) {
            System.err.println("Failed to send driver rejection email: " + e.getMessage());
        }
    }

    /**
     * Get pending driver verifications
     */
    public List<UserManagementDTO> getPendingDriverVerifications() {
        List<User> pendingDrivers = userRepository.findByRoleAndVerified("DRIVER", false);
        return pendingDrivers.stream()
            .map(this::convertToUserManagementDTO)
            .collect(Collectors.toList());
    }

    /**
     * Search users by name, email, or phone
     */
    public List<UserManagementDTO> searchUsers(String query) {
        List<User> users = userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneContaining(
            query, query, query
        );
        return users.stream().map(this::convertToUserManagementDTO).collect(Collectors.toList());
    }

    /**
     * Get system health metrics
     */
    public Map<String, Object> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        
        // Database connectivity
        health.put("database", "connected");
        health.put("timestamp", LocalDateTime.now());
        
        // Active connections
        long activeRides = rideRepository.countByStatus("ACTIVE");
        long pendingBookings = bookingRepository.countByStatus("PENDING");
        
        health.put("activeRides", activeRides);
        health.put("pendingBookings", pendingBookings);
        health.put("onlineUsers", userRepository.countByActive(true));
        
        // Recent activity (last hour)
        LocalDateTime lastHour = LocalDateTime.now().minusHours(1);
        long recentBookings = bookingRepository.countByBookingTimeAfter(lastHour);
        long recentPayments = paymentRepository.countByPaymentDateAfter(lastHour);
        
        health.put("bookingsLastHour", recentBookings);
        health.put("paymentsLastHour", recentPayments);
        
        // System status
        health.put("status", "healthy");
        
        return health;
    }

    /**
     * Generate earnings report
     */
    public Map<String, Object> getEarningsReport(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> report = new HashMap<>();
        
        Double totalEarnings = paymentRepository.sumAmountByStatusAndCreatedAtBetween(
            "SUCCESS", startDate, endDate
        );
        
        long totalTransactions = paymentRepository.countByPaymentStatusAndPaymentDateBetween(
            "SUCCESS", startDate, endDate
        );
        
        report.put("startDate", startDate);
        report.put("endDate", endDate);
        report.put("totalEarnings", totalEarnings != null ? totalEarnings : 0.0);
        report.put("totalTransactions", totalTransactions);
        report.put("averageTransactionValue", 
            totalTransactions > 0 ? (totalEarnings != null ? totalEarnings : 0.0) / totalTransactions : 0.0);
        
        return report;
    }

    /**
     * Get ride cancellation report
     */
    public Map<String, Object> getCancellationReport() {
        Map<String, Object> report = new HashMap<>();
        
        long totalRides = rideRepository.count();
        long cancelledRides = rideRepository.countByStatus("CANCELLED");
        long cancelledBookings = bookingRepository.countByStatus("CANCELLED");
        
        double cancellationRate = totalRides > 0 
            ? (double) cancelledRides / totalRides * 100 
            : 0.0;
        
        report.put("totalRides", totalRides);
        report.put("cancelledRides", cancelledRides);
        report.put("cancelledBookings", cancelledBookings);
        report.put("cancellationRate", cancellationRate);
        
        return report;
    }
}
