package com.rideshare.smart_ride_sharing_system.controller;

import com.rideshare.smart_ride_sharing_system.model.User;
import com.rideshare.smart_ride_sharing_system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/diagnostic")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class DiagnosticController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/users/count")
    public ResponseEntity<?> getUserCount() {
        long count = userRepository.count();
        Map<String, Object> response = new HashMap<>();
        response.put("totalUsers", count);
        response.put("message", "Total users in database: " + count);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/all")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("totalUsers", users.size());
        response.put("users", users.stream().map(user -> {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("name", user.getName());
            userMap.put("email", user.getEmail());
            userMap.put("phone", user.getPhone());
            userMap.put("role", user.getRole());
            userMap.put("verified", user.isVerified());
            return userMap;
        }).toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/check/{email}")
    public ResponseEntity<?> checkUserExists(@PathVariable String email) {
        boolean exists = userRepository.findByEmail(email).isPresent();
        Map<String, Object> response = new HashMap<>();
        response.put("email", email);
        response.put("exists", exists);
        if (exists) {
            User user = userRepository.findByEmail(email).get();
            response.put("userId", user.getId());
            response.put("name", user.getName());
        }
        return ResponseEntity.ok(response);
    }
}
