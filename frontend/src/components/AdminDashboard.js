import React, { useState, useEffect } from 'react';
import { Users, Car, DollarSign, TrendingUp, Activity, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [systemHealth, setSystemHealth] = useState(null);

    useEffect(() => {
        fetchDashboardStats();
        fetchSystemHealth();
        
        // Refresh stats every 30 seconds
        const interval = setInterval(() => {
            fetchDashboardStats();
            fetchSystemHealth();
        }, 30000);
        
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/admin/dashboard/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSystemHealth = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/admin/system/health', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSystemHealth(data);
            }
        } catch (error) {
            console.error('Error fetching system health:', error);
        }
    };

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <div className="header-actions">
                    <button className="refresh-btn" onClick={fetchDashboardStats}>
                        <Activity size={18} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* System Health Banner */}
            {systemHealth && (
                <div className="system-health-banner">
                    <div className="health-status">
                        <CheckCircle className="health-icon" />
                        <span>System Status: {systemHealth.status}</span>
                    </div>
                    <div className="health-metrics">
                        <span>Active Rides: {systemHealth.activeRides}</span>
                        <span>Pending Bookings: {systemHealth.pendingBookings}</span>
                        <span>Online Users: {systemHealth.onlineUsers}</span>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="dashboard-tabs">
                <button 
                    className={activeTab === 'overview' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button 
                    className={activeTab === 'users' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('users')}
                >
                    User Management
                </button>
                <button 
                    className={activeTab === 'verification' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('verification')}
                >
                    Driver Verification
                </button>
                <button 
                    className={activeTab === 'reports' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('reports')}
                >
                    Reports
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
                <div className="overview-content">
                    {/* Key Metrics Cards */}
                    <div className="metrics-grid">
                        <MetricCard
                            icon={<Users />}
                            title="Total Users"
                            value={stats.totalUsers}
                            subtitle={`${stats.activeUsers} active`}
                            color="#3b82f6"
                        />
                        <MetricCard
                            icon={<Car />}
                            title="Total Rides"
                            value={stats.totalRides}
                            subtitle={`${stats.completedRides} completed`}
                            color="#10b981"
                        />
                        <MetricCard
                            icon={<DollarSign />}
                            title="Total Earnings"
                            value={`₹${(stats.totalEarnings || 0).toFixed(2)}`}
                            subtitle={`₹${(stats.todayEarnings || 0).toFixed(2)} today`}
                            color="#f59e0b"
                        />
                        <MetricCard
                            icon={<TrendingUp />}
                            title="Average Rating"
                            value={(stats.averageRating || 0).toFixed(1)}
                            subtitle={`${stats.totalReviews || 0} reviews`}
                            color="#8b5cf6"
                        />
                    </div>

                    {/* Detailed Stats */}
                    <div className="stats-section">
                        <div className="stat-group">
                            <h3>User Statistics</h3>
                            <div className="stat-items">
                                <StatItem label="Total Drivers" value={stats.totalDrivers} />
                                <StatItem label="Total Passengers" value={stats.totalPassengers} />
                                <StatItem label="Verified Drivers" value={stats.verifiedDrivers} />
                                <StatItem label="Blocked Users" value={stats.blockedUsers} />
                                <StatItem label="New Users Today" value={stats.newUsersToday} />
                            </div>
                        </div>

                        <div className="stat-group">
                            <h3>Ride Statistics</h3>
                            <div className="stat-items">
                                <StatItem label="Active Rides" value={stats.activeRides} />
                                <StatItem label="Completed Rides" value={stats.completedRides} />
                                <StatItem label="Cancelled Rides" value={stats.cancelledRides} />
                                <StatItem label="Rides Today" value={stats.ridesCompletedToday} />
                            </div>
                        </div>

                        <div className="stat-group">
                            <h3>Booking Statistics</h3>
                            <div className="stat-items">
                                <StatItem label="Total Bookings" value={stats.totalBookings} />
                                <StatItem label="Pending" value={stats.pendingBookings} />
                                <StatItem label="Confirmed" value={stats.confirmedBookings} />
                                <StatItem label="Completed" value={stats.completedBookings} />
                                <StatItem label="Cancelled" value={stats.cancelledBookings} />
                            </div>
                        </div>

                        <div className="stat-group">
                            <h3>Payment Statistics</h3>
                            <div className="stat-items">
                                <StatItem label="Total Payments" value={stats.totalPayments} />
                                <StatItem label="Successful" value={stats.successfulPayments} />
                                <StatItem label="Failed" value={stats.failedPayments} />
                                <StatItem label="Week Earnings" value={`₹${stats.weekEarnings.toFixed(2)}`} />
                                <StatItem label="Month Earnings" value={`₹${stats.monthEarnings.toFixed(2)}`} />
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="charts-section">
                        <div className="chart-card">
                            <h3>Rides Per Day (Last 7 Days)</h3>
                            <SimpleBarChart data={stats.ridesPerDay} />
                        </div>
                        <div className="chart-card">
                            <h3>Earnings Per Day (Last 7 Days)</h3>
                            <SimpleBarChart data={stats.earningsPerDay} isCurrency={true} />
                        </div>
                    </div>
                </div>
            )}

            {/* User Management Tab */}
            {activeTab === 'users' && <UserManagement />}
            
            {/* Driver Verification Tab */}
            {activeTab === 'verification' && <DriverVerification />}

            {/* Reports Tab */}
            {activeTab === 'reports' && <Reports />}
        </div>
    );
};

