package com.rideshare.smart_ride_sharing_system.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
public class OtpService {

    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom;

    public OtpService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
        this.secureRandom = new SecureRandom();
    }

    /**
     * Generate a 6-digit OTP
     */
    public String generateOtp() {
        int otp = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(otp);
    }

    /**
     * Hash the OTP for secure storage
     */
    public String hashOtp(String otp) {
        return passwordEncoder.encode(otp);
    }

    /**
     * Verify if the provided OTP matches the hashed OTP
     */
    public boolean verifyOtp(String plainOtp, String hashedOtp) {
        return passwordEncoder.matches(plainOtp, hashedOtp);
    }
}
