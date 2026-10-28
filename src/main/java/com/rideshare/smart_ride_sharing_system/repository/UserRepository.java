package com.rideshare.smart_ride_sharing_system.repository;

import com.rideshare.smart_ride_sharing_system.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Custom query to find by email
    Optional<User> findByEmail(String email);
    
    // Custom query to find by phone
    Optional<User> findByPhone(String phone);
    
    // Find users by role
    List<User> findByRole(String role);
    
    // Count users by role
    long countByRole(String role);
    
    // Count active users
    long countByActive(boolean active);
    
    // Count verified drivers
    long countByRoleAndVerified(String role, boolean verified);
    
    // Find users by role and verification status
    List<User> findByRoleAndVerified(String role, boolean verified);
    
    // Count users created after a specific date
    long countByCreatedAtAfter(LocalDateTime createdAt);
    
    // Count users created between dates
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    // Search users by name, email, or phone
    List<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneContaining(
        String name, String email, String phone
    );
}