// Metric Card Component
const MetricCard = ({ icon, title, value, subtitle, color }) => (
    <div className="metric-card" style={{ borderLeftColor: color }}>
        <div className="metric-icon" style={{ backgroundColor: `${color}20`, color }}>
            {icon}
        </div>
        <div className="metric-content">
            <h4>{title}</h4>
            <div className="metric-value">{value}</div>
            <div className="metric-subtitle">{subtitle}</div>
        </div>
    </div>
);

// Stat Item Component
const StatItem = ({ label, value }) => (
    <div className="stat-item">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
    </div>
);

// Simple Bar Chart Component
const SimpleBarChart = ({ data, isCurrency = false }) => {
    if (!data) return <div>No data available</div>;
    
    const entries = Object.entries(data);
    const maxValue = Math.max(...entries.map(([, value]) => value));
    
    return (
        <div className="simple-bar-chart">
            {entries.map(([date, value]) => (
                <div key={date} className="bar-item">
                    <div className="bar-label">{date.substring(5)}</div>
                    <div className="bar-container">
                        <div 
                            className="bar-fill" 
                            style={{ height: `${(value / maxValue) * 100}%` }}
                        />
                    </div>
                    <div className="bar-value">
                        {isCurrency ? `₹${value.toFixed(0)}` : value}
                    </div>
                </div>
            ))}
        </div>
    );
};

