# Review System UI Integration Guide

## 🎨 Components Created

### 1. **ReviewModal.js** - Main review submission modal
- Star rating (1-5)
- Optional comment field
- Ride details summary
- Validation and error handling

### 2. **UserRating.js** - Display user ratings
- Overall rating with stars
- Total review count
- Driver/Passenger specific ratings
- Review history viewer

### 3. **ReviewList.js** - Pending reviews list
- Shows completed rides needing reviews
- Quick access to review modal
- Auto-refresh after submission

---

## 🔌 Integration Steps

### Step 1: Add to PassengerDashboard.js

```javascript
// At the top of the file
import ReviewList from './ReviewList';
import UserRating from './UserRating';

// Inside the component, add this section:
<div className="dashboard-section">
  <h2>⭐ My Rating</h2>
  <UserRating userId={userId} showDetails={true} />
</div>

<div className="dashboard-section">
  <ReviewList userId={userId} userRole="PASSENGER" />
</div>
```

### Step 2: Add to DriverDashboard.js

```javascript
// At the top of the file
import ReviewList from './ReviewList';
import UserRating from './UserRating';

// Inside the component, add this section:
<div className="dashboard-section">
  <h2>⭐ My Rating</h2>
  <UserRating userId={userId} showDetails={true} />
</div>

<div className="dashboard-section">
  <ReviewList userId={userId} userRole="DRIVER" />
</div>
```

### Step 3: Add Rating Display in SearchRides.js

When displaying available rides, show driver ratings:

```javascript
import UserRating from './UserRating';

// In the ride card:
<div className="driver-info">
  <p>Driver: {ride.driverName}</p>
  <UserRating userId={ride.driverId} showDetails={false} />
</div>
```

### Step 4: Add Review Prompt After Ride Completion

In your booking completion flow:

```javascript
import ReviewModal from './ReviewModal';

const [showReviewModal, setShowReviewModal] = useState(false);
const [completedBooking, setCompletedBooking] = useState(null);

// After ride completion:
const handleRideComplete = (booking) => {
  setCompletedBooking(booking);
  setShowReviewModal(true);
};

// In JSX:
{showReviewModal && completedBooking && (
  <ReviewModal
    booking={completedBooking}
    userType={userRole}
    userId={userId}
    onClose={() => setShowReviewModal(false)}
    onSuccess={() => {
      // Refresh data
      fetchBookings();
    }}
  />
)}
```

---

## 📋 Complete Integration Example

### PassengerDashboard.js Integration

```javascript
import React, { useState, useEffect } from 'react';
import ReviewList from './ReviewList';
import UserRating from './UserRating';
import ReviewModal from './ReviewModal';

const PassengerDashboard = () => {
  const [userId, setUserId] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // ... existing code ...

  return (
    <div className="passenger-dashboard">
      {/* Existing dashboard content */}
      
      {/* Add Rating Section */}
      <div className="dashboard-section rating-section">
        <h2>⭐ My Rating</h2>
        <UserRating userId={userId} showDetails={true} />
      </div>

      {/* Add Pending Reviews Section */}
      <div className="dashboard-section">
        <ReviewList 
          userId={userId} 
          userRole="PASSENGER"
        />
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          userType="PASSENGER"
          userId={userId}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            fetchBookings();
            setShowReviewModal(false);
          }}
        />
      )}
    </div>
  );
};

export default PassengerDashboard;
```

---

## 🎯 Usage Examples

### 1. Show Rating in Ride Cards

```javascript
<div className="ride-card">
  <div className="driver-section">
    <h4>{ride.driverName}</h4>
    <UserRating userId={ride.driverId} showDetails={false} />
  </div>
  {/* ... rest of ride card ... */}
</div>
```

### 2. Trigger Review After Booking Completion

