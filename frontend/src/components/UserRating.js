import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserRating.css';

const UserRating = ({ userId, showDetails = false }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviews, setShowReviews] = useState(false);

  useEffect(() => {
    fetchRatingStats();
  }, [userId]);

  const fetchRatingStats = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/reviews/user/${userId}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch rating stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="stars-display">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="star filled">★</span>
        ))}
        {hasHalfStar && <span className="star half">★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="star empty">★</span>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="user-rating-loading">Loading rating...</div>;
  }

  if (!stats || stats.totalReviews === 0) {
    return <div className="user-rating-none">No reviews yet</div>;
  }

  return (
    <div className="user-rating-container">
      <div className="rating-summary">
        <div className="rating-score">
          <span className="rating-number">{stats.overallRating.toFixed(1)}</span>
          {renderStars(stats.overallRating)}
        </div>
        <span className="rating-count">({stats.totalReviews} reviews)</span>
      </div>

      {showDetails && (
        <div className="rating-details">
          {stats.driverRating && (
            <div className="rating-detail-item">
              <span className="rating-label">🚗 As Driver:</span>
              <span className="rating-value">{stats.driverRating.toFixed(1)} ⭐</span>
            </div>
          )}
          {stats.passengerRating && (
            <div className="rating-detail-item">
              <span className="rating-label">👤 As Passenger:</span>
              <span className="rating-value">{stats.passengerRating.toFixed(1)} ⭐</span>
            </div>
          )}

          <button 
            className="view-reviews-btn"
            onClick={() => setShowReviews(!showReviews)}
          >
            {showReviews ? 'Hide Reviews' : 'View Reviews'}
          </button>

          {showReviews && stats.recentReviews && stats.recentReviews.length > 0 && (
            <div className="reviews-list">
              {stats.recentReviews.slice(0, 5).map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div className="review-stars">
                      {[...Array(review.rating)].map((_, i) => (
                        <span key={i} className="star filled">★</span>
                      ))}
                    </div>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="review-comment">{review.comment}</p>
                  )}
                  <span className="review-type">
                    {review.reviewerType === 'PASSENGER' ? '👤 From Passenger' : '🚗 From Driver'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserRating;
