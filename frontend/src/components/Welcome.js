import React from 'react';
import { Link } from 'react-router-dom';

const Welcome = () => {
  return (
    <div className="welcome-page">
      <header className="welcome-hero">
        <div className="hero-content">
          <div className="hero-badge">🚗 Smart Ride Sharing</div>
          <h1 className="hero-title">
            Welcome to <span className="gradient-text">ShareWay</span>
          </h1>
          <p className="hero-subtitle">Your journey, shared smarter</p>
          <p className="hero-description">
            Connect with drivers and passengers for convenient, eco-friendly, and affordable travel. 
            Join thousands making their commute better every day.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-hero-primary">
              <span>🚀</span> Get Started Free
            </Link>
            <Link to="/login" className="btn btn-hero-secondary">
              <span>👋</span> Sign In
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-value">10K+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">50K+</div>
              <div className="stat-label">Rides Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">4.8★</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
        </div>
      </header>

      <section className="features-section">
        <h2 className="section-title">Why Choose ShareWay?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Easy Booking</h3>
            <p>Find and book rides in seconds with our intuitive search and matching system</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Save Money</h3>
            <p>Share costs and reduce your travel expenses while helping the environment</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Safe & Secure</h3>
            <p>Verified users, secure payments, and real-time tracking for peace of mind</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Real-time Updates</h3>
            <p>Get instant notifications about your rides and bookings</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Eco-Friendly</h3>
            <p>Reduce carbon footprint by sharing rides and helping the planet</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Rated Drivers</h3>
            <p>Choose from highly-rated drivers with verified profiles and reviews</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join ShareWay today and experience smarter travel</p>
          <Link to="/register" className="btn btn-cta">Create Your Account →</Link>
        </div>
      </section>
    </div>
  );
};

export default Welcome;
