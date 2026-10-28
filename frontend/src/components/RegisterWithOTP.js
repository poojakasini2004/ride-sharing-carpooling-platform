import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import './RegisterWithOTP.css';

const RegisterWithOTP = () => {
  const [step, setStep] = useState(1); // 1 = Registration Form, 2 = OTP Verification
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'PASSENGER',
    vehicleType: '',
    vehicleModel: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const { login } = React.useContext(AuthContext);

  // Countdown timer for OTP expiry
  React.useEffect(() => {
    if (step === 2 && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0) {
      toast.error('⏰ OTP expired! Please register again.');
    }
  }, [step, countdown]);

  // Enable resend after 60 seconds
  React.useEffect(() => {
    if (step === 2) {
      const timer = setTimeout(() => setCanResend(true), 60000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      toast.error('❌ Passwords do not match');
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      toast.error(`❌ ${passwordError}`);
      return;
    }

    if (formData.userType === 'DRIVER') {
      if (!formData.vehicleType || !formData.vehicleModel) {
        setError('Vehicle type and model are required for drivers');
        setLoading(false);
        toast.error('❌ Vehicle information required for drivers');
        return;
      }
    }

    try {
      // Step 1: Initiate registration and send OTP
      const response = await axios.post('http://localhost:8080/auth/otp/register/initiate', {
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        password: formData.password,
        userType: formData.userType,
        vehicleType: formData.vehicleType || null,
        vehicleModel: formData.vehicleModel || null
      });

      if (response.data.success) {
        toast.success('📧 OTP sent to your email! Check your inbox.');
        setStep(2); // Move to OTP verification step
        setCountdown(600); // Reset countdown
      }
    } catch (err) {
      console.error('❌ Registration initiation failed:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      let errorMsg = err.response?.data?.error || 'Registration failed';
      
      // Check if server is not responding
      if (err.code === 'ERR_NETWORK' || !err.response) {
        errorMsg = 'Cannot connect to server. Please ensure the backend is running on port 8080.';
      }
      
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const otpArray = value.slice(0, 6).split('');
      const newOtp = [...otp];
      otpArray.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      // Focus last filled input
      const lastIndex = Math.min(index + otpArray.length - 1, 5);
      document.getElementById(`otp-${lastIndex}`)?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      setLoading(false);
      toast.error('❌ Please enter complete OTP');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/auth/otp/register/verify', {
        email: formData.email,
        otp: otpString
      });

      if (response.data.success) {
        toast.success('🎉 Registration successful! Welcome to ShareWay!');
        // Auto-login with the token
        login(response.data.token, response.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('❌ OTP verification failed:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      let errorMsg = err.response?.data?.error || 'OTP verification failed';
      
      // Check if server is not responding
      if (err.code === 'ERR_NETWORK' || !err.response) {
        errorMsg = 'Cannot connect to server. Please ensure the backend is running on port 8080.';
      }
      
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8080/auth/otp/register/resend', {
        email: formData.email
      });

      if (response.data.success) {
        toast.success('📧 New OTP sent to your email!');
        setCountdown(600); // Reset countdown
        setCanResend(false); // Disable resend for 60 seconds
        setOtp(['', '', '', '', '', '']); // Clear OTP inputs
        document.getElementById('otp-0')?.focus();
        
        // Re-enable resend after 60 seconds
        setTimeout(() => setCanResend(true), 60000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to resend OTP';
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="register-otp-container">
      {step === 1 ? (
        // Step 1: Registration Form
        <div className="form-container">
          <div className="form-header">
            <h2>🚗 Join ShareWay</h2>
            <p>Create your account and start sharing rides</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name *</label>
              <input 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                placeholder="Enter your full name"
                required 
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="your.email@example.com"
                required 
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="+91 9876543210"
                required 
              />
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                required 
              />
              <small>Must be at least 8 characters with uppercase, lowercase, and number</small>
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <input 
                type="password" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                placeholder="Re-enter your password"
                required 
              />
            </div>

            <div className="form-group">
              <label>I am a *</label>
              <select name="userType" value={formData.userType} onChange={handleChange}>
                <option value="PASSENGER">🧑 Passenger</option>
                <option value="DRIVER">🚗 Driver</option>
              </select>
            </div>

            {formData.userType === 'DRIVER' && (
              <>
                <div className="form-group">
                  <label>Vehicle Type *</label>
                  <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} required>
                    <option value="">Select vehicle type</option>
                    <option value="HATCHBACK">Hatchback</option>
                    <option value="SEDAN">Sedan</option>
                    <option value="SUV">SUV</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Vehicle Model *</label>
                  <input 
                    type="text" 
                    name="vehicleModel" 
                    value={formData.vehicleModel} 
                    onChange={handleChange} 
                    placeholder="e.g., Honda City 2023"
                    required 
                  />
                </div>
              </>
            )}

            {error && <p className="error-message">❌ {error}</p>}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Sending OTP...' : '📧 Send OTP'}
            </button>
          </form>

          <p className="login-link">
            Already have an account? <a href="/login">Login here</a>
          </p>
        </div>
      ) : (
        // Step 2: OTP Verification
        <div className="otp-container">
          <div className="otp-header">
            <h2>📧 Verify Your Email</h2>
            <p>We've sent a 6-digit code to</p>
            <p className="email-display">{formData.email}</p>
            <button className="change-email-btn" onClick={() => setStep(1)}>
              Change Email
            </button>
          </div>

          <form onSubmit={handleVerifyOtp}>
            <div className="otp-input-group">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="6"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="otp-input"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <div className="otp-timer">
              ⏱️ Code expires in: <strong>{formatTime(countdown)}</strong>
            </div>

            {error && <p className="error-message">❌ {error}</p>}

            <button type="submit" className="btn btn-success" disabled={loading || countdown === 0}>
              {loading ? '⏳ Verifying...' : '✅ Verify & Register'}
            </button>

            <div className="resend-section">
              <p>Didn't receive the code?</p>
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={handleResendOtp}
                disabled={!canResend || loading}
              >
                {canResend ? '🔄 Resend OTP' : '⏳ Resend available in 60s'}
              </button>
            </div>

            <button 
              type="button"
              className="btn btn-link" 
              onClick={() => setStep(1)}
            >
              ← Back to Registration
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RegisterWithOTP;
