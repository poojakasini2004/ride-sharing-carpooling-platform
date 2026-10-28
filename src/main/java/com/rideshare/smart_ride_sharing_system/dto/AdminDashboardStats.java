package com.rideshare.smart_ride_sharing_system.dto;

import java.util.Map;

/**
 * DTO for Admin Dashboard Statistics
 */
public class AdminDashboardStats {
    
    // User Statistics
    private long totalUsers;
    private long totalDrivers;
    private long totalPassengers;
    private long activeUsers;
    private long verifiedDrivers;
    private long blockedUsers;
    
    // Ride Statistics
    private long totalRides;
    private long activeRides;
    private long completedRides;
    private long cancelledRides;
    
    // Booking Statistics
    private long totalBookings;
    private long pendingBookings;
    private long confirmedBookings;
    private long completedBookings;
    private long cancelledBookings;
    
    // Payment Statistics
    private double totalEarnings;
    private double todayEarnings;
    private double weekEarnings;
    private double monthEarnings;
    private long totalPayments;
    private long successfulPayments;
    private long failedPayments;
    
    // Review Statistics
    private long totalReviews;
    private double averageRating;
    
    // Recent Activity
    private long newUsersToday;
    private long ridesCompletedToday;
    private long bookingsToday;
    
    // Dispute Statistics
    private long totalDisputes;
    private long pendingDisputes;
    private long resolvedDisputes;
    
    // Trend Data (for charts)
    private Map<String, Long> ridesPerDay;
    private Map<String, Double> earningsPerDay;
    private Map<String, Long> newUsersPerDay;
    
    // Constructors
    public AdminDashboardStats() {}
    
    // Getters and Setters
    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    
    public long getTotalDrivers() { return totalDrivers; }
    public void setTotalDrivers(long totalDrivers) { this.totalDrivers = totalDrivers; }
    
    public long getTotalPassengers() { return totalPassengers; }
    public void setTotalPassengers(long totalPassengers) { this.totalPassengers = totalPassengers; }
    
    public long getActiveUsers() { return activeUsers; }
    public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }
    
    public long getVerifiedDrivers() { return verifiedDrivers; }
    public void setVerifiedDrivers(long verifiedDrivers) { this.verifiedDrivers = verifiedDrivers; }
    
    public long getBlockedUsers() { return blockedUsers; }
    public void setBlockedUsers(long blockedUsers) { this.blockedUsers = blockedUsers; }
    
    public long getTotalRides() { return totalRides; }
    public void setTotalRides(long totalRides) { this.totalRides = totalRides; }
    
    public long getActiveRides() { return activeRides; }
    public void setActiveRides(long activeRides) { this.activeRides = activeRides; }
    
    public long getCompletedRides() { return completedRides; }
    public void setCompletedRides(long completedRides) { this.completedRides = completedRides; }
    
    public long getCancelledRides() { return cancelledRides; }
    public void setCancelledRides(long cancelledRides) { this.cancelledRides = cancelledRides; }
    
    public long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(long totalBookings) { this.totalBookings = totalBookings; }
    
    public long getPendingBookings() { return pendingBookings; }
    public void setPendingBookings(long pendingBookings) { this.pendingBookings = pendingBookings; }
    
    public long getConfirmedBookings() { return confirmedBookings; }
    public void setConfirmedBookings(long confirmedBookings) { this.confirmedBookings = confirmedBookings; }
    
    public long getCompletedBookings() { return completedBookings; }
    public void setCompletedBookings(long completedBookings) { this.completedBookings = completedBookings; }
    
    public long getCancelledBookings() { return cancelledBookings; }
    public void setCancelledBookings(long cancelledBookings) { this.cancelledBookings = cancelledBookings; }
    
    public double getTotalEarnings() { return totalEarnings; }
    public void setTotalEarnings(double totalEarnings) { this.totalEarnings = totalEarnings; }
    
    public double getTodayEarnings() { return todayEarnings; }
    public void setTodayEarnings(double todayEarnings) { this.todayEarnings = todayEarnings; }
    
    public double getWeekEarnings() { return weekEarnings; }
    public void setWeekEarnings(double weekEarnings) { this.weekEarnings = weekEarnings; }
    
    public double getMonthEarnings() { return monthEarnings; }
    public void setMonthEarnings(double monthEarnings) { this.monthEarnings = monthEarnings; }
    
    public long getTotalPayments() { return totalPayments; }
    public void setTotalPayments(long totalPayments) { this.totalPayments = totalPayments; }
    
    public long getSuccessfulPayments() { return successfulPayments; }
    public void setSuccessfulPayments(long successfulPayments) { this.successfulPayments = successfulPayments; }
    
    public long getFailedPayments() { return failedPayments; }
    public void setFailedPayments(long failedPayments) { this.failedPayments = failedPayments; }
    
    public long getTotalReviews() { return totalReviews; }
    public void setTotalReviews(long totalReviews) { this.totalReviews = totalReviews; }
    
    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }
    
    public long getNewUsersToday() { return newUsersToday; }
    public void setNewUsersToday(long newUsersToday) { this.newUsersToday = newUsersToday; }
    
    public long getRidesCompletedToday() { return ridesCompletedToday; }
    public void setRidesCompletedToday(long ridesCompletedToday) { this.ridesCompletedToday = ridesCompletedToday; }
    
    public long getBookingsToday() { return bookingsToday; }
    public void setBookingsToday(long bookingsToday) { this.bookingsToday = bookingsToday; }
    
    public long getTotalDisputes() { return totalDisputes; }
    public void setTotalDisputes(long totalDisputes) { this.totalDisputes = totalDisputes; }
    
    public long getPendingDisputes() { return pendingDisputes; }
    public void setPendingDisputes(long pendingDisputes) { this.pendingDisputes = pendingDisputes; }
    
    public long getResolvedDisputes() { return resolvedDisputes; }
    public void setResolvedDisputes(long resolvedDisputes) { this.resolvedDisputes = resolvedDisputes; }
    
    public Map<String, Long> getRidesPerDay() { return ridesPerDay; }
    public void setRidesPerDay(Map<String, Long> ridesPerDay) { this.ridesPerDay = ridesPerDay; }
    
    public Map<String, Double> getEarningsPerDay() { return earningsPerDay; }
    public void setEarningsPerDay(Map<String, Double> earningsPerDay) { this.earningsPerDay = earningsPerDay; }
    
    public Map<String, Long> getNewUsersPerDay() { return newUsersPerDay; }
    public void setNewUsersPerDay(Map<String, Long> newUsersPerDay) { this.newUsersPerDay = newUsersPerDay; }
}
