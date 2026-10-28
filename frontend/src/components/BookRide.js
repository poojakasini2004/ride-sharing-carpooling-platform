import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import PaymentModal from './PaymentModal';

const BookRide = () => {
  const { rideId } = useParams();
  const [ride, setRide] = useState(null);
  const [seatsBooked, setSeatsBooked] = useState(1);
  const [passengerName, setPassengerName] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const navigate = useNavigate();
  const { token, userId, user } = React.useContext(AuthContext);

  useEffect(() => {
    if (user) {
      setPassengerName(user.name || '');
      setPassengerEmail(user.email || '');
      setPassengerPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        // Try with token first, fallback to no auth if 403
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await axios.get(`http://localhost:8080/api/rides/${rideId}`, config);
        setRide(response.data);
      } catch (err) {
        console.error('Failed to fetch ride', err);
        if (err.response?.status === 403) {
          toast.error('❌ Session expired. Please login again.');
          navigate('/login');
        }
      }
    };
    if (rideId) {
      fetchRide();
    }
  }, [rideId, token, navigate]);

  const handleBook = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate required fields
    if (!userId) {
      toast.error('❌ Please login to book a ride');
      navigate('/login');
      return;
    }
    
    if (!passengerName || !passengerEmail || !passengerPhone) {
      toast.error('❌ Please fill in all passenger details');
      return;
    }
    
    if (!pickupLocation) {
      toast.error('❌ Please enter pickup location');
      return;
    }
    
    if (seatsBooked < 1) {
      toast.error('❌ Please select at least 1 seat');
      return;
    }
    
    try {
      console.log('Creating booking with data:', {
        rideId: parseInt(rideId),
        passengerId: parseInt(userId),
        seatsBooked: parseInt(seatsBooked),
        passengerName,
        passengerEmail,
        passengerPhone,
        pickupLocation
      });
      
      // Don't send Authorization header since /api/bookings is a public endpoint
      const response = await axios.post('http://localhost:8080/api/bookings/create', {
        rideId: parseInt(rideId),
        passengerId: parseInt(userId),
        seatsBooked: parseInt(seatsBooked),
        passengerName: passengerName.trim(),
        passengerEmail: passengerEmail.trim(),
        passengerPhone: passengerPhone.trim(),
        pickupLocation: pickupLocation.trim()
      });
      
      console.log('Booking created:', response.data);
      const newBookingId = response.data.id;
      setBookingId(newBookingId);
      setShowPayment(true);
      // Don't show success toast yet - wait for payment completion
      toast.info('💳 Please complete payment to confirm your booking', {
        autoClose: 2000
      });
    } catch (err) {
      console.error('Booking failed', err);
      console.error('Error response:', err.response?.data);
      
      // Handle 400 - validation error
      if (err.response?.status === 400) {
        const errorMsg = err.response.data?.message || err.response.data?.error || 'Invalid booking data';
        toast.error(`❌ ${errorMsg}`);
        setError(errorMsg);
        return;
      }
      
      // Handle 403 - token expired or invalid
      if (err.response?.status === 403) {
        toast.error('🔒 Session expired. Please login again.');
        localStorage.clear();
        navigate('/login');
        return;
      }
      
      // Handle other errors
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Booking failed. Please try again.';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
    }
  };

  const handlePaymentSuccess = (payment) => {
    console.log('Payment successful:', payment);
    toast.success('✅ Payment Successful! Your ride is confirmed.', {
      position: 'top-center',
      autoClose: 3000
    });
    setShowPayment(false);
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  const handlePaymentFailure = (error) => {
    console.error('Payment failed:', error);
    toast.error('❌ Payment failed. Please try again.');
    setShowPayment(false);
  };

  const handlePaymentClose = () => {
    setShowPayment(false);
    toast.info('ℹ️ Payment cancelled. You can try again later.');
  };

  if (!ride) return <div>Loading...</div>;

  return (
    <div className="book-ride">
      <h2>Book Ride</h2>
      <p>From {ride.origin} to {ride.destination}, Time: {new Date(ride.departureTime).toLocaleString()}, Price: ₹{ride.price}</p>
      <form onSubmit={handleBook}>
        <div>
          <label>Seats to Book:</label>
          <input type="number" value={seatsBooked} onChange={(e) => setSeatsBooked(e.target.value)} min="1" max={ride.availableSeats} required />
        </div>
        <div>
          <label>Name:</label>
          <input type="text" value={passengerName} onChange={(e) => setPassengerName(e.target.value)} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={passengerEmail} onChange={(e) => setPassengerEmail(e.target.value)} required />
        </div>
        <div>
          <label>Phone:</label>
          <input type="tel" value={passengerPhone} onChange={(e) => setPassengerPhone(e.target.value)} required />
        </div>
        <div>
          <label>Pickup Location:</label>
          <input type="text" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} placeholder="e.g., Near City Mall" required />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" className="btn btn-success">Book Ride & Pay</button>
      </form>

      {showPayment && (
        <PaymentModal
          isOpen={showPayment}
          onClose={handlePaymentClose}
          bookingDetails={{
            id: bookingId,
            source: ride.origin,
            destination: ride.destination,
            scheduledTime: new Date(ride.departureTime).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            driverName: ride.driver?.name || 'Driver',
            vehicleType: ride.vehicleType || 'Car',
            totalFare: ride.price * seatsBooked,
            baseFare: ride.price * 0.3,
            distanceFare: ride.price * 0.5,
            timeFare: ride.price * 0.2,
            distance: ride.distanceKm || 0,
            duration: ride.durationMinutes || 0,
            surgeMultiplier: 1,
            passengerName: passengerName,
            passengerEmail: passengerEmail,
            passengerPhone: passengerPhone
          }}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
      <style>{`
        .book-ride {
          padding: 30px;
          background: linear-gradient(135deg, #e0f7f7, #ffffff);
          border-radius: 16px;
          box-shadow: 0 8px 20px rgba(0, 128, 128, 0.2);
          max-width: 600px;
          margin: 0 auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          transition: transform 0.3s ease;
        }
        .book-ride:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0, 128, 128, 0.3);
        }
        form div {
          margin-bottom: 20px;
        }
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 700;
          color: #007a7a;
          font-size: 1.1rem;
          letter-spacing: 0.03em;
        }
        input {
          width: 100%;
          padding: 14px;
          border: 2px solid #a0d6d6;
          border-radius: 12px;
          font-size: 1.1rem;
          transition: border-color 0.4s ease, box-shadow 0.4s ease;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
        }
        input:focus {
          outline: none;
          border-color: #009999;
          box-shadow: 0 0 12px rgba(0, 153, 153, 0.5);
          background-color: #f0fdfd;
        }
        button {
          padding: 14px 28px;
          background: linear-gradient(135deg, #00b3b3, #007a7a);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 1.2rem;
          font-weight: 800;
          box-shadow: 0 6px 15px rgba(0, 128, 128, 0.4);
          transition: background 0.4s ease, box-shadow 0.4s ease, transform 0.2s ease;
        }
        button:hover {
          background: linear-gradient(135deg, #007a7a, #004d4d);
          box-shadow: 0 8px 20px rgba(0, 77, 77, 0.6);
          transform: translateY(-3px);
        }
        button:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
};

export default BookRide;
