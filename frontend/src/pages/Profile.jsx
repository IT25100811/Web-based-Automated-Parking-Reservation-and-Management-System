import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Lock, Trash2, CheckCircle, ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('easyParkUserId');
  const [userName, setUserName] = useState(localStorage.getItem('easyParkUserName') || 'User');

  const [user, setUser] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- THEME SYNC ---
  const [currentMode] = useState(localStorage.getItem('theme') || 'dark');
  const isDark = currentMode === 'dark';

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Fetch user details when component mounts
  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/users/${userId}`);
      setUser({
        name: response.data.name || '',
        email: response.data.email || '',
        password: '' // Keep password field clean initially for security
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Handle Profile Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const updateData = {
        name: user.name,
        email: user.email,
        password: user.password ? user.password : undefined
      };

      await axios.put(`http://localhost:8080/api/users/update/${userId}`, updateData);
      
      // Update local storage username as well
      localStorage.setItem('easyParkUserName', user.name);
      setUserName(user.name);

      setMessage('Profile updated successfully! 🎉');
      setIsError(false);
      setUser(prev => ({ ...prev, password: '' })); // clear password input after update
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data || 'Failed to update profile.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    if (window.confirm("⚠️ Are you sure you want to delete your Easy Park account? This action cannot be undone.")) {
      try {
        await axios.delete(`http://localhost:8080/api/users/delete/${userId}`);
        localStorage.clear(); // Clear all stored user details
        navigate('/');
      } catch (error) {
        console.error(error);
        alert("Failed to delete account. Please try again.");
      }
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0b0c10] text-gray-300' : 'bg-gray-100 text-gray-800'} font-sans selection:bg-[#00e5ff] selection:text-black pb-12 transition-colors duration-300`}>
      
      {/* Navigation Bar */}
      <nav className={`${isDark ? 'bg-[#12141a] border-gray-800' : 'bg-white border-gray-200'} border-b px-8 py-4 flex justify-between items-center shadow-lg mb-10 transition-colors duration-300`}>
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-blue-500 tracking-wide">
          EASY<span className={isDark ? 'text-white' : 'text-gray-900'}>PARK</span>
        </h1>
        <button 
          onClick={() => navigate('/dashboard')}
          className={`flex items-center gap-2 text-sm font-bold transition px-4 py-2 rounded-full border ${isDark ? 'text-gray-400 hover:text-[#00e5ff] bg-[#1a1c23] border-gray-700' : 'text-gray-600 hover:text-blue-600 bg-gray-50 border-gray-200'}`}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </nav>

      {/* Main Profile Container */}
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Profile Header Card */}
        <div className={`${isDark ? 'bg-[#15171e] border-gray-800' : 'bg-white border-gray-200'} rounded-2xl border p-8 shadow-2xl mb-8 relative overflow-hidden transition-colors`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00e5ff] opacity-5 rounded-bl-full pointer-events-none"></div>
          
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-gradient-to-br from-[#00e5ff] to-blue-600 rounded-2xl flex items-center justify-center text-black font-black text-3xl shadow-[0_0_20px_rgba(0,229,255,0.3)]">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{userName}</h2>
              <p className={`text-sm flex items-center gap-1.5 mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Shield size={14} className="text-[#00e5ff]" /> Verified Driver Account
              </p>
            </div>
          </div>
        </div>

        {/* Edit Profile Form Card */}
        <div className={`${isDark ? 'bg-[#15171e] border-gray-800' : 'bg-white border-gray-200'} rounded-2xl border p-8 shadow-2xl mb-8 transition-colors`}>
          <h3 className={`text-xl font-black mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            ⚙️ Account Settings & Details
          </h3>

          {message && (
            <div className={`mb-6 p-4 rounded-xl text-center text-sm font-bold border ${isError ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-green-500/10 border-green-500 text-green-500 flex items-center justify-center gap-2'}`}>
              {!isError && <CheckCircle size={18} />}
              {message}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className={`block text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <User size={14} className="text-[#00e5ff]" /> Full Name
              </label>
              <input 
                type="text" required
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                className={`w-full border px-4 py-3.5 rounded-xl focus:outline-none transition font-semibold ${isDark ? 'bg-[#1a1c23] border-gray-700 text-white focus:border-[#00e5ff]' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'}`}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className={`block text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Mail size={14} className="text-[#00e5ff]" /> Email Address
              </label>
              <input 
                type="email" required
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className={`w-full border px-4 py-3.5 rounded-xl focus:outline-none transition font-semibold ${isDark ? 'bg-[#1a1c23] border-gray-700 text-white focus:border-[#00e5ff]' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'}`}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className={`block text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Lock size={14} className="text-[#00e5ff]" /> New Password (Optional)
              </label>
              <input 
                type="password"
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                className={`w-full border px-4 py-3.5 rounded-xl focus:outline-none transition font-semibold ${isDark ? 'bg-[#1a1c23] border-gray-700 text-white focus:border-[#00e5ff]' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'}`}
                placeholder="Leave blank to keep current password"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#00e5ff] to-blue-500 hover:from-[#00c3d9] hover:to-blue-600 text-black font-black py-4 rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all mt-4 disabled:opacity-50"
            >
              {isLoading ? 'Updating Profile...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Danger Zone: Delete Account */}
        <div className={`${isDark ? 'bg-[#15171e] border-red-500/30' : 'bg-white border-red-200'} rounded-2xl border p-8 shadow-2xl transition-colors`}>
          <h3 className="text-lg font-black text-red-500 mb-2">⚠️ Danger Zone</h3>
          <p className={`text-xs mb-6 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Permanently delete your account and all associated vehicles. This action cannot be undone once confirmed.
          </p>
          <button 
            onClick={handleDeleteAccount}
            className={`border border-red-500/50 hover:bg-red-500 hover:text-white text-red-500 font-bold px-6 py-3 rounded-xl transition flex items-center gap-2 text-sm ${isDark ? 'bg-red-500/5' : 'bg-red-50'}`}
          >
            <Trash2 size={16} /> Delete Account
          </button>
        </div>

      </div>
    </div>
  );
}

export default Profile;