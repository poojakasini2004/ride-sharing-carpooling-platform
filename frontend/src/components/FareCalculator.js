import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FareCalculator.css';

const FareCalculator = () => {
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    vehicleType: 'SEDAN',
    numberOfPassengers: 1
  });

  const [fareData, setFareData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fareRates, setFareRates] = useState(null);

  useEffect(() => {
    // Load fare rates on component mount
    fetchFareRates();
  }, []);

  const fetchFareRates = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/fare/rates');
      setFareRates(response.data);
    } catch (err) {
      console.error('Error fetching fare rates:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateFare = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFareData(null);

    try {
      const response = await axios.post('http://localhost:8080/api/fare/calculate', formData);
      
      if (response.data.success) {
        setFareData(response.data);
      } else {
        setError(response.data.errorMessage || 'Failed to calculate fare');
      }
    } catch (err) {
      setError(err.response?.data?.errorMessage || 'Error calculating fare. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const quickEstimate = async () => {
    if (!formData.source || !formData.destination) {
      setError('Please enter source and destination');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get('http://localhost:8080/api/fare/estimate', {
        params: {
          source: formData.source,
          destination: formData.destination,
          vehicleType: formData.vehicleType,
          passengers: formData.numberOfPassengers
        }
      });

      if (response.data.success) {
        setFareData(response.data);
      } else {
        setError(response.data.errorMessage || 'Failed to calculate fare');
      }
    } catch (err) {
      setError('Error calculating fare. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fare-calculator-container">
      <div className="fare-calculator-card">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ 
            fontSize: '60px', 
            marginBottom: '10px',
            animation: 'bounce 2s ease-in-out infinite'
          }}>
            🚗
          </div>
          <h2>Fare Calculator</h2>
          <p className="subtitle">Calculate your ride fare instantly with real-time distance tracking</p>
        </div>

        <form onSubmit={calculateFare}>
          <div className="form-group">
            <label>
              <span style={{ fontSize: '20px', marginRight: '8px' }}>📍</span>
              Pickup Location
            </label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              placeholder="e.g., Mumbai Central Station"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <span style={{ fontSize: '20px', marginRight: '8px' }}>🎯</span>
              Drop Location
            </label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="e.g., Gateway of India, Mumbai"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <span style={{ fontSize: '20px', marginRight: '8px' }}>🚙</span>
                Vehicle Type
              </label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
              >
                <option value="HATCHBACK">Hatchback</option>
                <option value="SEDAN">Sedan</option>
                <option value="SUV">SUV</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <span style={{ fontSize: '20px', marginRight: '8px' }}>👥</span>
                Passengers
              </label>
              <input
                type="number"
                name="numberOfPassengers"
                value={formData.numberOfPassengers}
                onChange={handleChange}
                min="1"
                max="6"
              />
            </div>
          </div>

          <div className="button-group">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '⏳ Calculating...' : '🧮 Calculate Fare'}
            </button>
            <button type="button" className="btn-secondary" onClick={quickEstimate} disabled={loading}>
              {loading ? '⏳ Loading...' : '⚡ Quick Estimate'}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {fareData && (
          <div className="fare-result">
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <span style={{ fontSize: '40px' }}>💰</span>
            </div>
            <h3>Fare Details</h3>
            <div className="fare-breakdown">
              <div className="fare-item">
                <span className="label">📏 Distance:</span>
                <span className="value">{fareData.distanceInKm.toFixed(2)} km</span>
              </div>
              <div className="fare-item">
                <span className="label">🚗 Vehicle Type:</span>
                <span className="value">{fareData.vehicleType}</span>
              </div>
              <div className="fare-item">
                <span className="label">💵 Base Fare:</span>
                <span className="value">₹{fareData.baseFare.toFixed(2)}</span>
              </div>
              <div className="fare-item">
                <span className="label">📊 Per Km Rate:</span>
                <span className="value">₹{fareData.perKmRate.toFixed(2)}/km</span>
              </div>
              <div className="fare-item total">
                <span className="label">💳 Total Fare:</span>
                <span className="value">₹{fareData.totalFare.toFixed(2)}</span>
              </div>
              {formData.numberOfPassengers > 1 && (
                <div className="fare-item highlight">
                  <span className="label">👤 Per Passenger:</span>
                  <span className="value">₹{fareData.farePerPassenger.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {fareRates && (
          <div className="fare-rates">
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <span style={{ fontSize: '35px' }}>📊</span>
            </div>
            <h3>Pricing Information</h3>
            <div className="rates-grid">
              {Object.entries(fareRates).map(([vehicle, rates]) => {
                const vehicleIcon = vehicle === 'HATCHBACK' ? '🚗' : vehicle === 'SEDAN' ? '🚙' : '🚐';
                return (
                  <div key={vehicle} className="rate-card">
                    <div style={{ fontSize: '30px', marginBottom: '10px' }}>{vehicleIcon}</div>
                    <h4>{vehicle}</h4>
                    <p>💵 Base: ₹{rates.baseFare}</p>
                    <p>📏 Per km: ₹{rates.perKmRate}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FareCalculator;
