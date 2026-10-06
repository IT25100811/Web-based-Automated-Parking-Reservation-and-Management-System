import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, CheckCircle, LogOut, Car, QrCode, ArrowRightLeft, ShieldCheck, AlertTriangle, User, Sun, Moon, Info, CalendarDays, MapPin, Clock3, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- HELPER FUNCTION: Spring Boot Date Parser ---
const parseBackendDate = (d) => {
  if (!d) return new Date(NaN);
  if (Array.isArray(d)) {
    return new Date(d[0], d[1] - 1, d[2], d[3] || 0, d[4] || 0, d[5] || 0); // ALUTH: Seconds pass wenawa nam ewath ganna
  }
  
  // Safe Fallback String Parser (Just in case Spring sends ISO String)
  let dateString = String(d);
  try {
    let cleanStr = dateString.replace('Z', '').split('+')[0];
    let parts = cleanStr.includes('T') ? cleanStr.split('T') : cleanStr.split(' ');
    
    if (parts.length === 2) {
      let [year, month, day] = parts[0].split('-').map(Number);
      let [hour, minute, second] = parts[1].split('.')[0].split(':').map(Number);
      return new Date(year, month - 1, day, hour, minute, second || 0);
    }
  } catch (e) {
    console.error("Custom Date parsing failed", e);
  }

  return new Date(dateString);
};