```javascript
const completeRide = async (bookingId) => {
  try {
    await axios.put(`http://localhost:8080/api/bookings/${bookingId}/complete`);
    
    // Fetch the completed booking
    const response = await axios.get(`http://localhost:8080/api/bookings/${bookingId}`);
    
    // Show review modal
    setSelectedBooking(response.data);
    setShowReviewModal(true);
  } catch (error) {
    console.error('Failed to complete ride:', error);
  }
};
```

### 3. Check if User Can Review

```javascript
const checkCanReview = async (bookingId, userId) => {
  try {
    const response = await axios.get(
      `http://localhost:8080/api/reviews/can-review/${bookingId}/${userId}`
    );
    
    if (response.data.canReview) {
      // Show review button
      return true;
    } else {
      // Show reason: response.data.reason
      return false;
    }
  } catch (error) {
    console.error('Failed to check review status:', error);
    return false;
  }
};
```

---

## 🎨 Styling Tips

### Add to your App.css or global styles:

```css
.dashboard-section {
  background: white;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dashboard-section h2 {
  margin-top: 0;
  color: #333;
  font-size: 22px;
  margin-bottom: 20px;
}

.rating-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}
```

---

## 🔔 Notification Integration

### Listen for Review Prompts via WebSocket

```javascript
useEffect(() => {
  // Subscribe to notifications
  stompClient.subscribe(`/user/${userId}/queue/notifications`, (message) => {
    const notification = JSON.parse(message.body);
    
    if (notification.type === 'REVIEW_PROMPT') {
      // Fetch booking and show review modal
      fetchBookingAndShowReview(notification.bookingId);
    }
  });
}, [userId]);

const fetchBookingAndShowReview = async (bookingId) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/bookings/${bookingId}`);
    setSelectedBooking(response.data);
    setShowReviewModal(true);
  } catch (error) {
    console.error('Failed to fetch booking:', error);
  }
};
```

---

## ✅ Testing Checklist

- [ ] Review modal opens correctly
- [ ] Star rating works (click and hover)
- [ ] Comment field accepts text (max 1000 chars)
- [ ] Submit button disabled when rating = 0
- [ ] Success toast shows after submission
- [ ] Modal closes after successful submission
- [ ] Pending reviews list updates after submission
- [ ] User rating displays correctly
- [ ] Driver ratings show in search results
- [ ] Review history expands/collapses
- [ ] Responsive design works on mobile
- [ ] Error messages display properly

---

## 🐛 Common Issues & Fixes

### Issue 1: "Cannot read property 'name' of undefined"
**Fix:** Add null checks:
```javascript
{booking.ride?.driver?.name || 'N/A'}
```

### Issue 2: Reviews not showing after submission
**Fix:** Call refresh function in onSuccess:
```javascript
onSuccess={() => {
  fetchBookings();
  fetchRatings();
}}
```

### Issue 3: 403 Forbidden errors
**Fix:** Already fixed in SecurityConfig.java and JwtFilter.java

### Issue 4: Modal not closing
**Fix:** Ensure onClose is called:
```javascript
<button onClick={onClose}>Close</button>
```

---

## 📱 Mobile Responsiveness

All components are mobile-responsive with:
- Flexible layouts
- Touch-friendly buttons
- Readable text sizes
- Proper spacing
- Scrollable review lists

---

## 🚀 Quick Start

1. **Copy all component files** to `src/components/`
2. **Import components** in your dashboards
3. **Add sections** as shown in examples above
4. **Test** by completing a ride and submitting a review
5. **Customize** colors and styles to match your theme

---

## 🎉 Features

✅ **Star Rating System** - Interactive 1-5 stars  
✅ **Comment Field** - Optional feedback (1000 chars)  
✅ **Ride Details** - Shows source, destination, date  
✅ **Validation** - Prevents invalid submissions  
✅ **Error Handling** - User-friendly error messages  
✅ **Loading States** - Shows loading indicators  
✅ **Success Feedback** - Toast notifications  
✅ **Rating Display** - Shows overall, driver, passenger ratings  
✅ **Review History** - Expandable review list  
✅ **Pending Reviews** - Quick access to unreviewed rides  
✅ **Responsive Design** - Works on all devices  
✅ **Animations** - Smooth transitions and effects  

---

**Happy Coding! 🎊**
