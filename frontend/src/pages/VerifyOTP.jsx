import React, { useState } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, KeyRound } from 'lucide-react';

function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState(location.state?.email || '');
  const [otpCode, setOtpCode] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      // Sends the OTP and email to the backend as request parameters.
      const response = await axios.post('http://localhost:8080/api/users/verify-otp', null, {
        params: { email, otpCode }
      });
      
      setMessage(response.data);
      setIsError(false);
      
      // Redirects to the login page after a 2-second delay upon success.
      setTimeout(() => navigate('/'), 2000); 

    } catch (error) {
      setMessage(error.response?.data || 'OTP Verification failed. Please try again.');
      setIsError(true);
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

      {/* Hero Section (Verify Form Here) */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-between max-w-[1400px] mx-auto w-full px-8 py-12 gap-12">
        
        {/* Left Side Text */}
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#00e5ff]/10 text-[#00e5ff] px-4 py-2 rounded-full border border-[#00e5ff]/30 font-bold text-sm">
            <ShieldCheck size={18} /> Account Security
          </div>
          <h2 className="text-5xl lg:text-7xl font-black text-white leading-tight">
            Verify Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-blue-500">
              Identity.
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
            We have sent a secure One-Time Password (OTP) to your email address[cite: 2]. Please enter it below to activate your Easy Park account.
          </p>
          <div className="flex gap-4 pt-4">
            <div className="flex items-center gap-2 bg-[#15171e] px-4 py-2 rounded-lg border border-gray-800">
              <Mail className="text-[#00e5ff]" size={20} />
              <span className="font-bold text-sm">Check Inbox/Spam</span>
            </div>
          </div>
        </div>

        {/* Right Side Verify Form */}
        <div className="w-full max-w-md bg-[#15171e] p-8 rounded-2xl border border-gray-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative mt-8 lg:mt-0">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#00e5ff] opacity-10 blur-2xl rounded-full"></div>
          
          <div className="flex justify-center mb-6">
            <div className="bg-[#1a1c23] p-4 rounded-full border border-[#00e5ff]/30 shadow-[0_0_15px_rgba(0,229,255,0.15)]">
              <KeyRound size={32} className="text-[#00e5ff]" />
            </div>
          </div>

          <h3 className="text-2xl font-black text-center text-white mb-2">Enter OTP Code</h3>
          <p className="text-sm text-center text-gray-500 mb-8">Type the code sent to your email</p>

          {message && (
            <div className={`p-3 rounded-lg mb-6 text-center text-sm font-bold border ${isError ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-green-500/10 border-green-500 text-green-500'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full bg-[#1a1c23] border border-gray-700 text-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:border-[#00e5ff] transition"
                readOnly={!!location.state?.email} // Pre-filled nam auto lock wenawa
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">6-Digit OTP</label>
              <input 
                type="text" 
                required 
                value={otpCode} 
                onChange={(e) => setOtpCode(e.target.value)} 
                className="w-full bg-[#1a1c23] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] transition text-center tracking-[0.5em] text-xl font-black"
                placeholder="------"
                maxLength={6}
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-[#00e5ff] hover:bg-[#00c3d9] text-black font-black py-4 rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] transform hover:-translate-y-1 transition-all mt-4"
            >
              Verify & Activate Account
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}

export default VerifyOTP;