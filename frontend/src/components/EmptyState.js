import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ type, title, message, actionText, actionLink }) => {
  const getIllustration = () => {
    switch (type) {
      case 'no-rides':
        return '🚗';
      case 'no-bookings':
        return '📅';
      case 'no-payments':
        return '💳';
      case 'no-notifications':
        return '🔕';
      case 'no-results':
        return '🔍';
      case 'error':
        return '⚠️';
      default:
        return '📭';
    }
  };

  return (
    <div className="empty-state">
      <div className="empty-illustration">
        <span className="empty-icon">{getIllustration()}</span>
        <div className="empty-circle"></div>
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-message">{message}</p>
      {actionText && actionLink && (
        <Link to={actionLink} className="empty-action">
          {actionText}
        </Link>
      )}

      <style jsx>{`
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 16px;
          border: 2px dashed #e2e8f0;
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .empty-illustration {
          position: relative;
          display: inline-block;
          margin-bottom: 30px;
        }

        .empty-icon {
          font-size: 100px;
          display: block;
          position: relative;
          z-index: 2;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .empty-circle {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 20px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          filter: blur(10px);
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: translateX(-50%) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateX(-50%) scale(1.2);
            opacity: 0.2;
          }
        }

        .empty-title {
          color: #333;
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 16px 0;
          font-family: 'Poppins', sans-serif;
        }

        .empty-message {
          color: #666;
          font-size: 16px;
          line-height: 1.6;
          margin: 0 0 30px 0;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .empty-action {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          background: linear-gradient(135deg, #004E89 0%, #003d6e 100%);
          color: white;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 700;
          font-size: 16px;
          box-shadow: 0 8px 24px rgba(0, 78, 137, 0.3);
          transition: all 0.3s;
        }

        .empty-action:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0, 78, 137, 0.4);
        }

        @media (max-width: 480px) {
          .empty-state {
            padding: 60px 20px;
          }

          .empty-icon {
            font-size: 80px;
          }

          .empty-title {
            font-size: 24px;
          }

          .empty-message {
            font-size: 14px;
          }

          .empty-action {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default EmptyState;
