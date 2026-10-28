import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const PaymentModal = ({ isOpen, onClose, bookingDetails, onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchRazorpayKey();
    }
  }, [isOpen]);

  const fetchRazorpayKey = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/payments/razorpay-key');
      setRazorpayKey(response.data.key);
    } catch (error) {
      console.error('Failed to fetch Razorpay key:', error);
      toast.error('❌ Failed to initialize payment gateway');
    }
  };

  const handlePayment = async () => {
    if (!bookingDetails || !bookingDetails.id) {
      toast.error('❌ Invalid booking details');
      return;
    }

    setLoading(true);

    try {
      // Create Razorpay order
      const orderResponse = await axios.post(
        'http://localhost:8080/api/payments/create-order',
        { bookingId: bookingDetails.id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const orderData = orderResponse.data;
      setOrderDetails(orderData);

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        openRazorpayCheckout(orderData);
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error('Payment initiation failed:', error);
      toast.error('❌ Failed to initiate payment');
      setLoading(false);
    }
  };

  const openRazorpayCheckout = (orderData) => {
    const options = {
      key: razorpayKey,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'ShareWay',
      description: `Payment for Booking #${orderData.bookingId}`,
      order_id: orderData.orderId,
      handler: async function (response) {
        await verifyPayment(response);
      },
      prefill: {
        name: bookingDetails.passengerName || '',
        email: bookingDetails.passengerEmail || '',
        contact: bookingDetails.passengerPhone || ''
      },
      theme: {
        color: '#004E89'
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
          toast.info('💳 Payment cancelled');
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', function (response) {
      handlePaymentFailure(response.error);
    });
    razorpay.open();
    setLoading(false);
  };

  const verifyPayment = async (paymentResponse) => {
    try {
      console.log('🔐 ========== PAYMENT VERIFICATION STARTED ==========');
      console.log('Payment Response:', paymentResponse);
      
      const verifyResponse = await axios.post(
        'http://localhost:8080/api/payments/verify',
        {
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log('✅ Verification Response Status:', verifyResponse.status);
      console.log('✅ Verification Response Data:', verifyResponse.data);

      // Check if response is successful (status 200)
      if (verifyResponse.status === 200 && verifyResponse.data) {
        // Check if backend says success
        if (verifyResponse.data.success === true) {
          console.log('✅ ========== PAYMENT VERIFIED SUCCESSFULLY ==========');
          
          // Call parent success handler (which will show toast)
          if (onPaymentSuccess) {
            onPaymentSuccess(verifyResponse.data.payment);
          }
          
          onClose();
        } else {
          // Backend returned success: false
          console.error('❌ Backend verification failed:', verifyResponse.data);
          toast.error(`❌ ${verifyResponse.data.message || 'Payment verification failed'}`, {
            position: 'top-center',
            autoClose: 5000
          });
        }
      } else {
        console.error('❌ Unexpected response status:', verifyResponse.status);
        toast.error('❌ Unexpected response from server', {
          position: 'top-center',
          autoClose: 5000
        });
      }
    } catch (error) {
      console.error('❌ ========== PAYMENT VERIFICATION ERROR ==========');
      console.error('Error:', error);
      console.error('Error Response:', error.response);
      console.error('Error Response Data:', error.response?.data);
      console.error('Error Response Status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Payment verification failed';
      
      toast.error(`❌ ${errorMessage}`, {
        position: 'top-center',
        autoClose: 5000
      });
    }
  };

  const handlePaymentFailure = async (error) => {
    try {
      await axios.post(
        'http://localhost:8080/api/payments/failure',
        {
          razorpay_order_id: orderDetails?.orderId,
          reason: error.description || 'Payment failed'
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      toast.error(`❌ Payment failed: ${error.description}`);
    } catch (err) {
      console.error('Failed to record payment failure:', err);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="payment-modal-overlay" onClick={onClose}>
        <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={onClose}>×</button>
          
          <div className="payment-header">
            <div className="payment-icon">💳</div>
            <h2>Confirm Payment</h2>
            <p>Complete your booking payment</p>
          </div>

          <div className="payment-summary">
            <h3>📋 Booking Summary</h3>
            <div className="summary-card">
              <div className="summary-row">
                <span className="label">Booking ID:</span>
                <span className="value">#{bookingDetails?.id}</span>
              </div>
              <div className="summary-row">
                <span className="label">From:</span>
                <span className="value">{bookingDetails?.source}</span>
              </div>
              <div className="summary-row">
                <span className="label">To:</span>
                <span className="value">{bookingDetails?.destination}</span>
              </div>
              <div className="summary-row">
                <span className="label">Date & Time:</span>
                <span className="value">{bookingDetails?.scheduledTime}</span>
              </div>
              <div className="summary-row">
                <span className="label">Driver:</span>
                <span className="value">{bookingDetails?.driverName}</span>
              </div>
              <div className="summary-row">
                <span className="label">Vehicle:</span>
                <span className="value">{bookingDetails?.vehicleType}</span>
              </div>
            </div>

            <div className="fare-breakdown">
              <h3>💰 Fare Breakdown</h3>
              <div className="breakdown-card">
                <div className="breakdown-row">
                  <span>Base Fare:</span>
                  <span>₹{bookingDetails?.baseFare?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="breakdown-row">
                  <span>Distance ({bookingDetails?.distance?.toFixed(2)} km):</span>
                  <span>₹{bookingDetails?.distanceFare?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="breakdown-row">
                  <span>Time ({bookingDetails?.duration} min):</span>
                  <span>₹{bookingDetails?.timeFare?.toFixed(2) || '0.00'}</span>
                </div>
                {bookingDetails?.surgeMultiplier > 1 && (
                  <div className="breakdown-row surge">
                    <span>Surge ({bookingDetails.surgeMultiplier}x):</span>
                    <span>₹{bookingDetails?.surgeFare?.toFixed(2) || '0.00'}</span>
                  </div>
                )}
                <div className="breakdown-row total">
                  <span>Total Amount:</span>
                  <span>₹{bookingDetails?.totalFare?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="payment-actions">
            <button 
              className="cancel-btn" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="pay-btn" 
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                <>
                  💳 Pay ₹{bookingDetails?.totalFare?.toFixed(2) || '0.00'}
                </>
              )}
            </button>
          </div>

          <div className="payment-footer">
            <div className="security-badge">
              <span className="lock-icon">🔒</span>
              <span>Secured by Razorpay</span>
            </div>
            <p className="payment-note">
              Your payment information is encrypted and secure
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .payment-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease-out;
          backdrop-filter: blur(5px);
        }

        .payment-modal {
          background: white;
          border-radius: 20px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          animation: slideUp 0.4s ease-out;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.1);
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          z-index: 10;
        }

        .close-btn:hover {
          background: rgba(0, 0, 0, 0.2);
          transform: rotate(90deg);
        }

        .payment-header {
          background: linear-gradient(135deg, #004E89 0%, #0083b0 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
          border-radius: 20px 20px 0 0;
        }

        .payment-icon {
          font-size: 60px;
          margin-bottom: 15px;
          animation: bounce 2s ease-in-out infinite;
        }

        .payment-header h2 {
          margin: 10px 0;
          font-size: 28px;
          font-weight: 800;
        }

        .payment-header p {
          margin: 5px 0 0 0;
          opacity: 0.9;
          font-size: 16px;
        }

        .payment-summary {
          padding: 30px;
        }

        .payment-summary h3 {
          color: #333;
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .summary-card, .breakdown-card {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 25px;
        }

        .summary-row, .breakdown-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .summary-row:last-child, .breakdown-row:last-child {
          border-bottom: none;
        }

        .summary-row .label {
          color: #666;
          font-weight: 600;
        }

        .summary-row .value {
          color: #333;
          font-weight: 500;
          text-align: right;
        }

        .breakdown-row {
          font-size: 15px;
        }

        .breakdown-row.surge {
          color: #ff6b6b;
          font-weight: 600;
        }

        .breakdown-row.total {
          border-top: 2px solid #004E89;
          padding-top: 15px;
          margin-top: 10px;
          font-size: 20px;
          font-weight: 800;
          color: #004E89;
        }

        .payment-actions {
          display: flex;
          gap: 15px;
          padding: 0 30px 30px 30px;
        }

        .cancel-btn, .pay-btn {
          flex: 1;
          padding: 15px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .cancel-btn {
          background: #f0f0f0;
          color: #666;
        }

        .cancel-btn:hover:not(:disabled) {
          background: #e0e0e0;
          transform: translateY(-2px);
        }

        .pay-btn {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        }

        .pay-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
        }

        .pay-btn:disabled, .cancel-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .payment-footer {
          background: #f8f9fa;
          padding: 20px 30px;
          border-radius: 0 0 20px 20px;
          text-align: center;
        }

        .security-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: white;
          padding: 10px 20px;
          border-radius: 25px;
          font-weight: 600;
          color: #28a745;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 10px;
        }

        .lock-icon {
          font-size: 18px;
        }

        .payment-note {
          color: #666;
          font-size: 12px;
          margin: 10px 0 0 0;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .payment-modal {
            width: 95%;
            max-height: 95vh;
          }

          .payment-header {
            padding: 30px 20px;
          }

          .payment-summary {
            padding: 20px;
          }

          .payment-actions {
            flex-direction: column;
            padding: 0 20px 20px 20px;
          }
        }
      `}</style>
    </>
  );
};

export default PaymentModal;
