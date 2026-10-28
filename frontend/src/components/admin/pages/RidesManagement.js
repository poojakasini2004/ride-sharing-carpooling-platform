import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, MapPin, Calendar, Users as UsersIcon, DollarSign } from 'lucide-react';
import './RidesManagement.css';

const RidesManagement = () => {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRide, setSelectedRide] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetchRides();
    }, [filterStatus]);

    const fetchRides = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Use the existing rides endpoint
            const response = await fetch('http://localhost:8080/api/rides', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                let data = await response.json();
                
                // Filter by status if needed
                if (filterStatus !== 'all') {
                    data = data.filter(ride => {
                        const status = ride.status || 'active';
                        return status.toLowerCase() === filterStatus.toLowerCase();
                    });
                }
                
                setRides(data);
            }
        } catch (error) {
            console.error('Error fetching rides:', error);
        } finally {
            setLoading(false);
        }
    };

    const viewRideDetails = async (rideId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/rides/${rideId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setSelectedRide(data);
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error fetching ride details:', error);
        }
    };

    const cancelRide = async (rideId) => {
        if (!window.confirm('Are you sure you want to cancel this ride?')) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/admin/rides/${rideId}/cancel`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                alert('✅ Ride cancelled successfully');
                fetchRides();
                setShowModal(false);
            } else {
                alert('❌ Failed to cancel ride');
            }
        } catch (error) {
            console.error('Error cancelling ride:', error);
        }
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRides = rides.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(rides.length / itemsPerPage);

    return (
        <div className="rides-management-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h2>Rides Management</h2>
                    <p>Monitor and manage all rides</p>
                </div>
            </div>

            {/* Filter Buttons */}
            <div className="filter-tabs">
                <button 
                    className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('all')}
                >
                    All Rides
                </button>
                <button 
                    className={`filter-tab ${filterStatus === 'active' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('active')}
                >
                    Active
                </button>
                <button 
                    className={`filter-tab ${filterStatus === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('completed')}
                >
                    Completed
                </button>
                <button 
                    className={`filter-tab ${filterStatus === 'cancelled' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('cancelled')}
                >
                    Cancelled
                </button>
            </div>

            {/* Search Bar */}
            <div className="controls-bar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by driver name, source, or destination..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Rides Grid */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading rides...</p>
                </div>
            ) : rides.length === 0 ? (
                <div className="empty-state">
                    <Car size={64} color="#cbd5e1" />
                    <p>No rides found</p>
                </div>
            ) : (
                <>
                    <div className="rides-grid">
                        {currentRides.map(ride => (
                            <RideCard 
                                key={ride.id} 
                                ride={ride} 
                                onView={() => viewRideDetails(ride.id)}
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

            {/* Ride Details Modal */}
            {showModal && selectedRide && (
                <RideDetailsModal 
                    ride={selectedRide} 
                    onClose={() => setShowModal(false)}
                    onCancel={cancelRide}
                />
            )}
        </div>
    );
};

// Ride Card Component
const RideCard = ({ ride, onView }) => {
    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'active': return '#10b981';
            case 'completed': return '#3b82f6';
            case 'cancelled': return '#ef4444';
            default: return '#64748b';
        }
    };

    return (
        <div className="ride-card">
            <div className="ride-card-header">
                <span className="ride-id">Ride #{ride.id}</span>
                <span 
                    className="ride-status"
                    style={{ backgroundColor: `${getStatusColor(ride.status)}20`, color: getStatusColor(ride.status) }}
                >
                    {ride.status || 'Active'}
                </span>
            </div>

            <div className="ride-route">
                <div className="route-point">
                    <MapPin size={16} color="#10b981" />
                    <span>{ride.origin || ride.source || 'N/A'}</span>
                </div>
                <div className="route-line"></div>
                <div className="route-point">
                    <MapPin size={16} color="#ef4444" />
                    <span>{ride.destination}</span>
                </div>
            </div>

            <div className="ride-details">
                <div className="detail-item">
                    <Calendar size={16} />
                    <span>{new Date(ride.departureTime).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                    <UsersIcon size={16} />
                    <span>{ride.availableSeats} seats</span>
                </div>
                <div className="detail-item">
                    <DollarSign size={16} />
                    <span>₹{ride.pricePerSeat}</span>
                </div>
            </div>

            <div className="ride-driver">
                <div className="driver-avatar">
                    {ride.driverName?.charAt(0).toUpperCase() || 'D'}
                </div>
                <div className="driver-info">
                    <span className="driver-name">{ride.driverName || 'Unknown Driver'}</span>
                    <span className="vehicle-info">{ride.vehicleType || 'N/A'}</span>
                </div>
            </div>

            <button className="view-details-btn" onClick={onView}>
                <Eye size={16} />
                View Details
            </button>
        </div>
    );
};

// Ride Details Modal Component
const RideDetailsModal = ({ ride, onClose, onCancel }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                <h3>Ride Details - #{ride.id}</h3>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <div className="modal-body">
                <div className="detail-section">
                    <h4>Route Information</h4>
                    <div className="detail-grid">
                        <DetailRow label="Source" value={ride.origin || ride.source || 'N/A'} />
                        <DetailRow label="Destination" value={ride.destination || 'N/A'} />
                        <DetailRow label="Distance" value={`${ride.distance || 'N/A'} km`} />
                        <DetailRow label="Departure Time" value={new Date(ride.departureTime).toLocaleString()} />
                    </div>
                </div>

                <div className="detail-section">
                    <h4>Ride Information</h4>
                    <div className="detail-grid">
                        <DetailRow label="Status" value={ride.status || 'Active'} />
                        <DetailRow label="Available Seats" value={ride.availableSeats} />
                        <DetailRow label="Price per Seat" value={`₹${ride.pricePerSeat}`} />
                        <DetailRow label="Total Bookings" value={ride.bookings?.length || 0} />
                    </div>
                </div>

                <div className="detail-section">
                    <h4>Driver Information</h4>
                    <div className="detail-grid">
                        <DetailRow label="Driver Name" value={ride.driverName || 'N/A'} />
                        <DetailRow label="Vehicle Type" value={ride.vehicleType || 'N/A'} />
                        <DetailRow label="Vehicle Model" value={ride.vehicleModel || 'N/A'} />
                        <DetailRow label="License Plate" value={ride.licensePlate || 'N/A'} />
                    </div>
                </div>

                {ride.bookings && ride.bookings.length > 0 && (
                    <div className="detail-section">
                        <h4>Passengers ({ride.bookings.length})</h4>
                        <div className="passengers-list">
                            {ride.bookings.map((booking, index) => (
                                <div key={index} className="passenger-item">
                                    <div className="passenger-avatar">
                                        {booking.passengerName?.charAt(0).toUpperCase() || 'P'}
                                    </div>
                                    <div className="passenger-info">
                                        <span className="passenger-name">{booking.passengerName || 'Unknown'}</span>
                                        <span className="booking-status">{booking.status}</span>
                                    </div>
                                    <span className="seats-booked">{booking.seatsBooked} seat(s)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {ride.status !== 'cancelled' && ride.status !== 'completed' && (
                    <div className="modal-actions">
                        <button className="cancel-ride-btn" onClick={() => onCancel(ride.id)}>
                            Cancel Ride
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
);

const DetailRow = ({ label, value }) => (
    <div className="detail-row">
        <span className="detail-label">{label}:</span>
        <span className="detail-value">{value}</span>
    </div>
);

const Car = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M5 17h14v-5H5v5z"/>
        <path d="M3 11l2-7h14l2 7"/>
        <circle cx="7.5" cy="17.5" r="1.5"/>
        <circle cx="16.5" cy="17.5" r="1.5"/>
    </svg>
);

export default RidesManagement;
