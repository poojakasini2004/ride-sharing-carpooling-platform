import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import './VerifyEmailPrompt.css';

const VerifyEmailPrompt = ({ email, onVerified, onCancel }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  const { login } = React.useContext(AuthContext);

  // Send OTP on component mount
  useEffect(() => {
    sendInitialOtp();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (otpSent && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0) {
      toast.error('⏰ OTP expired! Please request a new one.');
    }
  }, [otpSent, countdown]);

  // Enable resend after 60 seconds
  useEffect(() => {
    if (otpSent) {
      const timer = setTimeout(() => setCanResend(true), 60000);
      return () => clearTimeout(timer);
    }
  }, [otpSent]);

  const sendInitialOtp = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/auth/otp/verify-existing', {
        email: email
      });

      if (response.data.success) {
        toast.success('📧 Verification OTP sent to your email!');
        setOtpSent(true);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to send OTP';
      toast.error(`❌ ${errorMsg}`);
      setError(errorMsg);
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
      const lastIndex = Math.min(index + otpArray.length - 1, 5);
      document.getElementById(`verify-otp-${lastIndex}`)?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      if (value && index < 5) {
        document.getElementById(`verify-otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`verify-otp-${index - 1}`)?.focus();
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
      const response = await axios.post('http://localhost:8080/auth/otp/verify-existing-confirm', {
        email: email,
        otp: otpString
      });

      if (response.data.success) {
        toast.success('✅ Email verified successfully!');
        // Call the onVerified callback with token and user data
        onVerified(response.data.token, response.data.user);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'OTP verification failed';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
      setOtp(['', '', '', '', '', '']);
      document.getElementById('verify-otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8080/auth/otp/verify-existing', {
        email: email
      });

      if (response.data.success) {
        toast.success('📧 New OTP sent to your email!');
        setCountdown(600);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        document.getElementById('verify-otp-0')?.focus();
        setTimeout(() => setCanResend(true), 60000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to resend OTP';
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="verify-email-overlay">
      <div className="verify-email-modal">
        <div className="verify-header">
          <h2>📧 Verify Your Email</h2>
          <p className="verify-message">
            For security reasons, we need to verify your email address before you can continue.
          </p>
          <p className="email-display">{email}</p>
          {otpSent && <p className="otp-sent-message">✅ OTP has been sent to your email</p>}
        </div>

        {otpSent ? (
          <form onSubmit={handleVerifyOtp}>
            <div className="otp-input-group">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`verify-otp-${index}`}
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

            <button 
              type="submit" 
              className="btn btn-verify" 
              disabled={loading || countdown === 0}
            >
              {loading ? '⏳ Verifying...' : '✅ Verify Email'}
            </button>

            <div className="resend-section">
              <p>Didn't receive the code?</p>
              <button 
                type="button"
                className="btn btn-resend" 
                onClick={handleResendOtp}
                disabled={!canResend || loading}
              >
                {canResend ? '🔄 Resend OTP' : '⏳ Resend available in 60s'}
              </button>
            </div>

            <button 
              type="button"
              className="btn btn-cancel" 
              onClick={onCancel}
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="loading-state">
            <p>⏳ Sending OTP to your email...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPrompt;
