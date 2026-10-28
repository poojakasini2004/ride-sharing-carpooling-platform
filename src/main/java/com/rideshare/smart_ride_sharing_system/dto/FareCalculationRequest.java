package com.rideshare.smart_ride_sharing_system.dto;

public class FareCalculationRequest {
    private String source;
    private String destination;
    private String vehicleType;
    private int numberOfPassengers;

    public FareCalculationRequest() {}

    public FareCalculationRequest(String source, String destination, String vehicleType, int numberOfPassengers) {
        this.source = source;
        this.destination = destination;
        this.vehicleType = vehicleType;
        this.numberOfPassengers = numberOfPassengers;
    }

    // Getters and Setters
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public int getNumberOfPassengers() { return numberOfPassengers; }
    public void setNumberOfPassengers(int numberOfPassengers) { this.numberOfPassengers = numberOfPassengers; }
}