// User Management Component
const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [filter]);

    const fetchUsers = async () => {
        try {
            const url = filter === 'all' 
                ? 'http://localhost:8080/api/admin/users'
                : `http://localhost:8080/api/admin/users/role/${filter}`;
            
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchUsers();
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:8080/api/admin/users/search?q=${searchQuery}`);
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error searching users:', error);
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        const newStatus = !currentStatus;
        const action = newStatus ? 'activate' : 'block';
        
        // Confirm action
        const confirmMessage = newStatus 
            ? 'Are you sure you want to activate this user?' 
            : 'Are you sure you want to block this user?';
        
        if (!window.confirm(confirmMessage)) return;
        
        const reason = newStatus ? '' : prompt('Enter reason for blocking:');
        if (!newStatus && !reason) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ active: newStatus, reason })
            });
            
            if (response.ok) {
                alert(`✅ User ${newStatus ? 'activated' : 'blocked'} successfully`);
                fetchUsers();
                fetchStats(); // Refresh stats
            } else {
                alert(`❌ Failed to ${action} user`);
            }
        } catch (error) {
            console.error('Error updating user status:', error);
            alert(`❌ Error: ${error.message}`);
        }
    };

    return (
        <div className="user-management">
            <div className="management-header">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button onClick={handleSearch}>Search</button>
                </div>
                <div className="filter-buttons">
                    <button 
                        className={filter === 'all' ? 'active' : ''}
                        onClick={() => setFilter('all')}
                    >
                        All Users
                    </button>
                    <button 
                        className={filter === 'driver' ? 'active' : ''}
                        onClick={() => setFilter('driver')}
                    >
                        Drivers
                    </button>
                    <button 
                        className={filter === 'passenger' ? 'active' : ''}
                        onClick={() => setFilter('passenger')}
                    >
                        Passengers
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading users...</div>
            ) : (
                <div className="users-table">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Verified</th>
                                <th>Rating</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.active ? 'active' : 'blocked'}`}>
                                            {user.active ? 'Active' : 'Blocked'}
                                        </span>
                                    </td>
                                    <td>
                                        {user.verified ? (
                                            <CheckCircle size={18} color="#10b981" />
                                        ) : (
                                            <XCircle size={18} color="#ef4444" />
                                        )}
                                    </td>
                                    <td>{user.rating ? user.rating.toFixed(1) : 'N/A'}</td>
                                    <td>
                                        <button
                                            className={`action-btn ${user.active ? 'block' : 'activate'}`}
                                            onClick={() => toggleUserStatus(user.id, user.active)}
                                        >
                                            {user.active ? 'Block' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// Driver Verification Component
const DriverVerification = () => {
    const [pendingDrivers, setPendingDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingDrivers();
    }, []);

    const fetchPendingDrivers = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/drivers/pending');
            if (response.ok) {
                const data = await response.json();
                setPendingDrivers(data);
            }
        } catch (error) {
            console.error('Error fetching pending drivers:', error);
        } finally {
            setLoading(false);
        }
    };

    const verifyDriver = async (driverId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/admin/drivers/${driverId}/verify`, {
                method: 'PUT'
            });
            
            if (response.ok) {
                alert('Driver verified successfully');
                fetchPendingDrivers();
            }
        } catch (error) {
            console.error('Error verifying driver:', error);
            alert('Failed to verify driver');
        }
    };

    const rejectDriver = async (driverId) => {
        const reason = prompt('Enter reason for rejection:');
        if (!reason) return;
        
        try {
            const response = await fetch(`http://localhost:8080/api/admin/users/${driverId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                alert('Driver rejected and removed');
                fetchPendingDrivers();
            }
        } catch (error) {
            console.error('Error rejecting driver:', error);
            alert('Failed to reject driver');
        }
    };

    if (loading) {
        return <div className="loading">Loading pending drivers...</div>;
    }

    if (pendingDrivers.length === 0) {
        return (
            <div className="user-management">
                <h3>Driver Verification</h3>
                <div className="loading">No pending driver verifications</div>
            </div>
        );
    }

    return (
        <div className="user-management">
            <h3 style={{ marginBottom: '20px' }}>Pending Driver Verifications</h3>
            <div className="users-table">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Vehicle Type</th>
                            <th>Vehicle Model</th>
                            <th>License Plate</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingDrivers.map(driver => (
                            <tr key={driver.id}>
                                <td>{driver.id}</td>
                                <td>{driver.name}</td>
                                <td>{driver.email}</td>
                                <td>{driver.phone}</td>
                                <td>{driver.vehicleType || 'N/A'}</td>
                                <td>{driver.vehicleModel || 'N/A'}</td>
                                <td>{driver.licensePlate || 'N/A'}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            className="action-btn activate"
                                            onClick={() => verifyDriver(driver.id)}
                                        >
                                            Verify
                                        </button>
                                        <button
                                            className="action-btn block"
                                            onClick={() => rejectDriver(driver.id)}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Reports Component - Enhanced
const Reports = () => {
    const [reportType, setReportType] = useState('cancellations');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchReport = async (type) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/admin/reports/${type}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setReportData(data);
            }
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport(reportType);
    }, [reportType]);

    const renderReportContent = () => {
        if (!reportData) return null;

        switch(reportType) {
            case 'cancellations':
                return (
                    <div className="report-content">
                        <h3>Cancellation Report</h3>
                        <div className="report-stats">
                            <div className="report-stat">
                                <label>Total Rides</label>
                                <value>{reportData.totalRides}</value>
                            </div>
                            <div className="report-stat">
                                <label>Cancelled Rides</label>
                                <value>{reportData.cancelledRides}</value>
                            </div>
                            <div className="report-stat">
                                <label>Cancelled Bookings</label>
                                <value>{reportData.cancelledBookings}</value>
                            </div>
                            <div className="report-stat">
                                <label>Cancellation Rate</label>
                                <value>{(reportData.cancellationRate || 0).toFixed(2)}%</value>
                            </div>
                        </div>
                    </div>
                );
            case 'payments':
                return (
                    <div className="report-content">
                        <h3>Payment Report</h3>
                        <div className="report-stats">
                            <div className="report-stat">
                                <label>Total Transactions</label>
                                <value>{reportData.totalTransactions}</value>
                            </div>
                            <div className="report-stat">
                                <label>Successful</label>
                                <value>{reportData.successfulTransactions}</value>
                            </div>
                            <div className="report-stat">
                                <label>Failed</label>
                                <value>{reportData.failedTransactions}</value>
                            </div>
                            <div className="report-stat">
                                <label>Total Amount</label>
                                <value>₹{(reportData.totalAmount || 0).toFixed(2)}</value>
                            </div>
                            <div className="report-stat">
                                <label>Success Rate</label>
                                <value>{(reportData.successRate || 0).toFixed(2)}%</value>
                            </div>
                            <div className="report-stat">
                                <label>Avg Transaction</label>
                                <value>₹{(reportData.averageTransactionValue || 0).toFixed(2)}</value>
                            </div>
                        </div>
                    </div>
                );
            case 'top-drivers':
                return (
                    <div className="report-content">
                        <h3>Top Rated Drivers</h3>
                        <div className="users-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Rating</th>
                                        <th>Vehicle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(Array.isArray(reportData) ? reportData : []).map((driver, index) => (
                                        <tr key={driver.id}>
                                            <td>{index + 1}</td>
                                            <td>{driver.name}</td>
                                            <td>{driver.email}</td>
                                            <td>⭐ {driver.rating ? driver.rating.toFixed(1) : 'N/A'}</td>
                                            <td>{driver.vehicleType} - {driver.vehicleModel}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'active-rides':
                return (
                    <div className="report-content">
                        <h3>Active Rides</h3>
                        <div className="users-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Source</th>
                                        <th>Destination</th>
                                        <th>Driver</th>
                                        <th>Available Seats</th>
                                        <th>Price</th>
                                        <th>Departure</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(Array.isArray(reportData) ? reportData : []).map((ride) => (
                                        <tr key={ride.id}>
                                            <td>{ride.id}</td>
                                            <td>{ride.source}</td>
                                            <td>{ride.destination}</td>
                                            <td>{ride.driverName}</td>
                                            <td>{ride.availableSeats}</td>
                                            <td>₹{ride.pricePerSeat}</td>
                                            <td>{new Date(ride.departureTime).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="reports-section">
            <div className="report-selector">
                <button 
                    className={reportType === 'cancellations' ? 'active' : ''}
                    onClick={() => setReportType('cancellations')}
                >
                    Cancellations
                </button>
                <button 
                    className={reportType === 'payments' ? 'active' : ''}
                    onClick={() => setReportType('payments')}
                >
                    Payments
                </button>
                <button 
                    className={reportType === 'top-drivers' ? 'active' : ''}
                    onClick={() => setReportType('top-drivers')}
                >
                    Top Drivers
                </button>
                <button 
                    className={reportType === 'active-rides' ? 'active' : ''}
                    onClick={() => setReportType('active-rides')}
                >
                    Active Rides
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading report...</div>
            ) : (
                renderReportContent()
            )}
        </div>
    );
};

export default AdminDashboard;
