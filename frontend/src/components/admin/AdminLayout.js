import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Car, 
    DollarSign, 
    Star, 
    BarChart3, 
    Settings, 
    Bell,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notifications, setNotifications] = useState(3);

    const adminName = localStorage.getItem('userName') || 'Admin';

    const menuItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: null },
        { path: '/admin/users', icon: Users, label: 'Users', badge: null },
        { path: '/admin/rides', icon: Car, label: 'Rides', badge: null },
        { path: '/admin/payments', icon: DollarSign, label: 'Payments', badge: null },
        { path: '/admin/reviews', icon: Star, label: 'Reviews', badge: null },
        { path: '/admin/reports', icon: BarChart3, label: 'Reports', badge: null },
        { path: '/admin/settings', icon: Settings, label: 'Settings', badge: null },
    ];

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            navigate('/login');
        }
    };

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <Car size={32} />
                        <span className="logo-text">ShareWay Admin</span>
                    </div>
                    <button 
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.path}
                                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                                onClick={() => navigate(item.path)}
                            >
                                <Icon size={20} />
                                <span className="nav-label">{item.label}</span>
                                {item.badge && <span className="nav-badge">{item.badge}</span>}
                            </button>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span className="nav-label">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="admin-main">
                {/* Top Header */}
                <header className="admin-header">
                    <div className="header-left">
                        <button 
                            className="mobile-menu-btn"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="page-title">
                            {menuItems.find(item => isActive(item.path))?.label || 'Admin Panel'}
                        </h1>
                    </div>
                    
                    <div className="header-right">
                        <button className="notification-btn">
                            <Bell size={20} />
                            {notifications > 0 && (
                                <span className="notification-badge">{notifications}</span>
                            )}
                        </button>
                        
                        <div className="admin-profile">
                            <div className="profile-avatar">
                                {adminName.charAt(0).toUpperCase()}
                            </div>
                            <div className="profile-info">
                                <span className="profile-name">{adminName}</span>
                                <span className="profile-role">Administrator</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="admin-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
