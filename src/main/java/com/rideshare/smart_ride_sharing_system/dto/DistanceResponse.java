package com.rideshare.smart_ride_sharing_system.dto;

public class DistanceResponse {
    private double distanceInKm;
    private double durationInMinutes;
    private boolean success;
    private String errorMessage;

    public DistanceResponse() {}

    public DistanceResponse(double distanceInKm, double durationInMinutes) {
        this.distanceInKm = distanceInKm;
        this.durationInMinutes = durationInMinutes;
        this.success = true;
    }

    public DistanceResponse(String errorMessage) {
        this.errorMessage = errorMessage;
        this.success = false;
    }

    // Getters and Setters
    public double getDistanceInKm() { return distanceInKm; }
    public void setDistanceInKm(double distanceInKm) { this.distanceInKm = distanceInKm; }

    public double getDurationInMinutes() { return durationInMinutes; }
    public void setDurationInMinutes(double durationInMinutes) { this.durationInMinutes = durationInMinutes; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}
