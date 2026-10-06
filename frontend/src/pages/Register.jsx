import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Zap, UserPlus, KeyRound, CheckCircle, XCircle } from 'lucide-react';

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // OTP State 
  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Password Strength State
  const [strengthScore, setStrengthScore] = useState(0);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    number: false,
    symbol: false
  });

  const navigate = useNavigate();

  // Function that runs while typing the password
  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, password: val });

    // Criteria checks
    const hasLength = val.length >= 8;
    const hasUppercase = /[A-Z]/.test(val);
    const hasNumber = /[0-9]/.test(val);
    const hasSymbol = /[^A-Za-z0-9]/.test(val);

    setPasswordCriteria({
      length: hasLength,
      uppercase: hasUppercase,
      number: hasNumber,
      symbol: hasSymbol
    });

    // Calculate overall score (0 to 4)
    let score = 0;
    if (hasLength) score++;
    if (hasUppercase) score++;
    if (hasNumber) score++;
    if (hasSymbol) score++;
    
    setStrengthScore(score);
  };

  // Change colors and text based on password strength.
  const getStrengthDetails = () => {
    if (formData.password.length === 0) return { text: '', color: 'bg-gray-700', width: 'w-0', textColor: 'text-gray-500' };
    if (strengthScore <= 1) return { text: 'Weak', color: 'bg-red-500', width: 'w-1/4', textColor: 'text-red-500' };
    if (strengthScore === 2) return { text: 'Fair', color: 'bg-yellow-500', width: 'w-2/4', textColor: 'text-yellow-500' };
    if (strengthScore === 3) return { text: 'Good', color: 'bg-[#00e5ff]', width: 'w-3/4', textColor: 'text-[#00e5ff]' };
    if (strengthScore === 4) return { text: 'Strong', color: 'bg-green-500', width: 'w-full', textColor: 'text-green-500' };
  };

  const strength = getStrengthDetails();

  // 1. Function to register a new user.
  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Prevent registration if the password is not strong enough.
    if (strengthScore < 4) {
      setMessage("❌ Please create a Strong password before continuing.");
      setIsError(true);
      return;
    }

    setMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/users/register', formData);
      setMessage(response.data || "Registration successful! Sending OTP...");
      setIsError(false);
      
     // Switch to the OTP form on the same page without navigating away.
      setTimeout(() => {
        setShowOTP(true); 
        setMessage('');
        setIsLoading(false);
      }, 1500);

    } catch (error) {
      setMessage(error.response?.data || 'Registration failed. Try again.');
      setIsError(true);
      setIsLoading(false);
    }
  };

  // 2. FIX: Function to verify the OTP.
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      // Use the correct backend endpoint "/verify-otp" and "otpCode" parameter.
      await axios.post('http://localhost:8080/api/users/verify-otp', null, {
        params: { email: formData.email, otpCode: otpCode } 
      });

      setMessage("✅ Account verified successfully!");
      setIsError(false);
      
      // Automatically redirect to the login page after successful verification.
      setTimeout(() => navigate('/'), 2000); 

    } catch (error) {
      console.error("Verification Error:", error);
      setMessage("❌ Invalid or expired OTP code. Please try again.");
      setIsError(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-gray-300 font-sans selection:bg-[#00e5ff] selection:text-black flex flex-col">
      
      {/* Navbar */}
      <nav className="bg-[#12141a] border-b border-gray-800 px-8 py-5 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#00e5ff] rounded flex items-center justify-center font-black text-black">P</div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            Easy<span className="text-[#00e5ff]">Park</span>
          </h1>
        </div>
        <div className="flex items-center gap-6 text-sm font-bold">
          <Link to="/" className="hover:text-[#00e5ff] transition">Back to Login</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-between max-w-[1400px] mx-auto w-full px-8 py-12 gap-12">
        
        {/* Left Side Text */}
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#00e5ff]/10 text-[#00e5ff] px-4 py-2 rounded-full border border-[#00e5ff]/30 font-bold text-sm">
            <UserPlus size={18} /> Join the Future of Parking
          </div>
          <h2 className="text-5xl lg:text-7xl font-black text-white leading-tight">
            Create Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-blue-500">
              Account.
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
            Get instant access to premium parking spots, real-time availability tracking, and secure your vehicle with Easy Park's smart technology.
          </p>
          <div className="flex gap-4 pt-4">
            <div className="flex items-center gap-2 bg-[#15171e] px-4 py-2 rounded-lg border border-gray-800">
              <Zap className="text-[#00e5ff]" size={20} />
              <span className="font-bold text-sm">Fast Setup</span>
            </div>
            <div className="flex items-center gap-2 bg-[#15171e] px-4 py-2 rounded-lg border border-gray-800">
              <Shield className="text-[#00e5ff]" size={20} />
              <span className="font-bold text-sm">Secure Data</span>
            </div>
          </div>
        </div>

        {/* Right Side Form (Dynamic: Register or OTP) */}
        <div className="w-full max-w-md bg-[#15171e] p-8 rounded-2xl border border-gray-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative mt-8 lg:mt-0">
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-[#00e5ff] opacity-10 blur-2xl rounded-full"></div>
          
          {message && (
            <div className={`p-3 rounded-lg mb-6 text-center text-sm font-bold border ${isError ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-green-500/10 border-green-500 text-green-500'}`}>
              {message}
            </div>
          )}

          {/* Conditional Rendering: OTP Form da nathnam Register Form da pennanne kiyala */}
          {!showOTP ? (
            // --- REGISTER FORM ---
            <div className="animate-fade-in">
              <h3 className="text-2xl font-black text-white mb-2">Sign Up</h3>
              <p className="text-sm text-gray-500 mb-8">Fill in your details to get started</p>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    className="w-full bg-[#1a1c23] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] transition"
                    placeholder="e.g., Akindu Menuja"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    className="w-full bg-[#1a1c23] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] transition"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider flex justify-between">
                    <span>Password</span>
                    {formData.password.length > 0 && (
                      <span className={`${strength.textColor} transition-colors duration-300 font-bold uppercase tracking-widest`}>{strength.text}</span>
                    )}
                  </label>
                  <input 
                    type="password" 
                    required 
                    value={formData.password} 
                    onChange={handlePasswordChange} 
                    className="w-full bg-[#1a1c23] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] transition font-black tracking-widest"
                    placeholder="Create a strong password"
                  />

                  {/* Password Strength Bar */}
                  <div className="h-1.5 w-full bg-gray-800 rounded-full mt-3 overflow-hidden flex">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-500 ease-out`}></div>
                  </div>

                  {/* Password Criteria Checkpoints */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5">
                      {passwordCriteria.length ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-gray-600" />}
                      <span className={`text-xs ${passwordCriteria.length ? 'text-gray-300' : 'text-gray-600'}`}>8+ Characters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passwordCriteria.uppercase ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-gray-600" />}
                      <span className={`text-xs ${passwordCriteria.uppercase ? 'text-gray-300' : 'text-gray-600'}`}>1 Uppercase</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passwordCriteria.number ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-gray-600" />}
                      <span className={`text-xs ${passwordCriteria.number ? 'text-gray-300' : 'text-gray-600'}`}>1 Number</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passwordCriteria.symbol ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-gray-600" />}
                      <span className={`text-xs ${passwordCriteria.symbol ? 'text-gray-300' : 'text-gray-600'}`}>1 Symbol</span>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading || strengthScore < 4}
                  className={`w-full font-black py-4 rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.2)] transform hover:-translate-y-1 transition-all mt-4 disabled:opacity-50 disabled:shadow-none disabled:transform-none ${
                    strengthScore === 4 
                      ? 'bg-[#00e5ff] hover:bg-[#00c3d9] text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]' 
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                  }`}
                >
                  {isLoading ? 'Processing...' : 'Create Account'}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account? <Link to="/" className="text-[#00e5ff] font-bold hover:underline">Login here</Link>
              </p>
            </div>
          ) : (
            // --- OTP VERIFICATION FORM ---
            <div className="animate-fade-in">
              <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                <KeyRound className="text-[#00e5ff]" /> Verify Email
              </h3>
              <p className="text-sm text-gray-500 mb-8">
                We've sent a 6-digit verification code to <br/>
                <span className="text-[#00e5ff] font-bold">{formData.email}</span>
              </p>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider text-center">Enter OTP Code</label>
                  <input 
                    type="text" 
                    required 
                    maxLength="6"
                    value={otpCode} 
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} // Ilakkam witharak type karanna denawa
                    className="w-full bg-[#1a1c23] border border-gray-700 text-white px-4 py-4 rounded-xl focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] transition text-center text-2xl tracking-[0.5em] font-mono"
                    placeholder="000000"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full bg-[#00e5ff] hover:bg-[#00c3d9] text-black font-black py-4 rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.4)] transform hover:-translate-y-1 transition-all mt-4 disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify Account'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Register;