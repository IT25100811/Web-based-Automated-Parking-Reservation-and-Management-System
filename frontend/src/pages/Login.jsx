import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Zap, Map, Phone, Mail, Clock, MapPin, Star, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [publicReviews, setPublicReviews] = useState([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0); 
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/reviews/all');
        const topReviews = response.data
          .filter(r => r.rating >= 4)
          .sort((a, b) => b.id - a.id)
          .slice(0, 5);
        setPublicReviews(topReviews);
      } catch (error) {
        console.error("Error fetching reviews for landing page:", error);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    if (publicReviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % publicReviews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [publicReviews.length, currentReviewIndex]);

  const nextReview = () => {
    if (publicReviews.length <= 1) return;
    setCurrentReviewIndex((prev) => (prev + 1) % publicReviews.length);
  };

  const prevReview = () => {
    if (publicReviews.length <= 1) return;
    setCurrentReviewIndex((prev) => (prev - 1 + publicReviews.length) % publicReviews.length);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/users/login', null, {
        params: { email, password }
      });
      
      const userData = response.data;
      
      localStorage.clear();
      localStorage.setItem('easyParkUserId', userData.id);
      localStorage.setItem('easyParkUserName', userData.name);
      localStorage.setItem('easyParkUserEmail', userData.email);
      localStorage.setItem('easyParkUserRole', userData.role); 

      setMessage(`Welcome back, ${userData.name}! 🚘`);
      setIsError(false);
      
      setTimeout(() => {
        // SUPER_ADMIN saha ADMIN dennama admin panel ekata yanawa
        if (userData.role === 'ADMIN' || userData.role === 'SUPER_ADMIN') {
          navigate('/admin'); 
        } else if (userData.role === 'STAFF') {
          navigate('/staff'); 
        } else {
          navigate('/dashboard'); 
        }
      }, 1500);

    } catch (error) {
      console.error(error);
      setIsError(true);
      setMessage("❌ Login failed! Please check your credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-gray-300 font-sans selection:bg-[#00e5ff] selection:text-black flex flex-col overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="bg-[#12141a]/95 backdrop-blur-md border-b border-gray-800 px-8 py-5 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#00e5ff] rounded flex items-center justify-center font-black text-black">P</div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            Easy<span className="text-[#00e5ff]">Park</span>
          </h1>
        </div>
        <div className="flex items-center gap-6 text-sm font-bold">
          <a href="#features" className="hover:text-[#00e5ff] transition">Features</a>
          {publicReviews.length > 0 && <a href="#reviews" className="hover:text-[#00e5ff] transition">Reviews</a>}
          <a href="#contact" className="hover:text-[#00e5ff] transition">Contact</a>
          <Link to="/register" className="bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff] px-5 py-2 rounded-full hover:bg-[#00e5ff] hover:text-black transition shadow-[0_0_10px_rgba(0,229,255,0.2)]">
            Register Now
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative flex-1 flex w-full border-b border-[#00e5ff]/10">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?q=80&w=2070&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10]/90 via-[#0b0c10]/70 to-[#0b0c10]/95 backdrop-blur-[2px]"></div>

        <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-between max-w-[1400px] mx-auto w-full px-8 py-20 gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-5xl lg:text-7xl font-black text-white leading-tight drop-shadow-2xl">
              You Can't <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-blue-500">
                Park Closer.
              </span>
            </h2>
            <p className="text-lg text-gray-300 max-w-lg leading-relaxed drop-shadow-md">
              Instantly book your space today. Your premium global parking partner. Experience real-time space locks and guaranteed security.
            </p>
            <div className="flex gap-4 pt-4">
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg border border-gray-700 shadow-xl">
                <Zap className="text-[#00e5ff]" size={20} />
                <span className="font-bold text-sm text-white">Real-time slots</span>
              </div>
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg border border-gray-700 shadow-xl">
                <Shield className="text-[#00e5ff]" size={20} />
                <span className="font-bold text-sm text-white">100% Secure</span>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md bg-[#15171e]/90 backdrop-blur-xl p-8 rounded-2xl border border-gray-700 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#00e5ff] opacity-20 blur-2xl rounded-full pointer-events-none"></div>
            <h3 className="text-2xl font-black text-white mb-2">Welcome Back</h3>
            <p className="text-sm text-gray-400 mb-8">Login to manage your bookings</p>

            {message && (
              <div className={`p-3 rounded-lg mb-6 text-center text-sm font-bold border ${isError ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-green-500/10 border-green-500 text-green-500'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#0b0c10]/80 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] transition" placeholder="Enter your email" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#0b0c10]/80 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] transition" placeholder="Enter your password" />
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-[#00e5ff] hover:bg-[#00c3d9] text-black font-black py-4 rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] transform hover:-translate-y-1 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'Signing In...' : 'Sign In to Easy Park'}
              </button>
            </form>
            
            <p className="text-center text-sm text-gray-400 mt-6">
              Don't have an account? <Link to="/register" className="text-[#00e5ff] font-bold hover:underline">Register here</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-[#12141a] py-20 border-b border-gray-800">
        <div className="max-w-[1400px] mx-auto px-8">
          <h2 className="text-3xl font-black text-center text-white mb-12">Why Choose Easy Park?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#15171e] p-8 rounded-2xl border border-gray-800 text-center hover:border-[#00e5ff] transition group shadow-xl">
              <Zap className="mx-auto text-[#00e5ff] mb-6 group-hover:scale-110 transition transform" size={48} />
              <h3 className="text-xl font-bold text-white mb-4">Real-Time Tracking</h3>
              <p className="text-sm text-gray-400">Our smart IoT sensors broadcast slot statuses immediately. See live availability from anywhere.</p>
            </div>
            <div className="bg-[#15171e] p-8 rounded-2xl border border-gray-800 text-center hover:border-[#ff4757] transition group shadow-xl">
              <Shield className="mx-auto text-[#ff4757] mb-6 group-hover:scale-110 transition transform" size={48} />
              <h3 className="text-xl font-bold text-white mb-4">Guaranteed Security</h3>
              <p className="text-sm text-gray-400">24/7 CCTV surveillance, well-lit spaces, and automated license-plate verification scanners.</p>
            </div>
            <div className="bg-[#15171e] p-8 rounded-2xl border border-gray-800 text-center hover:border-[#ffd32a] transition group shadow-xl">
              <Map className="mx-auto text-[#ffd32a] mb-6 group-hover:scale-110 transition transform" size={48} />
              <h3 className="text-xl font-bold text-white mb-4">EV & Handicap Friendly</h3>
              <p className="text-sm text-gray-400">Dedicated charging terminals for electric vehicles and accessible slots close to exit gates.</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- 3D Animated Customer Reviews Carousel --- */}
      {publicReviews.length > 0 && (
        <div id="reviews" className="bg-[#0b0c10] py-24 border-b border-gray-800 overflow-hidden relative">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-8 relative">
            <div className="text-center mb-16 relative z-20">
              <h2 className="text-3xl font-black text-white mb-4">What Our Customers Say</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Don't just take our word for it. Hear from the drivers who use Easy Park every day.</p>
            </div>
            
            {/* Carousel Container */}
            <div className="relative h-[380px] sm:h-[320px] flex items-center justify-center w-full max-w-6xl mx-auto">
              
              {/* Navigation Arrows */}
              {publicReviews.length > 1 && (
                <>
                  <button 
                    onClick={prevReview} 
                    className="absolute left-2 md:left-10 z-40 bg-[#15171e]/80 hover:bg-[#00e5ff] text-white hover:text-black p-3 rounded-full border border-gray-700 hover:border-[#00e5ff] transition backdrop-blur-md shadow-xl"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={nextReview} 
                    className="absolute right-2 md:right-10 z-40 bg-[#15171e]/80 hover:bg-[#00e5ff] text-white hover:text-black p-3 rounded-full border border-gray-700 hover:border-[#00e5ff] transition backdrop-blur-md shadow-xl"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {publicReviews.map((review, index) => {
                const prevIndex = (currentReviewIndex - 1 + publicReviews.length) % publicReviews.length;
                const nextIndex = (currentReviewIndex + 1) % publicReviews.length;

                let styleClass = "translate-x-0 scale-75 opacity-0 z-0 pointer-events-none"; // Hidden default

                if (index === currentReviewIndex) {
                  // Active Center Card
                  styleClass = "translate-x-0 scale-100 opacity-100 z-30 shadow-[0_0_40px_rgba(0,229,255,0.2)] border-[#00e5ff]/60 bg-[#15171e]";
                } else if (index === nextIndex) {
                  // Right Card (no blur, clear opacity)
                  styleClass = "translate-x-[60%] sm:translate-x-[75%] md:translate-x-[85%] scale-90 opacity-80 z-10 border-gray-700 pointer-events-none bg-[#0b0c10]";
                } else if (index === prevIndex) {
                  // Left Card (no blur, clear opacity)
                  styleClass = "-translate-x-[60%] sm:-translate-x-[75%] md:-translate-x-[85%] scale-90 opacity-80 z-10 border-gray-700 pointer-events-none bg-[#0b0c10]";
                }

                return (
                  <div 
                    key={review.id}
                    className={`absolute w-full max-w-[280px] sm:max-w-md md:max-w-xl transition-all duration-500 ease-out transform ${styleClass}`}
                  >
                    <div className="border border-inherit p-8 sm:p-12 rounded-[2rem] text-center relative h-full">
                      <MessageSquare className="absolute top-8 left-8 text-gray-800 opacity-20" size={80} />
                      
                      <div className="flex justify-center gap-1.5 mb-6 relative z-10">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={20} className={i < review.rating ? "text-[#ffd32a] fill-[#ffd32a]" : "text-gray-700"} />
                        ))}
                      </div>
                      
                      <p className="text-lg sm:text-xl font-medium text-white italic mb-8 relative z-10 leading-relaxed">
                        "{review.comment}"
                      </p>
                      
                      <div className="flex flex-col items-center gap-3 relative z-10">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00e5ff] to-blue-600 p-0.5 shadow-lg">
                          <div className="w-full h-full bg-[#1a1c23] rounded-full flex items-center justify-center font-black text-white text-lg">
                            {review.userName ? review.userName.charAt(0).toUpperCase() : 'U'}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-black text-white text-sm uppercase tracking-wider">{review.userName || 'Verified Driver'}</h4>
                          <p className="text-[10px] text-[#00e5ff] tracking-widest uppercase mt-1">EasyPark User</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dots Indicator */}
            {publicReviews.length > 1 && (
              <div className="flex justify-center gap-3 mt-12 relative z-20">
                {publicReviews.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentReviewIndex(idx)}
                    className={`transition-all duration-300 rounded-full ${idx === currentReviewIndex ? 'w-8 h-2.5 bg-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.6)]' : 'w-2.5 h-2.5 bg-gray-700 hover:bg-gray-500'}`}
                  />
                ))}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Footer Section */}
      <footer id="contact" className="bg-[#12141a] py-12">
        <div className="max-w-[1400px] mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-[#00e5ff] rounded flex items-center justify-center font-black text-black text-xs">P</div>
              <h1 className="text-xl font-black text-white tracking-wide">Easy<span className="text-[#00e5ff]">Park</span></h1>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Your premium global parking partner, delivering exceptional parking experiences with real-time space locks.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Contact & Location</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <p className="flex items-start gap-2"><MapPin size={16} className="text-[#00e5ff] shrink-0 mt-1" /> Malabe Main Office, Kandy Road, Sri Lanka</p>
              <p className="flex items-center gap-2"><Phone size={16} className="text-[#00e5ff] shrink-0" /> +94 72 972 7512</p>
              <p className="flex items-center gap-2"><Mail size={16} className="text-[#00e5ff] shrink-0" /> parkeasy.lk@gmail.com</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Our Branches</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2 text-[#00e5ff]"><div className="w-1.5 h-1.5 rounded-full bg-[#00e5ff]"></div> Colombo</li>
              <li className="hover:text-white cursor-pointer transition">Kadawatha</li>
              <li className="hover:text-white cursor-pointer transition">Negombo</li>
              <li className="hover:text-white cursor-pointer transition">Gampaha</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Working Hours</h4>
            <div className="bg-[#1a1c23] p-4 rounded-xl border border-gray-800 inline-block">
              <p className="flex items-center gap-2 font-bold text-[#ffd32a] text-sm"><Clock size={16} /> 24 Hours & 7 Days</p>
            </div>
          </div>

        </div>
        
        <div className="max-w-[1400px] mx-auto px-8 mt-12 pt-6 border-t border-gray-800 flex justify-between text-xs text-gray-600">
          <p>&copy; 2026 Easy Park | SE2030 Y2-S1-MLB-B4G2-02 Group Project | All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-[#00e5ff] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#00e5ff] cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default Login;