import React, { useState, useEffect } from 'react';
import { Users, Car, DollarSign, TrendingUp, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [systemHealth, setSystemHealth] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [statsRes, healthRes] = await Promise.all([
                fetch('http://localhost:8080/api/admin/dashboard/stats', { headers }),
                fetch('http://localhost:8080/api/admin/system/health', { headers })
            ]);

            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data);
            }

            if (healthRes.ok) {
                const data = await healthRes.json();
                setSystemHealth(data);
            }

            // Mock recent activity
            setRecentActivity([
                { id: 1, type: 'booking', message: 'New booking #1234 created', time: '2 minutes ago', icon: '🚗' },
                { id: 2, type: 'user', message: 'New driver registered', time: '15 minutes ago', icon: '👤' },
                { id: 3, type: 'payment', message: 'Payment of ₹450 received', time: '30 minutes ago', icon: '💰' },
                { id: 4, type: 'cancellation', message: 'Ride #5678 cancelled', time: '1 hour ago', icon: '❌' },
                { id: 5, type: 'review', message: 'New 5-star review received', time: '2 hours ago', icon: '⭐' },
            ]);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-page">
            {/* System Health Banner */}
            {systemHealth && (
                <div className="system-health-card">
                    <div className="health-status">
                        <CheckCircle className="health-icon" />
                        <div>
                            <h3>System Status: {systemHealth.status}</h3>
                            <p>All systems operational</p>
                        </div>
                    </div>
                    <div className="health-metrics">
                        <div className="health-metric">
                            <span className="metric-label">Active Rides</span>
                            <span className="metric-value">{systemHealth.activeRides}</span>
                        </div>
                        <div className="health-metric">
                            <span className="metric-label">Pending Bookings</span>
                            <span className="metric-value">{systemHealth.pendingBookings}</span>
                        </div>
                        <div className="health-metric">
                            <span className="metric-label">Online Users</span>
                            <span className="metric-value">{systemHealth.onlineUsers}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Key Metrics */}
            {stats && (
                <div className="metrics-grid">
                    <MetricCard
                        icon={<Users />}
                        title="Total Users"
                        value={stats.totalUsers}
                        subtitle={`${stats.activeUsers} active today`}
                        trend="+12%"
                        color="#3b82f6"
                    />
                    <MetricCard
                        icon={<Car />}
                        title="Total Rides"
                        value={stats.totalRides}
                        subtitle={`${stats.ridesCompletedToday} completed today`}
                        trend="+8%"
                        color="#10b981"
                    />
                    <MetricCard
                        icon={<DollarSign />}
                        title="Total Revenue"
                        value={`₹${(stats.totalEarnings || 0).toFixed(2)}`}
                        subtitle={`₹${(stats.todayEarnings || 0).toFixed(2)} today`}
                        trend="+15%"
                        color="#f59e0b"
                    />
                    <MetricCard
                        icon={<TrendingUp />}
                        title="Average Rating"
                        value={(stats.averageRating || 0).toFixed(1)}
                        subtitle={`${stats.totalReviews || 0} total reviews`}
                        trend="+0.3"
                        color="#8b5cf6"
                    />
                </div>
            )}

            {/* Charts and Activity */}
            <div className="dashboard-grid">
                {/* Charts Section */}
                <div className="chart-section">
                    <div className="chart-card">
                        <h3>Rides Per Day (Last 7 Days)</h3>
                        {stats && <SimpleBarChart data={stats.ridesPerDay} />}
                    </div>
                    <div className="chart-card">
                        <h3>Revenue Per Day (Last 7 Days)</h3>
                        {stats && <SimpleBarChart data={stats.earningsPerDay} isCurrency={true} />}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="activity-section">
                    <div className="activity-card">
                        <h3>Recent Activity</h3>
                        <div className="activity-list">
                            {recentActivity.map(activity => (
                                <div key={activity.id} className="activity-item">
                                    <span className="activity-icon">{activity.icon}</span>
                                    <div className="activity-content">
                                        <p className="activity-message">{activity.message}</p>
                                        <span className="activity-time">{activity.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            {stats && (
                <div className="quick-stats-grid">
                    <QuickStatCard title="User Statistics">
                        <StatRow label="Total Drivers" value={stats.totalDrivers} />
                        <StatRow label="Total Passengers" value={stats.totalPassengers} />
                        <StatRow label="Verified Drivers" value={stats.verifiedDrivers} />
                        <StatRow label="Blocked Users" value={stats.blockedUsers} />
                    </QuickStatCard>

                    <QuickStatCard title="Ride Statistics">
                        <StatRow label="Active Rides" value={stats.activeRides} />
                        <StatRow label="Completed Rides" value={stats.completedRides} />
                        <StatRow label="Cancelled Rides" value={stats.cancelledRides} />
                        <StatRow label="Completion Rate" value={`${((stats.completedRides / stats.totalRides) * 100).toFixed(1)}%`} />
                    </QuickStatCard>

                    <QuickStatCard title="Payment Statistics">
                        <StatRow label="Total Payments" value={stats.totalPayments} />
                        <StatRow label="Successful" value={stats.successfulPayments} />
                        <StatRow label="Failed" value={stats.failedPayments} />
                        <StatRow label="Success Rate" value={`${((stats.successfulPayments / stats.totalPayments) * 100).toFixed(1)}%`} />
                    </QuickStatCard>

                    <QuickStatCard title="Booking Statistics">
                        <StatRow label="Total Bookings" value={stats.totalBookings} />
                        <StatRow label="Pending" value={stats.pendingBookings} />
                        <StatRow label="Confirmed" value={stats.confirmedBookings} />
                        <StatRow label="Completed" value={stats.completedBookings} />
                    </QuickStatCard>
                </div>
            )}
        </div>
    );
};

// Metric Card Component
const MetricCard = ({ icon, title, value, subtitle, trend, color }) => (
    <div className="metric-card" style={{ borderLeftColor: color }}>
        <div className="metric-icon" style={{ backgroundColor: `${color}20`, color }}>
            {icon}
        </div>
        <div className="metric-content">
            <h4>{title}</h4>
            <div className="metric-value">{value}</div>
            <div className="metric-footer">
                <span className="metric-subtitle">{subtitle}</span>
                <span className="metric-trend" style={{ color }}>{trend}</span>
            </div>
        </div>
    </div>
);

// Quick Stat Card Component
const QuickStatCard = ({ title, children }) => (
    <div className="quick-stat-card">
        <h3>{title}</h3>
        <div className="stat-rows">
            {children}
        </div>
    </div>
);

// Stat Row Component
const StatRow = ({ label, value }) => (
    <div className="stat-row">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
    </div>
);

// Simple Bar Chart Component
const SimpleBarChart = ({ data, isCurrency = false }) => {
    if (!data) return <div className="no-data">No data available</div>;
    
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

export default Dashboard;
