import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewModal from './ReviewModal';
import './ReviewList.css';

const ReviewList = ({ userId, userRole }) => {
  const [completedBookings, setCompletedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    fetchCompletedBookings();
  }, [userId]);

  const fetchCompletedBookings = async () => {
    try {
      const endpoint = userRole === 'PASSENGER'
        ? `http://localhost:8080/api/bookings/passenger/${userId}`
        : `http://localhost:8080/api/bookings/driver/${userId}`;

      const response = await axios.get(endpoint);
      const completed = response.data.filter(b => b.status === 'COMPLETED');
      setCompletedBookings(completed);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = () => {
    fetchCompletedBookings();
  };

  const canReview = (booking) => {
    if (userRole === 'PASSENGER') {
      return !booking.passengerReviewed;
    } else {
      return !booking.driverReviewed;
    }
  };

  if (loading) {
    return <div className="review-list-loading">Loading...</div>;
  }

  const pendingReviews = completedBookings.filter(canReview);

  if (pendingReviews.length === 0) {
    return (
      <div className="review-list-empty">
        <p>✅ No pending reviews</p>
      </div>
    );
  }

  return (
    <div className="review-list-container">
      <h3>⭐ Pending Reviews ({pendingReviews.length})</h3>
      <div className="review-list-items">
        {pendingReviews.map((booking) => (
          <div key={booking.id} className="review-list-item">
            <div className="review-item-info">
              <div className="review-item-route">
                <span className="route-from">{booking.ride?.source || 'N/A'}</span>
                <span className="route-arrow">→</span>
                <span className="route-to">{booking.ride?.destination || 'N/A'}</span>
              </div>
              <div className="review-item-details">
                <span className="review-item-date">
                  {booking.ride?.datetime ? new Date(booking.ride.datetime).toLocaleDateString() : 'N/A'}
                </span>
                <span className="review-item-person">
                  {userRole === 'PASSENGER' 
                    ? `Driver: ${booking.ride?.driver?.name || 'N/A'}`
                    : `Passenger: ${booking.passengerName || 'N/A'}`
                  }
                </span>
              </div>
            </div>
            <button
              className="review-btn"
              onClick={() => handleReviewClick(booking)}
            >
              Rate Now
            </button>
          </div>
        ))}
      </div>

      {showReviewModal && selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          userType={userRole}
          userId={userId}
          onClose={() => setShowReviewModal(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};

export default ReviewList;
