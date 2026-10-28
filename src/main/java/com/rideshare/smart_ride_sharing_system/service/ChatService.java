package com.rideshare.smart_ride_sharing_system.service;

import com.rideshare.smart_ride_sharing_system.model.ChatMessage;
import com.rideshare.smart_ride_sharing_system.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Chat Service for Real-Time Passenger-Driver Communication
 */
@Service
public class ChatService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    /**
     * Send chat message
     */
    public ChatMessage sendMessage(Long bookingId, Long senderId, String senderType, String message) {
        
        // Save message to database
        ChatMessage chatMessage = new ChatMessage(bookingId, senderId, senderType, message);
        chatMessage = chatMessageRepository.save(chatMessage);

        // Prepare WebSocket payload
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", chatMessage.getId());
        payload.put("bookingId", bookingId);
        payload.put("senderId", senderId);
        payload.put("senderType", senderType);
        payload.put("message", message);
        payload.put("timestamp", chatMessage.getCreatedAt().toString());

        // Broadcast to booking-specific chat topic
        messagingTemplate.convertAndSend("/topic/chat/" + bookingId, payload);

        System.out.println("💬 Chat message sent for booking " + bookingId + " from " + senderType);

        return chatMessage;
    }

    /**
     * Get all messages for a booking
     */
    public List<ChatMessage> getBookingMessages(Long bookingId) {
        return chatMessageRepository.findByBookingIdOrderByCreatedAtAsc(bookingId);
    }

    /**
     * Mark messages as read
     */
    public void markMessagesAsRead(Long bookingId) {
        List<ChatMessage> messages = chatMessageRepository.findByBookingIdOrderByCreatedAtAsc(bookingId);
        messages.forEach(message -> {
            if (!message.isRead()) {
                message.setRead(true);
                chatMessageRepository.save(message);
            }
        });
    }

    /**
     * Get unread message count
     */
    public long getUnreadCount(Long bookingId) {
        return chatMessageRepository.countByBookingIdAndIsReadFalse(bookingId);
    }
}
