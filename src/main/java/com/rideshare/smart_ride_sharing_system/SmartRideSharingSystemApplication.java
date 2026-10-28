package com.rideshare.smart_ride_sharing_system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@ComponentScan(basePackages = "com.rideshare.smart_ride_sharing_system")
public class SmartRideSharingSystemApplication {

	public static void main(String[] args) {
		try {
			System.out.println("\n\n");
			System.out.println("========================================");
			System.out.println("  Smart Ride Sharing System Starting...");
			System.out.println("========================================");
			System.out.println("\n");
			
			SpringApplication.run(SmartRideSharingSystemApplication.class, args);
			
			System.out.println("\n");
			System.out.println("========================================");
			System.out.println("✅ Application Started Successfully!");
			System.out.println("  API Base URL: http://localhost:8080");
			System.out.println("========================================");
			System.out.println("\n\n");
		} catch (Exception e) {
			System.err.println("\n\n");
			System.err.println("========================================");
			System.err.println("❌ APPLICATION STARTUP FAILED!");
			System.err.println("========================================");
			System.err.println("Error: " + e.getMessage());
			System.err.println("Type: " + e.getClass().getName());
			System.err.println("\nFull Stack Trace:");
			e.printStackTrace();
			System.err.println("\n========================================");
			System.err.println("Common Solutions:");
			System.err.println("1. Check if MySQL is running");
			System.err.println("2. Verify database credentials in application.properties");
			System.err.println("3. Ensure database 'ride_sharing_db' exists");
			System.err.println("4. Check if port 8080 is available");
			System.err.println("========================================\n\n");
			System.exit(1);
		}
	}

}
