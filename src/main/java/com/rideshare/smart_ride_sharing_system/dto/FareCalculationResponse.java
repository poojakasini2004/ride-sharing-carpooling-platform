package com.rideshare.smart_ride_sharing_system.dto;

public class FareCalculationResponse {
    private double distanceInKm;
    private double baseFare;
    private double perKmRate;
    private double totalFare;
    private double farePerPassenger;
    private String vehicleType;
    private boolean success;
    private String errorMessage;

    public FareCalculationResponse() {}

    public FareCalculationResponse(double distanceInKm, double baseFare, double perKmRate, 
                                   double totalFare, double farePerPassenger, String vehicleType) {
        this.distanceInKm = distanceInKm;
        this.baseFare = baseFare;
        this.perKmRate = perKmRate;
        this.totalFare = totalFare;
        this.farePerPassenger = farePerPassenger;
        this.vehicleType = vehicleType;
        this.success = true;
    }

    public FareCalculationResponse(String errorMessage) {
        this.errorMessage = errorMessage;
        this.success = false;
    }

    // Getters and Setters
    public double getDistanceInKm() { return distanceInKm; }
    public void setDistanceInKm(double distanceInKm) { this.distanceInKm = distanceInKm; }

    public double getBaseFare() { return baseFare; }
    public void setBaseFare(double baseFare) { this.baseFare = baseFare; }

    public double getPerKmRate() { return perKmRate; }
    public void setPerKmRate(double perKmRate) { this.perKmRate = perKmRate; }

    public double getTotalFare() { return totalFare; }
    public void setTotalFare(double totalFare) { this.totalFare = totalFare; }

    public double getFarePerPassenger() { return farePerPassenger; }
    public void setFarePerPassenger(double farePerPassenger) { this.farePerPassenger = farePerPassenger; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}
