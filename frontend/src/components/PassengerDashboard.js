import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import PaymentHistory from './PaymentHistory';
import NotificationPanel from './NotificationPanel';
import ReviewModal from './ReviewModal';

const PassengerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigate = useNavigate();
  const { token, userId, user } = React.useContext(AuthContext);

  // Debug: Log user data
  useEffect(() => {
    console.log('PassengerDashboard - User data:', user);
    console.log('PassengerDashboard - UserId:', userId);
    console.log('PassengerDashboard - Token:', token ? 'Present' : 'Missing');
  }, [user, userId, token]);

  const formatDateTime = (datetime) => {
    if (!datetime) return 'N/A';
    if (typeof datetime === 'string') {
      return new Date(datetime).toLocaleString();
    }
    if (Array.isArray(datetime)) {
      const [year, month, day, hour, min, sec] = datetime;
      const date = new Date(year, month - 1, day, hour, min, sec);
      return date.toLocaleString();
    }
    return 'N/A';
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching data at:', new Date().toLocaleTimeString());
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('UserId:', userId);
      
      // Fetch available rides (no auth required) - add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const ridesResponse = await axios.get(`http://localhost:8080/api/rides/available?t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      console.log('✅ Available rides count:', ridesResponse.data.length);
      console.log('📊 Available rides:', ridesResponse.data);
      
      // Filter out rides with 0 available seats
      const availableRides = ridesResponse.data.filter(ride => ride.availableSeats > 0);
      console.log('🎯 Filtered available rides:', availableRides.length);
      setRides(availableRides);

      // Fetch bookings only if userId is available
      if (userId && userId !== 'undefined') {
        // Don't send Authorization header since /api/bookings is a public endpoint
        const bookingsResponse = await axios.get(`http://localhost:8080/api/bookings/passenger/${userId}?t=${timestamp}`, {
          headers: { 
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        console.log('✅ Bookings count:', bookingsResponse.data.length);
        setBookings(bookingsResponse.data);
      }
    } catch (err) {
      console.error('❌ Failed to fetch data', err);
      console.error('Error details:', err.response?.data || err.message);
      
      // Handle 403 - token expired or invalid
      if (err.response?.status === 403) {
        toast.error('🔒 Session expired. Please login again.');
        localStorage.clear();
        navigate('/login');
        return;
      }
      
      toast.error('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && userId) fetchData();
  }, [token, userId]);

  // Auto-refresh when tab becomes active
  useEffect(() => {
    if (activeTab === 'available') {
      fetchData();
    }
  }, [activeTab]);

  // Auto-refresh available rides every 30 seconds when on available tab
  useEffect(() => {
    let intervalId;
    if (activeTab === 'available') {
      intervalId = setInterval(() => {
        console.log('🔄 Auto-refreshing available rides...');
        fetchData();
      }, 30000); // 30 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeTab]);

  const handleCancel = async (bookingId) => {
    try {
      // Don't send Authorization header since /api/bookings is a public endpoint
      await axios.put(`http://localhost:8080/api/bookings/${bookingId}/cancel`, {});
      toast.success('✅ Booking cancelled successfully');
      // Refresh bookings
      const bookingsResponse = await axios.get(`http://localhost:8080/api/bookings/passenger/${userId}`);
      setBookings(bookingsResponse.data);
    } catch (err) {
      console.error('Failed to cancel booking', err);
      toast.error('❌ Failed to cancel booking');
    }
  };
  const handleFeedback = async (bookingId, rating, feedback) => {
    try {
      // Don't send Authorization header since /api/bookings is a public endpoint
      await axios.put(`http://localhost:8080/api/bookings/${bookingId}/feedback`, { rating, feedback });
      toast.success('⭐ Thank you for your feedback!');
      // Refresh bookings
      const bookingsResponse = await axios.get(`http://localhost:8080/api/bookings/passenger/${userId}`);
      setBookings(bookingsResponse.data);
    } catch (err) {
      console.error('Failed to submit feedback', err);
      toast.error('❌ Failed to submit feedback');
    }
  };

  // Manual trigger for completing expired rides
  const triggerRideCompletion = async () => {
    try {
      console.log('🔄 Manually triggering ride completion...');
      const response = await axios.post('http://localhost:8080/api/rides/complete-expired');
      console.log('✅ Completion response:', response.data);
      toast.success(`✅ ${response.data.message}`);
      // Refresh data after completion
      await fetchData();
    } catch (err) {
      console.error('❌ Failed to trigger completion:', err);
      toast.error('❌ Failed to complete expired rides');
    }
  };

  const upcomingBookings = bookings.filter(b => b.status === 'BOOKED');
  const pastBookings = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED');

  return (
    <div className="dashboard">
      <h2>Passenger Dashboard 
        <button onClick={fetchData} style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#004E89', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Refresh</button>
        <button onClick={triggerRideCompletion} style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} title="Complete expired rides">⚡ Update Status</button>
      </h2>
      <div className="tabs">
        <button className={activeTab === 'upcoming' ? 'active' : ''} onClick={() => setActiveTab('upcoming')}>Upcoming Rides</button>
        <button className={activeTab === 'past' ? 'active' : ''} onClick={() => setActiveTab('past')}>Past Rides</button>
        <button className={activeTab === 'available' ? 'active' : ''} onClick={() => setActiveTab('available')}>Available Rides</button>
        <button className={activeTab === 'payments' ? 'active' : ''} onClick={() => setActiveTab('payments')}>Payment History</button>
        <button className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>Notifications</button>
        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>Profile</button>
      </div>
      <style jsx>{`
        .dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .tabs {
          display: flex;
          margin-bottom: 20px;
          border-bottom: 1px solid #ddd;
        }
        .tabs button {
          padding: 10px 20px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 16px;
          border-bottom: 2px solid transparent;
          transition: all 0.3s;
        }
        .tabs button.active {
          border-bottom: 3px solid #004E89;
          color: #004E89;
          font-weight: 800;
        }
        .tabs button:hover {
          background-color: rgba(0, 78, 137, 0.05);
          color: #004E89;
        }
        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .rides-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          background: #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: box-shadow 0.3s;
        }
        .card:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        .card p {
          margin: 5px 0;
        }
        .card button {
          margin-top: 10px;
          padding: 8px 16px;
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .card button:hover {
          background-color: #c82333;
        }
        .btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #0066CC 0%, #004E89 100%);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          margin-bottom: 20px;
          font-weight: 700;
          transition: all 0.3s;
          box-shadow: 0 8px 24px rgba(0, 102, 204, 0.4);
        }
        .btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0, 102, 204, 0.5);
        }
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #004E89;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 40px auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .results-header {
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
        .results-header h3 {
          margin: 0;
          font-size: 28px;
          font-weight: 800;
        }
        .results-count {
          background: rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          backdrop-filter: blur(10px);
        }
        .no-rides {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 20px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 20px;
          animation: fadeIn 0.5s ease-out;
        }
        .no-rides-icon {
          font-size: 80px;
          margin-bottom: 20px;
          animation: bounce 2s ease-in-out infinite;
        }
        .no-rides h3 {
          color: #333;
          font-size: 24px;
          margin: 10px 0;
        }
        .no-rides p {
          color: #666;
          font-size: 16px;
        }
        .ride-card {
          background: white;
          border-radius: 10px;
          padding: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
          border: 1px solid #e5e7eb;
          animation: slideUp 0.6s ease-out backwards;
          position: relative;
          overflow: hidden;
        }
        .ride-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 78, 137, 0.1), transparent);
          transition: left 0.5s;
        }
        .ride-card:hover::before {
          left: 100%;
        }
        .ride-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 78, 137, 0.15);
          border-color: #004E89;
        }
        .ride-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid #f0f0f0;
        }
        .vehicle-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          padding: 4px 10px;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-size: 11px;
        }
        .vehicle-icon {
          font-size: 16px;
        }
        .vehicle-type {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .price-badge {
          display: flex;
          align-items: baseline;
          gap: 3px;
          background: linear-gradient(135deg, #E8F4F8 0%, #D0E8F2 100%);
          padding: 4px 10px;
          border-radius: 12px;
          box-shadow: 0 1px 4px rgba(6, 182, 212, 0.12);
          border: 1px solid #06b6d4;
        }
        .price-label {
          font-size: 11px;
          font-weight: 600;
          color: #0891b2;
        }
        .price-value {
          font-size: 14px;
          font-weight: 700;
          color: #0891b2;
        }
        .ride-route {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 8px 0;
          padding: 8px;
          background: linear-gradient(135deg, #F8FAFB 0%, #E8F4F8 100%);
          border-radius: 8px;
          border: 1px solid #D0E8F2;
        }
        .route-point {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }
        .route-icon {
          font-size: 18px;
          flex-shrink: 0;
        }
        .route-details {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .route-label {
          font-size: 10px;
          color: #666;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .route-location {
          font-size: 13px;
          color: #333;
          font-weight: 700;
        }
        .route-line {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .route-arrow {
          font-size: 18px;
          color: #004E89;
          font-weight: bold;
          animation: slideRight 1.5s ease-in-out infinite;
        }
        .ride-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 8px;
          margin: 10px 0;
        }
        .info-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px;
          background: white;
          border-radius: 8px;
          border: 1px solid #f0f0f0;
          transition: all 0.3s;
        }
        .info-item:hover {
          border-color: #004E89;
          transform: scale(1.02);
        }
        .info-icon {
          font-size: 16px;
          flex-shrink: 0;
        }
        .info-content {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .info-label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .info-value {
          font-size: 13px;
          color: #333;
          font-weight: 700;
        }
        .book-btn {
          width: 100%;
          margin-top: 16px;
          padding: 14px 24px;
          background: linear-gradient(135deg, #0066CC 0%, #004E89 100%);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 800;
          box-shadow: 0 8px 24px rgba(40, 167, 69, 0.4);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          position: relative;
          overflow: hidden;
        }
        .book-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }
        .book-btn:hover::before {
          left: 100%;
        }
        .book-btn:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 15px 40px rgba(40, 167, 69, 0.5);
        }
        .book-btn:active {
          transform: translateY(-1px) scale(0.98);
        }
        .btn-icon {
          font-size: 18px;
        }
        .btn-arrow {
          font-size: 16px;
          font-weight: bold;
          transition: transform 0.3s;
        }
        .book-btn:hover .btn-arrow {
          transform: translateX(5px);
        }
        .status-badge {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }
        .status-label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .status-value {
          font-size: 14px;
          color: #004E89;
          font-weight: 800;
          padding: 4px 12px;
          background: rgba(0, 78, 137, 0.1);
          border-radius: 12px;
        }
        .cancel-btn {
          width: 100%;
          margin-top: 10px;
          padding: 10px 16px;
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          position: relative;
          overflow: hidden;
        }
        .cancel-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }
        .cancel-btn:hover::before {
          left: 100%;
        }
        .cancel-btn:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 8px 20px rgba(220, 53, 69, 0.4);
        }
        .cancel-btn:active {
          transform: translateY(-1px) scale(0.98);
        }
        .review-btn {
          width: 100%;
          margin-top: 10px;
          padding: 10px 16px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .review-btn:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 8px 20px rgba(251, 191, 36, 0.4);
        }
        .vehicle-badge.completed {
          background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
        }
        .rating-badge {
          background: linear-gradient(135deg, #E8F4F8 0%, #D0E8F2 100%);
          padding: 8px 16px;
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(0, 78, 137, 0.15);
          border: 2px solid #004E89;
        }
        .rating-stars {
          font-size: 14px;
          font-weight: 800;
          color: #004E89;
        }
        .feedback-display {
          margin-top: 16px;
          padding: 16px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 12px;
          border-left: 4px solid #004E89;
        }
        .feedback-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }
        .feedback-icon {
          font-size: 20px;
        }
        .feedback-title {
          font-size: 14px;
          font-weight: 700;
          color: #004E89;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .feedback-text {
          margin: 0;
          font-size: 14px;
          color: #333;
          line-height: 1.6;
        }
        .feedback-form-wrapper {
          margin-top: 16px;
        }
        .profile-container {
          display: grid;
          gap: 30px;
        }
        .profile-card {
          background: white;
          border-radius: 16px;
          padding: 25px;
          text-align: center;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
          border: 2px solid transparent;
          transition: all 0.3s;
        }
        .profile-card:hover {
          border-color: #004E89;
          box-shadow: 0 15px 50px rgba(0, 78, 137, 0.2);
        }
        .profile-avatar {
          width: 80px;
          height: 80px;
          margin: 0 auto 15px;
          background: linear-gradient(135deg, #004E89 0%, #003d6e 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(0, 78, 137, 0.3);
        }
        .avatar-icon {
          font-size: 40px;
        }
        .profile-name {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 800;
          color: #333;
        }
        .profile-role {
          margin: 0;
          font-size: 16px;
          color: #004E89;
          font-weight: 600;
        }
        .profile-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
        .detail-card {
          background: white;
          border-radius: 12px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
          border: 2px solid transparent;
        }
        .detail-card:hover {
          transform: translateY(-5px);
          border-color: #004E89;
          box-shadow: 0 12px 40px rgba(0, 78, 137, 0.2);
        }
        .detail-icon {
          font-size: 28px;
          flex-shrink: 0;
        }
        .detail-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .detail-label {
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .detail-value {
          font-size: 14px;
          color: #333;
          font-weight: 700;
        }
        .profile-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        .stat-card {
          background: linear-gradient(135deg, #004E89 0%, #003d6e 100%);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 8px 24px rgba(0, 78, 137, 0.3);
          transition: all 0.3s;
          color: white;
        }
        .stat-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 15px 40px rgba(0, 78, 137, 0.4);
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
          font-size: 28px;
          font-weight: 900;
          line-height: 1;
        }
        .stat-label {
          font-size: 12px;
          font-weight: 600;
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 0.5px;
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
        @keyframes slideRight {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(10px);
          }
        }
      `}</style>
      {activeTab === 'upcoming' && (
        <div>
          <div className="results-header">
            <h3>🚀 Upcoming Rides</h3>
            <span className="results-count">{upcomingBookings.length} bookings</span>
          </div>
          {loading ? <div className="spinner"></div> : (
            <div className="rides-list">
              {upcomingBookings.length === 0 ? (
                <div className="no-rides">
                  <div className="no-rides-icon">📅</div>
                  <h3>No upcoming rides</h3>
                  <p>Book a ride to see it here</p>
                </div>
              ) : (
                upcomingBookings.map((booking, index) => {
                  const ride = booking.ride;
                  // Skip if ride data is invalid
                  if (!ride || typeof ride !== 'object' || !ride.origin) {
                    return null;
                  }
                  return (
                    <div key={booking.id} className="ride-card" style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="ride-card-header">
                        <div className="vehicle-badge">
                          <span className="vehicle-icon">🎫</span>
                          <span className="vehicle-type">BOOKED</span>
                        </div>
                        <div className="status-badge">
                          <span className="status-label">Status</span>
                          <span className="status-value">{booking.status}</span>
                        </div>
                      </div>
                      
                      {ride && (
                        <div className="ride-route">
                          <div className="route-point">
                            <span className="route-icon">📍</span>
                            <div className="route-details">
                              <span className="route-label">From</span>
                              <span className="route-location">{ride.origin}</span>
                            </div>
                          </div>
                          <div className="route-line">
                            <div className="route-arrow">→</div>
                          </div>
                          <div className="route-point">
                            <span className="route-icon">🎯</span>
                            <div className="route-details">
                              <span className="route-label">To</span>
                              <span className="route-location">{ride.destination}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="ride-info">
                        <div className="info-item">
                          <span className="info-icon">🕐</span>
                          <div className="info-content">
                            <span className="info-label">Departure</span>
                            <span className="info-value">{ride ? formatDateTime(ride.departureTime) : 'N/A'}</span>
                          </div>
                        </div>
                        <div className="info-item">
                          <span className="info-icon">💺</span>
                          <div className="info-content">
                            <span className="info-label">Seats</span>
                            <span className="info-value">{booking.seatsBooked} booked</span>
                          </div>
                        </div>
                        <div className="info-item">
                          <span className="info-icon">📅</span>
                          <div className="info-content">
                            <span className="info-label">Booked On</span>
                            <span className="info-value">{formatDateTime(booking.bookingTime)}</span>
                          </div>
                        </div>
                      </div>

                      <button onClick={() => handleCancel(booking.id)} className="cancel-btn">
                        <span className="btn-icon">❌</span>
                        <span>Cancel Booking</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
      {activeTab === 'past' && (
        <div>
          <div className="results-header">
            <h3>📜 Past Rides</h3>
            <span className="results-count">{pastBookings.length} completed</span>
          </div>
          {loading ? <div className="spinner"></div> : (
            <div className="rides-list">
              {pastBookings.length === 0 ? (
                <div className="no-rides">
                  <div className="no-rides-icon">📜</div>
                  <h3>No past rides</h3>
                  <p>Your ride history will appear here</p>
                </div>
              ) : (
                pastBookings.map((booking, index) => {
                  const ride = booking.ride;
                  // Skip if ride data is invalid
                  if (!ride || typeof ride !== 'object' || !ride.origin) {
                    return null;
                  }
                  return (
                    <div key={booking.id} className="ride-card" style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="ride-card-header">
                        <div className="vehicle-badge completed">
                          <span className="vehicle-icon">✅</span>
                          <span className="vehicle-type">{booking.status}</span>
                        </div>
                        {booking.rating && (
                          <div className="rating-badge">
                            <span className="rating-stars">⭐ {Number(booking.rating)}/5</span>
                          </div>
                        )}
                      </div>
                      
                      {ride && (
                        <div className="ride-route">
                          <div className="route-point">
                            <span className="route-icon">📍</span>
                            <div className="route-details">
                              <span className="route-label">From</span>
                              <span className="route-location">{ride.origin}</span>
                            </div>
                          </div>
                          <div className="route-line">
                            <div className="route-arrow">→</div>
                          </div>
                          <div className="route-point">
                            <span className="route-icon">🎯</span>
                            <div className="route-details">
                              <span className="route-label">To</span>
                              <span className="route-location">{ride.destination}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="ride-info">
                        <div className="info-item">
                          <span className="info-icon">💺</span>
                          <div className="info-content">
                            <span className="info-label">Seats</span>
                            <span className="info-value">{booking.seatsBooked} booked</span>
                          </div>
                        </div>
                        <div className="info-item">
                          <span className="info-icon">📅</span>
                          <div className="info-content">
                            <span className="info-label">Completed</span>
                            <span className="info-value">{booking.completedTime ? formatDateTime(booking.completedTime) : 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Only show review section for COMPLETED rides */}
                      {booking.status === 'COMPLETED' && (
                        booking.passengerReviewed ? (
                          <div className="feedback-display">
                            <div className="feedback-header">
                              <span className="feedback-icon">✅</span>
                              <span className="feedback-title">Review Submitted</span>
                            </div>
                            <p className="feedback-text">Thank you for your feedback!</p>
                          </div>
                        ) : (
                          <button 
                            className="review-btn"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowReviewModal(true);
                            }}
                          >
                            <span className="btn-icon">⭐</span>
                            <span>Leave Review</span>
                          </button>
                        )
                      )}

                      {/* Show cancelled status */}
                      {booking.status === 'CANCELLED' && (
                        <div className="feedback-display" style={{background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', borderLeft: '4px solid #dc2626'}}>
                          <div className="feedback-header">
                            <span className="feedback-icon">❌</span>
                            <span className="feedback-title" style={{color: '#dc2626'}}>Ride Cancelled</span>
                          </div>
                          <p className="feedback-text" style={{color: '#991b1b'}}>This booking was cancelled.</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
      {activeTab === 'available' && (
        <div>
          <button className="btn btn-primary" onClick={() => navigate('/search-rides')}>🔍 Advanced Search</button>
          <div className="results-header">
            <h3>🚗 Available Rides</h3>
            <span className="results-count">{rides.length} rides found</span>
          </div>
          <div className="rides-list">
            {rides.length === 0 ? (
              <div className="no-rides">
                <div className="no-rides-icon">🔍</div>
                <h3>No rides available</h3>
                <p>Check back later or try searching with different criteria</p>
              </div>
            ) : (
              rides.map((ride, index) => {
                const vehicleIcon = ride.vehicleType === 'HATCHBACK' ? '🚗' : 
                                   ride.vehicleType === 'SEDAN' ? '🚙' : 
                                   ride.vehicleType === 'SUV' ? '🚐' : '🚕';
                return (
                  <div key={ride.id} className="ride-card" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="ride-card-header">
                      <div className="vehicle-badge">
                        <span className="vehicle-icon">{vehicleIcon}</span>
                        <span className="vehicle-type">{ride.vehicleType || 'Car'}</span>
                      </div>
                      <div className="price-badge">
                        <span className="price-label">₹</span>
                        <span className="price-value">{ride.price}</span>
                      </div>
                    </div>
                    
                    <div className="ride-route">
                      <div className="route-point">
                        <span className="route-icon">📍</span>
                        <div className="route-details">
                          <span className="route-label">From</span>
                          <span className="route-location">{ride.origin}</span>
                        </div>
                      </div>
                      <div className="route-line">
                        <div className="route-arrow">→</div>
                      </div>
                      <div className="route-point">
                        <span className="route-icon">🎯</span>
                        <div className="route-details">
                          <span className="route-label">To</span>
                          <span className="route-location">{ride.destination}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ride-info">
                      <div className="info-item">
                        <span className="info-icon">🕐</span>
                        <div className="info-content">
                          <span className="info-label">Departure</span>
                          <span className="info-value">{new Date(ride.departureTime).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <span className="info-icon">💺</span>
                        <div className="info-content">
                          <span className="info-label">Seats</span>
                          <span className="info-value">{ride.availableSeats} available</span>
                        </div>
                      </div>
                      {ride.distanceKm && (
                        <div className="info-item">
                          <span className="info-icon">📏</span>
                          <div className="info-content">
                            <span className="info-label">Distance</span>
                            <span className="info-value">{ride.distanceKm.toFixed(1)} km</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <button onClick={() => navigate(`/book-ride/${ride.id}`)} className="book-btn">
                      <span className="btn-icon">🎫</span>
                      <span>Book Now</span>
                      <span className="btn-arrow">→</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
      {activeTab === 'payments' && (
        <div>
          <PaymentHistory passengerId={userId} />
        </div>
      )}
      {activeTab === 'notifications' && (
        <div>
          <NotificationPanel />
        </div>
      )}
      {activeTab === 'profile' && (
        <div>
          <div className="results-header">
            <h3>👤 My Profile</h3>
            <span className="results-count">Account Info</span>
          </div>
          <div className="profile-container">
            <div className="profile-card">
              <div className="profile-avatar">
                <span className="avatar-icon">👤</span>
              </div>
              <h2 className="profile-name">{user?.name || 'User'}</h2>
              <p className="profile-role">🎫 {user?.role || 'Passenger'}</p>
            </div>

            <div className="profile-details">
              <div className="detail-card">
                <div className="detail-icon">📧</div>
                <div className="detail-content">
                  <span className="detail-label">Email Address</span>
                  <span className="detail-value">{user?.email || 'N/A'}</span>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-icon">📞</div>
                <div className="detail-content">
                  <span className="detail-label">Phone Number</span>
                  <span className="detail-value">{user?.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-icon">🎯</div>
                <div className="detail-content">
                  <span className="detail-label">Account Type</span>
                  <span className="detail-value">{user?.role || 'N/A'}</span>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-icon">🆔</div>
                <div className="detail-content">
                  <span className="detail-label">User ID</span>
                  <span className="detail-value">#{userId || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat-card">
                <div className="stat-icon">🚀</div>
                <div className="stat-content">
                  <span className="stat-value">{upcomingBookings.length}</span>
                  <span className="stat-label">Upcoming Rides</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <span className="stat-value">{pastBookings.length}</span>
                  <span className="stat-label">Completed Rides</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <span className="stat-value">{bookings.length}</span>
                  <span className="stat-label">Total Bookings</span>
                </div>
              </div>
              {user?.rating !== undefined && (
                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-content">
                    <span className="stat-value">{user.rating.toFixed(1)}</span>
                    <span className="stat-label">Overall Rating</span>
                  </div>
                </div>
              )}
            </div>

            {/* Rating Section */}
            <div className="profile-card" style={{marginTop: '20px'}}>
              <h3 style={{margin: '0 0 20px 0', fontSize: '20px', fontWeight: '800', color: '#004E89', display: 'flex', alignItems: 'center', gap: '10px'}}>
                <span>📊</span> My Ratings
              </h3>
              
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '25px'}}>
                <div style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', borderRadius: '12px', padding: '20px', textAlign: 'center', border: '2px solid #dee2e6'}}>
                  <div style={{fontSize: '40px', marginBottom: '10px'}}>⭐</div>
                  <div style={{fontSize: '32px', fontWeight: '900', color: '#004E89', marginBottom: '5px'}}>
                    {user?.rating ? user.rating.toFixed(1) : '0.0'}
                  </div>
                  <div style={{fontSize: '13px', color: '#6c757d', fontWeight: '600', textTransform: 'uppercase'}}>Overall Rating</div>
                  <div style={{fontSize: '12px', color: '#999', marginTop: '5px'}}>
                    {user?.totalReviews || 0} total reviews
                  </div>
                </div>

                {user?.driverRating !== undefined && user?.driverRating !== null && (
                  <div style={{background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', borderRadius: '12px', padding: '20px', textAlign: 'center', border: '2px solid #90caf9'}}>
                    <div style={{fontSize: '40px', marginBottom: '10px'}}>🚗</div>
                    <div style={{fontSize: '32px', fontWeight: '900', color: '#1976d2', marginBottom: '5px'}}>
                      {user.driverRating.toFixed(1)}
                    </div>
                    <div style={{fontSize: '13px', color: '#1565c0', fontWeight: '600', textTransform: 'uppercase'}}>As Driver</div>
                    <div style={{fontSize: '12px', color: '#64b5f6', marginTop: '5px'}}>Rated by passengers</div>
                  </div>
                )}

                {user?.passengerRating !== undefined && user?.passengerRating !== null && (
                  <div style={{background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)', borderRadius: '12px', padding: '20px', textAlign: 'center', border: '2px solid #ce93d8'}}>
                    <div style={{fontSize: '40px', marginBottom: '10px'}}>👤</div>
                    <div style={{fontSize: '32px', fontWeight: '900', color: '#7b1fa2', marginBottom: '5px'}}>
                      {user.passengerRating.toFixed(1)}
                    </div>
                    <div style={{fontSize: '13px', color: '#6a1b9a', fontWeight: '600', textTransform: 'uppercase'}}>As Passenger</div>
                    <div style={{fontSize: '12px', color: '#ab47bc', marginTop: '5px'}}>Rated by drivers</div>
                  </div>
                )}
              </div>

              {user?.rating > 0 && (
                <div style={{marginTop: '25px'}}>
                  <h4 style={{margin: '0 0 15px 0', fontSize: '16px', fontWeight: '700', color: '#333'}}>Rating Performance</h4>
                  <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px'}}>
                    <div style={{minWidth: '100px', fontSize: '14px', fontWeight: '600', color: '#666'}}>⭐⭐⭐⭐⭐</div>
                    <div style={{flex: 1, height: '12px', background: '#e9ecef', borderRadius: '6px', overflow: 'hidden'}}>
                      <div style={{height: '100%', background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)', width: user.rating >= 4.5 ? '80%' : '0%', transition: 'width 0.5s'}}></div>
                    </div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px'}}>
                    <div style={{minWidth: '100px', fontSize: '14px', fontWeight: '600', color: '#666'}}>⭐⭐⭐⭐</div>
                    <div style={{flex: 1, height: '12px', background: '#e9ecef', borderRadius: '6px', overflow: 'hidden'}}>
                      <div style={{height: '100%', background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', width: user.rating >= 4.0 && user.rating < 4.5 ? '60%' : '0%', transition: 'width 0.5s'}}></div>
                    </div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px'}}>
                    <div style={{minWidth: '100px', fontSize: '14px', fontWeight: '600', color: '#666'}}>⭐⭐⭐</div>
                    <div style={{flex: 1, height: '12px', background: '#e9ecef', borderRadius: '6px', overflow: 'hidden'}}>
                      <div style={{height: '100%', background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)', width: user.rating >= 3.0 && user.rating < 4.0 ? '40%' : '0%', transition: 'width 0.5s'}}></div>
                    </div>
                  </div>
                  <div style={{padding: '15px', background: '#f8f9fa', borderRadius: '10px', marginTop: '20px', border: '1px solid #dee2e6'}}>
                    <div style={{fontSize: '14px', color: '#495057', lineHeight: '1.6'}}>
                      {user.rating >= 4.5 ? (
                        <><span style={{fontSize: '20px', marginRight: '8px'}}>🎉</span><strong>Excellent!</strong> You're a top-rated passenger. Drivers love riding with you!</>
                      ) : user.rating >= 4.0 ? (
                        <><span style={{fontSize: '20px', marginRight: '8px'}}>😊</span><strong>Great job!</strong> You're a respectful passenger. Keep being punctual and courteous!</>
                      ) : user.rating >= 3.0 ? (
                        <><span style={{fontSize: '20px', marginRight: '8px'}}>👍</span><strong>Good start!</strong> Focus on being on time, respectful, and leaving the car clean to improve your rating.</>
                      ) : (
                        <><span style={{fontSize: '20px', marginRight: '8px'}}>💪</span><strong>Room for improvement.</strong> Be punctual, respectful to drivers, and maintain cleanliness.</>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          userType="PASSENGER"
          userId={userId}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedBooking(null);
          }}
          onSuccess={() => {
            fetchData(); // Refresh data after review submission
          }}
        />
      )}
    </div>
  );
};

export default PassengerDashboard;