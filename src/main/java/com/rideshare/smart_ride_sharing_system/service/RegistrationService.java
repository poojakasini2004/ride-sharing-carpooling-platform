package com.rideshare.smart_ride_sharing_system.service;

import com.rideshare.smart_ride_sharing_system.model.PendingRegistration;
import com.rideshare.smart_ride_sharing_system.model.User;
import com.rideshare.smart_ride_sharing_system.repository.PendingRegistrationRepository;
import com.rideshare.smart_ride_sharing_system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class RegistrationService {

    @Autowired
    private PendingRegistrationRepository pendingRegistrationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Step 1: Create pending registration and send OTP
     */
    @Transactional
    public String initiateRegistration(String email, String fullName, String phone, 
                                      String password, String userType, 
                                      String vehicleType, String vehicleModel) {
        
        // Check if user already exists
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            throw new RuntimeException("User with this email already exists. Please login instead.");
        }

        // Check if phone already exists
        if (phone != null && !phone.isEmpty()) {
            Optional<User> existingPhone = userRepository.findByPhone(phone);
            if (existingPhone.isPresent()) {
                throw new RuntimeException("Phone number already registered");
            }
        }

        // Delete any existing pending registration for this email
        pendingRegistrationRepository.findByEmail(email).ifPresent(pending -> {
            pendingRegistrationRepository.delete(pending);
        });

        // Generate OTP
        String otp = otpService.generateOtp();
        String otpHash = otpService.hashOtp(otp);

        // Create pending registration
        PendingRegistration pending = new PendingRegistration();
        pending.setEmail(email);
        pending.setFullName(fullName);
        pending.setPhone(phone);
        pending.setPasswordHash(passwordEncoder.encode(password));
        pending.setUserType(userType);
        pending.setOtpHash(otpHash);
        
        if ("DRIVER".equalsIgnoreCase(userType)) {
            pending.setVehicleType(vehicleType);
            pending.setVehicleModel(vehicleModel);
        }

        pendingRegistrationRepository.save(pending);

        // Send OTP email
        emailService.sendOtpEmail(email, fullName, otp);

        System.out.println("📧 OTP sent to: " + email + " (OTP: " + otp + ")");
        
        return "OTP sent successfully to " + email;
    }

    /**
     * Step 2: Verify OTP and create user account
     */
    @Transactional
    public User verifyOtpAndCreateAccount(String email, String otp) {
        
        // Find pending registration
        PendingRegistration pending = pendingRegistrationRepository
            .findByEmailAndIsVerifiedFalse(email)
            .orElseThrow(() -> new RuntimeException("No pending registration found for this email"));

        // Check if OTP expired
        if (pending.isExpired()) {
            pendingRegistrationRepository.delete(pending);
            throw new RuntimeException("OTP has expired. Please register again.");
        }

        // Check attempts limit
        if (pending.getOtpAttempts() >= 5) {
            pendingRegistrationRepository.delete(pending);
            throw new RuntimeException("Too many wrong attempts. Please register again.");
        }

        // Verify OTP
        if (!otpService.verifyOtp(otp, pending.getOtpHash())) {
            pending.setOtpAttempts(pending.getOtpAttempts() + 1);
            pendingRegistrationRepository.save(pending);
            int remainingAttempts = 5 - pending.getOtpAttempts();
            throw new RuntimeException("Invalid OTP. " + remainingAttempts + " attempts remaining.");
        }

        // OTP verified! Create actual user account
        User user = new User();
        user.setName(pending.getFullName());
        user.setEmail(pending.getEmail());
        user.setPhone(pending.getPhone());
        user.setPassword(pending.getPasswordHash()); // Already hashed
        user.setRole(pending.getUserType());
        user.setVerified(true);
        user.setEmailVerifiedAt(LocalDateTime.now());
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        
        if ("DRIVER".equalsIgnoreCase(pending.getUserType())) {
            user.setVehicleType(pending.getVehicleType());
            user.setVehicleModel(pending.getVehicleModel());
        }

        User savedUser = userRepository.save(user);

        // Delete pending registration
        pendingRegistrationRepository.delete(pending);

        // Send welcome email
        emailService.sendWelcomeEmail(user.getEmail(), user.getName());

        System.out.println("✅ Account created successfully for: " + email);

        return savedUser;
    }

    /**
     * Resend OTP for existing pending registration
     */
    @Transactional
    public String resendOtp(String email) {
        
        PendingRegistration pending = pendingRegistrationRepository
            .findByEmailAndIsVerifiedFalse(email)
            .orElseThrow(() -> new RuntimeException("No pending registration found for this email"));

        // Generate new OTP
        String otp = otpService.generateOtp();
        String otpHash = otpService.hashOtp(otp);

        // Update pending registration
        pending.setOtpHash(otpHash);
        pending.setOtpAttempts(0); // Reset attempts
        pending.setExpiresAt(LocalDateTime.now().plusMinutes(10)); // Extend expiry
        pendingRegistrationRepository.save(pending);

        // Send new OTP email
        emailService.sendOtpEmail(email, pending.getFullName(), otp);

        System.out.println("📧 OTP resent to: " + email + " (OTP: " + otp + ")");

        return "OTP resent successfully to " + email;
    }

    /**
     * Send OTP to existing unverified user
     */
    @Transactional
    public String sendOtpToExistingUser(String email) {
        
        // Find user in users table
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if already verified
        if (user.isVerified()) {
            throw new RuntimeException("Email is already verified");
        }

        // Delete any existing pending registration for this email
        pendingRegistrationRepository.findByEmail(email).ifPresent(pending -> {
            pendingRegistrationRepository.delete(pending);
        });

        // Generate OTP
        String otp = otpService.generateOtp();
        String otpHash = otpService.hashOtp(otp);

        // Create pending registration for verification
        PendingRegistration pending = new PendingRegistration();
        pending.setEmail(user.getEmail());
        pending.setFullName(user.getName());
        pending.setPhone(user.getPhone());
        pending.setPasswordHash(user.getPassword()); // Already hashed
        pending.setUserType(user.getRole());
        pending.setOtpHash(otpHash);
        
        if ("DRIVER".equalsIgnoreCase(user.getRole())) {
            pending.setVehicleType(user.getVehicleType());
            pending.setVehicleModel(user.getVehicleModel());
        }

        pendingRegistrationRepository.save(pending);

        // Send OTP email
        emailService.sendOtpEmail(email, user.getName(), otp);

        System.out.println("📧 Verification OTP sent to existing user: " + email + " (OTP: " + otp + ")");
        
        return "OTP sent successfully to " + email;
    }

    /**
     * Verify OTP for existing user and update their verification status
     */
    @Transactional
    public User verifyExistingUser(String email, String otp) {
        
        // Find pending registration
        PendingRegistration pending = pendingRegistrationRepository
            .findByEmailAndIsVerifiedFalse(email)
            .orElseThrow(() -> new RuntimeException("No pending verification found for this email"));

        // Check if OTP expired
        if (pending.isExpired()) {
            pendingRegistrationRepository.delete(pending);
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        // Check attempts limit
        if (pending.getOtpAttempts() >= 5) {
            pendingRegistrationRepository.delete(pending);
            throw new RuntimeException("Too many wrong attempts. Please request a new OTP.");
        }

        // Verify OTP
        if (!otpService.verifyOtp(otp, pending.getOtpHash())) {
            pending.setOtpAttempts(pending.getOtpAttempts() + 1);
            pendingRegistrationRepository.save(pending);
            int remainingAttempts = 5 - pending.getOtpAttempts();
            throw new RuntimeException("Invalid OTP. " + remainingAttempts + " attempts remaining.");
        }

        // OTP verified! Update user's verification status
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setVerified(true);
        user.setEmailVerifiedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(user);

        // Delete pending registration
        pendingRegistrationRepository.delete(pending);

        // Send welcome email
        emailService.sendWelcomeEmail(user.getEmail(), user.getName());

        System.out.println("✅ Existing user email verified: " + email);

        return updatedUser;
    }

    /**
     * Clean up expired pending registrations (can be scheduled)
     */
    @Transactional
    public void cleanupExpiredRegistrations() {
        pendingRegistrationRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        System.out.println("🧹 Cleaned up expired pending registrations");
    }
}
