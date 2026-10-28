import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Welcome from './components/Welcome';
import Login from './components/Login';
import Register from './components/Register';
import RegisterWithOTP from './components/RegisterWithOTP';
import PassengerDashboard from './components/PassengerDashboard';
import DriverDashboard from './components/DriverDashboard';
import AdminDashboard from './components/AdminDashboard';
import SearchRides from './components/SearchRides';
import BookRide from './components/BookRide';
import BookRideConfirmation from './components/BookRideConfirmation';
import CreateRide from './components/CreateRide';
import FareCalculator from './components/FareCalculator';

// New Admin Panel Components
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/admin/pages/Dashboard';
import UsersManagement from './components/admin/pages/UsersManagement';
import RidesManagement from './components/admin/pages/RidesManagement';
import PaymentsManagement from './components/admin/pages/PaymentsManagement';
import ReviewsManagement from './components/admin/pages/ReviewsManagement';
import ReportsAnalytics from './components/admin/pages/ReportsAnalytics';
import Settings from './components/admin/pages/Settings';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<RegisterWithOTP />} />
              <Route path="/register-direct" element={<Register />} />
              <Route path="/dashboard" element={<DashboardRouter />} />
              <Route path="/passenger-dashboard" element={<DashboardRouter />} />
              <Route path="/driver-dashboard" element={<DashboardRouter />} />
              
              {/* Old Admin Route - Redirect to new admin panel */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              
              {/* New Admin Panel Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="rides" element={<RidesManagement />} />
                <Route path="payments" element={<PaymentsManagement />} />
                <Route path="reviews" element={<ReviewsManagement />} />
                <Route path="reports" element={<ReportsAnalytics />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              
              <Route path="/search-rides" element={<SearchRides />} />
              <Route path="/book-ride/:rideId" element={<BookRide />} />
              <Route path="/book-ride-confirmation/:bookingId" element={<BookRideConfirmation />} />
              <Route path="/create-ride" element={<CreateRide />} />
              <Route path="/fare-calculator" element={<FareCalculator />} />
            </Routes>
          </main>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

function DashboardRouter() {
  const { role } = React.useContext(AuthContext);
  if (role === 'PASSENGER') {
    return <PassengerDashboard />;
  } else if (role === 'DRIVER') {
    return <DriverDashboard />;
  } else if (role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" />;
  } else {
    return <Navigate to="/login" />;
  }
}

export default App;
