package com.rideshare.smart_ride_sharing_system.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.rideshare.smart_ride_sharing_system.model.Booking;
import com.rideshare.smart_ride_sharing_system.model.Payment;
import com.rideshare.smart_ride_sharing_system.repository.BookingRepository;
import com.rideshare.smart_ride_sharing_system.repository.PaymentRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    @Value("${razorpay.key.id:rzp_test_YOUR_KEY_ID}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:YOUR_KEY_SECRET}")
    private String razorpayKeySecret;

    private RazorpayClient razorpayClient;

    public PaymentService(PaymentRepository paymentRepository, 
                         BookingRepository bookingRepository) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
    }

    private RazorpayClient getRazorpayClient() throws RazorpayException {
        if (razorpayClient == null) {
            razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
        }
        return razorpayClient;
    }

    /**
     * Create Razorpay order for booking
     */
    @Transactional
    public Map<String, Object> createOrder(Long bookingId) throws Exception {
        // Get booking details
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Check if payment already exists
        Optional<Payment> existingPayment = paymentRepository.findByBookingId(bookingId);
        if (existingPayment.isPresent() && "SUCCESS".equals(existingPayment.get().getPaymentStatus())) {
            throw new RuntimeException("Payment already completed for this booking");
        }

        // Calculate amount in paise (Razorpay uses smallest currency unit)
        int amountInPaise = (int) (booking.getRide().getPrice() * 100);

        // Create Razorpay order
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "booking_" + bookingId);
        orderRequest.put("payment_capture", 1); // Auto capture

        Order order = getRazorpayClient().orders.create(orderRequest);

        // Create or update payment record
        Payment payment;
        if (existingPayment.isPresent()) {
            payment = existingPayment.get();
        } else {
            payment = new Payment();
            payment.setBooking(booking);
            payment.setPassenger(booking.getPassenger());
            payment.setDriver(booking.getRide().getDriver());
            payment.setAmount(booking.getRide().getPrice());
            payment.setPaymentMethod("RAZORPAY");
        }

        payment.setRazorpayOrderId(order.get("id"));
        payment.setPaymentStatus("PENDING");
        payment.setCurrency("INR");
        payment.setDescription("Payment for ride from " + booking.getRide().getSource() + 
                              " to " + booking.getRide().getDestination());

        paymentRepository.save(payment);

        // Return order details for frontend
        return Map.of(
            "orderId", order.get("id"),
            "amount", amountInPaise,
            "currency", "INR",
            "keyId", razorpayKeyId,
            "bookingId", bookingId,
            "paymentId", payment.getId()
        );
    }

    /**
     * Verify Razorpay payment signature
     */
    @Transactional
    public Payment verifyPayment(String razorpayOrderId, String razorpayPaymentId, 
                                String razorpaySignature) throws Exception {
        // Find payment by order ID
        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        // Verify signature
        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", razorpayOrderId);
        options.put("razorpay_payment_id", razorpayPaymentId);
        options.put("razorpay_signature", razorpaySignature);

        boolean isValidSignature = Utils.verifyPaymentSignature(options, razorpayKeySecret);

        if (isValidSignature) {
            // Update payment status
            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setRazorpaySignature(razorpaySignature);
            payment.setPaymentStatus("SUCCESS");
            payment.setPaymentDate(LocalDateTime.now());
            payment.setTransactionId(razorpayPaymentId);

            // Update booking status
            Booking booking = payment.getBooking();
            booking.setStatus("CONFIRMED");
            bookingRepository.save(booking);

            return paymentRepository.save(payment);
        } else {
            payment.setPaymentStatus("FAILED");
            payment.setFailureReason("Invalid signature");
            paymentRepository.save(payment);
            throw new RuntimeException("Payment verification failed");
        }
    }

    /**
     * Handle payment failure
     */
    @Transactional
    public Payment handlePaymentFailure(String razorpayOrderId, String failureReason) {
        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setPaymentStatus("FAILED");
        payment.setFailureReason(failureReason);

        return paymentRepository.save(payment);
    }

    /**
     * Get payment by booking ID
     */
    public Optional<Payment> getPaymentByBookingId(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId);
    }

    /**
     * Get all payments for a passenger
     */
    public List<Payment> getPassengerPayments(Long passengerId) {
        return paymentRepository.findRecentPaymentsByPassenger(passengerId);
    }

    /**
     * Get all payments for a driver
     */
    public List<Payment> getDriverPayments(Long driverId) {
        return paymentRepository.findRecentPaymentsByDriver(driverId);
    }

    /**
     * Get total earnings for a driver
     */
    public Double getDriverEarnings(Long driverId) {
        Double earnings = paymentRepository.getTotalEarningsByDriver(driverId);
        return earnings != null ? earnings : 0.0;
    }

    /**
     * Get total spending for a passenger
     */
    public Double getPassengerSpending(Long passengerId) {
        Double spending = paymentRepository.getTotalSpendingByPassenger(passengerId);
        return spending != null ? spending : 0.0;
    }

    /**
     * Process refund
     */
    @Transactional
    public Payment processRefund(Long paymentId, Double refundAmount) throws Exception {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (!"SUCCESS".equals(payment.getPaymentStatus())) {
            throw new RuntimeException("Cannot refund a payment that was not successful");
        }

        if (refundAmount > payment.getAmount()) {
            throw new RuntimeException("Refund amount cannot exceed payment amount");
        }

        // Create refund in Razorpay
        JSONObject refundRequest = new JSONObject();
        refundRequest.put("amount", (int) (refundAmount * 100)); // Convert to paise

        try {
            getRazorpayClient().payments.refund(payment.getRazorpayPaymentId(), refundRequest);

            // Update payment record
            payment.setPaymentStatus("REFUNDED");
            payment.setRefundAmount(refundAmount);
            payment.setRefundDate(LocalDateTime.now());

            // Update booking status
            Booking booking = payment.getBooking();
            booking.setStatus("CANCELLED");
            bookingRepository.save(booking);

            return paymentRepository.save(payment);
        } catch (RazorpayException e) {
            throw new RuntimeException("Refund failed: " + e.getMessage());
        }
    }

    /**
     * Get payment statistics for passenger
     */
    public Map<String, Object> getPassengerPaymentStats(Long passengerId) {
        Double totalSpending = getPassengerSpending(passengerId);
        Long successfulPayments = paymentRepository.countSuccessfulPaymentsByPassenger(passengerId);
        List<Payment> recentPayments = paymentRepository.findRecentPaymentsByPassenger(passengerId);

        return Map.of(
            "totalSpending", totalSpending,
            "successfulPayments", successfulPayments,
            "recentPayments", recentPayments
        );
    }

    /**
     * Get payment statistics for driver
     */
    public Map<String, Object> getDriverPaymentStats(Long driverId) {
        Double totalEarnings = getDriverEarnings(driverId);
        Long successfulPayments = paymentRepository.countSuccessfulPaymentsByDriver(driverId);
        List<Payment> recentPayments = paymentRepository.findRecentPaymentsByDriver(driverId);

        return Map.of(
            "totalEarnings", totalEarnings,
            "successfulPayments", successfulPayments,
            "recentPayments", recentPayments
        );
    }

    /**
     * Get Razorpay key for frontend
     */
    public String getRazorpayKey() {
        return razorpayKeyId;
    }
}
