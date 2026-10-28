import React, { useState, useEffect } from 'react';
import { Search, Star, Flag, Filter } from 'lucide-react';
import './ReviewsManagement.css';

const ReviewsManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterRating, setFilterRating] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);

    useEffect(() => {
        fetchReviews();
    }, [filterRating, filterType]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Fetch ALL bookings which contain reviews
            const response = await fetch('http://localhost:8080/api/bookings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                let data = await response.json();
                
                // Transform bookings with ratings to reviews
                let reviewsData = data
                    .filter(booking => booking.rating && booking.rating > 0)
                    .map(booking => ({
                        id: booking.id,
                        rating: booking.rating,
                        comment: booking.feedback || 'No comment provided',
                        reviewerName: booking.passengerName,
                        reviewerType: 'PASSENGER',
                        rideId: booking.rideId,
                        createdAt: booking.completedTime || booking.bookingTime
                    }));
                
                // Apply filters
                if (filterRating !== 'all') {
                    const rating = parseInt(filterRating);
                    reviewsData = reviewsData.filter(r => Math.floor(r.rating) === rating);
                }
                
                if (filterType !== 'all') {
                    reviewsData = reviewsData.filter(r => r.reviewerType === filterType);
                }
                
                setReviews(reviewsData);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const flagReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to flag this review as inappropriate?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/admin/reviews/${reviewId}/flag`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('✅ Review flagged successfully');
                fetchReviews();
            } else {
                alert('❌ Failed to flag review');
            }
        } catch (error) {
            console.error('Error flagging review:', error);
        }
    };

    const deleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/admin/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('✅ Review deleted successfully');
                fetchReviews();
            } else {
                alert('❌ Failed to delete review');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReviews = reviews.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(reviews.length / itemsPerPage);

    // Calculate stats
    const avgRating = reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;
    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
        rating,
        count: reviews.filter(r => Math.floor(r.rating) === rating).length
    }));

    return (
        <div className="reviews-management-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h2>Reviews & Ratings</h2>
                    <p>Monitor and manage user feedback</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="reviews-stats">
                <div className="avg-rating-card">
                    <div className="avg-rating-value">{avgRating}</div>
                    <div className="stars">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Star 
                                key={i} 
                                size={20} 
                                fill={i <= avgRating ? '#f59e0b' : 'none'}
                                color="#f59e0b"
                            />
                        ))}
                    </div>
                    <p>{reviews.length} total reviews</p>
                </div>

                <div className="rating-distribution">
                    {ratingDistribution.map(({ rating, count }) => (
                        <div key={rating} className="rating-bar-item">
                            <span className="rating-label">{rating} ⭐</span>
                            <div className="rating-bar-container">
                                <div 
                                    className="rating-bar-fill"
                                    style={{ 
                                        width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%` 
                                    }}
                                />
                            </div>
                            <span className="rating-count">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="filters-row">
                <div className="filter-group">
                    <label>Filter by Rating:</label>
                    <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
                        <option value="all">All Ratings</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Filter by Type:</label>
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="all">All Users</option>
                        <option value="DRIVER">Drivers</option>
                        <option value="PASSENGER">Passengers</option>
                    </select>
                </div>
            </div>

            {/* Reviews Grid */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading reviews...</p>
                </div>
            ) : reviews.length === 0 ? (
                <div className="empty-state">
                    <Star size={64} color="#cbd5e1" />
                    <p>No reviews found</p>
                </div>
            ) : (
                <>
                    <div className="reviews-grid">
                        {currentReviews.map(review => (
                            <ReviewCard 
                                key={review.id} 
                                review={review}
                                onFlag={flagReview}
                                onDelete={deleteReview}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <span className="page-info">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// Review Card Component
const ReviewCard = ({ review, onFlag, onDelete }) => (
    <div className="review-card">
        <div className="review-header">
            <div className="reviewer-info">
                <div className="reviewer-avatar">
                    {review.reviewerName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                    <div className="reviewer-name">{review.reviewerName || 'Anonymous'}</div>
                    <div className="review-type">{review.reviewerType || 'User'}</div>
                </div>
            </div>
            <div className="review-rating">
                {[1, 2, 3, 4, 5].map(i => (
                    <Star 
                        key={i} 
                        size={16} 
                        fill={i <= review.rating ? '#f59e0b' : 'none'}
                        color="#f59e0b"
                    />
                ))}
            </div>
        </div>

        <div className="review-content">
            <p>{review.comment || 'No comment provided'}</p>
        </div>

        <div className="review-footer">
            <span className="review-date">
                {new Date(review.createdAt).toLocaleDateString()}
            </span>
            <div className="review-actions">
                <button 
                    className="action-btn flag"
                    onClick={() => onFlag(review.id)}
                    title="Flag as inappropriate"
                >
                    <Flag size={14} />
                </button>
                <button 
                    className="action-btn delete"
                    onClick={() => onDelete(review.id)}
                    title="Delete review"
                >
                    ×
                </button>
            </div>
        </div>

        {review.rideId && (
            <div className="review-ride-info">
                <span>Ride #{review.rideId}</span>
            </div>
        )}
    </div>
);

export default ReviewsManagement;
