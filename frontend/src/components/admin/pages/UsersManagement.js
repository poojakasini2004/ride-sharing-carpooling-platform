import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Ban, CheckCircle, XCircle, UserCheck, Download } from 'lucide-react';
import './UsersManagement.css';

const UsersManagement = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetchUsers();
    }, [activeTab]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = activeTab === 'all' 
                ? 'http://localhost:8080/api/admin/users'
                : `http://localhost:8080/api/admin/users/role/${activeTab}`;
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
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
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:8080/api/admin/users/search?q=${searchQuery}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
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
        
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
        
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
                alert(`✅ User ${action}ed successfully`);
                fetchUsers();
            } else {
                alert(`❌ Failed to ${action} user`);
            }
        } catch (error) {
            console.error('Error updating user status:', error);
            alert(`❌ Error: ${error.message}`);
        }
    };

    const verifyDriver = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/admin/drivers/${userId}/verify`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                alert('✅ Driver verified successfully');
                fetchUsers();
            } else {
                alert('❌ Failed to verify driver');
            }
        } catch (error) {
            console.error('Error verifying driver:', error);
        }
    };

    const viewUserDetails = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(users.length / itemsPerPage);

    return (
        <div className="users-management-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h2>Users Management</h2>
                    <p>Manage drivers and passengers</p>
                </div>
                <button className="export-btn">
                    <Download size={18} />
                    Export Data
                </button>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <button 
                    className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All Users ({users.length})
                </button>
                <button 
                    className={`tab ${activeTab === 'driver' ? 'active' : ''}`}
                    onClick={() => setActiveTab('driver')}
                >
                    Drivers
                </button>
                <button 
                    className={`tab ${activeTab === 'passenger' ? 'active' : ''}`}
                    onClick={() => setActiveTab('passenger')}
                >
                    Passengers
                </button>
            </div>

            {/* Search and Filters */}
            <div className="controls-bar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <button className="filter-btn">
                    <Filter size={18} />
                    Filters
                </button>
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading users...</p>
                </div>
            ) : users.length === 0 ? (
                <div className="empty-state">
                    <p>No users found</p>
                </div>
            ) : (
                <>
                    <div className="table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Verified</th>
                                    <th>Rating</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>#{user.id}</td>
                                        <td className="user-name-cell">
                                            <div className="user-avatar">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            {user.name}
                                        </td>
                                        <td>{user.email}</td>
                                        <td>{user.phone || 'N/A'}</td>
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
                                        <td className="verified-cell">
                                            {user.verified ? (
                                                <CheckCircle size={18} color="#10b981" />
                                            ) : (
                                                <XCircle size={18} color="#ef4444" />
                                            )}
                                        </td>
                                        <td>
                                            <span className="rating">
                                                ⭐ {user.rating ? user.rating.toFixed(1) : 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="action-btn view"
                                                    onClick={() => viewUserDetails(user)}
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {user.role === 'DRIVER' && !user.verified && (
                                                    <button
                                                        className="action-btn verify"
                                                        onClick={() => verifyDriver(user.id)}
                                                        title="Verify Driver"
                                                    >
                                                        <UserCheck size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    className={`action-btn ${user.active ? 'block' : 'activate'}`}
                                                    onClick={() => toggleUserStatus(user.id, user.active)}
                                                    title={user.active ? 'Block User' : 'Activate User'}
                                                >
                                                    <Ban size={16} />
                                                </button>
                                            </div>
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

            {/* User Details Modal */}
            {showModal && selectedUser && (
                <UserDetailsModal 
                    user={selectedUser} 
                    onClose={() => setShowModal(false)} 
                />
            )}
        </div>
    );
};

// User Details Modal Component
const UserDetailsModal = ({ user, onClose }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                <h3>User Details</h3>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <div className="modal-body">
                <div className="user-detail-grid">
                    <DetailRow label="User ID" value={`#${user.id}`} />
                    <DetailRow label="Name" value={user.name} />
                    <DetailRow label="Email" value={user.email} />
                    <DetailRow label="Phone" value={user.phone || 'N/A'} />
                    <DetailRow label="Role" value={user.role} />
                    <DetailRow label="Status" value={user.active ? 'Active' : 'Blocked'} />
                    <DetailRow label="Verified" value={user.verified ? 'Yes' : 'No'} />
                    <DetailRow label="Rating" value={user.rating ? user.rating.toFixed(1) : 'N/A'} />
                    {user.role === 'DRIVER' && (
                        <>
                            <DetailRow label="Vehicle Type" value={user.vehicleType || 'N/A'} />
                            <DetailRow label="Vehicle Model" value={user.vehicleModel || 'N/A'} />
                            <DetailRow label="License Plate" value={user.licensePlate || 'N/A'} />
                        </>
                    )}
                </div>
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

export default UsersManagement;
