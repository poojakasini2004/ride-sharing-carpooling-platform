package com.rideshare.smart_ride_sharing_system.controller;

import com.rideshare.smart_ride_sharing_system.service.UserService;
import com.rideshare.smart_ride_sharing_system.model.User;
import com.rideshare.smart_ride_sharing_system.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthController(UserService userService, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestParam String email,
                                      @RequestParam String name,
                                      @RequestParam String password,
                                      @RequestParam(required = false) String phone,
                                      @RequestParam(defaultValue = "PASSENGER") String role,
                                      @RequestParam(required = false) String vehicleType,
                                      @RequestParam(required = false) String vehicleModel) {
        System.out.println("Register API called with:");
        System.out.println("  email: " + email);
        System.out.println("  name: " + name);
        System.out.println("  password: " + password);
        System.out.println("  phone: " + phone);
        System.out.println("  role: " + role);

        // Check if user already exists
        Optional<User> existingUser = userService.getUserByEmail(email);
        if (existingUser.isPresent()) {
            System.out.println("Registration failed: User with this email already exists");
            return ResponseEntity.badRequest().body(Map.of("error", "User with this email already exists"));
        }

        try {
            // Create new user with encoded password
            User user = new User(name, email, phone, passwordEncoder.encode(password), role, true);
            if ("DRIVER".equals(role)) {
                user.setVehicleType(vehicleType);
                user.setVehicleModel(vehicleModel);
            }
            userService.saveUser(user);

            // Generate JWT token
            String token = jwtUtil.generateToken(user);

            // Return success response with token
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registration successful!");
            response.put("token", token);
            response.put("user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole()
            ));

            System.out.println("Registration successful for email: " + email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String email,
                                   @RequestParam String password) {

        // Find user by email
        Optional<User> userOpt = userService.getUserByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid email or password"));
        }

        User user = userOpt.get();

        // Verify password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid email or password"));
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user);

        // Return success response with token
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful!");
        response.put("token", token);
        response.put("user", Map.of(
            "id", user.getId(),
            "name", user.getName(),
            "email", user.getEmail(),
            "role", user.getRole(),
            "phone", user.getPhone() != null ? user.getPhone() : ""
        ));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@RequestHeader("Authorization") String token) {
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
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid token"));
        }
    }
}
