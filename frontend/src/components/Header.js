import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Header = () => {
  const { user, logout, role } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="professional-header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo-link">
            <div className="logo-icon">🚗</div>
            <span className="logo-text">ShareWay</span>
          </Link>
          
          {user && (
            <nav className="main-nav">
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                <span className="nav-icon">🏠</span>
                Dashboard
              </Link>
              
              {role === 'PASSENGER' && (
                <Link 
                  to="/search-rides" 
                  className={`nav-link ${isActive('/search-rides') ? 'active' : ''}`}
                >
                  <span className="nav-icon">🔍</span>
                  Search Rides
                </Link>
              )}
              
              {role === 'DRIVER' && (
                <Link 
                  to="/create-ride" 
                  className={`nav-link ${isActive('/create-ride') ? 'active' : ''}`}
                >
                  <span className="nav-icon">➕</span>
                  Create Ride
                </Link>
              )}
              
              <Link 
                to="/fare-calculator" 
                className={`nav-link ${isActive('/fare-calculator') ? 'active' : ''}`}
              >
                <span className="nav-icon">💰</span>
                Fare Calculator
              </Link>
            </nav>
          )}
        </div>

        <div className="header-right">
          {!user ? (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">Login</Link>
              <Link to="/register" className="btn-register">Register</Link>
            </div>
          ) : (
            <div className="user-section">
              <NotificationBell />
              
              <div className="user-menu-wrapper">
                <button 
                  className="user-menu-button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="user-avatar">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    <span className="user-role">{role}</span>
                  </div>
                  <span className="dropdown-arrow">{showUserMenu ? '▲' : '▼'}</span>
                </button>
                
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-user-avatar">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="dropdown-user-name">{user.name}</div>
                        <div className="dropdown-user-email">{user.email}</div>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link to="/dashboard" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      <span>🏠</span> Dashboard
                    </Link>
                    <Link to="/fare-calculator" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      <span>💰</span> Fare Calculator
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item logout-item">
                      <span>🚪</span> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .professional-header {
          background: linear-gradient(135deg, #004E89 0%, #003d6e 100%);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
          position: sticky;
          top: 0;
          z-index: 1000;
          border-bottom: 3px solid #0066CC;
        }
        
        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 70px;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 3rem;
        }
        
        .logo-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          transition: transform 0.3s ease;
        }
        
        .logo-link:hover {
          transform: scale(1.05);
        }
        
        .logo-icon {
          font-size: 2rem;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }
        
        .logo-text {
          font-size: 1.75rem;
          font-weight: 800;
          color: white;
          letter-spacing: -0.5px;
        }
        
        .main-nav {
          display: flex;
          gap: 0.5rem;
        }
        
        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .nav-link:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          transform: translateY(-2px);
        }
        
        .nav-link.active {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          font-weight: 600;
        }
        
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 3px;
          background: white;
          border-radius: 2px;
        }
        
        .nav-icon {
          font-size: 1.1rem;
        }
        
        .header-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        
        .auth-buttons {
          display: flex;
          gap: 1rem;
        }
        
        .btn-login, .btn-register {
          padding: 0.625rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        
        .btn-login {
          color: white;
          border: 2px solid white;
        }
        
        .btn-login:hover {
          background: white;
          color: #004E89;
          transform: translateY(-2px);
        }
        
        .btn-register {
          background: white;
          color: #004E89;
        }
        
        .btn-register:hover {
          background: #0066CC;
          color: white;
          transform: translateY(-2px);
        }
        
        .user-section {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        
        .user-menu-wrapper {
          position: relative;
        }
        
        .user-menu-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.15);
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 0.5rem 1rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .user-menu-button:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
        }
        
        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0066CC 0%, #004E89 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1rem;
          border: 2px solid white;
        }
        
        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        
        .user-name {
          color: white;
          font-weight: 600;
          font-size: 0.95rem;
        }
        
        .user-role {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .dropdown-arrow {
          color: white;
          font-size: 0.7rem;
          margin-left: 0.25rem;
        }
        
        .user-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
          min-width: 260px;
          overflow: hidden;
          animation: slideDown 0.3s ease;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .dropdown-header {
          padding: 1.25rem;
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .dropdown-user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #004E89 0%, #0066CC 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.25rem;
        }
        
        .dropdown-user-name {
          font-weight: 600;
          color: #1a202c;
          font-size: 1rem;
        }
        
        .dropdown-user-email {
          color: #718096;
          font-size: 0.85rem;
        }
        
        .dropdown-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 0.5rem 0;
        }
        
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1.25rem;
          color: #4a5568;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-size: 0.95rem;
        }
        
        .dropdown-item:hover {
          background: #f7fafc;
          color: #004E89;
        }
        
        .dropdown-item span {
          font-size: 1.1rem;
        }
        
        .logout-item {
          color: #ef4444;
        }
        
        .logout-item:hover {
          background: #fef2f2;
          color: #dc2626;
        }
        
        @media (max-width: 968px) {
          .main-nav {
            display: none;
          }
          
          .header-container {
            padding: 0 1rem;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
