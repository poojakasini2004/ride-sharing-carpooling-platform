import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import DriverEarnings from './DriverEarnings';
import ReviewModal from './ReviewModal';

const DriverDashboard = () => {
  const [rides, setRides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const [expandedRides, setExpandedRides] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigate = useNavigate();
  const { token, userId, user } = React.useContext(AuthContext);

  const togglePassengers = (rideId) => {
    setExpandedRides(prev => ({
      ...prev,
      [rideId]: !prev[rideId]
    }));
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return 'N/A';
    return new Date(datetime).toLocaleString();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!userId || userId === 'undefined') {
        console.error('UserId is undefined or null');
        setLoading(false);
        return;
      }
      const ridesResponse = await axios.get(`http://localhost:8080/api/rides/driver/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Driver rides:', ridesResponse.data);
      setRides(ridesResponse.data);

      // Don't send Authorization header since /api/bookings is a public endpoint
      const bookingsResponse = await axios.get(`http://localhost:8080/api/bookings/driver/${userId}`);
      console.log('Driver bookings:', bookingsResponse.data);
      setBookings(bookingsResponse.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && userId && userId !== 'undefined') fetchData();
  }, [token, userId]);

  // Auto-refresh every 30 seconds to get new bookings
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (token && userId && userId !== 'undefined') {
        console.log('🔄 Auto-refreshing driver dashboard...');
        fetchData();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [token, userId]);

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

  // Filter by status instead of just time
  const currentRides = rides.filter(ride => ride.status === 'ACTIVE' || ride.status === 'AVAILABLE');
  const pastRides = rides.filter(ride => ride.status === 'COMPLETED' || ride.status === 'CANCELLED');

  const getPassengersForRide = (rideId) => {
    const passengers = bookings.filter(booking => {
      // Check both rideId property and nested ride.id
      return booking.rideId === rideId || booking.ride?.id === rideId;
    });
    console.log(`Passengers for ride ${rideId}:`, passengers);
    console.log('All bookings:', bookings);
    return passengers;
  };

  const totalPassengers = bookings.filter(b => b.status === 'BOOKED').length;
  const completedRides = rides.filter(r => r.status === 'COMPLETED').length;
  const totalEarnings = rides.reduce((sum, ride) => {
    const rideBookings = getPassengersForRide(ride.id);
    return sum + (rideBookings.reduce((rideSum, booking) => rideSum + (booking.seatsBooked * ride.price / ride.availableSeats), 0));
  }, 0);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>🚗 Driver Dashboard</h2>
        <div className="header-actions">
          <button onClick={triggerRideCompletion} className="btn-update" style={{ marginRight: '10px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }} title="Complete expired rides">
            <span>⚡</span> Update Status
          </button>
          <button onClick={() => navigate('/create-ride')} className="btn-create">
            <span>➕</span> Create Ride
          </button>
          <button onClick={fetchData} className="btn-refresh">
            <span>🔄</span> Refresh
          </button>
        </div>
      </div>
      <div className="tabs">
        <button className={activeTab === 'current' ? 'active' : ''} onClick={() => setActiveTab('current')}>Current Rides</button>
        <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>Ride History</button>
        <button className={activeTab === 'earnings' ? 'active' : ''} onClick={() => setActiveTab('earnings')}>Earnings</button>
        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>Profile</button>
      </div>
      <style>{`
        .dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 25px;
          background: linear-gradient(135deg, #004E89 0%, #003d6e 100%);
          border-radius: 15px;
          color: white;
          box-shadow: 0 10px 30px rgba(0, 78, 137, 0.3);
        }
        .dashboard-header h2 {
          margin: 0;
          font-size: 32px;
          font-weight: 800;
        }
        .header-actions {
          display: flex;
          gap: 15px;
        }
        .btn-create, .btn-refresh {
          padding: 12px 24px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }
        .btn-create {
          background: linear-gradient(135deg, #0066CC 0%, #004E89 100%);
          color: white;
          box-shadow: 0 8px 24px rgba(0, 102, 204, 0.4);
        }
        .btn-create:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0, 102, 204, 0.5);
        }
        .btn-refresh {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          backdrop-filter: blur(10px);
        }
        .btn-refresh:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
        .tabs {
          display: flex;
          margin-bottom: 30px;
          border-bottom: 2px solid #e0e0e0;
          gap: 10px;
        }
        .tabs button {
          padding: 12px 24px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          border-bottom: 3px solid transparent;
          transition: all 0.3s;
          color: #666;
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
        .rides-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
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
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
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
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0, 78, 137, 0.2);
          border-color: #004E89;
        }
        .ride-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid #f0f0f0;
        }
        .ride-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          padding: 6px 12px;
          border-radius: 16px;
          color: white;
          font-weight: 600;
          font-size: 13px;
        }
        .price-badge {
          display: flex;
          align-items: baseline;
          gap: 4px;
          background: linear-gradient(135deg, #E8F4F8 0%, #D0E8F2 100%);
          padding: 8px 14px;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(6, 182, 212, 0.15);
          border: 1px solid #06b6d4;
        }
        .price-label {
          font-size: 13px;
          font-weight: 600;
          color: #0891b2;
        }
        .price-value {
          font-size: 18px;
          font-weight: 700;
          color: #0891b2;
        }
        .ride-route {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 12px 0;
          padding: 12px;
          background: linear-gradient(135deg, #F8FAFB 0%, #E8F4F8 100%);
          border-radius: 10px;
          border: 1px solid #D0E8F2;
        }
        .route-point {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }
        .route-icon {
          font-size: 24px;
          flex-shrink: 0;
        }
        .route-details {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .route-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 1px;
        }
        .route-location {
          font-size: 16px;
          color: #333;
          font-weight: 700;
        }
        .route-line {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .route-arrow {
          font-size: 24px;
          color: #004E89;
          font-weight: bold;
          animation: slideRight 1.5s ease-in-out infinite;
        }
        .ride-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin: 20px 0;
        }
        .info-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: white;
          border-radius: 12px;
          border: 2px solid #f0f0f0;
          transition: all 0.3s;
        }
        .info-item:hover {
          border-color: #004E89;
          transform: scale(1.05);
        }
        .info-icon {
          font-size: 22px;
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
          font-size: 14px;
          color: #333;
          font-weight: 700;
        }
        .passengers-section {
          margin-top: 20px;
          border-radius: 12px;
          border: 2px solid #E8F4F8;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .passengers-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 20px;
          background: linear-gradient(135deg, #F8FAFB 0%, #E8F4F8 100%);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .passengers-header:hover {
          background: linear-gradient(135deg, #E8F4F8 0%, #D0E8F2 100%);
        }
        .passengers-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          font-weight: 700;
          color: #004E89;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .passenger-count {
          background: #004E89;
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
        }
        .expand-icon {
          font-size: 18px;
          color: #004E89;
          transition: transform 0.3s ease;
        }
        .expand-icon.expanded {
          transform: rotate(180deg);
        }
        .passengers-content {
          padding: 15px 20px;
          background: white;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease, padding 0.3s ease;
        }
        .passengers-content.expanded {
          max-height: 1000px;
          padding: 20px;
        }
        .passenger-card {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #F8FAFB 0%, #FFFFFF 100%);
          border: 1px solid #E8F4F8;
          transition: all 0.3s ease;
        }
        .passenger-card:hover {
          border-color: #004E89;
          box-shadow: 0 4px 12px rgba(0, 78, 137, 0.1);
        }
        .passenger-card p {
          margin: 0;
          font-size: 13px;
          color: #555;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .passenger-card strong {
          color: #004E89;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }
        .passenger-card span {
          color: #333;
          font-weight: 500;
          font-size: 14px;
        }
        .no-passengers {
          text-align: center;
          padding: 20px;
          color: #666;
          font-style: italic;
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
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes slideRight {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(10px); }
        }
      `}</style>
      {activeTab === 'current' && (
        <div>
          <div className="results-header">
            <h3>🚗 Current Rides</h3>
            <span className="results-count">{currentRides.length} active</span>
          </div>
          {loading ? <div className="spinner"></div> : (
            <div className="rides-list">
              {currentRides.length === 0 ? (
                <div className="no-rides">
                  <div className="no-rides-icon">🚗</div>
                  <h3>No current rides</h3>
                  <p>Create a ride to get started</p>
                </div>
              ) : (
                currentRides.map((ride, index) => {
                  const passengers = getPassengersForRide(ride.id);
                  return (
                    <div key={ride.id} className="ride-card" style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="ride-card-header">
                        <div className="ride-badge">
                          <span>🚙</span>
                          <span>ACTIVE RIDE</span>
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
                            <span className="info-label">Available</span>
                            <span className="info-value">{ride.availableSeats} seats</span>
                          </div>
                        </div>
                      </div>

                      <div className="passengers-section">
                        <div className="passengers-header" onClick={() => togglePassengers(ride.id)}>
                          <div className="passengers-title">
                            <span>👥 Passengers</span>
                            <span className="passenger-count">{passengers.length}</span>
                          </div>
                          <span className={`expand-icon ${expandedRides[ride.id] ? 'expanded' : ''}`}>▼</span>
                        </div>
                        <div className={`passengers-content ${expandedRides[ride.id] ? 'expanded' : ''}`}>
                          {passengers.length === 0 ? (
                            <div className="no-passengers">No bookings yet</div>
                          ) : (
                            passengers.map(booking => (
                              <div key={booking.id} className="passenger-card">
                                <p><strong>Name</strong><span>{booking.passengerName || 'N/A'}</span></p>
                                <p><strong>Email</strong><span>{booking.passengerEmail || 'N/A'}</span></p>
                                <p><strong>Phone</strong><span>{booking.passengerPhone || 'N/A'}</span></p>
                                <p><strong>Pickup</strong><span>{booking.pickupLocation || 'N/A'}</span></p>
                                <p><strong>Seats</strong><span>{booking.seatsBooked}</span></p>
                                <p><strong>Status</strong><span>{booking.status}</span></p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
      {activeTab === 'history' && (
        <div>
          <div className="results-header">
            <h3>📜 Ride History</h3>
            <span className="results-count">{pastRides.length} completed</span>
          </div>
          {loading ? <div className="spinner"></div> : (
            <div className="rides-list">
              {pastRides.length === 0 ? (
                <div className="no-rides">
                  <div className="no-rides-icon">📜</div>
                  <h3>No ride history</h3>
                  <p>Your completed rides will appear here</p>
                </div>
              ) : (
                pastRides.map((ride, index) => {
                  const passengers = getPassengersForRide(ride.id);
                  return (
                    <div key={ride.id} className="ride-card" style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="ride-card-header">
                        <div className="ride-badge" style={{background: 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)'}}>
                          <span>✅</span>
                          <span>COMPLETED</span>
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
                          <span className="info-icon">📅</span>
                          <div className="info-content">
                            <span className="info-label">Completed</span>
                            <span className="info-value">{new Date(ride.departureTime).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}</span>
                          </div>
                        </div>
                        <div className="info-item">
                          <span className="info-icon">👥</span>
                          <div className="info-content">
                            <span className="info-label">Passengers</span>
                            <span className="info-value">{passengers.length} total</span>
                          </div>
                        </div>
                      </div>

                      {passengers.length > 0 && (
                        <div className="passengers-section">
                          <div className="passengers-header" onClick={() => togglePassengers(ride.id)}>
                            <div className="passengers-title">
                              <span>👥 Passenger List</span>
                              <span className="passenger-count">{passengers.length}</span>
                            </div>
                            <span className={`expand-icon ${expandedRides[ride.id] ? 'expanded' : ''}`}>▼</span>
                          </div>
                          <div className={`passengers-content ${expandedRides[ride.id] ? 'expanded' : ''}`}>
                            {passengers.map(booking => (
                              <div key={booking.id} className="passenger-card">
                                <p><strong>Name</strong><span>{booking.passengerName || 'N/A'}</span></p>
                                <p><strong>Email</strong><span>{booking.passengerEmail || 'N/A'}</span></p>
                                <p><strong>Phone</strong><span>{booking.passengerPhone || 'N/A'}</span></p>
                                <p><strong>Seats</strong><span>{booking.seatsBooked}</span></p>
                                {booking.status === 'COMPLETED' && booking.driverReviewed !== true && (
                                  <button 
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setShowReviewModal(true);
                                    }}
                                    style={{
                                      marginTop: '10px',
                                      padding: '8px 16px',
                                      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      fontSize: '13px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      transition: 'all 0.3s',
                                      boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)'
                                    }}
                                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                                  >
                                    <span>⭐</span> Rate Passenger
                                  </button>
                                )}
                                {booking.driverReviewed && (
                                  <div style={{
                                    marginTop: '10px',
                                    padding: '8px 16px',
                                    background: '#e8f5e9',
                                    color: '#2e7d32',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}>
                                    <span>✓</span> Reviewed
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
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
      {activeTab === 'earnings' && (
        <div>
          <DriverEarnings driverId={userId} />
        </div>
      )}
      {activeTab === 'profile' && (
        <div>
          <div className="results-header">
            <h3>👤 Driver Profile</h3>
            <span className="results-count">Account Info</span>
          </div>
          <div style={{display: 'grid', gap: '25px'}}>
            <div style={{background: 'white', borderRadius: '16px', padding: '25px', textAlign: 'center', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)', border: '2px solid transparent', transition: 'all 0.3s'}}>
              <div style={{width: '80px', height: '80px', margin: '0 auto 15px', background: 'linear-gradient(135deg, #004E89 0%, #003d6e 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0, 78, 137, 0.3)'}}>
                <span style={{fontSize: '40px'}}>👤</span>
              </div>
              <h2 style={{margin: '0 0 8px 0', fontSize: '24px', fontWeight: '800', color: '#333'}}>{user?.name || 'Driver'}</h2>
              <p style={{margin: '0', fontSize: '16px', color: '#004E89', fontWeight: '600'}}>🚗 {user?.role || 'Driver'}</p>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px'}}>
              <div style={{background: 'white', borderRadius: '12px', padding: '15px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)', transition: 'all 0.3s', border: '2px solid transparent'}}>
                <div style={{fontSize: '28px'}}>📧</div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                  <span style={{fontSize: '11px', color: '#999', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px'}}>Email Address</span>
                  <span style={{fontSize: '14px', color: '#333', fontWeight: '700'}}>{user?.email || 'N/A'}</span>
                </div>
              </div>

              <div style={{background: 'white', borderRadius: '12px', padding: '15px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)', transition: 'all 0.3s', border: '2px solid transparent'}}>
                <div style={{fontSize: '28px'}}>📞</div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                  <span style={{fontSize: '11px', color: '#999', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px'}}>Phone Number</span>
                  <span style={{fontSize: '14px', color: '#333', fontWeight: '700'}}>{user?.phone || 'N/A'}</span>
                </div>
              </div>

              <div style={{background: 'white', borderRadius: '12px', padding: '15px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)', transition: 'all 0.3s', border: '2px solid transparent'}}>
                <div style={{fontSize: '28px'}}>🆔</div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                  <span style={{fontSize: '11px', color: '#999', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px'}}>User ID</span>
                  <span style={{fontSize: '14px', color: '#333', fontWeight: '700'}}>#{userId || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px'}}>
              <div style={{background: 'linear-gradient(135deg, #004E89 0%, #003d6e 100%)', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 8px 24px rgba(0, 78, 137, 0.3)', transition: 'all 0.3s', color: 'white'}}>
                <div style={{fontSize: '36px'}}>🚗</div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                  <span style={{fontSize: '28px', fontWeight: '900', lineHeight: '1'}}>{currentRides.length}</span>
                  <span style={{fontSize: '12px', fontWeight: '600', opacity: '0.9', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Active Rides</span>
                </div>
              </div>
              <div style={{background: 'linear-gradient(135deg, #004E89 0%, #003d6e 100%)', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 8px 24px rgba(0, 78, 137, 0.3)', transition: 'all 0.3s', color: 'white'}}>
                <div style={{fontSize: '36px'}}>✅</div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                  <span style={{fontSize: '28px', fontWeight: '900', lineHeight: '1'}}>{completedRides}</span>
                  <span style={{fontSize: '12px', fontWeight: '600', opacity: '0.9', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Completed</span>
                </div>
              </div>
              <div style={{background: 'linear-gradient(135deg, #004E89 0%, #003d6e 100%)', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 8px 24px rgba(0, 78, 137, 0.3)', transition: 'all 0.3s', color: 'white'}}>
                <div style={{fontSize: '36px'}}>👥</div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                  <span style={{fontSize: '28px', fontWeight: '900', lineHeight: '1'}}>{totalPassengers}</span>
                  <span style={{fontSize: '12px', fontWeight: '600', opacity: '0.9', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Total Passengers</span>
                </div>
              </div>
              {user?.rating && (
                <div style={{background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 8px 24px rgba(251, 191, 36, 0.3)', transition: 'all 0.3s', color: 'white'}}>
                  <div style={{fontSize: '36px'}}>⭐</div>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                    <span style={{fontSize: '28px', fontWeight: '900', lineHeight: '1'}}>{user.rating.toFixed(1)}</span>
                    <span style={{fontSize: '12px', fontWeight: '600', opacity: '0.9', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Your Rating</span>
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
          userType="DRIVER"
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

export default DriverDashboard;
