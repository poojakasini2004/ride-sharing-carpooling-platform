import React, { createContext, useState, useEffect, useContext } from 'react';

import axios from 'axios';

import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');

  useEffect(() => {
    if (token && !user) {
      // Always fetch complete user data from /auth/me if we don't have it
      axios.get('http://localhost:8080/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        console.log('Fetched user data:', response.data);
        setUserId(response.data.id);
        setUser(response.data);
        setRole(response.data.role);
        localStorage.setItem('userId', response.data.id);
        localStorage.setItem('role', response.data.role);
        localStorage.setItem('user', JSON.stringify(response.data));
      })
      .catch(err => {
        console.error('Failed to fetch user info', err);
        // Fallback to JWT decode
        try {
          const decoded = jwtDecode(token);
          setUser(decoded);
          setRole(decoded.role);
          if (decoded.id) {
            setUserId(decoded.id);
            localStorage.setItem('userId', decoded.id);
          }
        } catch (e) {
          console.error('Failed to decode token', e);
        }
      });
    }
  }, [token, user]);

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    setRole(userData.role);
    setUserId(userData.id);
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', userData.role);
    localStorage.setItem('userId', userData.id);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Register without OTP
  const registerUser = async (userData) => {
    try {
      // Only send required fields and non-empty optional fields
      const cleanData = {};
      if (userData.name) cleanData.name = userData.name;
      if (userData.email) cleanData.email = userData.email;
      if (userData.password) cleanData.password = userData.password;
      if (userData.phone) cleanData.phone = userData.phone;
      if (userData.role) cleanData.role = userData.role;
      // Only send vehicleType/vehicleModel if role is DRIVER and not empty
      if (userData.role === 'DRIVER') {
        if (userData.vehicleType) cleanData.vehicleType = userData.vehicleType;
        if (userData.vehicleModel) cleanData.vehicleModel = userData.vehicleModel;
      }
      const params = new URLSearchParams(cleanData).toString();
      const response = await axios.post(
        'http://localhost:8080/auth/register',
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
  const token = response.data.token;
  const userInfo = response.data.user;
  await login(token, userInfo);
  return token;
    } catch (error) {
      if (error.response) {
        // Show backend error message if available
        let errMsg = 'Registration failed';
        if (typeof error.response.data === 'string') {
          errMsg = error.response.data;
        } else if (error.response.data && error.response.data.error) {
          errMsg = error.response.data.error;
        }
        throw new Error(errMsg);
      } else if (error.request) {
        // Network error
        throw new Error('Network error: Unable to connect to server');
      } else {
        throw new Error('Registration failed');
      }
    }
  };

  // Login without OTP
  const loginUser = async (credentials) => {
    try {
      // Convert credentials to x-www-form-urlencoded
      const params = new URLSearchParams(credentials).toString();
      console.log('🔐 Login attempt with:', credentials.email);
      console.log('📤 Sending params:', params);
      
      const response = await axios.post(
        'http://localhost:8080/auth/login',
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      
      console.log('✅ Login response:', response.data);
      const token = response.data.token;
      const userInfo = response.data.user;
      login(token, userInfo);
      return token;
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response) {
        // Show backend error message if available
        let errMsg = 'Invalid email or password';
        if (typeof error.response.data === 'string') {
          errMsg = error.response.data;
        } else if (error.response.data && error.response.data.error) {
          errMsg = error.response.data.error;
        }
        throw new Error(errMsg);
      } else if (error.request) {
        // Network error
        throw new Error('Network error: Unable to connect to server');
      } else {
        throw new Error('Login failed');
      }
    }
  };

  const logout = () => {
    setToken('');
    setRole('');
    setUserId('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, role, userId, login, registerUser, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