// Safe Time Formatter for Display
const formatTime = (dateInput) => {
  if (!dateInput) return 'Pending';
  const d = parseBackendDate(dateInput);
  if (isNaN(d.getTime())) return 'Invalid Time';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

function StaffDashboard() {
  const navigate = useNavigate();
  const staffName = "Gate Operator 01";
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [searchMode, setSearchMode] = useState('scanner'); 
  const [searchId, setSearchId] = useState('');
  const [bookingResult, setBookingResult] = useState(null);
  const [slotDetails, setSlotDetails] = useState(null);
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null); 
  const [existingComplaint, setExistingComplaint] = useState(null);
  const [complaintText, setComplaintText] = useState('');
  const [isEditingComplaint, setIsEditingComplaint] = useState(false);
  const [searchSlotNum, setSearchSlotNum] = useState('');
  const [slotTimeline, setSlotTimeline] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageModal, setMessageModal] = useState({ isOpen: false, message: '', type: 'success' });
  const [fineModalData, setFineModalData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  let canManageComplaint = false;
  let timeRemaining = null;
  let isToday = false;

  if (bookingResult && bookingResult.startTime) {
    const bookingDate = parseBackendDate(bookingResult.startTime);
    const today = new Date(currentTime);
    isToday = bookingDate.getFullYear() === today.getFullYear() &&
              bookingDate.getMonth() === today.getMonth() &&
              bookingDate.getDate() === today.getDate();

    if (bookingResult.status === 'ENTERED') {
      canManageComplaint = true;
    } else if (bookingResult.status === 'COMPLETED') {
      let exitTimeStr = localStorage.getItem(`exit_time_${bookingResult.id}`);
      if (!exitTimeStr) {
        exitTimeStr = Date.now().toString();
        localStorage.setItem(`exit_time_${bookingResult.id}`, exitTimeStr);
      }
      const exitTimeMs = parseInt(exitTimeStr, 10);
      const diffMins = (currentTime - exitTimeMs) / (1000 * 60);
      
      if (diffMins <= 30) {
        canManageComplaint = true;
        timeRemaining = Math.max(0, Math.floor(30 - diffMins));
      }
    }
  }

  const handleSearchIdChange = (e) => {
    const value = e.target.value;
    if (value === '') { setSearchId(''); return; }
    if (/^\d{1,5}$/.test(value)) { setSearchId(value); }
  };

  const handleSearch = async (e) => {
    if(e) e.preventDefault();
    if (!searchId) return;

    setIsLoading(true);
    setBookingResult(null);
    setExistingComplaint(null);
    setComplaintText('');
    setIsEditingComplaint(false);
    setUserDetails(null); 
    setShowDeleteModal(false);

    try {
      const resResponse = await axios.get('http://localhost:8080/api/reservations/all');
      const foundBooking = resResponse.data.find(b => b.id === parseInt(searchId));

      if (foundBooking) {
        setBookingResult(foundBooking);
        
        const slotsResponse = await axios.get('http://localhost:8080/api/slots/all');
        const sDetails = slotsResponse.data.find(s => s.id === foundBooking.slotId);
        setSlotDetails(sDetails);

        const vehiclesResponse = await axios.get('http://localhost:8080/api/vehicles/all');
        const vDetails = vehiclesResponse.data.find(v => v.id === foundBooking.vehicleId);
        setVehicleDetails(vDetails);

        try {
          const usersResponse = await axios.get('http://localhost:8080/api/users/all');
          const uDetails = usersResponse.data.find(u => u.id === foundBooking.userId);
          setUserDetails(uDetails);
        } catch (userError) {}

        try {
          const compResponse = await axios.get(`http://localhost:8080/api/complaints/booking/${foundBooking.id}`);
          if (compResponse.data) {
            setExistingComplaint(compResponse.data);
            setComplaintText(compResponse.data.description);
          }
        } catch (compError) {}

      } else {
        setMessageModal({ isOpen: true, message: "Booking not found. Check the ID.", type: 'error' });
      }
    } catch (error) {
      console.error(error);
      setMessageModal({ isOpen: true, message: "Error fetching data from server.", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVehicleEntry = async () => {
    try {
      // ALUTH: Calling the new live ENTRY API
      const res = await axios.put(`http://localhost:8080/api/reservations/enter/${bookingResult.id}`);
      setMessageModal({ isOpen: true, message: "Vehicle Entry Marked Successfully!", type: 'success' });
      
      // Update UI with the returned backend object which contains actualEntryTime
      setBookingResult(res.data); 
    } catch (error) {
      console.error(error);
      setMessageModal({ isOpen: true, message: "Failed to update entry status.", type: 'error' });
    }
  };

  const calculateFine = () => {
    const endTimeObj = parseBackendDate(bookingResult.endTime);
    const overstayMs = currentTime - endTimeObj.getTime();
    
    if (overstayMs <= 300000) {
      return { isOverstayed: false, amount: 0, blocks: 0 };
    }

    const overstayMins = Math.ceil(overstayMs / 60000);
    const blocks = Math.ceil(overstayMins / 15);
    const basePrice = slotDetails?.price || 100;
    const penaltyHourlyRate = basePrice * 2;
    const penaltyPer15MinBlock = penaltyHourlyRate / 4;
    const fineAmount = blocks * penaltyPer15MinBlock;

    return { 
      isOverstayed: true, 
      overstayMins, 
      blocks, 
      amount: fineAmount,
      penaltyHourlyRate
    };
  };

  const handleVehicleExitClick = () => {
    const fineData = calculateFine();
    if (fineData.isOverstayed) {
      setFineModalData(fineData); 
    } else {
      executeExit(0); 
    }
  };

  const executeExit = async (fineAmount = 0) => {
    setFineModalData(null);
    try {
      // ALUTH: Calling the new live EXIT API
      const res = await axios.put(`http://localhost:8080/api/reservations/exit/${bookingResult.id}`, {
        overstayFine: fineAmount
      });
      
      if (slotDetails) {
        const updatedSlot = { ...slotDetails, status: 'AVAILABLE' };
        await axios.post('http://localhost:8080/api/slots/add', updatedSlot);
      }
      
      localStorage.setItem(`exit_time_${bookingResult.id}`, Date.now().toString());

      setMessageModal({ isOpen: true, message: `Vehicle Exit Marked! Fine calculated: Rs ${fineAmount.toFixed(2)}. Slot is now AVAILABLE.`, type: 'success' });
      
      // Update UI with the returned backend object which contains actualExitTime
      setBookingResult(res.data); 
      setSlotDetails({...slotDetails, status: 'AVAILABLE'});
      
    } catch (error) {
      console.error(error);
      setMessageModal({ isOpen: true, message: "Failed to process exit.", type: 'error' });
    }
  };

  const handleSlotSearchChange = (e) => {
    let value = e.target.value.toUpperCase();
    if (value === '') { setSearchSlotNum(''); return; }
    if (/^[A-Z]\d{0,4}$/.test(value)) { setSearchSlotNum(value); }
  };

  const handleSlotSearch = async (e) => {
    e.preventDefault();
    if(!searchSlotNum) return;

    setIsLoading(true);
    setSlotTimeline(null);

    try {
      const slotsRes = await axios.get('http://localhost:8080/api/slots/all');
      const targetSlot = slotsRes.data.find(s => s.slotNumber.toUpperCase() === searchSlotNum.trim());
      
      if (!targetSlot) {
        setMessageModal({ isOpen: true, message: "Slot not found in database.", type: 'error' });
        setIsLoading(false);
        return;
      }

      const resResponse = await axios.get('http://localhost:8080/api/reservations/all');
      const usersResponse = await axios.get('http://localhost:8080/api/users/all').catch(() => ({data: []}));
      const vehiclesResponse = await axios.get('http://localhost:8080/api/vehicles/all').catch(() => ({data: []}));

      const today = new Date(currentTime);
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).getTime();

      const todaysBookings = resResponse.data.filter(b => {
         if (b.slotId !== targetSlot.id) return false;
         const bTime = parseBackendDate(b.startTime).getTime();
         return bTime >= startOfToday && bTime <= endOfToday;
      }).map(b => {
         const u = usersResponse.data.find(u => u.id === b.userId);
         const v = vehiclesResponse.data.find(v => v.id === b.vehicleId);
         return { ...b, user: u, vehicle: v };
      }).sort((a, b) => parseBackendDate(a.startTime).getTime() - parseBackendDate(b.startTime).getTime());

      setSlotTimeline({ slot: targetSlot, bookings: todaysBookings });

    } catch(err) {
      setMessageModal({ isOpen: true, message: "Error fetching slot timeline.", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const jumpToScanner = (bookingId) => {
    setSearchId(bookingId.toString());
    setSearchMode('scanner');
    setTimeout(() => {
      document.getElementById('hiddenSearchBtn').click();
    }, 100);
  };

  const handleSaveComplaint = async () => {
    if (!complaintText.trim()) return;

    try {
      if (isEditingComplaint && existingComplaint) {
        const response = await axios.put(`http://localhost:8080/api/complaints/update/${existingComplaint.id}`, {
          ...existingComplaint, description: complaintText
        });
        setExistingComplaint(response.data);
        setIsEditingComplaint(false);
        setMessageModal({ isOpen: true, message: "Complaint updated successfully.", type: 'success' });
      } else {
        const payload = {
          bookingId: bookingResult.id,
          userId: bookingResult.userId,
          description: complaintText,
          status: "PENDING"
        };
        const response = await axios.post(`http://localhost:8080/api/complaints/add`, payload);
        setExistingComplaint(response.data);
        setMessageModal({ isOpen: true, message: "Complaint recorded successfully.", type: 'success' });
      }
    } catch (error) {
      setMessageModal({ isOpen: true, message: "Failed to save complaint.", type: 'error' });
    }
  };

  const confirmDeleteComplaint = async () => {
    setShowDeleteModal(false);
    try {
      await axios.delete(`http://localhost:8080/api/complaints/delete/${existingComplaint.id}`);
      setExistingComplaint(null);
      setComplaintText('');
      setIsEditingComplaint(false);
      setMessageModal({ isOpen: true, message: "Complaint removed successfully.", type: 'success' });
    } catch (error) {
      setMessageModal({ isOpen: true, message: "Failed to delete complaint.", type: 'error' });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-[#00e5ff] selection:text-black pb-12 transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0b0c10] text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
      
      {messageModal.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`p-8 rounded-3xl border w-full max-w-sm relative flex flex-col items-center text-center shadow-2xl transition-colors ${theme === 'dark' ? 'bg-[#15171e]' : 'bg-white'} ${messageModal.type === 'error' ? 'border-red-500/50' : 'border-green-500/50'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${messageModal.type === 'error' ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
              {messageModal.type === 'error' ? <AlertTriangle className="text-red-500" size={32} /> : <CheckCircle className="text-green-500" size={32} />}
            </div>
            <h2 className={`text-xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {messageModal.type === 'error' ? 'Error' : 'Success'}
            </h2>
            <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{messageModal.message}</p>
            <button 
              onClick={() => setMessageModal({ ...messageModal, isOpen: false })} 
              className={`w-full py-3 rounded-xl font-bold transition ${messageModal.type === 'error' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[#00e5ff] hover:bg-[#00c3d9] text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]'}`}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {fineModalData && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`p-8 rounded-3xl border w-full max-w-md relative flex flex-col items-center shadow-2xl transition-colors ${theme === 'dark' ? 'bg-[#15171e] border-[#ff4757]/50' : 'bg-white border-red-400'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border bg-red-500/10 border-red-500/30`}>
              <Receipt className="text-[#ff4757]" size={32} />
            </div>
            <h2 className={`text-2xl font-black mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Overstay Penalty</h2>
            <p className={`text-sm mb-6 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Vehicle has overstayed by <strong className="text-[#ff4757]">{fineModalData.overstayMins} minutes</strong> past the booking time.
            </p>

            <div className={`w-full rounded-2xl p-4 mb-6 border ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Penalty Rate / Hr</span>
                <span className={`text-sm font-black ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Rs {fineModalData.penaltyHourlyRate.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Time Blocks (15m)</span>
                <span className={`text-sm font-black ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{fineModalData.blocks} Blocks</span>
              </div>
              <div className="w-full h-px bg-gray-500/20 my-3"></div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-wider text-[#ff4757]">Total Fine Due</span>
                <span className="text-3xl font-black text-[#ff4757]">Rs {fineModalData.amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setFineModalData(null)} 
                className={`flex-1 py-4 rounded-xl font-bold transition ${theme === 'dark' ? 'text-gray-400 bg-[#1a1c23] hover:bg-gray-800 border border-gray-800' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'}`}
              >
                Cancel
              </button>
              <button 
                onClick={() => executeExit(fineModalData.amount)} 
                className="flex-1 py-4 rounded-xl font-black text-white bg-gradient-to-r from-[#ff4757] to-red-600 hover:from-red-500 hover:to-red-700 transition shadow-[0_0_15px_rgba(255,71,87,0.4)]"
              >
                Collect & Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`p-8 rounded-2xl border w-full max-w-sm relative flex flex-col items-center text-center ${theme === 'dark' ? 'bg-[#15171e] border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.15)]' : 'bg-white border-red-200 shadow-xl'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${theme === 'dark' ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h2 className={`text-xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Delete Complaint?</h2>
            <p className={`text-sm mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Are you sure you want to permanently delete this complaint?</p>
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className={`flex-1 py-3 rounded-xl font-bold transition ${theme === 'dark' ? 'text-gray-400 bg-[#1a1c23] hover:bg-gray-800' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'}`}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteComplaint} 
                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Navbar */}
      <nav className={`border-b px-8 py-4 flex justify-between items-center shadow-lg mb-8 transition-colors duration-300 ${theme === 'dark' ? 'bg-[#12141a] border-[#00e5ff]/20' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-blue-500 tracking-wide">
            EASY<span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>PARK</span>
          </h1>
          <span className="bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase flex items-center gap-1 hidden sm:flex">
            <ShieldCheck size={12} /> Staff Terminal
          </span>
        </div>
        <div className="flex items-center gap-4">
          
          <div 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`relative w-[72px] h-[36px] rounded-full cursor-pointer transition-all duration-500 flex items-center p-1 ${
              theme === 'dark' ? 'bg-[#0b0c10] shadow-[inset_0px_2px_8px_rgba(0,0,0,0.8)] border border-gray-800' : 'bg-[#e2e8f0] shadow-[inset_0px_2px_8px_rgba(0,0,0,0.1)] border border-gray-300'
            }`}
          >
            <div className="absolute w-full flex justify-between px-2.5 left-0 pointer-events-none">
              <Sun size={14} className={`${theme === 'dark' ? 'text-gray-500' : 'opacity-0'} transition-opacity duration-300`} />
              <Moon size={14} className={`${theme === 'dark' ? 'opacity-0' : 'text-gray-500'} transition-opacity duration-300`} />
            </div>
            <div className={`absolute w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 shadow-md ${
                theme === 'dark' ? 'translate-x-[34px] bg-[#1a1c23] border border-gray-700' : 'translate-x-0 bg-gradient-to-br from-[#ffc85a] to-[#ed8b00]'
              }`}
            >
              {theme === 'dark' ? <Moon size={14} className="text-gray-300" /> : <Sun size={14} className="text-white" />}
            </div>
          </div>

          <div className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border transition-colors hidden md:flex ${theme === 'dark' ? 'text-gray-400 bg-[#1a1c23] border-gray-700' : 'text-gray-700 bg-gray-50 border-gray-200'}`}>
            {staffName}
          </div>
          <button onClick={handleLogout} className="text-sm font-bold text-red-400 hover:text-red-500 transition flex items-center gap-2">
            <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 mt-10">
        
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setSearchMode('scanner')}
            className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              searchMode === 'scanner' 
                ? (theme === 'dark' ? 'bg-[#00e5ff] text-black shadow-[0_0_20px_rgba(0,229,255,0.3)]' : 'bg-blue-500 text-white shadow-xl')
                : (theme === 'dark' ? 'bg-[#15171e] text-gray-500 border border-gray-800 hover:text-gray-300' : 'bg-white text-gray-400 border border-gray-200 hover:text-gray-700')
            }`}
          >
            <QrCode size={18} /> Booking Scanner
          </button>
          <button 
            onClick={() => setSearchMode('timeline')}
            className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              searchMode === 'timeline' 
                ? (theme === 'dark' ? 'bg-[#00e5ff] text-black shadow-[0_0_20px_rgba(0,229,255,0.3)]' : 'bg-blue-500 text-white shadow-xl')
                : (theme === 'dark' ? 'bg-[#15171e] text-gray-500 border border-gray-800 hover:text-gray-300' : 'bg-white text-gray-400 border border-gray-200 hover:text-gray-700')
            }`}
          >
            <MapPin size={18} /> Slot Timeline (Today)
          </button>
        </div>

        {searchMode === 'scanner' && (
          <div className="animate-fade-in space-y-8">
            <div className={`p-8 rounded-3xl border shadow-2xl transition-colors ${theme === 'dark' ? 'bg-[#15171e] border-gray-800' : 'bg-white border-gray-200'}`}>
              <h2 className={`text-2xl font-black mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <QrCode className={theme === 'dark' ? 'text-[#00e5ff]' : 'text-blue-500'} size={28} /> Scanner Override Terminal
              </h2>
              <p className={`text-sm mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Type the Booking ID from the customer's QR code to manage entry/exit.</p>

              <form onSubmit={handleSearch} className="flex gap-4">
                <div className="flex-1">
                  <input 
                    type="text" 
                    value={searchId}
                    onChange={handleSearchIdChange}
                    placeholder="Enter Booking ID (Max 5 Digits)" 
                    className={`w-full border px-6 py-4 rounded-xl focus:outline-none transition text-lg tracking-wider ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-700 text-white focus:border-[#00e5ff]' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'}`}
                    required
                  />
                </div>
                <button 
                  id="hiddenSearchBtn"
                  type="submit" 
                  disabled={isLoading || !searchId}
                  className={`font-black px-8 py-4 rounded-xl transition flex items-center gap-2 ${theme === 'dark' ? 'bg-[#00e5ff] hover:bg-[#00c3d9] text-black shadow-[0_0_15px_rgba(0,229,255,0.3)] disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none' : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none'}`}
                >
                  <Search size={20} /> {isLoading ? 'Searching...' : 'Find Booking'}
                </button>
              </form>
            </div>

            {bookingResult && slotDetails && vehicleDetails && (
              <div className={`p-8 rounded-3xl border shadow-[0_0_40px_rgba(0,229,255,0.1)] transition-colors ${theme === 'dark' ? 'bg-[#15171e] border-[#00e5ff]/30' : 'bg-white border-blue-200'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Booking #{bookingResult.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border shadow-sm ${theme === 'dark' ? 'bg-[#1a1c23] text-gray-300 border-gray-700' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        <User size={12} className={theme === 'dark' ? 'text-[#00e5ff]' : 'text-blue-500'} /> {userDetails?.name || 'Unknown User'}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      bookingResult.status === 'CONFIRMED' ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40' :
                      bookingResult.status === 'ENTERED' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/40' :
                      'bg-green-500/20 text-green-500 border border-green-500/40'
                    }`}>
                      Current Status: {bookingResult.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Slot Number</p>
                    <p className={`text-4xl font-black ${theme === 'dark' ? 'text-[#00e5ff]' : 'text-blue-600'}`}>{slotDetails.slotNumber}</p>
                  </div>
                </div>

                <div className={`grid grid-cols-2 gap-6 mb-8 p-6 rounded-2xl border transition-colors ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                  <div>
                    <p className={`text-xs font-bold uppercase mb-3 flex items-center gap-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}><Car size={14}/> Vehicle Info</p>
                    <p className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{vehicleDetails.licensePlate}</p>
                    <p className={`text-sm capitalize mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{vehicleDetails.color} {vehicleDetails.make}</p>
                  </div>
                  <div>
                    <p className={`text-xs font-bold uppercase mb-3 flex items-center gap-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}><CalendarDays size={14}/> Time Window</p>
                    <p className={`text-sm font-black mb-1.5 ${theme === 'dark' ? 'text-[#00e5ff]' : 'text-blue-600'}`}>
                      {new Date(bookingResult.startTime).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    
                    {/* ALUTH: Live Time Display in Staff Dashboard */}
                    <p className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>Scheduled In: {formatTime(bookingResult.startTime)}</p>
                    <p className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>Scheduled Out: {formatTime(bookingResult.endTime)}</p>
                    
                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                        <p className={`text-xs font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'} uppercase tracking-wider`}>Actual Entry: <span className="font-black text-white">{bookingResult.actualEntryTime ? formatTime(bookingResult.actualEntryTime) : 'Not Entered'}</span></p>
                        <p className={`text-xs font-bold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'} uppercase tracking-wider`}>Actual Exit: <span className="font-black text-white">{bookingResult.actualExitTime ? formatTime(bookingResult.actualExitTime) : 'Pending'}</span></p>
                    </div>

                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {bookingResult.status === 'CONFIRMED' && (
                    isToday ? (
                      <button 
                        onClick={handleVehicleEntry}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-white font-black py-4 rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.3)] transition flex items-center justify-center gap-2 text-lg"
                      >
                        <ArrowRightLeft size={24} /> Mark Vehicle Entry
                      </button>
                    ) : (
                      <div className={`flex-1 font-black py-4 rounded-xl flex items-center justify-center gap-2 text-sm border opacity-80 cursor-not-allowed ${theme === 'dark' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-red-50 border-red-200 text-red-600'}`} title="You can only mark entry on the exact booking date">
                        <AlertTriangle size={20} /> Entry Allowed Only on {new Date(bookingResult.startTime).toLocaleDateString()}
                      </div>
                    )
                  )}

                  {bookingResult.status === 'ENTERED' && (
                    <button 
                      onClick={handleVehicleExitClick}
                      className="flex-1 bg-green-500 hover:bg-green-400 text-white font-black py-4 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.3)] transition flex items-center justify-center gap-2 text-lg"
                    >
                      <CheckCircle size={24} /> Mark Exit & Free Slot
                    </button>
                  )}

                  {bookingResult.status === 'COMPLETED' && (
                    <div className={`flex-1 font-black py-4 rounded-xl flex items-center justify-center gap-2 text-lg border ${theme === 'dark' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-green-50 border-green-200 text-green-600'}`}>
                      <CheckCircle size={24} /> Booking Completed
                    </div>
                  )}
                </div>

                {/* COMPLAINT CRUD UI */}
                {(canManageComplaint || existingComplaint) ? (
                  <div className={`mt-6 p-5 border rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.05)] transition-colors ${theme === 'dark' ? 'border-red-500/30 bg-[#1a1c23]' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className={`font-black text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                        <AlertTriangle size={16} /> Issue / Complaint Reporting
                      </h3>
                      {timeRemaining !== null && (
                        <span className="text-[10px] bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-2 py-1 rounded font-bold uppercase tracking-wider">
                          {timeRemaining} mins left to edit
                        </span>
                      )}
                    </div>

                    {(!existingComplaint || isEditingComplaint) && canManageComplaint ? (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          placeholder="Enter issue here (e.g., Scratched vehicle)"
                          value={complaintText}
                          onChange={(e) => setComplaintText(e.target.value)}
                          className={`flex-1 border px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-red-500 transition ${theme === 'dark' ? 'bg-[#0b0c10] border-red-500/30 text-white' : 'bg-white border-red-300 text-gray-900'}`}
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={handleSaveComplaint} 
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg text-sm font-bold transition whitespace-nowrap"
                          >
                            {isEditingComplaint ? 'Update Issue' : 'Submit Issue'}
                          </button>
                          {isEditingComplaint && (
                            <button 
                              onClick={() => { setIsEditingComplaint(false); setComplaintText(existingComplaint.description); }} 
                              className={`px-4 py-3 rounded-lg text-sm font-bold transition ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'}`}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ) : existingComplaint ? (
                      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg border gap-4 ${theme === 'dark' ? 'bg-[#0b0c10] border-red-500/20' : 'bg-white border-red-200'}`}>
                        <div className="flex-1">
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block mb-1">Reported Issue:</span>
                          <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>{existingComplaint.description}</p>
                        </div>
                        {canManageComplaint && (
                          <div className="flex gap-3">
                            <button 
                              onClick={() => { setIsEditingComplaint(true); setComplaintText(existingComplaint.description); }} 
                              className={`text-xs font-bold transition px-3 py-1.5 rounded-md ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300 bg-blue-500/10' : 'text-blue-600 hover:text-blue-700 bg-blue-50'}`}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => setShowDeleteModal(true)} 
                              className={`text-xs font-bold transition px-3 py-1.5 rounded-md ${theme === 'dark' ? 'text-red-400 hover:text-red-300 bg-red-500/10' : 'text-red-600 hover:text-red-700 bg-red-50'}`}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className={`mt-6 p-4 rounded-xl border flex items-center justify-center gap-2 text-sm font-bold opacity-70 ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
                    <Info size={16} /> 
                    {bookingResult.status === 'CONFIRMED' 
                      ? "Vehicle must be marked as 'ENTERED' to report an issue." 
                      : "Vehicle exited over 30 mins ago. Issues can no longer be reported or modified."}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: SLOT TIMELINE (TODAY) */}
        {/* ========================================== */}
        {searchMode === 'timeline' && (
          <div className="animate-fade-in space-y-8">
            <div className={`p-8 rounded-3xl border shadow-2xl transition-colors ${theme === 'dark' ? 'bg-[#15171e] border-gray-800' : 'bg-white border-gray-200'}`}>
              <h2 className={`text-2xl font-black mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <MapPin className={theme === 'dark' ? 'text-[#00e5ff]' : 'text-blue-500'} size={28} /> Live Slot Timeline
              </h2>
              <p className={`text-sm mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Search a slot (e.g., A6) to view all its scheduled bookings for <strong>Today ({new Date(currentTime).toLocaleDateString()})</strong>.
              </p>

              <form onSubmit={handleSlotSearch} className="flex gap-4">
                <div className="flex-1">
                  <input 
                    type="text" 
                    value={searchSlotNum}
                    onChange={handleSlotSearchChange}
                    placeholder="e.g., A6, B2 (Must start with Uppercase letter)" 
                    className={`w-full border px-6 py-4 rounded-xl focus:outline-none transition text-lg tracking-wider uppercase ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-700 text-white focus:border-[#00e5ff]' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'}`}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading || !searchSlotNum}
                  className={`font-black px-8 py-4 rounded-xl transition flex items-center gap-2 ${theme === 'dark' ? 'bg-[#00e5ff] hover:bg-[#00c3d9] text-black shadow-[0_0_15px_rgba(0,229,255,0.3)] disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none' : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none'}`}
                >
                  <Search size={20} /> {isLoading ? 'Searching...' : 'View Timeline'}
                </button>
              </form>
            </div>

            {slotTimeline && (
              <div className={`p-8 rounded-3xl border shadow-[0_0_40px_rgba(0,229,255,0.1)] transition-colors ${theme === 'dark' ? 'bg-[#15171e] border-[#00e5ff]/30' : 'bg-white border-blue-200'}`}>
                <h3 className={`text-3xl font-black mb-6 flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <span>Slot {slotTimeline.slot.slotNumber} <span className={`text-lg font-bold ml-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Today's Schedule</span></span>
                  <button onClick={(e) => handleSlotSearch(e)} className={`text-sm px-4 py-2 rounded-lg font-bold border transition ${theme === 'dark' ? 'bg-[#1a1c23] text-gray-400 border-gray-700 hover:text-[#00e5ff]' : 'bg-gray-100 text-gray-600 border-gray-200 hover:text-blue-500'}`}>Refresh</button>
                </h3>
                
                {slotTimeline.bookings.length === 0 ? (
                  <div className={`p-6 text-center font-bold rounded-2xl border ${theme === 'dark' ? 'bg-[#1a1c23] text-gray-500 border-gray-800' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    No bookings found for this slot today.
                  </div>
                ) : (
                  <div className="relative border-l-2 ml-4 border-dashed border-gray-600 space-y-8 pb-4">
                    {slotTimeline.bookings.map((b, idx) => {
                      let statusColor = "gray";
                      if (b.status === 'CONFIRMED') statusColor = "blue";
                      if (b.status === 'ENTERED') statusColor = "yellow";
                      if (b.status === 'COMPLETED') statusColor = "green";

                      return (
                        <div key={b.id} className="relative pl-8">
                          {/* Timeline Dot */}
                          <div className={`absolute -left-[11px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-4 shadow-[0_0_10px_rgba(0,0,0,0.5)] ${theme === 'dark' ? 'bg-[#15171e]' : 'bg-white'} ${
                            statusColor === 'blue' ? 'border-[#00e5ff]' : 
                            statusColor === 'yellow' ? 'border-yellow-500' : 
                            statusColor === 'green' ? 'border-green-500' : 'border-gray-500'
                          }`}></div>

                          <div className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                            theme === 'dark' 
                              ? `bg-[#1a1c23] ${statusColor === 'yellow' ? 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'border-gray-800 hover:border-gray-600'}` 
                              : `bg-gray-50 ${statusColor === 'yellow' ? 'border-yellow-400 shadow-md' : 'border-gray-200 hover:border-gray-300'}`
                          }`}>
                            
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                  statusColor === 'blue' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' :
                                  statusColor === 'yellow' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 animate-pulse' :
                                  'bg-green-500/20 text-green-500 border border-green-500/30'
                                }`}>
                                  {b.status}
                                </span>
                                <span className={`text-xs font-bold ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>ID: #{b.id}</span>
                              </div>
                              <h4 className={`text-xl font-black mb-1 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                <Clock3 size={18} className={theme === 'dark' ? 'text-[#00e5ff]' : 'text-blue-500'} />
                                {new Date(b.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(b.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </h4>
                              <p className={`text-sm font-semibold capitalize ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {b.vehicle?.licensePlate || 'Unknown Vehicle'} ({b.vehicle?.make || 'Car'})
                              </p>
                            </div>

                            <button 
                              onClick={() => jumpToScanner(b.id)}
                              className={`px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                                theme === 'dark' ? 'bg-[#00e5ff]/10 text-[#00e5ff] hover:bg-[#00e5ff] hover:text-black border border-[#00e5ff]/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white border border-blue-200'
                              }`}
                            >
                              Manage Entry/Exit
                            </button>

                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default StaffDashboard;