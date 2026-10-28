package com.rideshare.smart_ride_sharing_system.controller;

import com.rideshare.smart_ride_sharing_system.model.User;
import com.rideshare.smart_ride_sharing_system.security.JwtUtil;
import com.rideshare.smart_ride_sharing_system.service.RegistrationService;
import com.rideshare.smart_ride_sharing_system.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth/otp")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class OtpAuthController {

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * STEP 1: Initiate Registration - Send OTP to email
     * POST /auth/otp/register/initiate
     */
    @PostMapping("/register/initiate")
    public ResponseEntity<?> initiateRegistration(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String fullName = request.get("fullName");
            String phone = request.get("phone");
            String password = request.get("password");
            String userType = request.getOrDefault("userType", "PASSENGER");
            String vehicleType = request.get("vehicleType");
            String vehicleModel = request.get("vehicleModel");

            // Validate required fields
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            if (fullName == null || fullName.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Full name is required"));
            }
            if (password == null || password.length() < 8) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 characters"));
            }

            // Validate email format
            if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid email format"));
            }

            // Validate password strength
            if (!password.matches(".*[A-Z].*")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password must contain at least one uppercase letter"));
            }
            if (!password.matches(".*[a-z].*")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password must contain at least one lowercase letter"));
            }
            if (!password.matches(".*[0-9].*")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password must contain at least one number"));
            }

            // Validate driver-specific fields
            if ("DRIVER".equalsIgnoreCase(userType)) {
                if (vehicleType == null || vehicleType.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Vehicle type is required for drivers"));
                }
                if (vehicleModel == null || vehicleModel.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Vehicle model is required for drivers"));
                }
            }

            String message = registrationService.initiateRegistration(
                email, fullName, phone, password, userType, vehicleType, vehicleModel
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", message);
            response.put("email", email);
            response.put("expiresIn", "10 minutes");

            System.out.println("✅ Registration initiated for: " + email);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Registration initiation failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * STEP 2: Verify OTP and Complete Registration
     * POST /auth/otp/register/verify
     */
    @PostMapping("/register/verify")
    public ResponseEntity<?> verifyOtpAndRegister(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otp = request.get("otp");

            // Validate required fields
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            if (otp == null || otp.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "OTP is required"));
            }
            if (otp.length() != 6) {
                return ResponseEntity.badRequest().body(Map.of("error", "OTP must be 6 digits"));
            }

            // Verify OTP and create account
            User user = registrationService.verifyOtpAndCreateAccount(email, otp);

            // Generate JWT token for auto-login
            String token = jwtUtil.generateToken(user);

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Account created successfully! Welcome aboard!");
            response.put("token", token);
            response.put("user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "emailVerified", user.isVerified(),
                "emailVerifiedAt", user.getEmailVerifiedAt() != null ? user.getEmailVerifiedAt().toString() : ""
            ));

            System.out.println("✅ Registration completed for: " + email);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ OTP verification failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * STEP 3: Resend OTP
     * POST /auth/otp/register/resend
     */
    @PostMapping("/register/resend")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");

            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }

            String message = registrationService.resendOtp(email);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", message);
            response.put("email", email);
            response.put("expiresIn", "10 minutes");

            System.out.println("✅ OTP resent to: " + email);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ OTP resend failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Login with Email and Password (NO OTP)
     * POST /auth/otp/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");

            // Validate required fields
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            if (password == null || password.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
            }

            // Find user by email
            Optional<User> userOpt = userService.getUserByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid email or password"));
            }

            User user = userOpt.get();

            // Check if email is verified
            if (!user.isVerified()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Please verify your email first",
                    "emailVerified", false
                ));
            }

            // Check if account is active
            if (!user.isActive()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Account is suspended. Please contact support."));
            }

            // Verify password
            if (!passwordEncoder.matches(password, user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid email or password"));
            }

            // Update last login timestamp
            user.setLastLogin(LocalDateTime.now());
            userService.updateUser(user);

            // Generate JWT token
            String token = jwtUtil.generateToken(user);

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful!");
            response.put("token", token);
            response.put("user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "emailVerified", user.isVerified(),
                "lastLogin", user.getLastLogin() != null ? user.getLastLogin().toString() : ""
            ));

            System.out.println("✅ Login successful for: " + email);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Login failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    /**
     * Get current user info
     * GET /auth/otp/me
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUsername(token.substring(7));
            Optional<User> userOpt = userService.getUserByEmail(email);
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("name", user.getName());
            response.put("email", user.getEmail());
            response.put("role", user.getRole());
            response.put("phone", user.getPhone());
            response.put("emailVerified", user.isVerified());
            response.put("isActive", user.isActive());
            response.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");
            response.put("lastLogin", user.getLastLogin() != null ? user.getLastLogin().toString() : "");

            if ("DRIVER".equalsIgnoreCase(user.getRole())) {
                response.put("vehicleType", user.getVehicleType());
                response.put("vehicleModel", user.getVehicleModel());
                response.put("rating", user.getRating());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid token"));
        }
    }

    /**
     * Send OTP to existing unverified user
     * POST /auth/otp/verify-existing
     */
    @PostMapping("/verify-existing")
    public ResponseEntity<?> sendOtpToExistingUser(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");

            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }

            // Find user
            Optional<User> userOpt = userService.getUserByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();

            // Check if already verified
            if (user.isVerified()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is already verified"));
            }

            // Generate and send OTP
            String message = registrationService.sendOtpToExistingUser(email);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", message);
            response.put("email", email);
            response.put("expiresIn", "10 minutes");

            System.out.println("✅ Verification OTP sent to existing user: " + email);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Failed to send verification OTP: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Verify OTP for existing user and mark email as verified
     * POST /auth/otp/verify-existing-confirm
     */
    @PostMapping("/verify-existing-confirm")
    public ResponseEntity<?> verifyExistingUserOtp(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otp = request.get("otp");

            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            if (otp == null || otp.length() != 6) {
                return ResponseEntity.badRequest().body(Map.of("error", "Valid 6-digit OTP is required"));
            }

            // Verify OTP for existing user
            User user = registrationService.verifyExistingUser(email, otp);

            // Generate JWT token for login
            String token = jwtUtil.generateToken(user);

            // Update last login
            user.setLastLogin(LocalDateTime.now());
            userService.updateUser(user);

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Email verified successfully!");
            response.put("token", token);
            response.put("user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "emailVerified", user.isVerified(),
                "emailVerifiedAt", user.getEmailVerifiedAt() != null ? user.getEmailVerifiedAt().toString() : ""
            ));

            System.out.println("✅ Existing user email verified: " + email);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ OTP verification failed for existing user: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
