package com.rideshare.smart_ride_sharing_system.service;

import com.rideshare.smart_ride_sharing_system.model.Booking;
import com.rideshare.smart_ride_sharing_system.model.Payment;
import com.rideshare.smart_ride_sharing_system.model.User;
import com.rideshare.smart_ride_sharing_system.model.Ride;
import com.rideshare.smart_ride_sharing_system.repository.BookingRepository;
import com.rideshare.smart_ride_sharing_system.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private RideService rideService;

    @Autowired
    private RealtimeNotificationService notificationService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PaymentRepository paymentRepository;

    public Booking createBooking(Booking booking) {
        try {
            // Validate and set passenger
            if (booking.getPassengerId() != null) {
                Optional<User> passengerOpt = userService.getUserById(booking.getPassengerId());
                if (passengerOpt.isPresent()) {
                    User passenger = passengerOpt.get();
                    booking.setPassenger(passenger);
                    if (booking.getPassengerName() == null || booking.getPassengerName().isEmpty()) {
                        booking.setPassengerName(passenger.getName());
                    }
                    if (booking.getPassengerEmail() == null || booking.getPassengerEmail().isEmpty()) {
                        booking.setPassengerEmail(passenger.getEmail());
                    }
                    if (booking.getPassengerPhone() == null || booking.getPassengerPhone().isEmpty()) {
                        booking.setPassengerPhone(passenger.getPhone());
                    }
                } else {
                    throw new RuntimeException("Passenger not found with ID: " + booking.getPassengerId());
                }
            } else {
                throw new RuntimeException("Passenger ID is required");
            }
            
            // Validate and set ride
            if (booking.getRideId() != null) {
                Optional<Ride> rideOpt = rideService.getRideById(booking.getRideId());
                if (rideOpt.isPresent()) {
                    Ride ride = rideOpt.get();
                    
                    // Validate ride has driver
                    if (ride.getDriver() == null) {
                        throw new RuntimeException("Ride does not have a driver assigned");
                    }
                    
                    // Validate available seats
                    if (ride.getAvailableSeats() < booking.getSeatsBooked()) {
                        throw new RuntimeException("Not enough seats available. Requested: " + 
                            booking.getSeatsBooked() + ", Available: " + ride.getAvailableSeats());
                    }
                    
                    booking.setRide(ride);
                } else {
                    throw new RuntimeException("Ride not found with ID: " + booking.getRideId());
                }
            } else {
                throw new RuntimeException("Ride ID is required");
            }
            
            // Set booking metadata
            booking.setBookingTime(LocalDateTime.now());
            booking.setStatus("BOOKED");
            
            // Calculate total price based on ride price and seats booked
            Ride ride = booking.getRide();
            double totalPrice = ride.getPrice() * booking.getSeatsBooked();
            booking.setTotalPrice(totalPrice);
            System.out.println("💰 Total price calculated: ₹" + totalPrice + " (₹" + ride.getPrice() + " x " + booking.getSeatsBooked() + " seats)");
            
            // Save booking
            Booking savedBooking = bookingRepository.save(booking);
            System.out.println("✅ Booking saved with ID: " + savedBooking.getId());

            // Reduce available seats in the ride
            ride.setAvailableSeats(ride.getAvailableSeats() - booking.getSeatsBooked());
            rideService.saveRide(ride);
            System.out.println("✅ Updated ride seats. New available seats: " + ride.getAvailableSeats());

            // Send real-time notification to driver (non-critical, catch errors)
            try {
                if (ride.getDriver() != null && ride.getDriver().getId() != null) {
                    notificationService.notifyBookingCreated(
                        ride.getDriver().getId(),
                        savedBooking.getId(),
                        booking.getPassengerName()
                    );
                    System.out.println("✅ Driver notification sent");
                }
            } catch (Exception e) {
                System.err.println("⚠️ Failed to send driver notification: " + e.getMessage());
            }

            // Send confirmation notification to passenger (non-critical, catch errors)
            try {
                if (booking.getPassengerId() != null && ride.getDriver() != null) {
                    notificationService.notifyBookingConfirmed(
                        booking.getPassengerId(),
                        savedBooking.getId(),
                        ride.getDriver().getName()
                    );
                    System.out.println("✅ Passenger notification sent");
                }
            } catch (Exception e) {
                System.err.println("⚠️ Failed to send passenger notification: " + e.getMessage());
            }

            // Send booking confirmation email to passenger (non-critical, catch errors)
            try {
                if (booking.getPassengerEmail() != null && ride.getDriver() != null) {
                    emailService.sendBookingConfirmationEmail(
                        booking.getPassengerEmail(),
                        booking.getPassengerName(),
                        ride.getDriver().getName() != null ? ride.getDriver().getName() : "Driver",
                        ride.getDriver().getPhone() != null ? ride.getDriver().getPhone() : "N/A",
                        ride.getDriver().getVehicleType() != null ? ride.getDriver().getVehicleType() : "Car",
                        ride.getDriver().getVehicleModel() != null ? ride.getDriver().getVehicleModel() : "Standard",
                        ride.getSource(),
                        ride.getDestination(),
                        ride.getDatetime().toString(),
                        ride.getPrice(),
                        savedBooking.getId()
                    );
                    System.out.println("✅ Confirmation email sent");
                }
            } catch (Exception e) {
                System.err.println("⚠️ Failed to send booking confirmation email: " + e.getMessage());
            }

            // Create initial payment record (non-critical, catch errors)
            try {
                if (booking.getPassenger() != null && ride.getDriver() != null) {
                    Payment payment = new Payment();
                    payment.setBooking(savedBooking);
                    payment.setPassenger(booking.getPassenger());
                    payment.setDriver(ride.getDriver());
                    payment.setAmount(ride.getPrice());
                    payment.setPaymentMethod("PENDING");
                    payment.setPaymentStatus("PENDING");
                    payment.setCurrency("INR");
                    payment.setDescription("Payment for ride from " + ride.getSource() + " to " + ride.getDestination());
                    paymentRepository.save(payment);
                    System.out.println("✅ Payment record created for booking #" + savedBooking.getId());
                }
            } catch (Exception e) {
                System.err.println("⚠️ Failed to create payment record: " + e.getMessage());
            }

            return savedBooking;
            
        } catch (RuntimeException e) {
            // Re-throw business logic exceptions
            System.err.println("❌ Booking creation failed: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            // Catch any unexpected exceptions
            System.err.println("❌ Unexpected error during booking creation: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create booking: " + e.getMessage(), e);
        }
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }

    public List<Booking> getBookingsByPassenger(Long passengerId) {
        return bookingRepository.findByPassenger_Id(passengerId);
    }

    public List<Booking> getBookingsByDriver(Long driverId) {
        return bookingRepository.findByRide_Driver_Id(driverId);
    }

    public Booking cancelBooking(Long id) {
        Optional<Booking> bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isPresent()) {
            Booking booking = bookingOpt.get();
            booking.setStatus("CANCELLED");
            // Restore seats
            Ride ride = booking.getRide();
            ride.setAvailableSeats(ride.getAvailableSeats() + booking.getSeatsBooked());
            rideService.saveRide(ride);
            
            Booking cancelledBooking = bookingRepository.save(booking);

            // Send real-time notification to driver
			notificationService.notifyBookingCancelled(
				ride.getDriver().getId(),
				booking.getId(),
				booking.getPassengerName()
			);

            // Send confirmation notification to passenger
			notificationService.notifyBookingCancelled(
				booking.getPassengerId(),
				booking.getId(),
				"You"
			);

            // Send cancellation email to passenger
            try {
                emailService.sendBookingCancellationEmail(
                    booking.getPassengerEmail(),
                    booking.getPassengerName(),
                    ride.getSource(),
                    ride.getDestination(),
                    ride.getDatetime().toString(),
                    booking.getId(),
                    "You"
                );
            } catch (Exception e) {
                System.err.println("Failed to send cancellation email: " + e.getMessage());
            }

            return cancelledBooking;
        }
        throw new RuntimeException("Booking not found");
    }

	/**
	 * Driver-initiated cancellation. Sends appropriate messages to both parties.
	 */
	public Booking cancelBookingByDriver(Long id) {
		Optional<Booking> bookingOpt = bookingRepository.findById(id);
		if (bookingOpt.isPresent()) {
			Booking booking = bookingOpt.get();
			booking.setStatus("CANCELLED");
			Ride ride = booking.getRide();
			ride.setAvailableSeats(ride.getAvailableSeats() + booking.getSeatsBooked());
			rideService.saveRide(ride);
			Booking cancelledBooking = bookingRepository.save(booking);

			// Notify passenger that driver cancelled
			notificationService.notifyBookingCancelled(
				booking.getPassengerId(),
				booking.getId(),
				ride.getDriver().getName()
			);
			// Notify driver confirmation of cancellation
			notificationService.notifyBookingCancelled(
				ride.getDriver().getId(),
				booking.getId(),
				"You"
			);

			// Send cancellation email to passenger
			try {
				emailService.sendBookingCancellationEmail(
					booking.getPassengerEmail(),
					booking.getPassengerName(),
					ride.getSource(),
					ride.getDestination(),
					ride.getDatetime().toString(),
					booking.getId(),
					ride.getDriver().getName()
				);
			} catch (Exception e) {
				System.err.println("Failed to send cancellation email: " + e.getMessage());
			}

			return cancelledBooking;
		}
		throw new RuntimeException("Booking not found");
	}

	/**
	 * Reschedule booking time (notification-only). Does not persist schedule changes here.
	 */
	public Booking rescheduleBooking(Long id, String newTimeIso, boolean initiatedByDriver) {
		Optional<Booking> bookingOpt = bookingRepository.findById(id);
		if (bookingOpt.isPresent()) {
			Booking booking = bookingOpt.get();
			Ride ride = booking.getRide();
			String driverName = ride.getDriver().getName();
			String passengerName = booking.getPassengerName();

			// Notify both parties with initiator context
			if (initiatedByDriver) {
				notificationService.notifyBookingRescheduled(
					booking.getPassengerId(),
					booking.getId(),
					newTimeIso,
					driverName
				);
				notificationService.notifyBookingRescheduled(
					ride.getDriver().getId(),
					booking.getId(),
					newTimeIso,
					"You"
				);
			} else {
				notificationService.notifyBookingRescheduled(
					ride.getDriver().getId(),
					booking.getId(),
					newTimeIso,
					passengerName
				);
				notificationService.notifyBookingRescheduled(
					booking.getPassengerId(),
					booking.getId(),
					newTimeIso,
					"You"
				);
			}

			return booking;
		}
		throw new RuntimeException("Booking not found");
	}

    public Booking completeBooking(Long id) {
        Optional<Booking> bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isPresent()) {
            Booking booking = bookingOpt.get();
            booking.setStatus("COMPLETED");
            booking.setCompletedTime(LocalDateTime.now());
            Booking completedBooking = bookingRepository.save(booking);

            // Mark ride as completed
            Ride ride = booking.getRide();
            ride.setStatus("COMPLETED");
            ride.setCompletedAt(LocalDateTime.now());
            rideService.saveRide(ride);

            // Send real-time notification to both driver and passenger
            Double fare = ride.getPrice();
            notificationService.notifyRideCompleted(
                ride.getDriver().getId(),
                booking.getId(),
                fare
            );
            notificationService.notifyRideCompleted(
                booking.getPassengerId(),
                booking.getId(),
                fare
            );

            // Send review prompt notifications
            notificationService.sendReviewPrompt(
                booking.getPassengerId(),
                booking.getId(),
                "Rate your driver " + ride.getDriver().getName()
            );
            notificationService.sendReviewPrompt(
                ride.getDriver().getId(),
                booking.getId(),
                "Rate your passenger " + booking.getPassengerName()
            );

            return completedBooking;
        }
        throw new RuntimeException("Booking not found");
    }

    public Booking addFeedback(Long id, Integer rating, String feedback) {
        Optional<Booking> bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isPresent()) {
            Booking booking = bookingOpt.get();
            booking.setRating(rating);
            booking.setFeedback(feedback);
            return bookingRepository.save(booking);
        }
        throw new RuntimeException("Booking not found");
    }

    public List<Booking> getCompletedBookings() {
        return bookingRepository.findCompletedBookings();
    }

    public List<Booking> getBookingsByStatus(String status) {
        return bookingRepository.findByStatus(status);
    }
}
