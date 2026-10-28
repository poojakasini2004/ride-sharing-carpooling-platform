import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ReviewModal.css';

const ReviewModal = ({ booking, userType, userId, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Overall Rating, 2: Detailed Ratings, 3: Tags & Comment
  const [rating, setRating] = useState(0); // Start with 0 stars - user must select
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Multi-dimensional ratings for drivers - start at 0
  const [drivingQuality, setDrivingQuality] = useState(0);
  const [vehicleCleanliness, setVehicleCleanliness] = useState(0);
  const [professionalism, setProfessionalism] = useState(0);
  const [routeEfficiency, setRouteEfficiency] = useState(0);
  
  // Multi-dimensional ratings for passengers - start at 0
  const [punctuality, setPunctuality] = useState(0);
  const [respectfulness, setRespectfulness] = useState(0);
  const [passengerCleanliness, setPassengerCleanliness] = useState(0);

  const positiveTags = userType === 'PASSENGER' 
    ? ['🚗 Safe Driver', '✨ Clean Car', '😊 Friendly', '⏰ On Time', '💬 Great Conversation', '🎵 Quiet Ride', '🛣️ Smooth Driving', '⭐ Professional']
    : ['⏰ On Time', '😊 Respectful', '✨ Left Car Clean', '💬 Pleasant', '🎯 Clear Communication', '⭐ Great Passenger'];
  
  const negativeTags = userType === 'PASSENGER'
    ? ['⏰ Late Pickup', '🚗 Reckless Driving', '😐 Unprofessional', '🚫 Dirty Vehicle', '📱 Distracted', '🗺️ Wrong Route']
    : ['⏰ Late', '😐 Rude', '🚫 Left Mess', '📱 Distracted', '🗺️ Wrong Location'];

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = userType === 'PASSENGER' 
        ? 'http://localhost:8080/api/reviews/passenger'
        : 'http://localhost:8080/api/reviews/driver';

      const payload = {
        bookingId: booking.id,
        [userType === 'PASSENGER' ? 'passengerId' : 'driverId']: userId,
        rating,
        comment: comment.trim() || null,
        tags: selectedTags.join(','),
        ...(userType === 'PASSENGER' ? {
          drivingQuality,
          vehicleCleanliness,
          professionalism,
          routeEfficiency
        } : {
          punctuality,
          respectfulness,
          passengerCleanliness
        })
      };

      console.log('📤 Submitting review:', { endpoint, payload });
      const response = await axios.post(endpoint, payload);

      if (response.data.success) {
        // Show confirmation with animation
        setStep(4);
        setTimeout(() => {
          toast.success('✅ Review submitted successfully!');
          if (onSuccess) onSuccess();
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Failed to submit review:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit review';
      
      // Check if server is not responding
      if (error.code === 'ERR_NETWORK' || !error.response) {
        toast.error('❌ Cannot connect to server. Please ensure the backend is running on port 8080.');
      } else {
        toast.error(`❌ ${errorMessage}`);
      }
      
      setIsSubmitting(false);
    }
  };

  const renderStars = (value, setValue, hoverValue, setHoverValue) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`star ${star <= (hoverValue || value) ? 'filled' : ''} ${star <= value ? 'bounce' : ''}`}
        onClick={() => setValue(star)}
        onMouseEnter={() => setHoverValue && setHoverValue(star)}
        onMouseLeave={() => setHoverValue && setHoverValue(0)}
      >
        ★
      </span>
    ));
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const getRevieweeName = () => {
    if (userType === 'PASSENGER') {
      return booking.ride?.driver?.name || 'Driver';
    } else {
      return booking.passengerName || 'Passenger';
    }
  };

  const getRatingText = (rating) => {
    const texts = {
      1: '😞 Poor',
      2: '😕 Fair', 
      3: '😐 Good',
      4: '😊 Very Good',
      5: '🤩 Excellent'
    };
    return texts[rating] || '';
  };

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="review-modal-close" onClick={onClose}>×</button>
        
        {/* Progress Indicator */}
        <div className="progress-indicator">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        {/* Step 1: Overall Rating */}
        {step === 1 && (
          <div className="review-step fade-in">
            <div className="review-modal-header">
              <h2>How was your ride with {getRevieweeName()}?</h2>
              <div className="reviewee-avatar">
                {getRevieweeName().charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="rating-section-main">
              <div className="stars-container-large">
                {renderStars(rating, setRating, hoverRating, setHoverRating)}
              </div>
              {rating > 0 && (
                <p className="rating-text-large">{getRatingText(rating)}</p>
              )}
            </div>

            <div className="ride-details-summary">
              <p><strong>📍 From:</strong> {booking.ride?.origin || booking.ride?.source || 'N/A'}</p>
              <p><strong>📍 To:</strong> {booking.ride?.destination || 'N/A'}</p>
              <p><strong>📅 Date:</strong> {(booking.ride?.departureTime || booking.ride?.datetime) ? new Date(booking.ride.departureTime || booking.ride.datetime).toLocaleDateString() : 'N/A'}</p>
            </div>

            <div className="review-modal-actions">
              <button onClick={onClose} className="btn-skip">Skip</button>
              <button onClick={() => setStep(2)} className="btn-next">Next</button>
            </div>
          </div>
        )}

        {/* Step 2: Detailed Ratings */}
        {step === 2 && (
          <div className="review-step fade-in">
            <div className="review-modal-header">
              <h2>Rate the Details</h2>
              <p className="subtitle">Help us understand your experience better</p>
            </div>

            <div className="detailed-ratings">
              {userType === 'PASSENGER' ? (
                <>
                  <div className="rating-item">
                    <label>🚗 Driving Quality</label>
                    <div className="stars-container-small">
                      {renderStars(drivingQuality, setDrivingQuality)}
                    </div>
                  </div>
                  <div className="rating-item">
                    <label>✨ Vehicle Cleanliness</label>
                    <div className="stars-container-small">
                      {renderStars(vehicleCleanliness, setVehicleCleanliness)}
                    </div>
                  </div>
                  <div className="rating-item">
                    <label>⭐ Professionalism</label>
                    <div className="stars-container-small">
                      {renderStars(professionalism, setProfessionalism)}
                    </div>
                  </div>
                  <div className="rating-item">
                    <label>🛣️ Route Efficiency</label>
                    <div className="stars-container-small">
                      {renderStars(routeEfficiency, setRouteEfficiency)}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="rating-item">
                    <label>⏰ Punctuality</label>
                    <div className="stars-container-small">
                      {renderStars(punctuality, setPunctuality)}
                    </div>
                  </div>
                  <div className="rating-item">
                    <label>😊 Respectfulness</label>
                    <div className="stars-container-small">
                      {renderStars(respectfulness, setRespectfulness)}
                    </div>
                  </div>
                  <div className="rating-item">
                    <label>✨ Cleanliness</label>
                    <div className="stars-container-small">
                      {renderStars(passengerCleanliness, setPassengerCleanliness)}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="review-modal-actions">
              <button onClick={() => setStep(1)} className="btn-back">Back</button>
              <button onClick={() => setStep(3)} className="btn-next">Next</button>
            </div>
          </div>
        )}

        {/* Step 3: Tags & Comment */}
        {step === 3 && (
          <div className="review-step fade-in">
            <div className="review-modal-header">
              <h2>Add Quick Tags</h2>
              <p className="subtitle">Select all that apply (optional)</p>
            </div>

            <div className="tags-section">
              <div className="tags-group">
                <h4>👍 Positive</h4>
                <div className="tags-container">
                  {positiveTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className={`tag-btn ${selectedTags.includes(tag) ? 'selected' : ''}`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              
              {rating < 4 && (
                <div className="tags-group">
                  <h4>👎 Areas for Improvement</h4>
                  <div className="tags-container">
                    {negativeTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        className={`tag-btn negative ${selectedTags.includes(tag) ? 'selected' : ''}`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="comment-section">
              <label htmlFor="comment">Share more details (optional)</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={`Tell us about your experience with ${getRevieweeName()}...`}
                rows="4"
                maxLength="1000"
              />
              <small>{comment.length}/1000 characters</small>
            </div>

            <div className="review-modal-actions">
              <button onClick={() => setStep(2)} className="btn-back" disabled={isSubmitting}>Back</button>
              <button onClick={handleSubmit} className="btn-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="review-step confirmation fade-in">
            <div className="confetti">🎉</div>
            <h2>Thank You!</h2>
            <div className="success-icon">✨</div>
            <p>Your {rating}★ review helps {getRevieweeName()}!</p>
            <p className="subtitle">Building a better ride-sharing community together</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;
