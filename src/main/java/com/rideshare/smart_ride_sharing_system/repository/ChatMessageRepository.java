package com.rideshare.smart_ride_sharing_system.repository;

import com.rideshare.smart_ride_sharing_system.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    // Find all messages for a booking
    List<ChatMessage> findByBookingIdOrderByCreatedAtAsc(Long bookingId);
    
    // Count unread messages for a booking
    long countByBookingIdAndIsReadFalse(Long bookingId);
}
