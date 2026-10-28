import React from 'react';
import './StatCard.css';

const StatCard = ({ icon, title, value, subtitle, color = 'blue', trend }) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-icon">
        <span>{icon}</span>
      </div>
      <div className="stat-card-content">
        <div className="stat-card-title">{title}</div>
        <div className="stat-card-value">{value}</div>
        {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
        {trend && (
          <div className={`stat-card-trend ${trend.type}`}>
            <span>{trend.type === 'up' ? '↑' : '↓'}</span>
            {trend.value}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
