package com.rideshare.smart_ride_sharing_system.controller;

import com.rideshare.smart_ride_sharing_system.model.Payment;
import com.rideshare.smart_ride_sharing_system.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Create Razorpay order for booking
     * POST /api/payments/create-order
     */
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Long> request) {
        try {
            Long bookingId = request.get("bookingId");
            if (bookingId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Booking ID is required"));
            }

            Map<String, Object> orderDetails = paymentService.createOrder(bookingId);
            return ResponseEntity.ok(orderDetails);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Verify Razorpay payment
     * POST /api/payments/verify
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> paymentData) {
        try {
            String razorpayOrderId = paymentData.get("razorpay_order_id");
            String razorpayPaymentId = paymentData.get("razorpay_payment_id");
            String razorpaySignature = paymentData.get("razorpay_signature");

            if (razorpayOrderId == null || razorpayPaymentId == null || razorpaySignature == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Missing payment verification data"));
            }

            Payment payment = paymentService.verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Payment verified successfully",
                "payment", payment
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                        "success", false,
                        "error", e.getMessage()
                    ));
        }
    }

    /**
     * Handle payment failure
     * POST /api/payments/failure
     */
    @PostMapping("/failure")
    public ResponseEntity<?> handlePaymentFailure(@RequestBody Map<String, String> failureData) {
        try {
            String razorpayOrderId = failureData.get("razorpay_order_id");
            String failureReason = failureData.get("reason");

            Payment payment = paymentService.handlePaymentFailure(razorpayOrderId, failureReason);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Payment failure recorded",
                "payment", payment
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get payment by booking ID
     * GET /api/payments/booking/{bookingId}
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getPaymentByBooking(@PathVariable Long bookingId) {
        Optional<Payment> payment = paymentService.getPaymentByBookingId(bookingId);
        if (payment.isPresent()) {
            return ResponseEntity.ok(payment.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Payment not found for this booking"));
        }
    }

    /**
     * Get all payments for a passenger
     * GET /api/payments/passenger/{passengerId}
     */
    @GetMapping("/passenger/{passengerId}")
    public ResponseEntity<List<Payment>> getPassengerPayments(@PathVariable Long passengerId) {
        List<Payment> payments = paymentService.getPassengerPayments(passengerId);
        return ResponseEntity.ok(payments);
    }

    /**
     * Get all payments for a driver
     * GET /api/payments/driver/{driverId}
     */
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<Payment>> getDriverPayments(@PathVariable Long driverId) {
        List<Payment> payments = paymentService.getDriverPayments(driverId);
        return ResponseEntity.ok(payments);
    }

    /**
     * Get driver earnings
     * GET /api/payments/driver/{driverId}/earnings
     */
    @GetMapping("/driver/{driverId}/earnings")
    public ResponseEntity<?> getDriverEarnings(@PathVariable Long driverId) {
        Double earnings = paymentService.getDriverEarnings(driverId);
        return ResponseEntity.ok(Map.of("totalEarnings", earnings));
    }

    /**
     * Get passenger spending
     * GET /api/payments/passenger/{passengerId}/spending
     */
    @GetMapping("/passenger/{passengerId}/spending")
    public ResponseEntity<?> getPassengerSpending(@PathVariable Long passengerId) {
        Double spending = paymentService.getPassengerSpending(passengerId);
        return ResponseEntity.ok(Map.of("totalSpending", spending));
    }

    /**
     * Process refund
     * POST /api/payments/refund
     */
    @PostMapping("/refund")
    public ResponseEntity<?> processRefund(@RequestBody Map<String, Object> refundRequest) {
        try {
            Long paymentId = Long.valueOf(refundRequest.get("paymentId").toString());
            Double refundAmount = Double.valueOf(refundRequest.get("refundAmount").toString());

            Payment payment = paymentService.processRefund(paymentId, refundAmount);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Refund processed successfully",
                "payment", payment
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                        "success", false,
                        "error", e.getMessage()
                    ));
        }
    }

    /**
     * Get payment statistics for passenger
     * GET /api/payments/passenger/{passengerId}/stats
     */
    @GetMapping("/passenger/{passengerId}/stats")
    public ResponseEntity<?> getPassengerStats(@PathVariable Long passengerId) {
        Map<String, Object> stats = paymentService.getPassengerPaymentStats(passengerId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get payment statistics for driver
     * GET /api/payments/driver/{driverId}/stats
     */
    @GetMapping("/driver/{driverId}/stats")
    public ResponseEntity<?> getDriverStats(@PathVariable Long driverId) {
        Map<String, Object> stats = paymentService.getDriverPaymentStats(driverId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get Razorpay key for frontend
     * GET /api/payments/razorpay-key
     */
    @GetMapping("/razorpay-key")
    public ResponseEntity<?> getRazorpayKey() {
        String key = paymentService.getRazorpayKey();
        return ResponseEntity.ok(Map.of("key", key));
    }
}
