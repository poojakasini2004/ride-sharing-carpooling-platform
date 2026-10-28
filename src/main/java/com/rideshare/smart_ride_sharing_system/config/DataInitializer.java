package com.rideshare.smart_ride_sharing_system.config;

import com.rideshare.smart_ride_sharing_system.model.Ride;
import com.rideshare.smart_ride_sharing_system.model.User;
import com.rideshare.smart_ride_sharing_system.repository.RideRepository;
import com.rideshare.smart_ride_sharing_system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Initializing sample data...");

        // Create sample users only once (check if already exists)
        if (userRepository.findByEmail("passenger@test.com").isEmpty()) {
            // Create a passenger
            User passenger = new User(
                "John Passenger",
                "passenger@test.com",
                "1234567890",
                passwordEncoder.encode("password123"),
                "PASSENGER",
                true
            );
            userRepository.save(passenger);
            System.out.println("Created sample passenger: passenger@test.com / password123");

            // Create drivers
            User driver1 = new User(
                "Alice Driver",
                "driver1@test.com",
                "9876543210",
                passwordEncoder.encode("password123"),
                "DRIVER",
                true
            );
            driver1.setVehicleType("Sedan");
            driver1.setVehicleModel("Honda City");
            driver1.setRating(4.5);
            userRepository.save(driver1);
            System.out.println("Created sample driver: driver1@test.com / password123");

            User driver2 = new User(
                "Bob Driver",
                "driver2@test.com",
                "9876543211",
                passwordEncoder.encode("password123"),
                "DRIVER",
                true
            );
            driver2.setVehicleType("SUV");
            driver2.setVehicleModel("Toyota Fortuner");
            driver2.setRating(4.8);
            userRepository.save(driver2);
            System.out.println("Created sample driver: driver2@test.com / password123");

            // Create sample rides
            Ride ride1 = new Ride();
            ride1.setSource("Hyderabad");
            ride1.setDestination("Bangalore");
            ride1.setDatetime(LocalDateTime.now().plusDays(1));
            ride1.setAvailableSeats(3);
            ride1.setPrice(800.0);
            ride1.setDriver(driver1);
            ride1.setVehicleType(driver1.getVehicleType());
            rideRepository.save(ride1);

            Ride ride2 = new Ride();
            ride2.setSource("Mumbai");
            ride2.setDestination("Pune");
            ride2.setDatetime(LocalDateTime.now().plusHours(5));
            ride2.setAvailableSeats(2);
            ride2.setPrice(500.0);
            ride2.setDriver(driver2);
            ride2.setVehicleType(driver2.getVehicleType());
            rideRepository.save(ride2);

            Ride ride3 = new Ride();
            ride3.setSource("Delhi");
            ride3.setDestination("Jaipur");
            ride3.setDatetime(LocalDateTime.now().plusDays(2));
            ride3.setAvailableSeats(4);
            ride3.setPrice(600.0);
            ride3.setDriver(driver1);
            ride3.setVehicleType(driver1.getVehicleType());
            rideRepository.save(ride3);

            Ride ride4 = new Ride();
            ride4.setSource("Chennai");
            ride4.setDestination("Coimbatore");
            ride4.setDatetime(LocalDateTime.now().plusHours(8));
            ride4.setAvailableSeats(3);
            ride4.setPrice(450.0);
            ride4.setDriver(driver2);
            ride4.setVehicleType(driver2.getVehicleType());
            rideRepository.save(ride4);

            System.out.println("Created 4 sample rides");
        }

        System.out.println("Data initialization complete!");
        System.out.println("Total users: " + userRepository.count());
        System.out.println("Total rides: " + rideRepository.count());
    }
}
