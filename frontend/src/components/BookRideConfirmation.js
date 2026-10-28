import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BookRideConfirmation = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="confirmation-page">
      <h2>✅ Ride Booked Successfully!</h2>
      <p>Your booking ID: {bookingId}</p>
      <p>Details: [Ride details would be shown here]</p>
      <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>Back to Dashboard</button>
      <button onClick={() => navigate('/search-rides')} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Book Another Ride</button>
      <style>{`
        .confirmation-page {
          padding: 50px 40px;
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
          background: linear-gradient(135deg, #e8f5e8, #ffffff);
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(40, 167, 69, 0.2);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          transition: transform 0.3s ease;
        }
        .confirmation-page:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(40, 167, 69, 0.3);
        }
        h2 {
          color: #28a745;
          margin-bottom: 25px;
          font-size: 2.2rem;
          font-weight: 800;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        p {
          margin: 15px 0;
          font-size: 1.2rem;
          color: #333;
          line-height: 1.6;
        }
        button {
          padding: 12px 24px;
          margin: 10px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: 700;
          transition: background-color 0.3s ease, transform 0.2s ease;
        }
        button:first-of-type {
          background-color: #28a745;
          color: white;
          box-shadow: 0 4px 10px rgba(40, 167, 69, 0.3);
        }
        button:first-of-type:hover {
          background-color: #218838;
          box-shadow: 0 6px 15px rgba(33, 136, 56, 0.5);
          transform: translateY(-2px);
        }
        button:last-of-type {
          background-color: #007bff;
          color: white;
          box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3);
        }
        button:last-of-type:hover {
          background-color: #0056b3;
          box-shadow: 0 6px 15px rgba(0, 86, 179, 0.5);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default BookRideConfirmation;
