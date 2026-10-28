package com.rideshare.smart_ride_sharing_system.controller;

import com.rideshare.smart_ride_sharing_system.dto.AdminDashboardStats;
import com.rideshare.smart_ride_sharing_system.dto.UserManagementDTO;
import com.rideshare.smart_ride_sharing_system.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin Controller for Dashboard and User Management
 * Provides endpoints for monitoring system health, managing users, and generating reports
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    /**
     * Get comprehensive dashboard statistics
     * GET /api/admin/dashboard/stats
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<AdminDashboardStats> getDashboardStats() {
        try {
            AdminDashboardStats stats = adminService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("Error fetching dashboard stats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get system health metrics
     * GET /api/admin/system/health
     */
    @GetMapping("/system/health")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        try {
            Map<String, Object> health = adminService.getSystemHealth();
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            System.err.println("Error fetching system health: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get all users
     * GET /api/admin/users
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserManagementDTO>> getAllUsers() {
        try {
            List<UserManagementDTO> users = adminService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("Error fetching users: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get users by role
     * GET /api/admin/users/role/{role}
     */
    @GetMapping("/users/role/{role}")
    public ResponseEntity<List<UserManagementDTO>> getUsersByRole(@PathVariable String role) {
        try {
            List<UserManagementDTO> users = adminService.getUsersByRole(role.toUpperCase());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("Error fetching users by role: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get user details by ID
     * GET /api/admin/users/{userId}
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<UserManagementDTO> getUserDetails(@PathVariable Long userId) {
        try {
            UserManagementDTO user = adminService.getUserDetails(userId);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error fetching user details: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Search users
     * GET /api/admin/users/search?q={query}
     */
    @GetMapping("/users/search")
    public ResponseEntity<List<UserManagementDTO>> searchUsers(@RequestParam String q) {
        try {
            List<UserManagementDTO> users = adminService.searchUsers(q);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("Error searching users: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Block/Unblock user
     * PUT /api/admin/users/{userId}/status
     * Body: { "active": true/false, "reason": "optional reason" }
     */
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<Map<String, String>> toggleUserStatus(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> request) {
        try {
            boolean active = (boolean) request.get("active");
            String reason = (String) request.getOrDefault("reason", "");
            
            adminService.toggleUserStatus(userId, active, reason);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "User status updated successfully");
            response.put("status", active ? "active" : "blocked");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            System.err.println("Error updating user status: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get pending driver verifications
     * GET /api/admin/drivers/pending
     */
    @GetMapping("/drivers/pending")
    public ResponseEntity<List<UserManagementDTO>> getPendingDriverVerifications() {
        try {
            List<UserManagementDTO> pendingDrivers = adminService.getPendingDriverVerifications();
            return ResponseEntity.ok(pendingDrivers);
        } catch (Exception e) {
            System.err.println("Error fetching pending drivers: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Verify driver
     * POST /api/admin/drivers/{driverId}/verify
     */
    @PostMapping("/drivers/{driverId}/verify")
    public ResponseEntity<Map<String, String>> verifyDriver(@PathVariable Long driverId) {
        try {
            adminService.verifyDriver(driverId);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Driver verified successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            System.err.println("Error verifying driver: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Reject driver verification
     * POST /api/admin/drivers/{driverId}/reject
     * Body: { "reason": "rejection reason" }
     */
    @PostMapping("/drivers/{driverId}/reject")
    public ResponseEntity<Map<String, String>> rejectDriverVerification(
            @PathVariable Long driverId,
            @RequestBody Map<String, String> request) {
        try {
            String reason = request.getOrDefault("reason", "Not specified");
            adminService.rejectDriverVerification(driverId, reason);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Driver verification rejected");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            System.err.println("Error rejecting driver: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get earnings report
     * GET /api/admin/reports/earnings?startDate={date}&endDate={date}
     */
    @GetMapping("/reports/earnings")
    public ResponseEntity<Map<String, Object>> getEarningsReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            Map<String, Object> report = adminService.getEarningsReport(startDate, endDate);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            System.err.println("Error generating earnings report: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get cancellation report
     * GET /api/admin/reports/cancellations
     */
    @GetMapping("/reports/cancellations")
    public ResponseEntity<Map<String, Object>> getCancellationReport() {
        try {
            Map<String, Object> report = adminService.getCancellationReport();
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            System.err.println("Error generating cancellation report: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Health check endpoint
     * GET /api/admin/ping
     */
    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "Admin API is running");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    /**
     * Get system settings
     * GET /api/admin/settings
     */
    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> getSettings() {
        try {
            Map<String, Object> settings = new HashMap<>();
            // Default settings - in a real app, these would come from a database
            settings.put("baseFare", 50);
            settings.put("perKmRate", 10);
            settings.put("perMinuteRate", 2);
            settings.put("commissionRate", 15);
            settings.put("cancellationFee", 20);
            settings.put("emailNotifications", true);
            settings.put("smsNotifications", false);
            settings.put("pushNotifications", true);
            settings.put("bookingAlerts", true);
            settings.put("paymentAlerts", true);
            settings.put("systemAlerts", true);
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            System.err.println("Error fetching settings: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Update system settings
     * PUT /api/admin/settings
     */
    @PutMapping("/settings")
    public ResponseEntity<Map<String, String>> updateSettings(@RequestBody Map<String, Object> settings) {
        try {
            // In a real app, save these settings to a database
            System.out.println("Updating settings: " + settings);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Settings updated successfully");
            response.put("timestamp", LocalDateTime.now().toString());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error updating settings: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update settings");
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
