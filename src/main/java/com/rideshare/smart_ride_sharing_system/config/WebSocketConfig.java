package com.rideshare.smart_ride_sharing_system.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket Configuration for Real-Time Updates
 * 
 * Enables:
 * - Real-time booking status updates
 * - Live driver location tracking
 * - Instant notifications
 * - Real-time chat messaging
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        // Enable a simple in-memory message broker
        // Prefix for messages FROM server TO client
        config.enableSimpleBroker(
            "/topic",      // For broadcast messages (all users)
            "/queue"       // For private messages (specific user)
        );
        
        // Prefix for messages FROM client TO server
        config.setApplicationDestinationPrefixes("/app");
        
        // Prefix for user-specific messages
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        // WebSocket endpoint that clients will connect to
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")  // Allow all origins (configure properly in production)
                .withSockJS()
                .setHeartbeatTime(25000)  // Increase heartbeat time to prevent disconnections
                .setDisconnectDelay(30000); // Increase disconnect delay
        
        // Add a secondary endpoint without SockJS for direct WebSocket connections
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
        
        System.out.println("✅ WebSocket endpoint registered at: /ws with improved connection settings");
    }
}
