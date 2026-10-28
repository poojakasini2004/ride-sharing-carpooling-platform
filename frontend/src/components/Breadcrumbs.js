import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumbs = () => {
  const location = useLocation();
  
  const pathnames = location.pathname.split('/').filter((x) => x);
  
  const breadcrumbNameMap = {
    '': 'Home',
    'dashboard': 'Dashboard',
    'passenger-dashboard': 'Passenger Dashboard',
    'driver-dashboard': 'Driver Dashboard',
    'search-rides': 'Search Rides',
    'create-ride': 'Create Ride',
    'register': 'Register',
    'login': 'Login',
    'profile': 'Profile',
    'payments': 'Payment History',
    'earnings': 'Earnings'
  };

  if (pathnames.length === 0 || location.pathname === '/') {
    return null;
  }

  return (
    <div className="breadcrumbs-container">
      <nav className="breadcrumbs">
        <Link to="/" className="breadcrumb-item">
          <span className="breadcrumb-icon">🏠</span>
          <span>Home</span>
        </Link>
        
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const displayName = breadcrumbNameMap[name] || name.charAt(0).toUpperCase() + name.slice(1);

          return (
            <React.Fragment key={name}>
              <span className="breadcrumb-separator">›</span>
              {isLast ? (
                <span className="breadcrumb-item active">{displayName}</span>
              ) : (
                <Link to={routeTo} className="breadcrumb-item">
                  {displayName}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      <style jsx>{`
        .breadcrumbs-container {
          background: white;
          padding: 12px 20px;
          border-bottom: 1px solid #e0e0e0;
          margin-bottom: 20px;
        }

        .breadcrumbs {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .breadcrumb-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #666;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.3s;
        }

        .breadcrumb-item:hover {
          background: #f0f0f0;
          color: #004E89;
        }

        .breadcrumb-item.active {
          color: #004E89;
          font-weight: 700;
          cursor: default;
        }

        .breadcrumb-icon {
          font-size: 16px;
        }

        .breadcrumb-separator {
          color: #ccc;
          font-size: 18px;
          user-select: none;
        }

        @media (max-width: 480px) {
          .breadcrumbs-container {
            padding: 8px 12px;
          }

          .breadcrumb-item {
            font-size: 12px;
          }

          .breadcrumb-separator {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default Breadcrumbs;
