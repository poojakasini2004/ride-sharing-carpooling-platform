package com.rideshare.smart_ride_sharing_system.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Service to convert addresses to coordinates using Nominatim (OpenStreetMap)
 * Free geocoding service - no API key required
 */
@Service
public class GeocodingService {

    private static final Logger logger = LoggerFactory.getLogger(GeocodingService.class);
    private static final String NOMINATIM_URL = "https://nominatim.openstreetmap.org";
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public GeocodingService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .defaultHeader("User-Agent", "SmartRideSharingSystem/1.0")
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Get coordinates (latitude, longitude) for a given address
     * @param address The address to geocode
     * @return Map with "lat" and "lon" keys, or null if geocoding fails
     */
    public Map<String, Double> getCoordinates(String address) {
        try {
            // Check if the input is already coordinates (format: "lat,lon")
            if (address.matches("^-?\\d+\\.\\d+,-?\\d+\\.\\d+$")) {
                String[] parts = address.split(",");
                Map<String, Double> coords = new HashMap<>();
                coords.put("lat", Double.parseDouble(parts[0].trim()));
                coords.put("lon", Double.parseDouble(parts[1].trim()));
                return coords;
            }

            String encodedAddress = URLEncoder.encode(address, StandardCharsets.UTF_8);
            String url = String.format("%s/search?q=%s&format=json&limit=1", NOMINATIM_URL, encodedAddress);

            logger.info("Geocoding address: {}", address);

            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode results = objectMapper.readTree(response);
            
            if (results.isArray() && results.size() > 0) {
                JsonNode location = results.get(0);
                Map<String, Double> coords = new HashMap<>();
                coords.put("lat", location.path("lat").asDouble());
                coords.put("lon", location.path("lon").asDouble());
                
                logger.info("Geocoded {} to lat: {}, lon: {}", address, coords.get("lat"), coords.get("lon"));
                return coords;
            }

            logger.warn("No results found for address: {}", address);
            return null;

        } catch (Exception e) {
            logger.error("Error geocoding address {}: {}", address, e.getMessage());
            return null;
        }
    }

    /**
     * Get address from coordinates (reverse geocoding)
     */
    public String getAddress(double lat, double lon) {
        try {
            String url = String.format("%s/reverse?lat=%f&lon=%f&format=json", NOMINATIM_URL, lat, lon);

            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode result = objectMapper.readTree(response);
            return result.path("display_name").asText();

        } catch (Exception e) {
            logger.error("Error reverse geocoding: {}", e.getMessage());
            return null;
        }
    }
}
