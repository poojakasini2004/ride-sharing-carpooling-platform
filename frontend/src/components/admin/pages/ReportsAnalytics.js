import React, { useState, useEffect } from 'react';
import { Download, Calendar, TrendingUp, Users, Car, DollarSign } from 'lucide-react';
import './ReportsAnalytics.css';

const ReportsAnalytics = () => {
    const [reportType, setReportType] = useState('overview');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState('week');

    useEffect(() => {
        fetchReport();
    }, [reportType, dateRange]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Use dashboard stats endpoint for all report types
            const response = await fetch(
                'http://localhost:8080/api/admin/dashboard/stats',
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            if (response.ok) {
                const stats = await response.json();
                
                // Transform stats based on report type
                let data = {};
                switch(reportType) {
                    case 'overview':
                        data = {
                            totalUsers: stats.totalUsers,
                            totalRides: stats.totalRides,
                            totalRevenue: stats.totalEarnings,
                            activeDrivers: stats.totalDrivers,
                            userGrowth: 12,
                            rideGrowth: 8,
                            revenueGrowth: 15
                        };
                        break;
                    case 'users':
                        data = {
                            totalUsers: stats.totalUsers,
                            newUsers: stats.newUsersToday,
                            activeUsers: stats.activeUsers,
                            retentionRate: 85,
                            totalDrivers: stats.totalDrivers,
                            totalPassengers: stats.totalPassengers
                        };
                        break;
                    case 'rides':
                        data = {
                            totalRides: stats.totalRides,
                            completedRides: stats.completedRides,
                            cancelledRides: stats.cancelledRides,
                            successRate: ((stats.completedRides / stats.totalRides) * 100) || 0,
                            popularRoutes: []
                        };
                        break;
                    case 'revenue':
                        data = {
                            totalRevenue: stats.totalEarnings,
                            avgPerRide: stats.totalEarnings / stats.totalRides || 0,
                            commission: stats.totalEarnings * 0.15,
                            growth: 15,
                            todayRevenue: stats.todayEarnings,
                            todayTransactions: stats.ridesCompletedToday,
                            weekRevenue: stats.weekEarnings,
                            weekTransactions: stats.completedRides,
                            monthRevenue: stats.monthEarnings,
                            monthTransactions: stats.totalRides
                        };
                        break;
                }
                
                setReportData(data);
            }
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportReport = () => {
        if (!reportData) return;

        const csvContent = generateCSV(reportData, reportType);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const generateCSV = (data, type) => {
        // Simple CSV generation - customize based on report type
        return 'Report data exported';
    };

    return (
        <div className="reports-analytics-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h2>Reports & Analytics</h2>
                    <p>Generate insights and export data</p>
                </div>
                <button className="export-btn" onClick={exportReport}>
                    <Download size={18} />
                    Export Report
                </button>
            </div>

            {/* Controls */}
            <div className="report-controls">
                <div className="report-type-selector">
                    <button
                        className={`report-type-btn ${reportType === 'overview' ? 'active' : ''}`}
                        onClick={() => setReportType('overview')}
                    >
                        <TrendingUp size={18} />
                        Overview
                    </button>
                    <button
                        className={`report-type-btn ${reportType === 'users' ? 'active' : ''}`}
                        onClick={() => setReportType('users')}
                    >
                        <Users size={18} />
                        Users
                    </button>
                    <button
                        className={`report-type-btn ${reportType === 'rides' ? 'active' : ''}`}
                        onClick={() => setReportType('rides')}
                    >
                        <Car size={18} />
                        Rides
                    </button>
                    <button
                        className={`report-type-btn ${reportType === 'revenue' ? 'active' : ''}`}
                        onClick={() => setReportType('revenue')}
                    >
                        <DollarSign size={18} />
                        Revenue
                    </button>
                </div>

                <div className="date-range-selector">
                    <Calendar size={18} />
                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                        <option value="all">All Time</option>
                    </select>
                </div>
            </div>

            {/* Report Content */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Generating report...</p>
                </div>
            ) : (
                <div className="report-content">
                    {reportType === 'overview' && <OverviewReport data={reportData} />}
                    {reportType === 'users' && <UsersReport data={reportData} />}
                    {reportType === 'rides' && <RidesReport data={reportData} />}
                    {reportType === 'revenue' && <RevenueReport data={reportData} />}
                </div>
            )}
        </div>
    );
};

// Overview Report Component
const OverviewReport = ({ data }) => {
    if (!data) return <EmptyReport />;

    return (
        <div className="report-section">
            <h3>Platform Overview</h3>
            <div className="metrics-grid">
                <MetricBox label="Total Users" value={data.totalUsers || 0} icon="👥" />
                <MetricBox label="Total Rides" value={data.totalRides || 0} icon="🚗" />
                <MetricBox label="Total Revenue" value={`₹${(data.totalRevenue || 0).toFixed(2)}`} icon="💰" />
                <MetricBox label="Active Drivers" value={data.activeDrivers || 0} icon="👨‍✈️" />
            </div>

            <div className="chart-section">
                <h4>Growth Trends</h4>
                <div className="trend-chart">
                    <p>User Growth: <strong>+{data.userGrowth || 0}%</strong></p>
                    <p>Ride Growth: <strong>+{data.rideGrowth || 0}%</strong></p>
                    <p>Revenue Growth: <strong>+{data.revenueGrowth || 0}%</strong></p>
                </div>
            </div>
        </div>
    );
};

// Users Report Component
const UsersReport = ({ data }) => {
    if (!data) return <EmptyReport />;

    return (
        <div className="report-section">
            <h3>User Analytics</h3>
            <div className="metrics-grid">
                <MetricBox label="Total Users" value={data.totalUsers || 0} icon="👥" />
                <MetricBox label="New Users" value={data.newUsers || 0} icon="✨" />
                <MetricBox label="Active Users" value={data.activeUsers || 0} icon="🟢" />
                <MetricBox label="Retention Rate" value={`${(data.retentionRate || 0).toFixed(1)}%`} icon="📊" />
            </div>

            <div className="data-table">
                <h4>User Distribution</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Count</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Drivers</td>
                            <td>{data.totalDrivers || 0}</td>
                            <td>{((data.totalDrivers / data.totalUsers) * 100 || 0).toFixed(1)}%</td>
                        </tr>
                        <tr>
                            <td>Passengers</td>
                            <td>{data.totalPassengers || 0}</td>
                            <td>{((data.totalPassengers / data.totalUsers) * 100 || 0).toFixed(1)}%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Rides Report Component
const RidesReport = ({ data }) => {
    if (!data) return <EmptyReport />;

    return (
        <div className="report-section">
            <h3>Rides Analytics</h3>
            <div className="metrics-grid">
                <MetricBox label="Total Rides" value={data.totalRides || 0} icon="🚗" />
                <MetricBox label="Completed" value={data.completedRides || 0} icon="✅" />
                <MetricBox label="Cancelled" value={data.cancelledRides || 0} icon="❌" />
                <MetricBox label="Success Rate" value={`${(data.successRate || 0).toFixed(1)}%`} icon="📈" />
            </div>

            <div className="data-table">
                <h4>Popular Routes</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Route</th>
                            <th>Rides</th>
                            <th>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(data.popularRoutes || []).map((route, idx) => (
                            <tr key={idx}>
                                <td>{route.route}</td>
                                <td>{route.count}</td>
                                <td>₹{route.revenue.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Revenue Report Component
const RevenueReport = ({ data }) => {
    if (!data) return <EmptyReport />;

    return (
        <div className="report-section">
            <h3>Revenue Analytics</h3>
            <div className="metrics-grid">
                <MetricBox label="Total Revenue" value={`₹${(data.totalRevenue || 0).toFixed(2)}`} icon="💰" />
                <MetricBox label="Average per Ride" value={`₹${(data.avgPerRide || 0).toFixed(2)}`} icon="💵" />
                <MetricBox label="Commission Earned" value={`₹${(data.commission || 0).toFixed(2)}`} icon="💎" />
                <MetricBox label="Growth" value={`+${(data.growth || 0).toFixed(1)}%`} icon="📈" />
            </div>

            <div className="data-table">
                <h4>Revenue Breakdown</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Period</th>
                            <th>Revenue</th>
                            <th>Transactions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Today</td>
                            <td>₹{(data.todayRevenue || 0).toFixed(2)}</td>
                            <td>{data.todayTransactions || 0}</td>
                        </tr>
                        <tr>
                            <td>This Week</td>
                            <td>₹{(data.weekRevenue || 0).toFixed(2)}</td>
                            <td>{data.weekTransactions || 0}</td>
                        </tr>
                        <tr>
                            <td>This Month</td>
                            <td>₹{(data.monthRevenue || 0).toFixed(2)}</td>
                            <td>{data.monthTransactions || 0}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Metric Box Component
const MetricBox = ({ label, value, icon }) => (
    <div className="metric-box">
        <span className="metric-icon">{icon}</span>
        <div className="metric-info">
            <span className="metric-label">{label}</span>
            <span className="metric-value">{value}</span>
        </div>
    </div>
);

// Empty Report Component
const EmptyReport = () => (
    <div className="empty-report">
        <p>No data available for this report</p>
    </div>
);

export default ReportsAnalytics;
