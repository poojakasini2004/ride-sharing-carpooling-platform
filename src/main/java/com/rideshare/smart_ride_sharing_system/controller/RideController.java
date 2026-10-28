package com.rideshare.smart_ride_sharing_system.controller;

import com.rideshare.smart_ride_sharing_system.model.Ride;
import com.rideshare.smart_ride_sharing_system.dto.RouteMatchResult;
import com.rideshare.smart_ride_sharing_system.model.User;
import com.rideshare.smart_ride_sharing_system.service.RideService;
import com.rideshare.smart_ride_sharing_system.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/rides")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class RideController {

    @Autowired
    private RideService rideService;

    @Autowired
    private UserService userService;

    // ✅ Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        System.out.println("RideController health check called");
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("status", "OK");
        response.put("message", "RideController is working!");
        response.put("timestamp", java.time.LocalDateTime.now());
        response.put("totalRides", rideService.getAllRides().size());
        return ResponseEntity.ok(response);
    }

    // ✅ Create Ride
    @PostMapping("/create")
    public ResponseEntity<?> createRide(@RequestBody Ride ride) {
        try {
            System.out.println("\n=== POST /api/rides/create CALLED ===");
            System.out.println("Received ride data:");
            System.out.println("  Origin: " + ride.getSource());
            System.out.println("  Destination: " + ride.getDestination());
            System.out.println("  Departure Time: " + ride.getDatetime());
            System.out.println("  Available Seats: " + ride.getAvailableSeats());
            System.out.println("  Price: " + ride.getPrice());
            System.out.println("  Driver ID from request: " + ride.getDriverId());
            
            // Validate required fields
            if (ride.getSource() == null || ride.getSource().trim().isEmpty()) {
                System.err.println("ERROR: Origin is required");
                return ResponseEntity.badRequest().body("Origin is required");
            }
            if (ride.getDestination() == null || ride.getDestination().trim().isEmpty()) {
                System.err.println("ERROR: Destination is required");
                return ResponseEntity.badRequest().body("Destination is required");
            }
            if (ride.getDatetime() == null) {
                System.err.println("ERROR: Departure time is required");
                return ResponseEntity.badRequest().body("Departure time is required");
            }
            if (ride.getAvailableSeats() <= 0) {
                System.err.println("ERROR: Available seats must be greater than 0");
                return ResponseEntity.badRequest().body("Available seats must be greater than 0");
            }
            
            // Try to get user from driverId first (from request body)
            User driver = null;
            if (ride.getDriverId() != null) {
                System.out.println("Looking up driver by ID: " + ride.getDriverId());
                Optional<User> driverOpt = userService.getUserById(ride.getDriverId());
                if (driverOpt.isPresent()) {
                    driver = driverOpt.get();
                    System.out.println("✅ Driver found by ID - Name: " + driver.getName() + ", Email: " + driver.getEmail());
                } else {
                    System.err.println("❌ Driver not found with ID: " + ride.getDriverId());
                    java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
                    errorResponse.put("error", "Driver Not Found");
                    errorResponse.put("message", "No user found with ID: " + ride.getDriverId());
                    return ResponseEntity.status(404).body(errorResponse);
                }
            } else {
                // Fallback to JWT authentication
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                System.out.println("Auth object: " + auth);
                System.out.println("Auth name: " + (auth != null ? auth.getName() : "null"));
                System.out.println("Auth principal: " + (auth != null ? auth.getPrincipal() : "null"));
                
                if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
                    System.err.println("❌ No authentication found and no driverId provided");
                    java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
                    errorResponse.put("error", "Authentication Required");
                    errorResponse.put("message", "Please provide driverId or valid authentication token");
                    return ResponseEntity.status(401).body(errorResponse);
                }
                
                String email = auth.getName();
                System.out.println("Looking up driver by email: " + email);
                
                Optional<User> userOpt = userService.getUserByEmail(email);
                if (userOpt.isPresent()) {
                    driver = userOpt.get();
                    System.out.println("✅ Driver found by email - ID: " + driver.getId() + ", Name: " + driver.getName());
                } else {
                    System.err.println("❌ User not found for email: " + email);
                    java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
                    errorResponse.put("error", "User Not Found");
                    errorResponse.put("message", "No user found with email: " + email);
                    return ResponseEntity.status(404).body(errorResponse);
                }
            }
            
            // Set the driver
            ride.setDriver(driver);
            System.out.println("✅ Using driver - ID: " + driver.getId() + ", Name: " + driver.getName() + ", Role: " + driver.getRole());
            
            Ride createdRide = rideService.createRide(ride);
            System.out.println("✅ Ride created successfully with ID: " + createdRide.getId());
            System.out.println("===================================\n");
            return ResponseEntity.ok(createdRide);
        } catch (RuntimeException e) {
            System.err.println("❌ ERROR creating ride: " + e.getMessage());
            e.printStackTrace();
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Failed to create ride");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("type", e.getClass().getSimpleName());
            return ResponseEntity.status(400).body(errorResponse);
        } catch (Exception e) {
            System.err.println("❌ UNEXPECTED ERROR creating ride: " + e.getMessage());
            e.printStackTrace();
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Internal server error");
            errorResponse.put("message", "An unexpected error occurred: " + e.getMessage());
            errorResponse.put("type", e.getClass().getSimpleName());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // ✅ Get all rides
    @GetMapping
    public ResponseEntity<List<Ride>> getAllRides() {
        return ResponseEntity.ok(rideService.getAllRides());
    }

    // ✅ Search rides
    @GetMapping("/search")
    public ResponseEntity<List<Ride>> searchRides(@RequestParam String source,
                                                  @RequestParam String destination,
                                                  @RequestParam String datetime,
                                                  @RequestParam(required = false) Double priceMin,
                                                  @RequestParam(required = false) Double priceMax,
                                                  @RequestParam(required = false) String vehicleType,
                                                  @RequestParam(required = false) Double ratingMin) {
        LocalDateTime dt = LocalDateTime.parse(datetime);
        return ResponseEntity.ok(rideService.searchRidesWithFilters(source, destination, dt, priceMin, priceMax, vehicleType, ratingMin));
    }

    // ✅ Get rides by driver
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<Ride>> getRidesByDriver(@PathVariable Long driverId) {
        return ResponseEntity.ok(rideService.getRidesByDriver(driverId));
    }

    // ✅ Get available rides
    @GetMapping("/available")
    public ResponseEntity<List<Ride>> getAvailableRides() {
        return ResponseEntity.ok(rideService.getAvailableRides());
    }

    // ✅ Route matching: direct and partial
    @GetMapping("/match")
    public ResponseEntity<List<RouteMatchResult>> matchRides(@RequestParam String source,
                                                            @RequestParam String destination,
                                                            @RequestParam String earliestDeparture,
                                                            @RequestParam(required = false) Double maxDetourKm,
                                                            @RequestParam(required = false) Double maxDetourPercent) {
        LocalDateTime dt = LocalDateTime.parse(earliestDeparture);
        List<RouteMatchResult> matches = rideService.matchRides(source, destination, dt, maxDetourKm, maxDetourPercent);
        return ResponseEntity.ok(matches);
    }

    // ✅ Get completed rides
    @GetMapping("/completed")
    public ResponseEntity<List<Ride>> getCompletedRides() {
        return ResponseEntity.ok(rideService.getCompletedRides());
    }

    // ✅ Get rides by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Ride>> getRidesByStatus(@PathVariable String status) {
        return ResponseEntity.ok(rideService.getRidesByStatus(status));
    }

    // ✅ Manually trigger ride completion (admin/testing endpoint)
    @PostMapping("/complete-expired")
    public ResponseEntity<?> completeExpiredRides() {
        try {
            int completedCount = rideService.manuallyCompleteRides();
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", true);
            response.put("message", "Completed " + completedCount + " expired rides");
            response.put("completedCount", completedCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Failed to complete rides");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // ✅ Get single ride - MUST BE LAST to avoid catching specific paths
    @GetMapping("/{id}")
    public ResponseEntity<Ride> getRideById(@PathVariable Long id) {
        return rideService.getRideById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
