package com.rideshare.smart_ride_sharing_system.service;

import com.rideshare.smart_ride_sharing_system.dto.DistanceResponse;
import com.rideshare.smart_ride_sharing_system.dto.RouteMatchResult;
import com.rideshare.smart_ride_sharing_system.dto.FareCalculationRequest;
import com.rideshare.smart_ride_sharing_system.dto.FareCalculationResponse;
import com.rideshare.smart_ride_sharing_system.model.Booking;
import com.rideshare.smart_ride_sharing_system.model.Ride;
import com.rideshare.smart_ride_sharing_system.model.User;
import com.rideshare.smart_ride_sharing_system.repository.BookingRepository;
import com.rideshare.smart_ride_sharing_system.repository.RideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class RideService {

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private FareCalculationService fareCalculationService;

    @Autowired
    private OSRMService osrmService;

    @Autowired
    private BookingRepository bookingRepository;

    public Ride createRide(Ride ride) {
        try {
            System.out.println("=== Creating Ride ===");
            System.out.println("Source: " + ride.getSource());
            System.out.println("Destination: " + ride.getDestination());
            System.out.println("DateTime: " + ride.getDatetime());
            System.out.println("Available Seats: " + ride.getAvailableSeats());
            System.out.println("Driver ID: " + ride.getDriverId());
            
            // Validate required fields
            if (ride.getSource() == null || ride.getSource().trim().isEmpty()) {
                throw new RuntimeException("Source location is required");
            }
            if (ride.getDestination() == null || ride.getDestination().trim().isEmpty()) {
                throw new RuntimeException("Destination location is required");
            }
            if (ride.getDatetime() == null) {
                throw new RuntimeException("Departure time is required");
            }
            if (ride.getAvailableSeats() <= 0) {
                throw new RuntimeException("Available seats must be greater than 0");
            }
            
            // Validate and set driver
            if (ride.getDriverId() != null) {
                Optional<User> driverOpt = userService.getUserById(ride.getDriverId());
                if (driverOpt.isPresent()) {
                    User driver = driverOpt.get();
                    ride.setDriver(driver);
                    ride.setVehicleType(driver.getVehicleType());
                    System.out.println("Driver found: " + driver.getName());
                    
                    // Calculate fare automatically if not provided
                    if (ride.getPrice() == 0 || ride.getDistanceKm() == null) {
                        try {
                            String vehicleType = driver.getVehicleType() != null ? driver.getVehicleType() : "SEDAN";
                            FareCalculationRequest fareRequest = new FareCalculationRequest(
                                ride.getSource(),
                                ride.getDestination(),
                                vehicleType,
                                ride.getAvailableSeats()
                            );
                            
                            FareCalculationResponse fareResponse = fareCalculationService.calculateFare(fareRequest);
                            
                            if (fareResponse.isSuccess()) {
                                ride.setDistanceKm(fareResponse.getDistanceInKm());
                                ride.setBaseFare(fareResponse.getBaseFare());
                                ride.setPerKmRate(fareResponse.getPerKmRate());
                                ride.setPrice(fareResponse.getTotalFare());
                                
                                // Also get duration
                                try {
                                    DistanceResponse distanceResponse = osrmService.calculateDistance(
                                        ride.getSource(), ride.getDestination()
                                    );
                                    if (distanceResponse.isSuccess()) {
                                        ride.setDurationMinutes(distanceResponse.getDurationInMinutes());
                                    }
                                } catch (Exception e) {
                                    System.err.println("⚠️ Could not calculate duration: " + e.getMessage());
                                }
                                
                                System.out.println("✅ Auto-calculated fare: ₹" + ride.getPrice() + 
                                                 " for " + ride.getDistanceKm() + " km");
                            } else {
                                System.err.println("⚠️ Fare calculation failed, using default price");
                                if (ride.getPrice() == 0) {
                                    ride.setPrice(100.0); // Default minimum fare
                                }
                            }
                        } catch (Exception e) {
                            System.err.println("⚠️ Could not auto-calculate fare: " + e.getMessage());
                            // Continue with manual price if auto-calculation fails
                            if (ride.getPrice() == 0) {
                                ride.setPrice(100.0); // Default minimum fare
                            }
                        }
                    }
                } else {
                    throw new RuntimeException("Driver not found with ID: " + ride.getDriverId());
                }
            } else if (ride.getDriver() == null) {
                throw new RuntimeException("Driver is required");
            }
            
            // Set default status if not set
            if (ride.getStatus() == null || ride.getStatus().isEmpty()) {
                ride.setStatus("ACTIVE");
            }
            
            Ride savedRide = rideRepository.save(ride);
            System.out.println("✅ Ride saved with ID: " + savedRide.getId());
            return savedRide;
            
        } catch (RuntimeException e) {
            System.err.println("❌ Ride creation failed: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("❌ Unexpected error during ride creation: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create ride: " + e.getMessage(), e);
        }
    }

    public List<Ride> getAllRides() {
        return rideRepository.findAll();
    }

    public Optional<Ride> getRideById(Long id) {
        return rideRepository.findById(id);
    }

    public List<Ride> searchRides(String source, String destination, LocalDateTime datetime) {
        return rideRepository.findBySourceAndDestinationAndDatetimeAfter(source, destination, datetime);
    }

    public List<Ride> searchRidesWithFilters(String source, String destination, LocalDateTime datetime,
                                             Double priceMin, Double priceMax, String vehicleType, Double ratingMin) {
        List<Ride> rides = rideRepository.searchRides(source, destination, datetime, priceMin, priceMax, vehicleType, ratingMin);
        for (Ride ride : rides) {
            if (ride.getDriver() != null) {
                ride.setVehicleType(ride.getDriver().getVehicleType());
            }
        }
        return rides;
    }

    public Ride saveRide(Ride ride) {
        return rideRepository.save(ride);
    }

    public List<Ride> getRidesByDriver(Long driverId) {
        return rideRepository.findByDriver_Id(driverId);
    }

    public List<Ride> getAvailableRides() {
        List<Ride> rides = rideRepository.findAvailableRides();
        System.out.println("Available rides found: " + rides.size());
        for (Ride ride : rides) {
            if (ride.getDriver() != null) {
                ride.setVehicleType(ride.getDriver().getVehicleType());
            }
        }
        return rides;
    }

    public List<Ride> getCompletedRides() {
        List<Ride> rides = rideRepository.findCompletedRides();
        for (Ride ride : rides) {
            if (ride.getDriver() != null) {
                ride.setVehicleType(ride.getDriver().getVehicleType());
            }
        }
        return rides;
    }

    public List<Ride> getRidesByStatus(String status) {
        List<Ride> rides = rideRepository.findByStatus(status);
        for (Ride ride : rides) {
            if (ride.getDriver() != null) {
                ride.setVehicleType(ride.getDriver().getVehicleType());
            }
        }
        return rides;
    }

    // Add other methods: update, delete

	/**
	 * Match rides for a passenger request using direct and partial (detour) logic.
	 * Heuristic: A partial match is valid if pickup and drop are near the driver's path
	 * and the detour added is within maxDetourKm or maxDetourPercent of the ride distance.
	 * OPTIMIZED: Uses caching and limits candidates for better performance
	 */
	public List<RouteMatchResult> matchRides(String passengerSource,
										   String passengerDestination,
										   LocalDateTime earliestDeparture,
										   Double maxDetourKm,
										   Double maxDetourPercent) {
		List<Ride> candidates = rideRepository.findCandidatesFrom(earliestDeparture);
		java.util.List<RouteMatchResult> results = new java.util.ArrayList<>();
		
		// Limit candidates for performance (process max 50 rides)
		int maxCandidates = Math.min(candidates.size(), 50);
		System.out.println("🔍 Processing " + maxCandidates + " ride candidates out of " + candidates.size());

		// Pre-calculate passenger route distance (only once)
		DistanceResponse passengerRoute = osrmService.calculateDistance(passengerSource, passengerDestination);
		if (!passengerRoute.isSuccess()) {
			System.out.println("⚠️ Failed to calculate passenger route distance");
			return results;
		}
		double passengerDistanceKm = passengerRoute.getDistanceInKm();

		for (int i = 0; i < maxCandidates; i++) {
			Ride ride = candidates.get(i);
			
			// Normalize driver vehicleType transient for response
			if (ride.getDriver() != null) {
				ride.setVehicleType(ride.getDriver().getVehicleType());
			}

			boolean isDirect = ride.getSource() != null && ride.getDestination() != null
					&& ride.getSource().equalsIgnoreCase(passengerSource)
					&& ride.getDestination().equalsIgnoreCase(passengerDestination);

			if (isDirect) {
				RouteMatchResult m = toMatchResult(ride, RouteMatchResult.MatchType.DIRECT, 0.0);
				results.add(m);
				continue;
			}

			// OPTIMIZED: Calculate detour with fewer API calls
			try {
				// Only calculate base ride distance
				DistanceResponse base = osrmService.calculateDistance(ride.getSource(), ride.getDestination());
				if (!base.isSuccess()) {
					continue;
				}
				
				double baseKm = base.getDistanceInKm();
				
				// Quick heuristic: If passenger distance is much larger than max detour, skip detailed calculation
				if (maxDetourKm != null && passengerDistanceKm > maxDetourKm * 3) {
					continue;
				}
				
				// Calculate detour segments
				DistanceResponse viaPickup = osrmService.calculateDistance(ride.getSource(), passengerSource);
				if (!viaPickup.isSuccess()) continue;
				
				DistanceResponse viaDropToDest = osrmService.calculateDistance(passengerDestination, ride.getDestination());
				if (!viaDropToDest.isSuccess()) continue;

				// Use pre-calculated passenger distance
				double newKm = viaPickup.getDistanceInKm() + passengerDistanceKm + viaDropToDest.getDistanceInKm();
				double detourKm = newKm - baseKm;

				boolean withinKm = maxDetourKm == null || detourKm <= maxDetourKm;
				boolean withinPct = maxDetourPercent == null || (baseKm > 0 && (detourKm / baseKm) * 100.0 <= maxDetourPercent);

				if (withinKm && withinPct) {
					RouteMatchResult m = toMatchResult(ride, RouteMatchResult.MatchType.PARTIAL, detourKm);
					if (baseKm > 0) {
						m.setRideDistanceKm(baseKm);
					}
					results.add(m);
					System.out.println("✅ Match found: Ride #" + ride.getId() + " with detour " + String.format("%.2f", detourKm) + " km");
				}
			} catch (Exception e) {
				System.err.println("⚠️ Error processing ride #" + ride.getId() + ": " + e.getMessage());
				continue;
			}
		}

		System.out.println("📊 Found " + results.size() + " matching rides");

		// Sort: direct first, then by smallest detour
		results.sort((a, b) -> {
			if (a.getMatchType() != b.getMatchType()) {
				return a.getMatchType() == RouteMatchResult.MatchType.DIRECT ? -1 : 1;
			}
			double da = a.getDetourKm() == null ? 0.0 : a.getDetourKm();
			double db = b.getDetourKm() == null ? 0.0 : b.getDetourKm();
			return Double.compare(da, db);
		});

		return results;
	}



	private RouteMatchResult toMatchResult(Ride ride, RouteMatchResult.MatchType type, Double detourKm) {
		RouteMatchResult m = new RouteMatchResult();
		m.setRideId(ride.getId());
		m.setDriverId(ride.getDriverId());
		m.setDriverName(ride.getDriver() != null ? ride.getDriver().getName() : null);
		m.setVehicleType(ride.getVehicleType());
		m.setSource(ride.getSource());
		m.setDestination(ride.getDestination());
		m.setDepartureTime(ride.getDatetime());
		m.setPrice(ride.getPrice());
		m.setRideDistanceKm(ride.getDistanceKm());
		m.setDetourKm(detourKm);
		m.setMatchType(type);
		return m;
	}

    /**
     * Auto-complete rides every 1 minute (more responsive)
     */
    @Scheduled(fixedRate = 60000, initialDelay = 30000) // 1 minute, start after 30 seconds
    @Transactional
    public void autoCompleteRides() {
        try {
            LocalDateTime now = LocalDateTime.now();
            
            // Use optimized query instead of filtering all rides
            List<Ride> ridesToComplete = rideRepository.findRidesToComplete(now);

            if (ridesToComplete.isEmpty()) {
                return; // Silent when nothing to do
            }
            
            System.out.println("\n=== Auto-Complete Rides Scheduler ===");
            System.out.println("🔍 Found " + ridesToComplete.size() + " rides to complete at " + now);

            int successCount = 0;
            int errorCount = 0;

            for (Ride ride : ridesToComplete) {
                try {
                    ride.setStatus("COMPLETED");
                    ride.setCompletedAt(now);

                    // Fix null values
                    if (ride.getDistanceKm() == null || ride.getBaseFare() == null) {
                        updateRideFareDetails(ride);
                    }

                    rideRepository.save(ride);
                    System.out.println("✅ Completed Ride #" + ride.getId() + ": " + ride.getSource() + " → " + ride.getDestination());

                    // Complete bookings
                    completeBookingsForRide(ride.getId());
                    successCount++;

                } catch (Exception e) {
                    System.err.println("❌ Error completing ride #" + ride.getId() + ": " + e.getMessage());
                    errorCount++;
                }
            }

            System.out.println("📊 Summary: " + successCount + " completed, " + errorCount + " errors");
            System.out.println("=== Scheduler Finished ===\n");
        } catch (Exception e) {
            System.err.println("❌ Scheduler error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Manually trigger ride completion (can be called via API)
     */
    @Transactional
    public int manuallyCompleteRides() {
        try {
            LocalDateTime now = LocalDateTime.now();
            List<Ride> ridesToComplete = rideRepository.findRidesToComplete(now);
            
            System.out.println("\n=== Manual Ride Completion Triggered ===");
            System.out.println("🔍 Found " + ridesToComplete.size() + " rides to complete");
            
            int completedCount = 0;
            for (Ride ride : ridesToComplete) {
                try {
                    ride.setStatus("COMPLETED");
                    ride.setCompletedAt(now);
                    
                    if (ride.getDistanceKm() == null || ride.getBaseFare() == null) {
                        updateRideFareDetails(ride);
                    }
                    
                    rideRepository.save(ride);
                    completeBookingsForRide(ride.getId());
                    completedCount++;
                    System.out.println("✅ Completed Ride #" + ride.getId());
                } catch (Exception e) {
                    System.err.println("❌ Error completing ride #" + ride.getId() + ": " + e.getMessage());
                }
            }
            
            System.out.println("📊 Total completed: " + completedCount);
            System.out.println("=== Manual Completion Finished ===\n");
            return completedCount;
        } catch (Exception e) {
            System.err.println("❌ Manual completion error: " + e.getMessage());
            e.printStackTrace();
            return 0;
        }
    }

    /**
     * Fix existing rides with null values on startup
     */
    @Scheduled(initialDelay = 30000, fixedDelay = Long.MAX_VALUE)
    @Transactional
    public void fixExistingRidesOnStartup() {
        try {
            System.out.println("\n=== Fixing Existing Rides ===");
            
            List<Ride> ridesWithNullValues = rideRepository.findAll().stream()
                .filter(ride -> ride.getDistanceKm() == null || ride.getBaseFare() == null)
                .toList();

            System.out.println("🔧 Found " + ridesWithNullValues.size() + " rides with null values");

            for (Ride ride : ridesWithNullValues) {
                try {
                    updateRideFareDetails(ride);
                    rideRepository.save(ride);
                    System.out.println("✅ Fixed Ride #" + ride.getId());
                } catch (Exception e) {
                    System.err.println("❌ Error fixing ride #" + ride.getId() + ": " + e.getMessage());
                }
            }

            System.out.println("=== Finished Fixing Rides ===\n");
        } catch (Exception e) {
            System.err.println("❌ Startup fix error: " + e.getMessage());
        }
    }

    private void updateRideFareDetails(Ride ride) {
        try {
            if (ride.getSource() == null || ride.getDestination() == null) {
                return;
            }

            FareCalculationRequest fareRequest = new FareCalculationRequest(
                ride.getSource(),
                ride.getDestination(),
                ride.getDriver() != null ? ride.getDriver().getVehicleType() : "SEDAN",
                ride.getAvailableSeats()
            );
            
            FareCalculationResponse fareResponse = fareCalculationService.calculateFare(fareRequest);
            
            if (fareResponse.isSuccess()) {
                ride.setDistanceKm(fareResponse.getDistanceInKm());
                ride.setBaseFare(fareResponse.getBaseFare());
                ride.setPerKmRate(fareResponse.getPerKmRate());
                
                if (ride.getPrice() == 0.0) {
                    ride.setPrice(fareResponse.getTotalFare());
                }

                DistanceResponse distanceResponse = osrmService.calculateDistance(
                    ride.getSource(), ride.getDestination()
                );
                if (distanceResponse.isSuccess()) {
                    ride.setDurationMinutes(distanceResponse.getDurationInMinutes());
                }

                System.out.println("  📊 Updated: " + fareResponse.getDistanceInKm() + " km, ₹" + fareResponse.getTotalFare());
            }
        } catch (Exception e) {
            System.err.println("⚠️ Error calculating fare: " + e.getMessage());
        }
    }

    private void completeBookingsForRide(Long rideId) {
        List<Booking> bookings = bookingRepository.findAll().stream()
            .filter(b -> b.getRideId() != null && b.getRideId().equals(rideId))
            .filter(b -> "BOOKED".equals(b.getStatus()))
            .toList();

        for (Booking booking : bookings) {
            try {
                booking.setStatus("COMPLETED");
                booking.setCompletedTime(LocalDateTime.now());
                bookingRepository.save(booking);
                System.out.println("  ✅ Completed Booking #" + booking.getId());
            } catch (Exception e) {
                System.err.println("  ❌ Error: " + e.getMessage());
            }
        }
    }
}
