package com.rideshare.smart_ride_sharing_system.dto;

import java.time.LocalDateTime;

public class RouteMatchResult {

	public enum MatchType { DIRECT, PARTIAL }

	private Long rideId;
	private Long driverId;
	private String driverName;
	private String vehicleType;
	private String source;
	private String destination;
	private LocalDateTime departureTime;
	private double price;
	private Double rideDistanceKm;
	private Double detourKm; // null or 0 for direct
	private MatchType matchType;

	public RouteMatchResult() {}

	public Long getRideId() { return rideId; }
	public void setRideId(Long rideId) { this.rideId = rideId; }

	public Long getDriverId() { return driverId; }
	public void setDriverId(Long driverId) { this.driverId = driverId; }

	public String getDriverName() { return driverName; }
	public void setDriverName(String driverName) { this.driverName = driverName; }

	public String getVehicleType() { return vehicleType; }
	public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

	public String getSource() { return source; }
	public void setSource(String source) { this.source = source; }

	public String getDestination() { return destination; }
	public void setDestination(String destination) { this.destination = destination; }

	public LocalDateTime getDepartureTime() { return departureTime; }
	public void setDepartureTime(LocalDateTime departureTime) { this.departureTime = departureTime; }

	public double getPrice() { return price; }
	public void setPrice(double price) { this.price = price; }

	public Double getRideDistanceKm() { return rideDistanceKm; }
	public void setRideDistanceKm(Double rideDistanceKm) { this.rideDistanceKm = rideDistanceKm; }

	public Double getDetourKm() { return detourKm; }
	public void setDetourKm(Double detourKm) { this.detourKm = detourKm; }

	public MatchType getMatchType() { return matchType; }
	public void setMatchType(MatchType matchType) { this.matchType = matchType; }
}


