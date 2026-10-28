import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SearchRides = () => {
  const [searchParams, setSearchParams] = useState({
    source: '',
    destination: '',
    datetime: '',
    priceMin: '',
    priceMax: '',
    vehicleType: '',
    ratingMin: ''
  });
  const [rides, setRides] = useState([]);
  const [matches, setMatches] = useState([]);
  const [detour, setDetour] = useState({ maxDetourKm: '5', maxDetourPercent: '20' });
  const [loading, setLoading] = useState(false);
  const [matchLoading, setMatchLoading] = useState(false);
  const [sortBy, setSortBy] = useState('price'); // price, time, rating
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAvailableRides = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/rides/available', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRides(response.data);
      } catch (err) {
        console.error('Failed to fetch available rides', err);
      }
    };
    fetchAvailableRides();
  }, [token]);

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams);
      const response = await axios.get(`http://localhost:8080/api/rides/search?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let results = response.data;
      
      // Apply sorting
      results = sortRides(results);
      
      setRides(results);
      setMatches([]);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const sortRides = (ridesList) => {
    return [...ridesList].sort((a, b) => {
      switch(sortBy) {
        case 'price':
          return a.price - b.price;
        case 'time':
          return new Date(a.departureTime) - new Date(b.departureTime);
        case 'rating':
          return (b.driverRating || 0) - (a.driverRating || 0);
        default:
          return 0;
      }
    });
  };

  const handleMatch = async () => {
    try {
      if (!searchParams.source || !searchParams.destination || !searchParams.datetime) {
        alert('⚠️ Please enter source, destination, and date/time to find matches');
        return;
      }
      
      setMatchLoading(true);
      const params = new URLSearchParams();
      params.set('source', searchParams.source);
      params.set('destination', searchParams.destination);
      params.set('earliestDeparture', searchParams.datetime);
      if (detour.maxDetourKm) params.set('maxDetourKm', detour.maxDetourKm);
      if (detour.maxDetourPercent) params.set('maxDetourPercent', detour.maxDetourPercent);

      const url = `http://localhost:8080/api/rides/match?${params.toString()}`;
      const response = await axios.get(url);
      const matchResults = response.data || [];
      
      // Categorize matches
      const directMatches = matchResults.filter(m => m.matchType === 'DIRECT');
      const partialMatches = matchResults.filter(m => m.matchType === 'PARTIAL');
      
      console.log('🎯 Direct Matches:', directMatches.length);
      console.log('🧭 Partial Matches:', partialMatches.length);
      
      setMatches(matchResults);
    } catch (err) {
      console.error('Match fetch failed', err);
      alert('❌ Failed to find matches. Please try again.');
    } finally {
      setMatchLoading(false);
    }
  };

  const getMatchBadge = (matchType) => {
    if (matchType === 'DIRECT') {
      return { icon: '🎯', label: 'Direct Match', color: '#004E89' };
    } else if (matchType === 'PARTIAL') {
      return { icon: '🧭', label: 'Partial Match', color: '#0066CC' };
    }
    return { icon: '📍', label: 'Match', color: '#6b7280' };
  };

  const handleBook = (rideId) => {
    navigate(`/book-ride/${rideId}`);
  };

  return (
    <div className="search-rides">
      <div className="page-header">
        <h2>🔍 Search Rides</h2>
        <p className="page-subtitle">Find your perfect ride with smart route matching</p>
      </div>
      
      <form onSubmit={handleSearch} className="search-form">
        <div className="form-row">
          <div className="form-group">
            <label>Source:</label>
            <input type="text" name="source" value={searchParams.source} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Destination:</label>
            <input type="text" name="destination" value={searchParams.destination} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>DateTime:</label>
            <input type="datetime-local" name="datetime" value={searchParams.datetime} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Vehicle Type:</label>
            <input type="text" name="vehicleType" value={searchParams.vehicleType} onChange={handleChange} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Min Price:</label>
            <input type="number" name="priceMin" value={searchParams.priceMin} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Max Price:</label>
            <input type="number" name="priceMax" value={searchParams.priceMax} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Min Rating:</label>
            <input type="number" name="ratingMin" value={searchParams.ratingMin} onChange={handleChange} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Max Detour (km):</label>
            <input type="number" name="maxDetourKm" value={detour.maxDetourKm}
                   onChange={(e) => setDetour({ ...detour, maxDetourKm: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Max Detour (%):</label>
            <input type="number" name="maxDetourPercent" value={detour.maxDetourPercent}
                   onChange={(e) => setDetour({ ...detour, maxDetourPercent: e.target.value })} />
          </div>
          <div className="form-group" style={{display:'flex',alignItems:'flex-end'}}>
            <button type="button" className="search-btn" onClick={handleMatch}>Find Best Matches</button>
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="search-btn primary" disabled={loading}>
            {loading ? '🔄 Searching...' : '🔍 Search Rides'}
          </button>
          <button type="button" className="filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? '📊 Hide Filters' : '📊 Show Filters'}
          </button>
        </div>
      </form>
      
      {showFilters && (
        <div className="filters-panel">
          <h4>🎛️ Sort & Filter</h4>
          <div className="filter-options">
            <div className="filter-group">
              <label>Sort By:</label>
              <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setRides(sortRides(rides)); }}>
                <option value="price">💰 Price (Low to High)</option>
                <option value="time">🕐 Departure Time</option>
                <option value="rating">⭐ Rating (High to Low)</option>
              </select>
            </div>
          </div>
        </div>
      )}
      {rides.length > 0 && (
        <div className="results-header">
          <h3>🚗 Available Rides</h3>
          <span className="results-count">{rides.length} rides found</span>
        </div>
      )}
      <div className="rides-list">
        {rides.length === 0 ? (
          <div className="no-rides">
            <div className="no-rides-icon">🔍</div>
            <h3>No rides found</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        ) : (
          rides.map((ride, index) => {
            const vehicleIcon = ride.vehicleType === 'HATCHBACK' ? '🚗' : 
                               ride.vehicleType === 'SEDAN' ? '🚙' : 
                               ride.vehicleType === 'SUV' ? '🚐' : '🚕';
            return (
              <div key={ride.id} className="ride-card" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="ride-card-header">
                  <div className="vehicle-badge">
                    <span className="vehicle-icon">{vehicleIcon}</span>
                    <span className="vehicle-type">{ride.vehicleType || 'Car'}</span>
                  </div>
                  <div className="price-badge">
                    <span className="price-label">₹</span>
                    <span className="price-value">{ride.price}</span>
                  </div>
                </div>
                
                <div className="ride-route">
                  <div className="route-point">
                    <span className="route-icon">📍</span>
                    <div className="route-details">
                      <span className="route-label">From</span>
                      <span className="route-location">{ride.origin}</span>
                    </div>
                  </div>
                  <div className="route-line">
                    <div className="route-arrow">→</div>
                  </div>
                  <div className="route-point">
                    <span className="route-icon">🎯</span>
                    <div className="route-details">
                      <span className="route-label">To</span>
                      <span className="route-location">{ride.destination}</span>
                    </div>
                  </div>
                </div>

                <div className="ride-info">
                  <div className="info-item">
                    <span className="info-icon">🕐</span>
                    <div className="info-content">
                      <span className="info-label">Departure</span>
                      <span className="info-value">{new Date(ride.departureTime).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">💺</span>
                    <div className="info-content">
                      <span className="info-label">Seats</span>
                      <span className="info-value">{ride.availableSeats} available</span>
                    </div>
                  </div>
                  {ride.distanceKm && (
                    <div className="info-item">
                      <span className="info-icon">📏</span>
                      <div className="info-content">
                        <span className="info-label">Distance</span>
                        <span className="info-value">{ride.distanceKm.toFixed(1)} km</span>
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={() => handleBook(ride.id)} className="book-btn">
                  <span className="btn-icon">🎫</span>
                  <span>Book Now</span>
                  <span className="btn-arrow">→</span>
                </button>
              </div>
            );
          })
        )}
      </div>
      {matches && matches.length > 0 && (
        <>
          <div className="results-header match-header" style={{marginTop:'24px'}}>
            <div>
              <h3>🎯 Smart Route Matches</h3>
              <p className="match-subtitle">
                {matches.filter(m => m.matchType === 'DIRECT').length} direct • 
                {matches.filter(m => m.matchType === 'PARTIAL').length} partial matches
              </p>
            </div>
            <span className="results-count">{matches.length} total</span>
          </div>
          <div className="rides-list">
            {matches.map((m, idx) => (
              <div key={`${m.rideId}-${idx}`} className="ride-card match-card" style={{animationDelay: `${idx * 0.1}s`}}>
                <div className="match-type-badge" style={{backgroundColor: getMatchBadge(m.matchType).color}}>
                  <span>{getMatchBadge(m.matchType).icon}</span>
                  <span>{getMatchBadge(m.matchType).label}</span>
                </div>
                <div className="ride-card-header">
                  <div className="vehicle-badge">
                    <span className="vehicle-icon">{m.vehicleType === 'SUV' ? '🚐' : m.vehicleType === 'SEDAN' ? '🚙' : '🚗'}</span>
                    <span className="vehicle-type">{m.vehicleType || 'Car'}</span>
                  </div>
                  <div className="price-badge">
                    <span className="price-label">₹</span>
                    <span className="price-value">{m.price}</span>
                  </div>
                </div>

                <div className="ride-route">
                  <div className="route-point">
                    <span className="route-icon">📍</span>
                    <div className="route-details">
                      <span className="route-label">From</span>
                      <span className="route-location">{m.source}</span>
                    </div>
                  </div>
                  <div className="route-line"><div className="route-arrow">→</div></div>
                  <div className="route-point">
                    <span className="route-icon">🎯</span>
                    <div className="route-details">
                      <span className="route-label">To</span>
                      <span className="route-location">{m.destination}</span>
                    </div>
                  </div>
                </div>

                <div className="ride-info">
                  <div className="info-item">
                    <span className="info-icon">🕐</span>
                    <div className="info-content">
                      <span className="info-label">Departure</span>
                      <span className="info-value">{new Date(m.departureTime || Date.now()).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                  {m.detourKm != null && (
                    <div className="info-item">
                      <span className="info-icon">➕</span>
                      <div className="info-content">
                        <span className="info-label">Detour</span>
                        <span className="info-value">{m.detourKm.toFixed(1)} km</span>
                      </div>
                    </div>
                  )}
                  {m.rideDistanceKm != null && (
                    <div className="info-item">
                      <span className="info-icon">📏</span>
                      <div className="info-content">
                        <span className="info-label">Base Distance</span>
                        <span className="info-value">{m.rideDistanceKm.toFixed(1)} km</span>
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={() => handleBook(m.rideId)} className="book-btn">
                  <span className="btn-icon">🎫</span>
                  <span>Book This Ride</span>
                  <span className="btn-arrow">→</span>
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      <style jsx>{`
        .search-rides {
          padding: 30px;
          max-width: 1200px;
          margin: 0 auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          transition: transform 0.3s ease;
        }
        .search-rides:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 128, 128, 0.15);
        }
        .page-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .page-header h2 {
          font-size: 2.5rem;
          background: linear-gradient(135deg, #004E89 0%, #003d6e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }
        .page-subtitle {
          color: #4a5568;
          font-size: 1.1rem;
        }
        .search-form {
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          padding: 30px;
          border-radius: 20px;
          margin-bottom: 30px;
          box-shadow: 0 15px 35px rgba(0, 78, 137, 0.2);
          border: 2px solid rgba(0, 78, 137, 0.1);
        }
        .form-row {
          display: flex;
          gap: 25px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .form-group {
          flex: 1;
          min-width: 220px;
        }
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 700;
          color: #004E89;
          font-size: 1rem;
          letter-spacing: 0.03em;
        }
        input, select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #dbeafe;
          border-radius: 12px;
          font-size: 1rem;
          box-sizing: border-box;
          transition: all 0.3s ease;
          background-color: white;
          font-family: 'Inter', sans-serif;
        }
        input:focus, select:focus {
          outline: none;
          border-color: #004E89;
          box-shadow: 0 0 0 4px rgba(0, 78, 137, 0.1);
          transform: translateY(-2px);
        }
        .form-actions {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }
        .search-btn {
          flex: 1;
          padding: 14px 28px;
          background: linear-gradient(135deg, #004E89, #003d6e);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: 700;
          box-shadow: 0 8px 20px rgba(0, 78, 137, 0.4);
          transition: all 0.3s ease;
        }
        .search-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0, 78, 137, 0.5);
        }
        .search-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .filter-toggle-btn {
          padding: 14px 24px;
          background: white;
          color: #004E89;
          border: 2px solid #004E89;
          border-radius: 12px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .filter-toggle-btn:hover {
          background: #004E89;
          color: white;
        }
        .filters-panel {
          background: white;
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(0, 78, 137, 0.15);
          border: 2px solid #dbeafe;
        }
        .filters-panel h4 {
          margin: 0 0 15px 0;
          color: #004E89;
        }
        .filter-options {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }
        .filter-group {
          flex: 1;
          min-width: 200px;
        }
        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #004E89 0%, #003d6e 100%);
          border-radius: 15px;
          color: white;
          box-shadow: 0 10px 30px rgba(0, 78, 137, 0.3);
        }
        .match-header {
          background: linear-gradient(135deg, #0066CC 0%, #004E89 100%);
        }
        .match-subtitle {
          font-size: 0.9rem;
          opacity: 0.9;
          margin-top: 5px;
        }
        .results-header h3 {
          margin: 0;
          font-size: 28px;
          font-weight: 800;
        }
        .results-count {
          background: rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          backdrop-filter: blur(10px);
        }
        .rides-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .no-rides {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 20px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 20px;
          animation: fadeIn 0.5s ease-out;
        }
        .no-rides-icon {
          font-size: 80px;
          margin-bottom: 20px;
          animation: bounce 2s ease-in-out infinite;
        }
        .no-rides h3 {
          color: #333;
          font-size: 24px;
          margin: 10px 0;
        }
        .no-rides p {
          color: #666;
          font-size: 16px;
        }
        .ride-card {
          background: white;
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 2px solid transparent;
          animation: slideUp 0.6s ease-out backwards;
          position: relative;
          overflow: hidden;
        }
        .ride-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 78, 137, 0.1), transparent);
          transition: left 0.5s;
        }
        .ride-card:hover::before {
          left: 100%;
        }
        .ride-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0, 78, 137, 0.2);
          border-color: #004E89;
        }
        .ride-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }
        .match-card {
          border: 2px solid #004E89;
        }
        .match-type-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          color: white;
          font-size: 0.85rem;
          font-weight: 700;
          z-index: 10;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .vehicle-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #004E89 0%, #003d6e 100%);
          padding: 8px 16px;
          border-radius: 20px;
          color: white;
          font-weight: 700;
        }
        .vehicle-icon {
          font-size: 20px;
        }
        .vehicle-type {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .price-badge {
          display: flex;
          align-items: baseline;
          gap: 5px;
          background: linear-gradient(135deg, #E8F4F8 0%, #D0E8F2 100%);
          padding: 12px 20px;
          border-radius: 25px;
          box-shadow: 0 5px 15px rgba(0, 78, 137, 0.15);
          border: 2px solid #004E89;
        }
        .price-label {
          font-size: 16px;
          font-weight: 700;
          color: #004E89;
        }
        .price-value {
          font-size: 22px;
          font-weight: 900;
          color: #004E89;
        }
        .ride-route {
          display: flex;
          align-items: center;
          gap: 20px;
          margin: 20px 0;
          padding: 20px;
          background: linear-gradient(135deg, #F8FAFB 0%, #E8F4F8 100%);
          border-radius: 15px;
          border: 1px solid #D0E8F2;
        }
        .route-point {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }
        .route-icon {
          font-size: 22px;
          flex-shrink: 0;
        }
        .route-details {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .route-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 1px;
        }
        .route-location {
          font-size: 15px;
          color: #333;
          font-weight: 700;
        }
        .route-line {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .route-arrow {
          font-size: 24px;
          color: #004E89;
          font-weight: bold;
          animation: slideRight 1.5s ease-in-out infinite;
        }
        .ride-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
          margin: 16px 0;
        }
        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          background: white;
          border-radius: 10px;
          border: 2px solid #f0f0f0;
          transition: all 0.3s;
        }
        .info-item:hover {
          border-color: #004E89;
          transform: scale(1.05);
        }
        .info-icon {
          font-size: 20px;
          flex-shrink: 0;
        }
        .info-content {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .info-label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .info-value {
          font-size: 13px;
          color: #333;
          font-weight: 700;
        }
        .book-btn {
          width: 100%;
          margin-top: 16px;
          padding: 14px 24px;
          background: linear-gradient(135deg, #0066CC 0%, #004E89 100%);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 800;
          box-shadow: 0 8px 24px rgba(0, 102, 204, 0.4);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          position: relative;
          overflow: hidden;
        }
        .book-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }
        .book-btn:hover::before {
          left: 100%;
        }
        .book-btn:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 15px 40px rgba(0, 102, 204, 0.5);
        }
        .book-btn:active {
          transform: translateY(-1px) scale(0.98);
        }
        .btn-icon {
          font-size: 18px;
        }
        .btn-arrow {
          font-size: 16px;
          font-weight: bold;
          transition: transform 0.3s;
        }
        .book-btn:hover .btn-arrow {
          transform: translateX(5px);
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes slideRight {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(10px);
          }
        }
        @media (max-width: 768px) {
          .results-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
          .ride-info {
            grid-template-columns: 1fr;
          }
          .ride-route {
            flex-direction: column;
            gap: 10px;
          }
          .route-line {
            transform: rotate(90deg);
          }
        }
      `}</style>
    </div>
  );
};

export default SearchRides;
