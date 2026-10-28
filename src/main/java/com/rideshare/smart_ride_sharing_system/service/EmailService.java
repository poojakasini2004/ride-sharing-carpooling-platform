package com.rideshare.smart_ride_sharing_system.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Send OTP verification email
     */
    public void sendOtpEmail(String toEmail, String fullName, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Verify your email - Smart Ride Share");

            String htmlContent = buildOtpEmailHtml(fullName, otp);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("✅ OTP email sent successfully to: " + toEmail);
        } catch (MessagingException e) {
            System.err.println("❌ Failed to send OTP email to: " + toEmail);
            e.printStackTrace();
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    /**
     * Send welcome email after successful registration
     */
    public void sendWelcomeEmail(String toEmail, String fullName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to Smart Ride Share! 🚗");

            String htmlContent = buildWelcomeEmailHtml(fullName);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("✅ Welcome email sent successfully to: " + toEmail);
        } catch (MessagingException e) {
            System.err.println("⚠️ Failed to send welcome email to: " + toEmail);
            e.printStackTrace();
            // Don't throw exception - welcome email is not critical
        }
    }

    /**
     * Build HTML content for OTP email
     */
    private String buildOtpEmailHtml(String fullName, String otp) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #00b4db 0%%, #0083b0 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .otp-box { background: white; border: 2px dashed #00b4db; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                    .otp-code { font-size: 32px; font-weight: bold; color: #00b4db; letter-spacing: 5px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚗 Smart Ride Share</h1>
                        <p>Email Verification</p>
                    </div>
                    <div class="content">
                        <h2>Hello %s! 👋</h2>
                        <p>Welcome to <strong>Smart Ride Share</strong>! We're excited to have you on board.</p>
                        <p>To complete your registration, please verify your email address using the code below:</p>
                        
                        <div class="otp-box">
                            <p style="margin: 0; color: #666;">Your Verification Code</p>
                            <div class="otp-code">%s</div>
                            <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Valid for 10 minutes</p>
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ Security Notice:</strong> Never share this code with anyone. Our team will never ask for your verification code.
                        </div>
                        
                        <p>If you didn't request this code, please ignore this email.</p>
                        
                        <p>Best regards,<br><strong>The Smart Ride Share Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>© 2024 Smart Ride Share. All rights reserved.</p>
                        <p>Need help? Contact us at support@smartrideshare.com</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(fullName, otp);
    }

    /**
     * Build HTML content for welcome email
     */
    private String buildWelcomeEmailHtml(String fullName) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #00b4db 0%%, #0083b0 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .feature-box { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #00b4db; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to Smart Ride Share!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello %s! 🚗</h2>
                        <p><strong>Your account is now active!</strong></p>
                        <p>Thank you for verifying your email. You're all set to start using Smart Ride Share.</p>
                        
                        <h3>What you can do now:</h3>
                        <div class="feature-box">
                            <strong>🔍 Find Rides</strong><br>
                            Search for available rides in your area
                        </div>
                        <div class="feature-box">
                            <strong>🚗 Offer Rides</strong><br>
                            Share your journey and earn money
                        </div>
                        <div class="feature-box">
                            <strong>💰 Dynamic Pricing</strong><br>
                            Fair and transparent fare calculation
                        </div>
                        <div class="feature-box">
                            <strong>💳 Secure Payments</strong><br>
                            Safe and easy payment options
                        </div>
                        
                        <p style="margin-top: 20px;">Ready to get started? Log in to your account and explore!</p>
                        
                        <p>Best regards,<br><strong>The Smart Ride Share Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>© 2024 Smart Ride Share. All rights reserved.</p>
                        <p>Need help? Contact us at support@smartrideshare.com</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(fullName);
    }

    /**
     * Send booking confirmation email to passenger
     */
    public void sendBookingConfirmationEmail(
            String passengerEmail,
            String passengerName,
            String driverName,
            String driverPhone,
            String vehicleType,
            String vehicleModel,
            String pickup,
            String destination,
            String dateTime,
            Double fare,
            Long bookingId
    ) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(passengerEmail);
            helper.setSubject("Ride Confirmed! 🚗 Booking #" + bookingId);

            String htmlContent = buildBookingConfirmationHtml(
                passengerName, driverName, driverPhone, vehicleType, vehicleModel,
                pickup, destination, dateTime, fare, bookingId
            );
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("✅ Booking confirmation email sent to: " + passengerEmail);
        } catch (MessagingException e) {
            System.err.println("⚠️ Failed to send booking confirmation email to: " + passengerEmail);
            e.printStackTrace();
        }
    }

    /**
     * Send ride started notification email
     */
    public void sendRideStartedEmail(
            String passengerEmail,
            String passengerName,
            String driverName,
            Long bookingId
    ) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(passengerEmail);
            helper.setSubject("Your Ride Has Started! 🚗 Booking #" + bookingId);

            String htmlContent = buildRideStartedHtml(passengerName, driverName, bookingId);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("✅ Ride started email sent to: " + passengerEmail);
        } catch (MessagingException e) {
            System.err.println("⚠️ Failed to send ride started email");
            e.printStackTrace();
        }
    }

    /**
     * Send ride completed email with receipt
     */
    public void sendRideCompletedEmail(
            String passengerEmail,
            String passengerName,
            String driverName,
            String pickup,
            String destination,
            Double distance,
            Double fare,
            String paymentMethod,
            Long bookingId
    ) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(passengerEmail);
            helper.setSubject("Ride Completed! 🎉 Receipt for Booking #" + bookingId);

            String htmlContent = buildRideCompletedHtml(
                passengerName, driverName, pickup, destination, 
                distance, fare, paymentMethod, bookingId
            );
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("✅ Ride completed email sent to: " + passengerEmail);
        } catch (MessagingException e) {
            System.err.println("⚠️ Failed to send ride completed email");
            e.printStackTrace();
        }
    }

    /**
     * Build HTML for booking confirmation email
     */
    private String buildBookingConfirmationHtml(
            String passengerName, String driverName, String driverPhone,
            String vehicleType, String vehicleModel, String pickup, String destination,
            String dateTime, Double fare, Long bookingId
    ) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
                    .container { max-width: 600px; margin: 20px auto; background: white; }
                    .header { background: linear-gradient(135deg, #11998e 0%%, #38ef7d 100%%); color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; }
                    .booking-card { background: #f9f9f9; border-left: 4px solid #11998e; padding: 20px; margin: 20px 0; border-radius: 5px; }
                    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .detail-label { font-weight: bold; color: #666; }
                    .detail-value { color: #333; }
                    .driver-info { background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 15px 0; }
                    .fare-box { background: #fff3cd; border: 2px solid #ffc107; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; }
                    .fare-amount { font-size: 32px; font-weight: bold; color: #f57c00; }
                    .button { display: inline-block; background: #11998e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 12px; }
                    .icon { font-size: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Ride Confirmed!</h1>
                        <p>Booking #%s</p>
                    </div>
                    
                    <div class="content">
                        <h2>Hello %s! 👋</h2>
                        <p>Great news! Your ride has been confirmed. Here are your booking details:</p>
                        
                        <div class="booking-card">
                            <h3 style="margin-top: 0; color: #11998e;">📍 Trip Details</h3>
                            <div class="detail-row">
                                <span class="detail-label">Pickup Location:</span>
                                <span class="detail-value">%s</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Drop-off Location:</span>
                                <span class="detail-value">%s</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Date & Time:</span>
                                <span class="detail-value">%s</span>
                            </div>
                        </div>
                        
                        <div class="driver-info">
                            <h3 style="margin-top: 0; color: #2e7d32;">🚗 Your Driver</h3>
                            <div class="detail-row">
                                <span class="detail-label">Driver Name:</span>
                                <span class="detail-value">%s</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Contact:</span>
                                <span class="detail-value">%s</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Vehicle:</span>
                                <span class="detail-value">%s - %s</span>
                            </div>
                        </div>
                        
                        <div class="fare-box">
                            <p style="margin: 0; color: #666;">Estimated Fare</p>
                            <div class="fare-amount">₹%.2f</div>
                            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Final fare may vary based on actual distance</p>
                        </div>
                        
                        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="margin-top: 0; color: #1976d2;">📱 What's Next?</h4>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>Your driver will arrive at the pickup location</li>
                                <li>You'll receive real-time updates on driver's location</li>
                                <li>You can chat with your driver through the app</li>
                                <li>Payment will be processed after ride completion</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:3000/bookings/%s" class="button">View Booking Details</a>
                        </div>
                        
                        <p style="color: #666; font-size: 14px; margin-top: 30px;">
                            <strong>Need to cancel?</strong> You can cancel your ride from the app up to 5 minutes before pickup time.
                        </p>
                        
                        <p>Have a safe journey! 🚗💨</p>
                        <p>Best regards,<br><strong>The ShareWay Team</strong></p>
                    </div>
                    
                    <div class="footer">
                        <p>© 2024 ShareWay. All rights reserved.</p>
                        <p>Need help? Contact us at support@shareway.com</p>
                        <p style="margin-top: 10px;">
                            <a href="#" style="color: #11998e; text-decoration: none; margin: 0 10px;">Help Center</a> |
                            <a href="#" style="color: #11998e; text-decoration: none; margin: 0 10px;">Terms</a> |
                            <a href="#" style="color: #11998e; text-decoration: none; margin: 0 10px;">Privacy</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                bookingId, passengerName, pickup, destination, dateTime,
                driverName, driverPhone, vehicleType, vehicleModel, fare, bookingId
            );
    }

    /**
     * Build HTML for ride started email
     */
    private String buildRideStartedHtml(String passengerName, String driverName, Long bookingId) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
                    .container { max-width: 600px; margin: 20px auto; background: white; }
                    .header { background: linear-gradient(135deg, #00b4db 0%%, #0083b0 100%%); color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; }
                    .alert-box { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin: 20px 0; border-radius: 5px; }
                    .button { display: inline-block; background: #00b4db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
                    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚗 Your Ride Has Started!</h1>
                        <p>Booking #%s</p>
                    </div>
                    
                    <div class="content">
                        <h2>Hello %s! 👋</h2>
                        
                        <div class="alert-box">
                            <h3 style="margin-top: 0; color: #2e7d32;">✅ Ride in Progress</h3>
                            <p style="margin: 0;">%s has started your ride. You can track your journey in real-time through the app.</p>
                        </div>
                        
                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="margin-top: 0;">🔒 Safety Tips</h4>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>Share your trip details with family/friends</li>
                                <li>Use the in-app chat for communication</li>
                                <li>Emergency button available in the app</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:3000/track/%s" class="button">Track Your Ride</a>
                        </div>
                        
                        <p>Have a safe journey! 🛡️</p>
                        <p>Best regards,<br><strong>The ShareWay Team</strong></p>
                    </div>
                    
                    <div class="footer">
                        <p>© 2024 ShareWay. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(bookingId, passengerName, driverName, bookingId);
    }

    /**
     * Build HTML for ride completed email (receipt)
     */
    private String buildRideCompletedHtml(
            String passengerName, String driverName, String pickup, String destination,
            Double distance, Double fare, String paymentMethod, Long bookingId
    ) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
                    .container { max-width: 600px; margin: 20px auto; background: white; }
                    .header { background: linear-gradient(135deg, #00b4db 0%%, #0083b0 100%%); color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; }
                    .receipt-box { background: #f9f9f9; border: 2px solid #e0e0e0; padding: 20px; margin: 20px 0; border-radius: 8px; }
                    .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .total-row { font-size: 20px; font-weight: bold; color: #00b4db; padding-top: 15px; border-top: 2px solid #00b4db; }
                    .button { display: inline-block; background: #00b4db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
                    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Ride Completed!</h1>
                        <p>Thank you for riding with us</p>
                    </div>
                    
                    <div class="content">
                        <h2>Hello %s! 👋</h2>
                        <p>Your ride has been completed successfully. Here's your receipt:</p>
                        
                        <div class="receipt-box">
                            <h3 style="margin-top: 0; text-align: center; color: #00b4db;">📄 RECEIPT</h3>
                            <p style="text-align: center; color: #666; margin: 0 0 20px 0;">Booking #%s</p>
                            
                            <div class="receipt-row">
                                <span>Pickup:</span>
                                <span><strong>%s</strong></span>
                            </div>
                            <div class="receipt-row">
                                <span>Drop-off:</span>
                                <span><strong>%s</strong></span>
                            </div>
                            <div class="receipt-row">
                                <span>Driver:</span>
                                <span><strong>%s</strong></span>
                            </div>
                            <div class="receipt-row">
                                <span>Distance:</span>
                                <span><strong>%.2f km</strong></span>
                            </div>
                            <div class="receipt-row">
                                <span>Payment Method:</span>
                                <span><strong>%s</strong></span>
                            </div>
                            <div class="receipt-row total-row">
                                <span>Total Fare:</span>
                                <span>₹%.2f</span>
                            </div>
                        </div>
                        
                        <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                            <h4 style="margin-top: 0; color: #2e7d32;">⭐ Rate Your Experience</h4>
                            <p>How was your ride with %s?</p>
                            <a href="http://localhost:3000/rate/%s" class="button">Rate Driver</a>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:3000/receipt/%s" class="button">Download Receipt</a>
                        </div>
                        
                        <p>Thank you for choosing ShareWay! We hope to serve you again soon. 🚗</p>
                        <p>Best regards,<br><strong>The ShareWay Team</strong></p>
                    </div>
                    
                    <div class="footer">
                        <p>© 2024 ShareWay. All rights reserved.</p>
                        <p>Questions about this ride? <a href="mailto:support@shareway.com" style="color: #00b4db;">Contact Support</a></p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                passengerName, bookingId, pickup, destination, driverName,
                distance, paymentMethod, fare, driverName, bookingId, bookingId
            );
    }

    /**
     * Send booking cancellation email
     */
    public void sendBookingCancellationEmail(
            String toEmail,
            String passengerName,
            String pickup,
            String destination,
            String dateTime,
            Long bookingId,
            String cancelledBy
    ) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Booking Cancelled - Booking #" + bookingId);

            String htmlContent = buildCancellationEmailHtml(
                passengerName, pickup, destination, dateTime, bookingId, cancelledBy
            );
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("✅ Cancellation email sent to: " + toEmail);
        } catch (MessagingException e) {
            System.err.println("⚠️ Failed to send cancellation email to: " + toEmail);
            e.printStackTrace();
        }
    }

    /**
     * Send ride reminder email
     */
    public void sendRideReminderEmail(
            String toEmail,
            String userName,
            String pickup,
            String destination,
            String dateTime,
            int hoursUntilRide,
            Long bookingId
    ) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Ride Reminder: Your ride is in " + hoursUntilRide + " hour" + (hoursUntilRide > 1 ? "s" : ""));

            String htmlContent = buildRideReminderEmailHtml(
                userName, pickup, destination, dateTime, hoursUntilRide, bookingId
            );
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("✅ Ride reminder email sent to: " + toEmail);
        } catch (MessagingException e) {
            System.err.println("⚠️ Failed to send ride reminder email to: " + toEmail);
            e.printStackTrace();
        }
    }

    /**
     * Build HTML for cancellation email
     */
    private String buildCancellationEmailHtml(
            String passengerName, String pickup, String destination,
            String dateTime, Long bookingId, String cancelledBy
    ) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
                    .container { max-width: 600px; margin: 20px auto; background: white; }
                    .header { background: linear-gradient(135deg, #dc3545 0%%, #c82333 100%%); color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; }
                    .cancel-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px; }
                    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .button { display: inline-block; background: #004E89; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
                    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>❌ Booking Cancelled</h1>
                        <p>Booking #%s</p>
                    </div>
                    
                    <div class="content">
                        <h2>Hello %s,</h2>
                        <p>Your ride booking has been cancelled%s.</p>
                        
                        <div class="cancel-box">
                            <h3 style="margin-top: 0; color: #856404;">📋 Cancelled Booking Details</h3>
                            <div class="detail-row">
                                <span><strong>Pickup:</strong></span>
                                <span>%s</span>
                            </div>
                            <div class="detail-row">
                                <span><strong>Destination:</strong></span>
                                <span>%s</span>
                            </div>
                            <div class="detail-row">
                                <span><strong>Scheduled Time:</strong></span>
                                <span>%s</span>
                            </div>
                        </div>
                        
                        <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="margin-top: 0; color: #2e7d32;">💡 What's Next?</h4>
                            <p>• Any charges will be refunded within 5-7 business days</p>
                            <p>• You can book another ride anytime</p>
                            <p>• Check our app for available rides</p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:3000/search-rides" class="button">Find Another Ride</a>
                        </div>
                        
                        <p>We're sorry for any inconvenience. We hope to serve you again soon!</p>
                        <p>Best regards,<br><strong>The Smart Ride Share Team</strong></p>
                    </div>
                    
                    <div class="footer">
                        <p>© 2024 Smart Ride Share. All rights reserved.</p>
                        <p>Need help? Contact us at support@smartrideshare.com</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                bookingId, passengerName,
                cancelledBy != null ? " by " + cancelledBy : "",
                pickup, destination, dateTime
            );
    }

    /**
     * Build HTML for ride reminder email
     */
    private String buildRideReminderEmailHtml(
            String userName, String pickup, String destination,
            String dateTime, int hoursUntilRide, Long bookingId
    ) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
                    .container { max-width: 600px; margin: 20px auto; background: white; }
                    .header { background: linear-gradient(135deg, #004E89 0%%, #003d6e 100%%); color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; }
                    .reminder-box { background: #fff3cd; border: 3px solid #ffc107; padding: 25px; margin: 20px 0; border-radius: 10px; text-align: center; }
                    .time-badge { font-size: 48px; font-weight: bold; color: #f57c00; margin: 10px 0; }
                    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .button { display: inline-block; background: #004E89; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
                    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⏰ Ride Reminder</h1>
                        <p>Your ride is coming up soon!</p>
                    </div>
                    
                    <div class="content">
                        <h2>Hello %s! 👋</h2>
                        
                        <div class="reminder-box">
                            <p style="margin: 0; font-size: 18px; color: #856404;">Your ride starts in</p>
                            <div class="time-badge">%d Hour%s</div>
                            <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Please be ready at your pickup location</p>
                        </div>
                        
                        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #004E89;">📍 Trip Details</h3>
                            <div class="detail-row">
                                <span><strong>Pickup Location:</strong></span>
                                <span>%s</span>
                            </div>
                            <div class="detail-row">
                                <span><strong>Destination:</strong></span>
                                <span>%s</span>
                            </div>
                            <div class="detail-row">
                                <span><strong>Scheduled Time:</strong></span>
                                <span>%s</span>
                            </div>
                        </div>
                        
                        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="margin-top: 0; color: #1976d2;">✅ Pre-Ride Checklist</h4>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>Ensure your phone is charged</li>
                                <li>Be at the pickup location 5 minutes early</li>
                                <li>Have your booking ID ready: #%s</li>
                                <li>Check weather and dress accordingly</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:3000/bookings/%s" class="button">View Booking Details</a>
                        </div>
                        
                        <p>Have a safe and pleasant journey! 🚗💨</p>
                        <p>Best regards,<br><strong>The Smart Ride Share Team</strong></p>
                    </div>
                    
                    <div class="footer">
                        <p>© 2024 Smart Ride Share. All rights reserved.</p>
                        <p>Need help? Contact us at support@smartrideshare.com</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                userName, hoursUntilRide, hoursUntilRide > 1 ? "s" : "",
                pickup, destination, dateTime, bookingId, bookingId
            );
    }

    /**
     * Send account status email (activation/suspension)
     */
    public void sendAccountStatusEmail(String toEmail, String fullName, boolean active, String reason) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(active ? "Account Activated - Smart Ride Share" : "Account Suspended - Smart Ride Share");

            String htmlContent = buildAccountStatusEmailHtml(fullName, active, reason);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("✅ Account status email sent to: " + toEmail);
        } catch (MessagingException e) {
            System.err.println("❌ Failed to send account status email to: " + toEmail);
            e.printStackTrace();
        }
    }

    /**
     * Send driver verification email
     */
    public void sendDriverVerificationEmail(String toEmail, String fullName, boolean approved) {
        sendDriverVerificationEmail(toEmail, fullName, approved, null);
    }

    /**
     * Send driver verification email with reason
     */
    public void sendDriverVerificationEmail(String toEmail, String fullName, boolean approved, String reason) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(approved ? "Driver Verification Approved ✅" : "Driver Verification Update");

            String htmlContent = buildDriverVerificationEmailHtml(fullName, approved, reason);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("✅ Driver verification email sent to: " + toEmail);
        } catch (MessagingException e) {
            System.err.println("❌ Failed to send driver verification email to: " + toEmail);
            e.printStackTrace();
        }
    }

    /**
     * Build HTML content for account status email
     */
    private String buildAccountStatusEmailHtml(String fullName, boolean active, String reason) {
        String status = active ? "Activated" : "Suspended";
        String statusColor = active ? "#4caf50" : "#f44336";
        String statusIcon = active ? "✅" : "⚠️";
        
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: %s; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .status-box { background: white; border: 2px solid %s; padding: 20px; margin: 20px 0; border-radius: 8px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>%s Account %s</h1>
                    </div>
                    <div class="content">
                        <h2>Hello %s! 👋</h2>
                        <div class="status-box">
                            <p>Your account has been <strong>%s</strong>.</p>
                            %s
                        </div>
                        <p>If you have any questions, please contact our support team.</p>
                        <p>Best regards,<br><strong>Smart Ride Share Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>© 2024 Smart Ride Share. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                statusColor, statusColor, statusIcon, status, fullName, 
                active ? "activated" : "suspended",
                reason != null && !active ? "<p><strong>Reason:</strong> " + reason + "</p>" : ""
            );
    }

    /**
     * Build HTML content for driver verification email
     */
    private String buildDriverVerificationEmailHtml(String fullName, boolean approved, String reason) {
        String status = approved ? "Approved" : "Rejected";
        String statusColor = approved ? "#4caf50" : "#f44336";
        String statusIcon = approved ? "✅" : "❌";
        
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: %s; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .status-box { background: white; border: 2px solid %s; padding: 20px; margin: 20px 0; border-radius: 8px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>%s Driver Verification %s</h1>
                    </div>
                    <div class="content">
                        <h2>Hello %s! 👋</h2>
                        <div class="status-box">
                            <p>Your driver verification has been <strong>%s</strong>.</p>
                            %s
                            %s
                        </div>
                        <p>Best regards,<br><strong>Smart Ride Share Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>© 2024 Smart Ride Share. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                statusColor, statusColor, statusIcon, status, fullName, 
                approved ? "approved" : "rejected",
                reason != null && !approved ? "<p><strong>Reason:</strong> " + reason + "</p>" : "",
                approved ? "<p>You can now start accepting ride requests!</p>" : "<p>Please contact support for more information.</p>"
            );
    }

    /**
     * Send generic notification email (used as fallback)
     */
    public void sendNotificationEmail(String toEmail, String title, String message) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(title);

            String htmlContent = buildGenericNotificationHtml(title, message);
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            System.out.println("✅ Notification email sent to: " + toEmail);
        } catch (MessagingException e) {
            System.err.println("⚠️ Failed to send notification email to: " + toEmail);
            e.printStackTrace();
        }
    }

    /**
     * Build HTML for generic notification email
     */
    private String buildGenericNotificationHtml(String title, String message) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
                    .container { max-width: 600px; margin: 20px auto; background: white; }
                    .header { background: linear-gradient(135deg, #00b4db 0%%, #0083b0 100%%); color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; }
                    .message-box { background: #f9f9f9; border-left: 4px solid #00b4db; padding: 20px; margin: 20px 0; border-radius: 5px; }
                    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔔 %s</h1>
                    </div>
                    <div class="content">
                        <div class="message-box">
                            <p>%s</p>
                        </div>
                        <p>Best regards,<br><strong>The Smart Ride Share Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>© 2024 Smart Ride Share. All rights reserved.</p>
                        <p>Need help? Contact us at support@smartrideshare.com</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(title, message);
    }
}

