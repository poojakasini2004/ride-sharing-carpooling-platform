package com.rideshare.smart_ride_sharing_system.service;

import com.rideshare.smart_ride_sharing_system.dto.DistanceResponse;
import com.rideshare.smart_ride_sharing_system.dto.FareCalculationRequest;
import com.rideshare.smart_ride_sharing_system.dto.FareCalculationResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * Service for calculating dynamic fares based on distance and vehicle type
 * Formula: Fare = Base Fare + (Rate per Km × Distance)
 * Split cost if multiple passengers (proportional to distance covered)
 */
@Service
public class FareCalculationService {

    private static final Logger logger = LoggerFactory.getLogger(FareCalculationService.class);

    @Autowired
    private OSRMService osrmService;

    // Configurable fare rates (can be moved to database or config file)
    @Value("${fare.base.sedan:50.0}")
    private double baseFareSedan;

    @Value("${fare.base.suv:75.0}")
    private double baseFareSUV;

    @Value("${fare.base.hatchback:40.0}")
    private double baseFareHatchback;

    @Value("${fare.rate.sedan:12.0}")
    private double perKmRateSedan;

    @Value("${fare.rate.suv:15.0}")
    private double perKmRateSUV;

    @Value("${fare.rate.hatchback:10.0}")
    private double perKmRateHatchback;

    /**
     * Calculate fare for a ride
     */
    public FareCalculationResponse calculateFare(FareCalculationRequest request) {
        try {
            logger.info("Calculating fare for {} to {} with vehicle type {}", 
                    request.getSource(), request.getDestination(), request.getVehicleType());

            // Get distance from OSRM
            DistanceResponse distanceResponse = osrmService.calculateDistance(
                    request.getSource(), 
                    request.getDestination()
            );

            if (!distanceResponse.isSuccess()) {
                return new FareCalculationResponse(distanceResponse.getErrorMessage());
            }

            double distance = distanceResponse.getDistanceInKm();
            
            // Get fare rates based on vehicle type
            Map<String, Double> rates = getFareRates(request.getVehicleType());
            double baseFare = rates.get("baseFare");
            double perKmRate = rates.get("perKmRate");

            // Calculate total fare
            double totalFare = baseFare + (perKmRate * distance);

            // Calculate fare per passenger if multiple passengers
            double farePerPassenger = totalFare;
            if (request.getNumberOfPassengers() > 1) {
                farePerPassenger = totalFare / request.getNumberOfPassengers();
            }

            // Round to 2 decimal places
            totalFare = Math.round(totalFare * 100.0) / 100.0;
            farePerPassenger = Math.round(farePerPassenger * 100.0) / 100.0;

            logger.info("Calculated fare - Distance: {} km, Total: ₹{}, Per Passenger: ₹{}", 
                    distance, totalFare, farePerPassenger);

            return new FareCalculationResponse(
                    distance,
                    baseFare,
                    perKmRate,
                    totalFare,
                    farePerPassenger,
                    request.getVehicleType()
            );

        } catch (Exception e) {
            logger.error("Error calculating fare: {}", e.getMessage(), e);
            return new FareCalculationResponse("Error calculating fare: " + e.getMessage());
        }
    }

    /**
     * Calculate fare using distance directly (when distance is already known)
     */
    public double calculateFareByDistance(double distanceInKm, String vehicleType, int numberOfPassengers) {
        Map<String, Double> rates = getFareRates(vehicleType);
        double baseFare = rates.get("baseFare");
        double perKmRate = rates.get("perKmRate");

        double totalFare = baseFare + (perKmRate * distanceInKm);
        
        if (numberOfPassengers > 1) {
            totalFare = totalFare / numberOfPassengers;
        }

        return Math.round(totalFare * 100.0) / 100.0;
    }

    /**
     * Get fare rates based on vehicle type
     */
    private Map<String, Double> getFareRates(String vehicleType) {
        Map<String, Double> rates = new HashMap<>();
        
        if (vehicleType == null) {
            vehicleType = "SEDAN"; // Default
        }

        switch (vehicleType.toUpperCase()) {
            case "SUV":
                rates.put("baseFare", baseFareSUV);
                rates.put("perKmRate", perKmRateSUV);
                break;
            case "HATCHBACK":
                rates.put("baseFare", baseFareHatchback);
                rates.put("perKmRate", perKmRateHatchback);
                break;
            case "SEDAN":
            default:
                rates.put("baseFare", baseFareSedan);
                rates.put("perKmRate", perKmRateSedan);
                break;
        }

        return rates;
    }

    /**
     * Get all fare rates for display
     */
    public Map<String, Map<String, Double>> getAllFareRates() {
        Map<String, Map<String, Double>> allRates = new HashMap<>();
        
        Map<String, Double> sedanRates = new HashMap<>();
        sedanRates.put("baseFare", baseFareSedan);
        sedanRates.put("perKmRate", perKmRateSedan);
        allRates.put("SEDAN", sedanRates);

        Map<String, Double> suvRates = new HashMap<>();
        suvRates.put("baseFare", baseFareSUV);
        suvRates.put("perKmRate", perKmRateSUV);
        allRates.put("SUV", suvRates);

        Map<String, Double> hatchbackRates = new HashMap<>();
        hatchbackRates.put("baseFare", baseFareHatchback);
        hatchbackRates.put("perKmRate", perKmRateHatchback);
        allRates.put("HATCHBACK", hatchbackRates);

        return allRates;
    }
}
