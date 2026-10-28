package com.rideshare.smart_ride_sharing_system.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rideshare.smart_ride_sharing_system.dto.DistanceResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

/**
 * Service to interact with OSRM (Open Source Routing Machine) API
 * for calculating distances and routes between locations.
 */
@Service
public class OSRMService {

    private static final Logger logger = LoggerFactory.getLogger(OSRMService.class);
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final GeocodingService geocodingService;

    @Value("${osrm.api.url:http://router.project-osrm.org}")
    private String osrmApiUrl;

    public OSRMService(WebClient.Builder webClientBuilder, GeocodingService geocodingService) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = new ObjectMapper();
        this.geocodingService = geocodingService;
    }

    /**
     * Calculate distance between two locations using OSRM
     * @param source Source location (address or coordinates)
     * @param destination Destination location (address or coordinates)
     * @return DistanceResponse with distance in km and duration in minutes
     */
    public DistanceResponse calculateDistance(String source, String destination) {
        try {
            logger.info("Calculating distance from {} to {}", source, destination);

            // Get coordinates for source and destination
            Map<String, Double> sourceCoords = geocodingService.getCoordinates(source);
            Map<String, Double> destCoords = geocodingService.getCoordinates(destination);

            if (sourceCoords == null || destCoords == null) {
                String errorMsg = "Unable to find coordinates for the given locations. ";
                if (sourceCoords == null) {
                    errorMsg += "Source address '" + source + "' could not be found. ";
                }
                if (destCoords == null) {
                    errorMsg += "Destination address '" + destination + "' could not be found. ";
                }
                errorMsg += "Please check the spelling and try again.";
                logger.error("Failed to geocode locations: {}", errorMsg);
                return new DistanceResponse(errorMsg);
            }

            // Build OSRM API URL
            String url = String.format("%s/route/v1/driving/%f,%f;%f,%f?overview=false",
                    osrmApiUrl,
                    sourceCoords.get("lon"), sourceCoords.get("lat"),
                    destCoords.get("lon"), destCoords.get("lat"));

            logger.info("OSRM API URL: {}", url);

            // Call OSRM API
            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            // Parse response
            JsonNode root = objectMapper.readTree(response);
            
            if (!"Ok".equals(root.path("code").asText())) {
                logger.error("OSRM API error: {}", root.path("message").asText());
                return new DistanceResponse("Route calculation failed");
            }

            JsonNode route = root.path("routes").get(0);
            double distanceInMeters = route.path("distance").asDouble();
            double durationInSeconds = route.path("duration").asDouble();

            double distanceInKm = distanceInMeters / 1000.0;
            double durationInMinutes = durationInSeconds / 60.0;

            logger.info("Distance: {} km, Duration: {} minutes", distanceInKm, durationInMinutes);

            return new DistanceResponse(distanceInKm, durationInMinutes);

        } catch (Exception e) {
            logger.error("Error calculating distance: {}", e.getMessage(), e);
            return new DistanceResponse("Error calculating distance: " + e.getMessage());
        }
    }

    /**
     * Calculate distance using coordinates directly
     */
    public DistanceResponse calculateDistanceByCoordinates(double sourceLat, double sourceLon, 
                                                           double destLat, double destLon) {
        try {
            String url = String.format("%s/route/v1/driving/%f,%f;%f,%f?overview=false",
                    osrmApiUrl, sourceLon, sourceLat, destLon, destLat);

            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(response);
            
            if (!"Ok".equals(root.path("code").asText())) {
                return new DistanceResponse("Route calculation failed");
            }

            JsonNode route = root.path("routes").get(0);
            double distanceInKm = route.path("distance").asDouble() / 1000.0;
            double durationInMinutes = route.path("duration").asDouble() / 60.0;

            return new DistanceResponse(distanceInKm, durationInMinutes);

        } catch (Exception e) {
            logger.error("Error calculating distance by coordinates: {}", e.getMessage());
            return new DistanceResponse("Error calculating distance: " + e.getMessage());
        }
    }
}
