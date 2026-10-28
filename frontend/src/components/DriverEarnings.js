import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const DriverEarnings = ({ driverId }) => {
  const [earnings, setEarnings] = useState(0);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = React.useContext(AuthContext);

  useEffect(() => {
    if (driverId) {
      fetchDriverEarnings();
      fetchDriverPayments();
      fetchDriverStats();
    }
  }, [driverId]);

  const fetchDriverEarnings = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/payments/driver/${driverId}/earnings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEarnings(response.data.totalEarnings || 0);
    } catch (error) {
      console.error('Failed to fetch driver earnings:', error);
      toast.error('❌ Failed to load earnings');
    }
  };

  const fetchDriverPayments = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/payments/driver/${driverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to fetch driver payments:', error);
      toast.error('❌ Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverStats = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/payments/driver/${driverId}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch driver stats:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS': return '✅';
      case 'PENDING': return '⏳';
      case 'FAILED': return '❌';
      case 'REFUNDED': return '🔄';
      default: return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS': return '#28a745';
      case 'PENDING': return '#ffc107';
      case 'FAILED': return '#dc3545';
      case 'REFUNDED': return '#004E89';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="driver-earnings">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading earnings...</p>
        </div>
        <style jsx>{`
          .driver-earnings {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
          }
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            color: #004E89;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #004E89;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="driver-earnings">
      <div className="earnings-header">
        <h2>💰 Driver Earnings</h2>
        <button onClick={() => { fetchDriverEarnings(); fetchDriverPayments(); fetchDriverStats(); }} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      <div className="earnings-overview">
        <div className="total-earnings-card">
          <div className="earnings-icon">💰</div>
          <div className="earnings-content">
            <span className="earnings-label">Total Earnings</span>
            <span className="earnings-amount">₹{earnings.toFixed(2)}</span>
          </div>
        </div>

        {stats && (
          <div className="earnings-stats">
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <span className="stat-value">{stats.successfulPayments || 0}</span>
                <span className="stat-label">Successful Rides</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <span className="stat-value">{payments.length}</span>
                <span className="stat-label">Total Rides</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <span className="stat-value">₹{(earnings / Math.max(payments.length, 1)).toFixed(2)}</span>
                <span className="stat-label">Avg per Ride</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="payments-section">
        <h3>📋 Payment History</h3>
        <div className="payments-list">
          {payments.length === 0 ? (
            <div className="no-payments">
              <div className="no-payments-icon">💳</div>
              <h3>No payments yet</h3>
              <p>Your earnings will appear here after completing rides</p>
            </div>
          ) : (
            payments.map((payment, index) => (
              <div key={payment.id} className="payment-card" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="payment-card-header">
                  <div className="payment-info">
                    <span className="payment-id">Payment #{payment.id}</span>
                    <span className="booking-id">Booking #{payment.booking?.id || 'N/A'}</span>
                  </div>
                  <div className="payment-status" style={{color: getStatusColor(payment.paymentStatus)}}>
                    <span className="status-icon">{getStatusIcon(payment.paymentStatus)}</span>
                    <span className="status-text">{payment.paymentStatus}</span>
                  </div>
                </div>

                <div className="payment-details">
                  <div className="amount-section">
                    <span className="amount-label">Earning</span>
                    <span className="amount-value">₹{payment.amount?.toFixed(2)}</span>
                  </div>
                  
                  <div className="payment-info-grid">
                    <div className="info-item">
                      <span className="info-label">Date:</span>
                      <span className="info-value">{formatDate(payment.paymentDate)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Passenger:</span>
                      <span className="info-value">{payment.passenger?.name || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Transaction ID:</span>
                      <span className="info-value">{payment.transactionId || 'N/A'}</span>
                    </div>
                    {payment.description && (
                      <div className="info-item full-width">
                        <span className="info-label">Description:</span>
                        <span className="info-value">{payment.description}</span>
                      </div>
                    )}
                  </div>

                  {payment.paymentStatus === 'FAILED' && payment.failureReason && (
                    <div className="failure-reason">
                      <span className="failure-label">❌ Failure Reason:</span>
                      <span className="failure-text">{payment.failureReason}</span>
                    </div>
                  )}

                  {payment.paymentStatus === 'REFUNDED' && (
                    <div className="refund-info">
                      <span className="refund-label">🔄 Refunded:</span>
                      <span className="refund-amount">₹{payment.refundAmount?.toFixed(2)}</span>
                      <span className="refund-date">on {formatDate(payment.refundDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .driver-earnings {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .earnings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          border-radius: 15px;
          color: white;
          box-shadow: 0 10px 30px rgba(40, 167, 69, 0.3);
        }

        .earnings-header h2 {
          margin: 0;
          font-size: 28px;
          font-weight: 800;
        }

        .refresh-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
          backdrop-filter: blur(10px);
        }

        .refresh-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .earnings-overview {
          margin-bottom: 40px;
        }

        .total-earnings-card {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          border-radius: 20px;
          padding: 30px;
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
          box-shadow: 0 15px 40px rgba(40, 167, 69, 0.3);
          color: white;
        }

        .earnings-icon {
          font-size: 60px;
          flex-shrink: 0;
        }

        .earnings-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .earnings-label {
          font-size: 18px;
          font-weight: 600;
          opacity: 0.9;
        }

        .earnings-amount {
          font-size: 48px;
          font-weight: 900;
          line-height: 1;
        }

        .earnings-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
          border: 2px solid transparent;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          border-color: #28a745;
          box-shadow: 0 15px 40px rgba(40, 167, 69, 0.2);
        }

        .stat-icon {
          font-size: 32px;
          flex-shrink: 0;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 900;
          color: #28a745;
          line-height: 1;
        }

        .stat-label {
          font-size: 12px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .payments-section h3 {
          color: #333;
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 20px;
          padding-left: 10px;
        }

        .payments-list {
          display: grid;
          gap: 20px;
        }

        .no-payments {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 20px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 20px;
          animation: fadeIn 0.5s ease-out;
        }

        .no-payments-icon {
          font-size: 80px;
          margin-bottom: 20px;
          animation: bounce 2s ease-in-out infinite;
        }

        .no-payments h3 {
          color: #333;
          font-size: 24px;
          margin: 10px 0;
        }

        .no-payments p {
          color: #666;
          font-size: 16px;
        }

        .payment-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 2px solid transparent;
          animation: slideUp 0.6s ease-out backwards;
          position: relative;
          overflow: hidden;
        }

        .payment-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(40, 167, 69, 0.1), transparent);
          transition: left 0.5s;
        }

        .payment-card:hover::before {
          left: 100%;
        }

        .payment-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 20px 60px rgba(40, 167, 69, 0.3);
          border-color: #28a745;
        }

        .payment-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }

        .payment-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .payment-id {
          font-size: 16px;
          font-weight: 800;
          color: #28a745;
        }

        .booking-id {
          font-size: 12px;
          color: #666;
        }

        .payment-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
        }

        .status-icon {
          font-size: 18px;
        }

        .status-text {
          font-size: 14px;
        }

        .payment-details {
          display: grid;
          gap: 15px;
        }

        .amount-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          padding: 15px 20px;
          border-radius: 12px;
        }

        .amount-label {
          font-size: 16px;
          font-weight: 600;
        }

        .amount-value {
          font-size: 24px;
          font-weight: 900;
        }

        .payment-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .info-item.full-width {
          grid-column: 1 / -1;
        }

        .info-label {
          font-size: 12px;
          color: #666;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 14px;
          color: #333;
          font-weight: 500;
          word-break: break-all;
        }

        .failure-reason {
          background: #f8d7da;
          color: #721c24;
          padding: 12px;
          border-radius: 8px;
          border-left: 4px solid #dc3545;
          margin-top: 10px;
        }

        .failure-label {
          font-weight: 700;
          margin-right: 8px;
        }

        .failure-text {
          font-size: 14px;
        }

        .refund-info {
          background: #d1ecf1;
          color: #0c5460;
          padding: 12px;
          border-radius: 8px;
          border-left: 4px solid #004E89;
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .refund-label {
          font-weight: 700;
        }

        .refund-amount {
          font-weight: 800;
          font-size: 16px;
        }

        .refund-date {
          font-size: 12px;
          opacity: 0.8;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};

export default DriverEarnings;
