import React, { useState, useEffect } from 'react';
import { Search, Download, DollarSign, TrendingUp, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import './PaymentsManagement.css';

const PaymentsManagement = () => {
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);

    useEffect(() => {
        fetchPaymentData();
    }, [filterStatus]);

    const fetchPaymentData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch ALL bookings for admin
            const response = await fetch('http://localhost:8080/api/bookings', { headers });

            if (response.ok) {
                let data = await response.json();
                
                // Transform bookings to payment transactions
                const payments = data.map(booking => ({
                    id: booking.id,
                    bookingId: booking.id,
                    amount: booking.totalFare || 0,
                    status: booking.paymentStatus || 'SUCCESS',
                    paymentMethod: 'Card',
                    userName: booking.passengerName,
                    createdAt: booking.bookingTime
                }));
                
                // Filter by status if needed
                if (filterStatus !== 'all') {
                    const filtered = payments.filter(p => 
                        p.status.toLowerCase() === filterStatus.toLowerCase()
                    );
                    setTransactions(filtered);
                } else {
                    setTransactions(payments);
                }
                
                // Calculate stats
                const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
                const successfulPayments = payments.filter(p => p.status === 'SUCCESS').length;
                const failedPayments = payments.filter(p => p.status === 'FAILED').length;
                const todayPayments = payments.filter(p => {
                    const paymentDate = new Date(p.createdAt);
                    const today = new Date();
                    return paymentDate.toDateString() === today.toDateString();
                });
                const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);
                
                setStats({
                    totalRevenue,
                    todayRevenue,
                    todayTransactions: todayPayments.length,
                    totalPayments: payments.length,
                    successfulPayments,
                    failedPayments
                });
            }
        } catch (error) {
            console.error('Error fetching payment data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefund = async (transactionId) => {
        if (!window.confirm('Are you sure you want to process a refund for this transaction?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/admin/payments/${transactionId}/refund`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('✅ Refund processed successfully');
                fetchPaymentData();
            } else {
                alert('❌ Failed to process refund');
            }
        } catch (error) {
            console.error('Error processing refund:', error);
        }
    };

    const exportData = () => {
        // Create CSV content
        const headers = ['ID', 'Date', 'User', 'Amount', 'Status', 'Method'];
        const rows = transactions.map(txn => [
            txn.id,
            new Date(txn.createdAt).toLocaleString(),
            txn.userName,
            txn.amount,
            txn.status,
            txn.paymentMethod
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(transactions.length / itemsPerPage);

    return (
        <div className="payments-management-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h2>Payments & Transactions</h2>
                    <p>Monitor all payment activities</p>
                </div>
                <button className="export-btn" onClick={exportData}>
                    <Download size={18} />
                    Export CSV
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="payment-stats-grid">
                    <StatCard
                        icon={<DollarSign />}
                        title="Total Revenue"
                        value={`₹${(stats.totalRevenue || 0).toFixed(2)}`}
                        subtitle="All time"
                        color="#10b981"
                    />
                    <StatCard
                        icon={<TrendingUp />}
                        title="Today's Revenue"
                        value={`₹${(stats.todayRevenue || 0).toFixed(2)}`}
                        subtitle={`${stats.todayTransactions || 0} transactions`}
                        color="#3b82f6"
                    />
                    <StatCard
                        icon={<CheckCircle />}
                        title="Success Rate"
                        value={`${((stats.successfulPayments / stats.totalPayments) * 100 || 0).toFixed(1)}%`}
                        subtitle={`${stats.successfulPayments || 0} successful`}
                        color="#8b5cf6"
                    />
                    <StatCard
                        icon={<XCircle />}
                        title="Failed Payments"
                        value={stats.failedPayments || 0}
                        subtitle="Requires attention"
                        color="#ef4444"
                    />
                </div>
            )}

            {/* Filter Tabs */}
            <div className="filter-tabs">
                <button 
                    className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('all')}
                >
                    All Transactions
                </button>
                <button 
                    className={`filter-tab ${filterStatus === 'success' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('success')}
                >
                    Successful
                </button>
                <button 
                    className={`filter-tab ${filterStatus === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('pending')}
                >
                    Pending
                </button>
                <button 
                    className={`filter-tab ${filterStatus === 'failed' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('failed')}
                >
                    Failed
                </button>
            </div>

            {/* Search Bar */}
            <div className="controls-bar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by transaction ID, user name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="refresh-btn" onClick={fetchPaymentData}>
                    <RefreshCw size={18} />
                    Refresh
                </button>
            </div>

            {/* Transactions Table */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading transactions...</p>
                </div>
            ) : transactions.length === 0 ? (
                <div className="empty-state">
                    <DollarSign size={64} color="#cbd5e1" />
                    <p>No transactions found</p>
                </div>
            ) : (
                <>
                    <div className="table-container">
                        <table className="transactions-table">
                            <thead>
                                <tr>
                                    <th>Transaction ID</th>
                                    <th>Date & Time</th>
                                    <th>User</th>
                                    <th>Booking ID</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentTransactions.map(txn => (
                                    <tr key={txn.id}>
                                        <td className="txn-id">#{txn.id}</td>
                                        <td>{new Date(txn.createdAt).toLocaleString()}</td>
                                        <td className="user-cell">
                                            <div className="user-avatar-small">
                                                {txn.userName?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            {txn.userName || 'Unknown'}
                                        </td>
                                        <td>#{txn.bookingId}</td>
                                        <td className="amount-cell">₹{txn.amount.toFixed(2)}</td>
                                        <td>
                                            <span className="payment-method">
                                                {txn.paymentMethod || 'Card'}
                                            </span>
                                        </td>
                                        <td>
                                            <StatusBadge status={txn.status} />
                                        </td>
                                        <td>
                                            {txn.status === 'SUCCESS' && (
                                                <button
                                                    className="refund-btn"
                                                    onClick={() => handleRefund(txn.id)}
                                                >
                                                    Refund
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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

// Stat Card Component
const StatCard = ({ icon, title, value, subtitle, color }) => (
    <div className="payment-stat-card" style={{ borderLeftColor: color }}>
        <div className="stat-icon" style={{ backgroundColor: `${color}20`, color }}>
            {icon}
        </div>
        <div className="stat-content">
            <h4>{title}</h4>
            <div className="stat-value">{value}</div>
            <div className="stat-subtitle">{subtitle}</div>
        </div>
    </div>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
        switch(status?.toUpperCase()) {
            case 'SUCCESS':
                return { icon: <CheckCircle size={14} />, color: '#10b981', bg: '#d1fae5' };
            case 'PENDING':
                return { icon: <Clock size={14} />, color: '#f59e0b', bg: '#fef3c7' };
            case 'FAILED':
                return { icon: <XCircle size={14} />, color: '#ef4444', bg: '#fee2e2' };
            default:
                return { icon: <Clock size={14} />, color: '#64748b', bg: '#f1f5f9' };
        }
    };

    const config = getStatusConfig(status);

    return (
        <span 
            className="status-badge"
            style={{ backgroundColor: config.bg, color: config.color }}
        >
            {config.icon}
            {status || 'Unknown'}
        </span>
    );
};

export default PaymentsManagement;
