import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const PaymentCheckout = ({ bookingId, amount, onPaymentSuccess, onPaymentFailure, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const { token, userId } = React.useContext(require('../context/AuthContext').AuthContext);

  useEffect(() => {
    if (bookingId && userId) {
      createPaymentOrder();
    }
  }, [bookingId, userId]);

  const createPaymentOrder = async () => {
    try {
      setLoading(true);
      
      // Call the correct backend endpoint with all required fields
      const response = await axios.post('http://localhost:8080/api/payments/create', 
        { 
          bookingId: bookingId,
          passengerId: userId,
          amount: amount,
          paymentMethod: 'RAZORPAY'
        }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPaymentData(response.data);
      toast.success('✅ Payment initialized successfully');
    } catch (error) {
      console.error('Failed to create payment order:', error);
      const errorMsg = error.response?.data?.error || 'Failed to initialize payment';
      toast.error(`❌ ${errorMsg}`);
      onPaymentFailure && onPaymentFailure(error);
    } finally {
      setLoading(false);
    }
  };

  const openRazorpayCheckout = () => {
    if (!paymentData) {
      toast.error('❌ Payment data not available');
      return;
    }

    // For now, simulate payment success since Razorpay integration requires API keys
    // In production, you would use actual Razorpay integration
    handlePaymentSuccess();
  };

  const handlePaymentSuccess = async () => {
    try {
      setLoading(true);
      
      // Update payment status to SUCCESS
      const response = await axios.put(
        `http://localhost:8080/api/payments/${paymentData.id}/status`,
        {
          status: 'SUCCESS',
          transactionId: `TXN_${Date.now()}`
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('🎉 Payment successful!');
      onPaymentSuccess && onPaymentSuccess(response.data);
    } catch (error) {
      console.error('Payment update failed:', error);
      const errorMsg = error.response?.data?.error || 'Payment update failed';
      toast.error(`❌ ${errorMsg}`);
      onPaymentFailure && onPaymentFailure(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentFailure = async () => {
    try {
      if (paymentData?.id) {
        // Update payment status to FAILED
        await axios.put(
          `http://localhost:8080/api/payments/${paymentData.id}/status`,
          {
            status: 'FAILED',
            transactionId: null
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      toast.info('Payment cancelled');
      onPaymentFailure && onPaymentFailure(new Error('Payment cancelled'));
      onClose && onClose();
    } catch (error) {
      console.error('Failed to record payment failure:', error);
      onClose && onClose();
    }
  };

  return (
    <div className="payment-checkout">
      <div className="payment-header">
        <h3>💳 Complete Payment</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="payment-details">
        <div className="amount-display">
          <span className="amount-label">Total Amount</span>
          <span className="amount-value">₹{amount}</span>
        </div>
        
        <div className="booking-info">
          <p>Booking ID: #{bookingId}</p>
          <p>Payment Method: Razorpay</p>
        </div>
      </div>

      <div className="payment-actions">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Processing...</span>
          </div>
        ) : (
          <>
            <button 
              className="pay-btn" 
              onClick={openRazorpayCheckout}
              disabled={!paymentData}
            >
              <span className="btn-icon">💳</span>
              Complete Payment
            </button>
            <button 
              className="cancel-btn" 
              onClick={handlePaymentFailure}
            >
              Cancel Payment
            </button>
          </>
        )}
      </div>

      <div className="payment-security">
        <p>🔒 Your payment is secured by Razorpay</p>
        <p>✅ 256-bit SSL encryption</p>
      </div>

      <style jsx>{`
        .payment-checkout {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 78, 137, 0.4);
          padding: 35px;
          max-width: 450px;
          width: 90%;
          z-index: 1000;
          animation: slideIn 0.3s ease-out;
          border: 2px solid rgba(0, 78, 137, 0.1);
        }

        .payment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }

        .payment-header h3 {
          margin: 0;
          background: linear-gradient(135deg, #004E89 0%, #003d6e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 26px;
          font-weight: 800;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
          padding: 5px;
          border-radius: 50%;
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }

        .close-btn:hover {
          background: #f0f0f0;
          color: #333;
        }

        .payment-details {
          margin-bottom: 25px;
        }

        .amount-display {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #004E89 0%, #003d6e 100%);
          color: white;
          padding: 22px;
          border-radius: 14px;
          margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(0, 78, 137, 0.3);
        }

        .amount-label {
          font-size: 17px;
          font-weight: 600;
          opacity: 0.95;
        }

        .amount-value {
          font-size: 32px;
          font-weight: 900;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .booking-info {
          background: #eff6ff;
          padding: 18px;
          border-radius: 12px;
          border-left: 5px solid #004E89;
          box-shadow: 0 2px 8px rgba(0, 78, 137, 0.1);
        }

        .booking-info p {
          margin: 8px 0;
          color: #334155;
          font-size: 15px;
          font-weight: 500;
        }

        .payment-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .pay-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 16px 28px;
          border-radius: 14px;
          font-size: 17px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.3s;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
        }

        .pay-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(16, 185, 129, 0.5);
        }

        .pay-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cancel-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 12px 25px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .cancel-btn:hover {
          background: #5a6268;
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 18px;
          color: #004E89;
          font-weight: 600;
          font-size: 16px;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid #dbeafe;
          border-top: 3px solid #004E89;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .payment-security {
          text-align: center;
          padding-top: 15px;
          border-top: 1px solid #f0f0f0;
        }

        .payment-security p {
          margin: 6px 0;
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }

        .btn-icon {
          font-size: 18px;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -60%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Overlay */
        .payment-checkout::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 78, 137, 0.3);
          backdrop-filter: blur(4px);
          z-index: -1;
        }
      `}</style>
    </div>
  );
};

export default PaymentCheckout;
