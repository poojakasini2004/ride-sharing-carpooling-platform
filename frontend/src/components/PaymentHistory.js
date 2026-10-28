import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const PaymentHistory = ({ passengerId }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const { token } = React.useContext(AuthContext);

  useEffect(() => {
    if (passengerId) {
      fetchPaymentHistory();
      fetchPaymentStats();
    }
  }, [passengerId]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching payment history...');
      console.log('Passenger ID:', passengerId);
      console.log('Token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        console.warn('⚠️ No token available');
        setPayments([]);
        return;
      }
      
      if (!passengerId) {
        console.warn('⚠️ No passenger ID available');
        setPayments([]);
        return;
      }
      
      const url = `http://localhost:8080/api/payments/passenger/${passengerId}`;
      console.log('📡 Fetching from:', url);
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Payment history response:', response.data);
      console.log('📊 Number of payments:', response.data.length);
      setPayments(response.data);
    } catch (error) {
      console.error('❌ Failed to fetch payment history:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 403) {
        console.warn('🔒 Payment history access forbidden - may need authentication');
        setPayments([]);
      } else if (error.response?.status === 404) {
        console.warn('📭 No payments found for this passenger');
        setPayments([]);
      } else {
        toast.error('❌ Failed to load payment history');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      console.log('📊 Fetching payment stats...');
      if (!token) {
        console.warn('⚠️ No token for stats');
        return;
      }
      if (!passengerId) {
        console.warn('⚠️ No passenger ID for stats');
        return;
      }
      
      const url = `http://localhost:8080/api/payments/passenger/${passengerId}/stats`;
      console.log('📡 Fetching stats from:', url);
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Payment stats response:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('❌ Failed to fetch payment stats:', error);
      console.error('Stats error response:', error.response?.data);
      if (error.response?.status === 403) {
        console.warn('🔒 Payment stats access forbidden');
      }
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
      <div className="payment-history">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading payment history...</p>
        </div>
        <style jsx>{`
          .payment-history {
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
    <div className="payment-history">
      <div className="payment-header">
        <h2>💳 Payment History</h2>
        <button onClick={fetchPaymentHistory} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {stats && (
        <div className="payment-stats">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <span className="stat-value">₹{stats.totalSpending?.toFixed(2) || '0.00'}</span>
              <span className="stat-label">Total Spent</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <span className="stat-value">{stats.successfulPayments || 0}</span>
              <span className="stat-label">Successful Payments</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <span className="stat-value">{payments.length}</span>
              <span className="stat-label">Total Transactions</span>
            </div>
          </div>
        </div>
      )}

      <div className="payments-list">
        {payments.length === 0 ? (
          <div className="no-payments">
            <div className="no-payments-icon">💳</div>
            <h3>No payments yet</h3>
            <p>Your payment history will appear here after booking rides</p>
          </div>
        ) : (
          payments.map((payment, index) => (
            <div key={payment.id} className="payment-card" style={{animationDelay: `${index * 0.1}s`}}>
              <div className="payment-card-header">
                <div className="payment-id">
                  <span className="id-label">Payment #</span>
                  <span className="id-value">{payment.id}</span>
                </div>
                <div className="payment-status" style={{color: getStatusColor(payment.paymentStatus)}}>
                  <span className="status-icon">{getStatusIcon(payment.paymentStatus)}</span>
                  <span className="status-text">{payment.paymentStatus}</span>
                </div>
              </div>

              <div className="payment-details">
                <div className="amount-section">
                  <span className="amount-label">Amount</span>
                  <span className="amount-value">₹{payment.amount?.toFixed(2)}</span>
                </div>
                
                <div className="payment-info">
                  <div className="info-row">
                    <span className="info-label">Date:</span>
                    <span className="info-value">{formatDate(payment.paymentDate)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Method:</span>
                    <span className="info-value">{payment.paymentMethod || 'Razorpay'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Transaction ID:</span>
                    <span className="info-value">{payment.transactionId || 'N/A'}</span>
                  </div>
                  {payment.description && (
                    <div className="info-row">
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

      <style jsx>{`
        .payment-history {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .payment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #004E89 0%, #003d6e 100%);
          border-radius: 15px;
          color: white;
          box-shadow: 0 10px 30px rgba(0, 78, 137, 0.3);
        }

        .payment-header h2 {
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

        .payment-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
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
          border-color: #004E89;
          box-shadow: 0 15px 40px rgba(0, 78, 137, 0.2);
        }

        .stat-icon {
          font-size: 36px;
          flex-shrink: 0;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 900;
          color: #004E89;
          line-height: 1;
        }

        .stat-label {
          font-size: 12px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
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
          background: linear-gradient(90deg, transparent, rgba(0, 78, 137, 0.1), transparent);
          transition: left 0.5s;
        }

        .payment-card:hover::before {
          left: 100%;
        }

        .payment-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 20px 60px rgba(0, 78, 137, 0.3);
          border-color: #004E89;
        }

        .payment-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }

        .payment-id {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .id-label {
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .id-value {
          font-size: 18px;
          font-weight: 800;
          color: #004E89;
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
          background: linear-gradient(135deg, #004E89 0%, #003d6e 100%);
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

        .payment-info {
          display: grid;
          gap: 10px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .info-label {
          font-size: 14px;
          color: #666;
          font-weight: 600;
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

export default PaymentHistory;
