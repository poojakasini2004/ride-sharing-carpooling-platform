package com.rideshare.smart_ride_sharing_system.controller;

import com.rideshare.smart_ride_sharing_system.dto.DistanceResponse;
import com.rideshare.smart_ride_sharing_system.dto.FareCalculationRequest;
import com.rideshare.smart_ride_sharing_system.dto.FareCalculationResponse;
import com.rideshare.smart_ride_sharing_system.service.FareCalculationService;
import com.rideshare.smart_ride_sharing_system.service.OSRMService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for fare calculation and distance estimation
 */
@RestController
@RequestMapping("/api/fare")
@CrossOrigin(origins = "*")
public class FareController {

    @Autowired
    private FareCalculationService fareCalculationService;

    @Autowired
    private OSRMService osrmService;

    /**
     * Calculate fare for a ride
     * POST /api/fare/calculate
     */
    @PostMapping("/calculate")
    public ResponseEntity<FareCalculationResponse> calculateFare(@RequestBody FareCalculationRequest request) {
        FareCalculationResponse response = fareCalculationService.calculateFare(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get distance between two locations
     * GET /api/fare/distance?source=...&destination=...
     */
    @GetMapping("/distance")
    public ResponseEntity<DistanceResponse> getDistance(
            @RequestParam String source,
            @RequestParam String destination) {
        
        DistanceResponse response = osrmService.calculateDistance(source, destination);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get all fare rates for different vehicle types
     * GET /api/fare/rates
     */
    @GetMapping("/rates")
    public ResponseEntity<Map<String, Map<String, Double>>> getFareRates() {
        return ResponseEntity.ok(fareCalculationService.getAllFareRates());
    }

    /**
     * Quick fare estimate
     * GET /api/fare/estimate?source=...&destination=...&vehicleType=...&passengers=...
     */
    @GetMapping("/estimate")
    public ResponseEntity<FareCalculationResponse> estimateFare(
            @RequestParam String source,
            @RequestParam String destination,
            @RequestParam(defaultValue = "SEDAN") String vehicleType,
            @RequestParam(defaultValue = "1") int passengers) {
        
        FareCalculationRequest request = new FareCalculationRequest(
                source, destination, vehicleType, passengers
        );
        
        FareCalculationResponse response = fareCalculationService.calculateFare(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
}
