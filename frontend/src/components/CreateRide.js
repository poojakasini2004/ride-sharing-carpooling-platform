import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const CreateRide = () => {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departureTime: '',
    availableSeats: 1,
    price: 0
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [calculatingFare, setCalculatingFare] = useState(false);
  const [fareEstimate, setFareEstimate] = useState(null);
  const navigate = useNavigate();
  const { token, userId } = React.useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear fare estimate when origin or destination changes
    if (e.target.name === 'origin' || e.target.name === 'destination') {
      setFareEstimate(null);
    }
  };

  const calculateFare = async () => {
    if (!formData.origin || !formData.destination) {
      toast.warning('⚠️ Please enter both origin and destination');
      return;
    }

    setCalculatingFare(true);
    try {
      const response = await axios.get('http://localhost:8080/api/fare/estimate', {
        params: {
          source: formData.origin,
          destination: formData.destination,
          vehicleType: 'SEDAN', // Default, will be auto-detected from driver profile
          passengers: 1
        }
      });

      if (response.data.success) {
        setFareEstimate(response.data);
        setFormData({ ...formData, price: response.data.totalFare });
        toast.success(`✅ Estimated fare: ₹${response.data.totalFare.toFixed(2)} for ${response.data.distanceInKm.toFixed(2)} km`);
      } else {
        toast.error('❌ ' + response.data.errorMessage);
      }
    } catch (err) {
      console.error('Error calculating fare:', err);
      toast.error('❌ Could not calculate fare. You can enter manually.');
    } finally {
      setCalculatingFare(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Validate required fields
    if (!token || !userId) {
      toast.error('❌ Please login to create a ride');
      navigate('/login');
      setLoading(false);
      return;
    }
    
    if (!formData.origin || !formData.destination) {
      toast.error('❌ Please enter both origin and destination');
      setLoading(false);
      return;
    }
    
    if (!formData.departureTime) {
      toast.error('❌ Please select departure time');
      setLoading(false);
      return;
    }
    
    if (formData.availableSeats < 1) {
      toast.error('❌ Please enter valid number of seats');
      setLoading(false);
      return;
    }
    
    try {
      const rideData = {
        origin: formData.origin.trim(),
        destination: formData.destination.trim(),
        departureTime: formData.departureTime,
        availableSeats: parseInt(formData.availableSeats),
        price: parseFloat(formData.price) || 0,
        driverId: parseInt(userId) // Include driver ID in request body
      };
      
      console.log('Creating ride with data:', rideData);
      console.log('Using token:', token ? 'Present' : 'Missing');
      
      const response = await axios.post('http://localhost:8080/api/rides/create', rideData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Ride created successfully:', response.data);
      toast.success('✅ Ride posted successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Failed to create ride', err);
      console.error('Error response:', err.response);
      
      // Handle 404 - endpoint not found (shouldn't happen if backend is running)
      if (err.response?.status === 404) {
        toast.error('❌ API endpoint not found. Please check if backend is running.');
        setError('Backend service unavailable. Please try again later.');
        setLoading(false);
        return;
      }
      
      // Handle 401/403 - authentication error
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('🔒 Session expired. Please login again.');
        localStorage.clear();
        navigate('/login');
        setLoading(false);
        return;
      }
      
      // Handle 400 - validation error
      if (err.response?.status === 400) {
        const errorMsg = err.response.data?.message || err.response.data?.error || 'Invalid ride data';
        toast.error(`❌ ${errorMsg}`);
        setError(errorMsg);
        setLoading(false);
        return;
      }
      
      // Properly extract error message
      let errorMsg = 'Failed to create ride. Please try again.';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        } else if (err.response.data.error) {
          errorMsg = err.response.data.error;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
      toast.error('❌ ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-ride-container">
      <div className="create-ride-form">
        <h2 className="form-title">Create New Ride</h2>
        <p className="form-subtitle">Share your ride and earn money</p>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="origin">Starting Location (Origin):</label>
            <input 
              type="text" 
              id="origin"
              name="origin" 
              value={formData.origin} 
              onChange={handleChange} 
              placeholder="e.g., Tirupati"
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="destination">Destination:</label>
            <input 
              type="text" 
              id="destination"
              name="destination" 
              value={formData.destination} 
              onChange={handleChange} 
              placeholder="e.g., Chennai"
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="departureTime">Departure Time:</label>
            <input 
              type="datetime-local" 
              id="departureTime"
              name="departureTime" 
              value={formData.departureTime} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="availableSeats">Available Seats:</label>
            <input 
              type="number" 
              id="availableSeats"
              name="availableSeats" 
              value={formData.availableSeats} 
              onChange={handleChange} 
              min="1" 
              max="8"
              placeholder="1-8"
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="price">Price per Seat (INR):</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="number" 
                id="price"
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                min="0" 
                step="0.01"
                placeholder="e.g., 50"
                required 
                style={{ flex: 1 }}
              />
              <button 
                type="button" 
                onClick={calculateFare} 
                disabled={calculatingFare || !formData.origin || !formData.destination}
                style={{
                  padding: '15px 20px',
                  background: 'linear-gradient(135deg, #004E89, #003d6e)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  opacity: (calculatingFare || !formData.origin || !formData.destination) ? 0.6 : 1
                }}
              >
                {calculatingFare ? '⏳ Calculating...' : '🧮 Auto Calculate'}
              </button>
            </div>
            {fareEstimate && (
              <div style={{
                marginTop: '10px',
                padding: '12px',
                background: 'linear-gradient(135deg, #d4edda, #c3e6cb)',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#155724'
              }}>
                💡 Distance: {fareEstimate.distanceInKm.toFixed(2)} km | 
                Suggested Fare: ₹{fareEstimate.totalFare.toFixed(2)}
              </div>
            )}
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating Ride...' : 'Create Ride'}
          </button>
        </form>
        <div className="form-footer">
          <p>After creating, your ride will appear in passenger search results.</p>
        </div>
      </div>
      <style>{`
        .create-ride-container {
          max-width: 650px;
          margin: 0 auto;
          padding: 25px;
          background: linear-gradient(135deg, #f0f8ff, #e6f3ff);
          border-radius: 20px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          transition: transform 0.3s ease;
        }
        .create-ride-container:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 45px rgba(0,0,0,0.15);
        }
        .create-ride-form {
          background: linear-gradient(135deg, #ffffff, #f8f9fa);
          padding: 35px;
          border-radius: 15px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        .form-title {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 10px;
          font-size: 32px;
          font-weight: 900;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .form-subtitle {
          text-align: center;
          color: #6c757d;
          margin-bottom: 35px;
          font-size: 18px;
          font-weight: 500;
        }
        .error-message {
          background: linear-gradient(135deg, #ffe6e6, #ffcccc);
          color: #c33;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 25px;
          border-left: 5px solid #c33;
          font-weight: 600;
        }
        .success-message {
          background: linear-gradient(135deg, #d4edda, #c3e6cb);
          color: #155724;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 25px;
          border-left: 5px solid #28a745;
          font-weight: 600;
          animation: slideIn 0.5s ease;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .form-group {
          margin-bottom: 25px;
        }
        .form-group label {
          display: block;
          margin-bottom: 10px;
          color: #495057;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 0.02em;
        }
        .form-group input, .form-group select {
          width: 100%;
          padding: 15px 18px;
          border: 2px solid #ced4da;
          border-radius: 10px;
          font-size: 16px;
          box-sizing: border-box;
          transition: border-color 0.4s ease, box-shadow 0.4s ease;
          background-color: #f8f9fa;
        }
        .form-group input:focus, .form-group select:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.15);
          background-color: #ffffff;
        }
        .form-group input::placeholder {
          color: #adb5bd;
        }
        .submit-btn {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 20px;
          font-weight: 900;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          margin-top: 15px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(40, 167, 69, 0.5);
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .form-footer {
          text-align: center;
          margin-top: 25px;
          color: #6c757d;
          font-size: 16px;
          font-weight: 500;
        }
        @media (max-width: 600px) {
          .create-ride-container {
            margin: 15px;
            padding: 20px;
          }
          .create-ride-form {
            padding: 25px;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateRide;
