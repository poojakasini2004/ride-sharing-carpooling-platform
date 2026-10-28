package com.rideshare.smart_ride_sharing_system.repository;

import com.rideshare.smart_ride_sharing_system.model.PendingRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PendingRegistrationRepository extends JpaRepository<PendingRegistration, Long> {
    
    Optional<PendingRegistration> findByEmail(String email);
    
    Optional<PendingRegistration> findByEmailAndIsVerifiedFalse(String email);
    
    void deleteByEmail(String email);
    
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}
