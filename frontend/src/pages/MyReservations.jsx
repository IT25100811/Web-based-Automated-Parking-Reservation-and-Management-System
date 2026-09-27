import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Car, Clock, CalendarDays, History, QrCode, User, CheckCircle, ArrowRight, Star, X, MessageSquare, Edit, Trash2, Shield, Hash, AlertTriangle, ChevronLeft, ChevronRight, DollarSign, Sun, Moon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import QRCode from "react-qr-code";

// --- HELPER FUNCTION: Spring Boot Date Parser (BULLETPROOF LOCAL TIME FIX) ---
const parseBackendDate = (d) => {
  if (!d) return new Date(NaN);
  
  if (Array.isArray(d)) {
    return new Date(d[0], d[1] - 1, d[2], d[3] || 0, d[4] || 0, d[5] || 0);
  }
  
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


// --- PREMIUM DATE PICKER COMPONENT ---
const PremiumDatePicker = ({ value, onChange, isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  let initialDate = new Date();
  if (value) {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      initialDate = parsed;
    }
  }

  const [currentMonth, setCurrentMonth] = useState(initialDate);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const rawDaysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const rawFirstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const daysInMonth = isNaN(rawDaysInMonth) || rawDaysInMonth < 1 ? 30 : rawDaysInMonth;
  const firstDayOfMonth = isNaN(rawFirstDay) || rawFirstDay < 0 ? 0 : rawFirstDay;
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handleSelect = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const pad = (n) => n.toString().padStart(2, '0');
    const formatted = `${newDate.getFullYear()}-${pad(newDate.getMonth() + 1)}-${pad(newDate.getDate())}`; 
    onChange(formatted);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={popupRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full ${isDark ? 'bg-[#1a1c23] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border p-3 rounded-xl flex items-center justify-between cursor-pointer hover:border-[#00e5ff] transition`}
      >
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-[#00e5ff]" />
          <span className="text-sm font-semibold">{value || "Select Date"}</span>
        </div>
      </div>

      {isOpen && (
        <div className={`absolute z-[100] mt-2 p-4 rounded-2xl shadow-2xl border ${isDark ? 'border-gray-800 bg-[#15171e]' : 'border-gray-200 bg-white'} w-72 animate-fade-in`}>
          <div className="flex justify-between items-center mb-4">
            <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className={`p-1 rounded-md ${isDark ? 'hover:bg-[#1a1c23] text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}><ChevronLeft size={18}/></button>
            <span className={`font-black text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
            <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className={`p-1 rounded-md ${isDark ? 'hover:bg-[#1a1c23] text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}><ChevronRight size={18}/></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className={`text-[10px] font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {[...Array(firstDayOfMonth)].map((_, i) => <div key={`empty-${i}`} />)}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              
              const todayObj = new Date();
              todayObj.setHours(0, 0, 0, 0); 
              
              const maxDate = new Date();
              maxDate.setMonth(maxDate.getMonth() + 6);
              maxDate.setHours(23, 59, 59, 999);

              const isPast = dateObj < todayObj;
              const isTooFar = dateObj > maxDate;
              const isDisabled = isPast || isTooFar;
              
              const pad = (n) => n.toString().padStart(2, '0');
              const dateStr = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;
              const isSelected = value === dateStr;

              return (
                <button 
                  type="button"
                  key={day} 
                  onClick={() => !isDisabled && handleSelect(day)}
                  disabled={isDisabled}
                  title={isTooFar ? "Cannot book more than 6 months in advance" : ""}
                  className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${isDisabled ? 'opacity-20 cursor-not-allowed' : isSelected ? 'bg-[#00e5ff] text-black shadow-[0_0_15px_rgba(0,229,255,0.4)] transform scale-110' : `${isDark ? 'text-white' : 'text-gray-800'} hover:bg-[#00e5ff]/20`}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// --- PREMIUM TIME PICKER COMPONENT ---
const PremiumTimePicker = ({ value, onChange, isDark, placeholder, alignRight = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);

  const parseTime = (val) => {
    if (!val || typeof val !== 'string') return { h: '12', m: '00', p: 'PM' };
    try {
      let [hours, minutes] = val.split(':');
      if(!hours || !minutes) return { h: '12', m: '00', p: 'PM' };
      hours = parseInt(hours);
      if(isNaN(hours)) return { h: '12', m: '00', p: 'PM' };
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return { h: hours.toString().padStart(2, '0'), m: minutes, p: period };
    } catch(e) {
      return { h: '12', m: '00', p: 'PM' };
    }
  };

  const [time, setTime] = useState(parseTime(value));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) setTime(parseTime(value));
  }, [isOpen, value]);

  const handleApply = () => {
    let hh = parseInt(time.h);
    if (time.p === 'PM' && hh !== 12) hh += 12;
    if (time.p === 'AM' && hh === 12) hh = 0;
    const formatted24h = `${hh.toString().padStart(2, '0')}:${time.m}`;
    onChange(formatted24h);
    setIsOpen(false);
  };

  const hoursList = Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minsList = ['00', '15', '30', '45']; 

  const displayTime = value ? (() => {
    const parsed = parseTime(value);
    return `${parsed.h}:${parsed.m} ${parsed.p}`;
  })() : placeholder;

  return (
    <div className="relative" ref={popupRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full ${isDark ? 'bg-[#1a1c23] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border p-3 rounded-xl flex items-center justify-between cursor-pointer hover:border-[#00e5ff] transition`}
      >
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[#00e5ff]" />
          <span className="text-sm font-semibold">{displayTime}</span>
        </div>
      </div>

      {isOpen && (
        <div className={`absolute z-[100] mt-2 p-4 rounded-2xl shadow-2xl border ${isDark ? 'border-gray-800 bg-[#15171e]' : 'border-gray-200 bg-white'} w-64 animate-fade-in ${alignRight ? 'right-0' : 'left-0'}`}>
          <div className={`flex justify-center items-center gap-2 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} pb-4 mb-4`}>
            <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{time.h} : {time.m}</div>
            <div className="bg-[#00e5ff]/10 text-[#00e5ff] px-2 py-1 rounded-md text-xs font-bold">{time.p}</div>
          </div>
          
          <div className="flex gap-2 h-40">
            <div className={`flex-1 overflow-y-auto ${isDark ? 'bg-[#1a1c23]' : 'bg-gray-50'} rounded-xl p-1 no-scrollbar text-center`}>
              {hoursList.map(h => (
                <div key={`h-${h}`} onClick={() => setTime({...time, h})} className={`py-2 text-sm cursor-pointer rounded-lg font-bold transition ${time.h === h ? 'bg-[#00e5ff] text-black' : `${isDark ? 'text-gray-400' : 'text-gray-600'} hover:text-[#00e5ff]`}`}>{h}</div>
              ))}
            </div>
            <div className={`flex-1 overflow-y-auto ${isDark ? 'bg-[#1a1c23]' : 'bg-gray-50'} rounded-xl p-1 no-scrollbar text-center`}>
              {minsList.map(m => (
                <div key={`m-${m}`} onClick={() => setTime({...time, m})} className={`py-2 text-sm cursor-pointer rounded-lg font-bold transition ${time.m === m ? 'bg-[#00e5ff] text-black' : `${isDark ? 'text-gray-400' : 'text-gray-600'} hover:text-[#00e5ff]`}`}>{m}</div>
              ))}
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div onClick={() => setTime({...time, p: 'AM'})} className={`flex-1 flex items-center justify-center rounded-xl text-sm font-bold cursor-pointer transition ${time.p === 'AM' ? 'bg-[#00e5ff] text-black' : `${isDark ? 'bg-[#1a1c23] text-gray-400' : 'bg-gray-50 text-gray-600'}`}`}>AM</div>
              <div onClick={() => setTime({...time, p: 'PM'})} className={`flex-1 flex items-center justify-center rounded-xl text-sm font-bold cursor-pointer transition ${time.p === 'PM' ? 'bg-[#00e5ff] text-black' : `${isDark ? 'bg-[#1a1c23] text-gray-400' : 'bg-gray-50 text-gray-600'}`}`}>PM</div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button type="button" onClick={() => setIsOpen(false)} className={`flex-1 py-2 rounded-xl text-xs font-bold ${isDark ? 'bg-[#1a1c23] text-gray-400' : 'bg-gray-100 text-gray-600'} hover:bg-gray-500 hover:text-white transition`}>Cancel</button>
            <button type="button" onClick={handleApply} className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#00e5ff] text-black hover:bg-[#00c3d9] transition shadow-[0_0_10px_rgba(0,229,255,0.3)]">Apply Time</button>
          </div>
        </div>
      )}
    </div>
  );
};


function MyReservations() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('easyParkUserId');
  const userName = localStorage.getItem('easyParkUserName') || 'User';

  const [activeBookings, setActiveBookings] = useState([]);
  const [historyBookings, setHistoryBookings] = useState([]);
  const [myReviews, setMyReviews] = useState([]); 
  const [vehicles, setVehicles] = useState([]);
  const [slots, setSlots] = useState([]);
  const [allReservations, setAllReservations] = useState([]); 
  const [complaints, setComplaints] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  // --- THEME SYNC ---
  const [themeMode, setThemeMode] = useState(localStorage.getItem('theme') || 'dark');
  const isDark = themeMode === 'dark';

  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', themeMode);
  }, [themeMode]);
  
  // Real-time updates for active fines
  const [currentTime, setCurrentTime] = useState(Date.now());

  // QR Modal State
  const [qrModalBooking, setQrModalBooking] = useState(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false); 
  const [editReviewId, setEditReviewId] = useState(null);
  const [currentReviewBookingId, setCurrentReviewBookingId] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', actionData: null, title: '', message: '' });
  const [messageModal, setMessageModal] = useState({ isOpen: false, message: '', type: 'success' });


  // RESCHEDULE STATES
  const [rescheduleData, setRescheduleData] = useState({
    isOpen: false,
    booking: null,
    durationMs: 0,
    newDate: '',
    newStartTime: '',
    newEndTimeStr: '',
    selectedSlotId: null,
    availableSlotsForGrid: [], 
    isLoadingSlots: false,
    errorMessage: ''
  });

  // Timer for fine calculations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }
    fetchData();
  }, [userId]);

  useEffect(() => {
    if (rescheduleData.newStartTime && rescheduleData.newEndTimeStr) {
      const parseTimeStr = (t) => {
        if(!t || typeof t !== 'string') return 0;
        const parts = t.split(':');
        return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
      };
      
      const startMins = parseTimeStr(rescheduleData.newStartTime);
      const endMins = parseTimeStr(rescheduleData.newEndTimeStr);

      if (endMins <= startMins) {
        setRescheduleData(prev => ({...prev, errorMessage: 'Failed: End time must be after start time.'}));
      } else {
        setRescheduleData(prev => ({...prev, errorMessage: ''}));
      }
    }
  }, [rescheduleData.newStartTime, rescheduleData.newEndTimeStr]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const resResponse = await axios.get(`http://localhost:8080/api/reservations/user/${userId}`);
      const userBookings = resResponse.data;

      const allResResponse = await axios.get('http://localhost:8080/api/reservations/all');
      setAllReservations(allResResponse.data);

      const vehResponse = await axios.get('http://localhost:8080/api/vehicles/all');
      setVehicles(vehResponse.data);

      const slotResponse = await axios.get('http://localhost:8080/api/slots/all');
      setSlots(slotResponse.data.filter(slot => slot.active !== false));

      const revResponse = await axios.get('http://localhost:8080/api/reviews/all');
      const userReviews = revResponse.data.filter(r => r.userId === parseInt(userId));
      setMyReviews(userReviews.sort((a, b) => b.id - a.id));

      try {
        const compResponse = await axios.get('http://localhost:8080/api/complaints/all');
        setComplaints(compResponse.data);
      } catch (compError) {}

      userBookings.sort((a, b) => b.id - a.id);

      const active = userBookings.filter(b => ['PENDING', 'CONFIRMED', 'ENTERED'].includes(String(b.status).toUpperCase().trim()));
      const history = userBookings.filter(b => ['COMPLETED', 'CANCELLED'].includes(String(b.status).toUpperCase().trim()));

      setActiveBookings(active);
      setHistoryBookings(history);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- OVERSTAY FINE CALCULATION FOR USERS ---
  const getFineForReservation = (res) => {
    let exitTimeMs;

    if (res.status === 'COMPLETED') {
      const exitTimeStr = localStorage.getItem(`exit_time_${res.id}`);
      if (!exitTimeStr) return { fine: 0, mins: 0, blocks: 0 };
      exitTimeMs = parseInt(exitTimeStr, 10);
    } else if (res.status === 'ENTERED') {
      // Live calculation for currently entered vehicles
      exitTimeMs = currentTime;
    } else {
      return { fine: 0, mins: 0, blocks: 0 };
    }
    
    const endMs = parseBackendDate(res.endTime).getTime();
    const overstayMs = exitTimeMs - endMs;
    
    // 5 mins grace period
    if (overstayMs <= 300000) return { fine: 0, mins: 0, blocks: 0 };
    
    const overstayMins = Math.ceil(overstayMs / 60000);
    const blocks = Math.ceil(overstayMins / 15);
    const slot = slots.find(s => s.id === res.slotId);
    const basePrice = slot?.price || 100;
    const penaltyHourlyRate = basePrice * 2;
    const penaltyPer15MinBlock = penaltyHourlyRate / 4;
    
    return { 
      fine: blocks * penaltyPer15MinBlock, 
      mins: overstayMins, 
      blocks 
    };
  };

  const handleCancelBookingClick = (bookingId) => {
    setConfirmModal({
      isOpen: true,
      type: 'cancelBooking',
      actionData: bookingId,
      title: 'Cancel Booking',
      message: `Are you sure you want to cancel booking #${bookingId}? This action cannot be undone.`
    });
  };

  const handleDeleteReviewClick = (reviewId) => {
    setConfirmModal({
      isOpen: true,
      type: 'deleteReview',
      actionData: reviewId,
      title: 'Delete Review',
      message: `Are you sure you want to delete this review?`
    });
  };

  const handleConfirmAction = async () => {
    const { type, actionData } = confirmModal;
    setConfirmModal({ ...confirmModal, isOpen: false });

    if (type === 'cancelBooking') {
      try {
        const response = await axios.delete(`http://localhost:8080/api/reservations/${actionData}`);
        if (response.status === 200 || response.status === 204) {
          setMessageModal({ isOpen: true, message: 'Booking cancelled successfully!', type: 'success' });
          fetchData(); 
        } else {
          setMessageModal({ isOpen: true, message: 'Failed to cancel booking.', type: 'error' });
        }
      } catch (error) {
        setMessageModal({ isOpen: true, message: 'Failed to cancel booking. Please try again.', type: 'error' });
      }
    } else if (type === 'deleteReview') {
      try {
        await axios.delete(`http://localhost:8080/api/reviews/delete/${actionData}`);
        setMessageModal({ isOpen: true, message: 'Review deleted successfully!', type: 'success' });
        fetchData();
      } catch (error) {
        setMessageModal({ isOpen: true, message: 'Failed to delete review.', type: 'error' });
      }
    }
  };

  const openRescheduleModal = (booking) => {
    const rescheduleCount = parseInt(localStorage.getItem(`reschedule_count_${booking.id}`) || '0');
    if (rescheduleCount >= 3) {
      setMessageModal({ isOpen: true, message: 'You have reached the maximum limit of 3 reschedules for this booking.', type: 'error' });
      return;
    }

    const originalStart = parseBackendDate(booking.startTime);
    const originalEnd = parseBackendDate(booking.endTime);
    const durationMs = originalEnd.getTime() - originalStart.getTime();

    const pad = (n) => n.toString().padStart(2, '0');
    const dateStr = `${originalStart.getFullYear()}-${pad(originalStart.getMonth() + 1)}-${pad(originalStart.getDate())}`;
    const startStr = `${pad(originalStart.getHours())}:${pad(originalStart.getMinutes())}`;
    const endStr = `${pad(originalEnd.getHours())}:${pad(originalEnd.getMinutes())}`;

    setRescheduleData({
      isOpen: true,
      booking,
      durationMs,
      newDate: dateStr,
      newStartTime: startStr,
      newEndTimeStr: endStr,
      selectedSlotId: booking.slotId,
      availableSlotsForGrid: [], 
      isLoadingSlots: false,
      errorMessage: ''
    });
  };

  // CHECK IF A SLOT IS BOOKED AT THE RESCHEDULE TIME
  const isSlotBookedAtTime = (slotId) => {
      if (!rescheduleData.newStartTime || !rescheduleData.newDate || rescheduleData.errorMessage) return false;
      const [startH, startM] = rescheduleData.newStartTime.split(':').map(Number);
      const [year, month, day] = rescheduleData.newDate.split('-').map(Number);
      
      const newStartObj = new Date(year, month - 1, day, startH, startM, 0);
      const newEndObj = new Date(newStartObj.getTime() + rescheduleData.durationMs);

      return allReservations.some(r => {
          if (String(r.id) === String(rescheduleData.booking?.id)) return false; 
          if (String(r.slotId) !== String(slotId)) return false;
          
          const rStatus = String(r.status || '').toUpperCase().trim();
          if (!['CONFIRMED', 'ENTERED', 'PENDING'].includes(rStatus)) return false;
          
          const rStart = parseBackendDate(r.startTime).getTime();
          const rEnd = parseBackendDate(r.endTime).getTime();
          const nStart = newStartObj.getTime();
          const nEnd = newEndObj.getTime();
          
          return (nStart < rEnd && nEnd > rStart); 
      });
  };

  useEffect(() => {
    if (!rescheduleData.isOpen || !rescheduleData.newDate || !rescheduleData.newStartTime || rescheduleData.errorMessage) return;

    const checkSlots = async () => {
      setRescheduleData(prev => ({ ...prev, isLoadingSlots: true }));

      const [startH, startM] = rescheduleData.newStartTime.split(':').map(Number);
      const [year, month, day] = rescheduleData.newDate.split('-').map(Number);
      
      const newStartObj = new Date(year, month - 1, day, startH, startM, 0);
      const newEndObj = new Date(newStartObj.getTime() + rescheduleData.durationMs);

      const pad = (n) => n.toString().padStart(2, '0');
      const newEndStr = `${pad(newEndObj.getHours())}:${pad(newEndObj.getMinutes())}`;

      try {
        const res = await axios.get('http://localhost:8080/api/reservations/all');
        const allRes = res.data;
        setAllReservations(allRes);

        const visibleSlots = slots.filter(slot => {
          const slotStatus = String(slot.status || '').toUpperCase().trim();
          return slotStatus !== 'MAINTENANCE'; 
        });

        const isCurrentSlotBooked = allRes.some(r => {
            if (String(r.id) === String(rescheduleData.booking.id)) return false; 
            if (String(r.slotId) !== String(rescheduleData.selectedSlotId)) return false;
            
            const rStatus = String(r.status || '').toUpperCase().trim();
            if (!['CONFIRMED', 'ENTERED', 'PENDING'].includes(rStatus)) return false;
            
            const rStart = parseBackendDate(r.startTime).getTime();
            const rEnd = parseBackendDate(r.endTime).getTime();
            const nStart = newStartObj.getTime();
            const nEnd = newEndObj.getTime();
            
            return (nStart < rEnd && nEnd > rStart); 
        });

        setRescheduleData(prev => {
          return {
            ...prev,
            newEndTimeStr: newEndStr,
            availableSlotsForGrid: visibleSlots,
            selectedSlotId: isCurrentSlotBooked ? null : prev.selectedSlotId,
            isLoadingSlots: false
          };
        });
      } catch (e) {
        console.error("Availability check failed", e);
        setRescheduleData(prev => ({ ...prev, isLoadingSlots: false }));
      }
    };

    const timeoutId = setTimeout(checkSlots, 500); 
    return () => clearTimeout(timeoutId);
  }, [rescheduleData.newDate, rescheduleData.newStartTime, rescheduleData.isOpen, slots, rescheduleData.errorMessage]);

  const handleSlotSelect = (slotId) => {
    const isBooked = isSlotBookedAtTime(slotId);

    if (isBooked) {
        setMessageModal({ isOpen: true, message: 'This slot is already booked for the selected time window. Please choose another slot or change the time.', type: 'error' });
    } else {
        setRescheduleData(p => ({...p, selectedSlotId: slotId}));
    }
  };

  const handleUpdateBooking = async () => {
    const { booking, newDate, newStartTime, durationMs, selectedSlotId } = rescheduleData;
    
    if (!selectedSlotId) {
      setMessageModal({ isOpen: true, message: 'Please select an available slot to proceed.', type: 'error' });
      return;
    }

    const [startH, startM] = newStartTime.split(':').map(Number);
    const [year, month, day] = newDate.split('-').map(Number);
    const newStartObj = new Date(year, month - 1, day, startH, startM, 0);
    const newEndObj = new Date(newStartObj.getTime() + durationMs);

    if (newStartObj < new Date()) {
      setMessageModal({ isOpen: true, message: 'Cannot reschedule to a past date or time.', type: 'error' });
      return;
    }

    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    if (newStartObj > sixMonthsFromNow) {
      setMessageModal({ isOpen: true, message: 'You can only book up to 6 months in advance.', type: 'error' });
      return;
    }

    const isVehicleDoubleBooked = activeBookings.some(res => {
      if (String(res.id) === String(booking.id)) return false; 
      if (String(res.vehicleId) !== String(booking.vehicleId)) return false; 

      const resStart = parseBackendDate(res.startTime);
      const resEnd = parseBackendDate(res.endTime);
      
      return (newStartObj < resEnd) && (newEndObj > resStart);
    });

    if (isVehicleDoubleBooked) {
      setMessageModal({ isOpen: true, message: 'Failed: This vehicle is already booked for another slot during this new time window.', type: 'error' });
      return;
    }

    try {
      const pad = (n) => n.toString().padStart(2, '0');
      const startIso = `${newStartObj.getFullYear()}-${pad(newStartObj.getMonth()+1)}-${pad(newStartObj.getDate())}T${pad(newStartObj.getHours())}:${pad(newStartObj.getMinutes())}:00`;
      const endIso = `${newEndObj.getFullYear()}-${pad(newEndObj.getMonth()+1)}-${pad(newEndObj.getDate())}T${pad(newEndObj.getHours())}:${pad(newEndObj.getMinutes())}:00`;

      const payload = {
        id: booking.id, 
        userId: parseInt(booking.userId || userId),
        vehicleId: parseInt(booking.vehicleId),
        slotId: parseInt(selectedSlotId),
        startTime: startIso,
        endTime: endIso,
        status: booking.status,
        totalAmount: parseFloat(booking.totalAmount)
      };

      try {
        await axios.put(`http://localhost:8080/api/reservations/update/${booking.id}`, payload);
        
        const currentCount = parseInt(localStorage.getItem(`reschedule_count_${booking.id}`) || '0');
        localStorage.setItem(`reschedule_count_${booking.id}`, currentCount + 1);
        const remsLeft = 3 - (currentCount + 1);

        setMessageModal({ isOpen: true, message: `Booking rescheduled successfully! 🎉 (${remsLeft} reschedules left)`, type: 'success' });
        setRescheduleData(prev => ({ ...prev, isOpen: false }));
        fetchData();
      } catch (err) {
        console.error(err);
        setMessageModal({ isOpen: true, message: 'Backend Error: Please make sure you added the @PutMapping("/update/{id}") in Spring Boot!', type: 'error' });
      }
      
    } catch (error) {
      console.error(error);
      setMessageModal({ isOpen: true, message: 'Failed to reschedule booking. Please try again.', type: 'error' });
    }
  };

  const openNewReviewModal = (bookingId) => {
    setIsEditingReview(false);
    setEditReviewId(null);
    setCurrentReviewBookingId(bookingId);
    setReviewData({ rating: 5, comment: '' });
    setReviewMessage('');
    setShowReviewModal(true);
  };

  const openEditReviewModal = (review) => {
    setIsEditingReview(true);
    setEditReviewId(review.id);
    setCurrentReviewBookingId(review.bookingId);
    setReviewData({ rating: review.rating, comment: review.comment });
    setReviewMessage('');
    setShowReviewModal(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setReviewMessage('');
    
    try {
      if (isEditingReview) {
        await axios.put(`http://localhost:8080/api/reviews/update/${editReviewId}`, reviewData);
        setReviewMessage('Review updated successfully! 🚀');
      } else {
        const payload = {
          userId: parseInt(userId),
          userName: userName,
          bookingId: currentReviewBookingId, 
          rating: reviewData.rating,
          comment: reviewData.comment
        };
        await axios.post('http://localhost:8080/api/reviews/add', payload);
        setReviewMessage('Review submitted successfully! 🎉 Thank you.');
      }
      
      fetchData(); 
      
      setTimeout(() => {
        setShowReviewModal(false);
        setReviewData({ rating: 5, comment: '' });
        setReviewMessage('');
      }, 2000);

    } catch (error) {
      console.error("Error submitting review", error);
      setReviewMessage('Failed to submit review. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const getVehiclePlate = (vId) => vehicles.find(v => v.id === vId)?.licensePlate || 'Unknown';
  const getSlotNumber = (sId) => slots.find(s => s.id === sId)?.slotNumber || `#${sId}`;
  
  const formatDate = (dateInput) => {
    const d = parseBackendDate(dateInput);
    if(isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const formatTime = (dateInput) => {
    const d = parseBackendDate(dateInput);
    if(isNaN(d.getTime())) return 'Invalid Time';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0b0c10] text-gray-300' : 'bg-gray-100 text-gray-800'} font-sans selection:bg-[#00e5ff] selection:text-black pb-12 relative transition-colors duration-300`}>
      
      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`${isDark ? 'bg-[#15171e]' : 'bg-white'} p-8 rounded-2xl border border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.15)] w-full max-w-md relative flex flex-col items-center text-center`}>
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>{confirmModal.title}</h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-8`}>{confirmModal.message}</p>
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} 
                className={`flex-1 py-3 rounded-xl font-bold transition ${isDark ? 'text-gray-400 bg-[#1a1c23] hover:bg-gray-800 hover:text-white' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'}`}
              >
                Go Back
              </button>
              <button 
                onClick={handleConfirmAction} 
                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MESSAGE MODAL --- */}
      {messageModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`${isDark ? 'bg-[#15171e]' : 'bg-white'} p-8 rounded-2xl border w-full max-w-sm relative flex flex-col items-center text-center ${messageModal.type === 'success' ? 'border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.15)]' : 'border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.15)]'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${messageModal.type === 'success' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
              {messageModal.type === 'success' ? <CheckCircle className="text-green-500" size={32} /> : <X className="text-red-500" size={32} />}
            </div>
            <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>{messageModal.type === 'success' ? 'Success!' : 'Error'}</h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-8`}>{messageModal.message}</p>
            <button 
              onClick={() => setMessageModal({ ...messageModal, isOpen: false })} 
              className={`w-full py-3 rounded-xl font-bold text-black transition ${messageModal.type === 'success' ? 'bg-[#00e5ff] hover:bg-[#00c3d9] shadow-[0_0_15px_rgba(0,229,255,0.4)]' : 'bg-gray-300 hover:bg-gray-400'}`}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* --- QR CODE MODAL --- */}
      {qrModalBooking && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`${isDark ? 'bg-[#15171e]' : 'bg-white'} p-8 rounded-3xl border border-[#00e5ff]/30 shadow-[0_0_50px_rgba(0,229,255,0.2)] w-full max-w-sm relative flex flex-col items-center`}>
            <button onClick={() => setQrModalBooking(null)} className={`absolute top-4 right-4 text-gray-500 ${isDark ? 'hover:text-white' : 'hover:text-gray-900'} transition`}>
              <X size={24} />
            </button>
            <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>Entrance Pass</h3>
            <p className="text-xs text-[#00e5ff] font-bold tracking-widest uppercase mb-6">Booking #{qrModalBooking.id}</p>
            
            <div className="bg-white p-4 rounded-2xl shadow-xl mb-6">
              <QRCode value={`EASYPARK-BOOKING-${qrModalBooking.id}-${qrModalBooking.userId}`} size={200} bgColor="#ffffff" fgColor="#000000" />
            </div>
            
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} font-semibold text-center mb-2`}>Show this code at the gate scanner.</p>
            <h2 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Spot {getSlotNumber(qrModalBooking.slotId)}</h2>
          </div>
        </div>
      )}

      {/* --- RESCHEDULE MODAL --- */}
      {rescheduleData.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`${isDark ? 'bg-[#15171e]' : 'bg-white'} p-8 pb-10 rounded-2xl border border-[#00e5ff]/30 shadow-[0_0_50px_rgba(0,229,255,0.2)] w-full max-w-md relative overflow-visible`}>
            <button onClick={() => setRescheduleData(prev => ({ ...prev, isOpen: false }))} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition">
              <X size={24} />
            </button>
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'} mb-2 flex items-center gap-2`}>
              <Clock className="text-[#00e5ff]" /> Reschedule Booking
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
              Pick a new date and time. Your duration of <span className={`${isDark ? 'text-white' : 'text-gray-800'} font-bold`}>{rescheduleData.durationMs / (1000 * 60 * 60)} hours</span> remains unchanged.
            </p>

            <div className="space-y-5">
              <div>
                <label className={`block text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2 uppercase tracking-wider`}>New Date</label>
                <PremiumDatePicker 
                  value={rescheduleData.newDate} 
                  onChange={(val) => setRescheduleData(p => ({...p, newDate: val}))} 
                  isDark={isDark} 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2 uppercase tracking-wider`}>Start Time</label>
                  <PremiumTimePicker 
                    value={rescheduleData.newStartTime} 
                    onChange={(val) => setRescheduleData(p => ({...p, newStartTime: val}))} 
                    isDark={isDark} 
                    placeholder="Start" 
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2 uppercase tracking-wider`}>End Time</label>
                  <div className={`w-full ${isDark ? 'bg-[#1a1c23] border-gray-700 text-gray-500' : 'bg-gray-100 border-gray-300 text-gray-600'} border p-3 rounded-xl text-sm font-semibold cursor-not-allowed text-center`}>
                      {rescheduleData.newEndTimeStr ? (() => {
                         const [h,m] = rescheduleData.newEndTimeStr.split(':');
                         let hh = parseInt(h);
                         const p = hh >= 12 ? 'PM' : 'AM';
                         hh = hh % 12 || 12;
                         return `${hh.toString().padStart(2,'0')}:${m} ${p}`;
                      })() : 'Auto'}
                  </div>
                </div>
              </div>

              {rescheduleData.errorMessage && (
                <div className={`mt-2 p-3 rounded-xl text-center text-sm font-bold border bg-red-500/10 border-red-500 text-red-500 flex items-center justify-center gap-2`}>
                  <AlertTriangle size={16} />
                  {rescheduleData.errorMessage}
                </div>
              )}

              <div className={`pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <label className={`block text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-3 uppercase tracking-wider flex justify-between items-center`}>
                    <span>Available Slots for this Time</span>
                    <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded border border-red-500/30">Red = Booked</span>
                </label>
                {rescheduleData.isLoadingSlots ? (
                  <div className="text-center py-4 text-[#00e5ff] text-sm font-bold animate-pulse border border-[#00e5ff]/20 bg-[#00e5ff]/5 rounded-xl">Checking availability...</div>
                ) : rescheduleData.availableSlotsForGrid.length === 0 ? (
                  <div className="text-center py-4 text-red-500 text-sm font-bold bg-red-500/10 rounded-xl border border-red-500/20">
                    No slots available in the database.
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                    {rescheduleData.availableSlotsForGrid.map(slot => {
                        const isBooked = isSlotBookedAtTime(slot.id);
                        const isSelected = String(rescheduleData.selectedSlotId) === String(slot.id);

                        return (
                          <button 
                            type="button"
                            key={slot.id}
                            onClick={() => handleSlotSelect(slot.id)}
                            className={`py-2 rounded-lg text-sm font-black transition-all ${
                                isBooked 
                                ? `${isDark ? 'bg-[#1a1c23]' : 'bg-gray-100'} text-red-500/50 border border-red-500/30 cursor-pointer hover:border-red-500/80` 
                                : isSelected
                                ? 'bg-[#00e5ff] text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]' 
                                : `${isDark ? 'bg-[#1a1c23] text-gray-400 border-gray-700' : 'bg-white text-gray-600 border-gray-300'} border hover:border-[#00e5ff]/50`
                            }`}
                          >
                            {slot.slotNumber}
                          </button>
                        );
                    })}
                  </div>
                )}
              </div>

              <button 
                onClick={handleUpdateBooking}
                disabled={!rescheduleData.selectedSlotId || rescheduleData.isLoadingSlots || rescheduleData.errorMessage}
                className="w-full bg-gradient-to-r from-[#00e5ff] to-blue-500 hover:from-[#00c3d9] hover:to-blue-600 text-black font-black py-4 rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all mt-4 disabled:opacity-50"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- REVIEW MODAL --- */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`${isDark ? 'bg-[#15171e]' : 'bg-white'} p-8 rounded-2xl border border-[#00e5ff]/30 shadow-[0_0_50px_rgba(0,229,255,0.2)] w-full max-w-md relative`}>
            <button onClick={() => !isSubmitting && setShowReviewModal(false)} className={`absolute top-4 right-4 text-gray-500 ${isDark ? 'hover:text-white' : 'hover:text-gray-900'} transition`}>
              <X size={24} />
            </button>
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'} mb-2 flex items-center gap-2`}>
              <Star className="text-[#ffd32a] fill-[#ffd32a]" /> {isEditingReview ? 'Edit Review' : 'Rate Experience'}
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-6 flex items-center gap-1`}>
              {isEditingReview ? 'Update your previous feedback' : 'How was your parking experience?'} 
              {currentReviewBookingId && <span className="bg-[#00e5ff]/10 text-[#00e5ff] px-2 py-0.5 rounded text-xs font-bold ml-1 border border-[#00e5ff]/20">Booking #{currentReviewBookingId}</span>}
            </p>

            {reviewMessage && (
              <div className={`mb-4 p-3 rounded-xl text-center text-sm font-bold border ${reviewMessage.includes('Failed') ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-green-500/10 border-green-500 text-green-500'}`}>
                {reviewMessage}
              </div>
            )}

            <form onSubmit={submitReview} className="space-y-6">
              <div className="flex flex-col items-center gap-2">
                <label className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Select Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={32}
                      onClick={() => setReviewData({...reviewData, rating: star})}
                      className={`cursor-pointer transition-all ${star <= reviewData.rating ? 'text-[#ffd32a] fill-[#ffd32a] transform scale-110' : 'text-gray-400 hover:text-gray-500'}`} 
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className={`block text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2 uppercase tracking-wider flex items-center gap-2`}>
                  <MessageSquare size={14} /> Your Feedback
                </label>
                <textarea 
                  required 
                  rows="4"
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                  className={`w-full ${isDark ? 'bg-[#1a1c23] border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} px-4 py-3 rounded-xl focus:outline-none focus:border-[#00e5ff] transition resize-none border`} 
                  placeholder="Tell us about your experience..."
                ></textarea>
              </div>
              
              <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-[#00e5ff] to-blue-500 hover:from-[#00c3d9] hover:to-blue-600 text-black font-black py-4 rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all mt-6 disabled:opacity-50">
                {isSubmitting ? 'Saving...' : (isEditingReview ? 'Update Review' : 'Submit Review')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className={`${isDark ? 'bg-[#12141a] border-gray-800' : 'bg-white border-gray-200'} border-b px-8 py-4 flex justify-between items-center shadow-lg mb-8 transition-colors duration-300`}>
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-blue-500 tracking-wide">
          EASY<span className={isDark ? 'text-white' : 'text-gray-900'}>PARK</span>
        </h1>
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className={`text-sm font-bold transition ${isDark ? 'text-gray-400 hover:text-[#00e5ff]' : 'text-gray-500 hover:text-blue-600'}`}>Dashboard</Link>
          <span className="text-sm font-bold text-[#00e5ff] border-b-2 border-[#00e5ff] pb-1">My Reservations</span>
          
          <div className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border ml-4 transition-colors ${isDark ? 'bg-[#1a1c23] text-gray-400 border-gray-700' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
            <User size={16} className="text-[#00e5ff]" /> {userName}
          </div>
          <button onClick={handleLogout} className={`text-sm font-bold transition ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>Logout</button>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-6 space-y-10">
        
        {/* Active Booking Section */}
        <section>
          <h2 className={`text-2xl font-black mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <QrCode className="text-[#00e5ff]" /> Active Bookings
          </h2>
          
          {isLoading ? (
            <div className={`p-10 text-center font-bold rounded-2xl border ${isDark ? 'bg-[#15171e] text-gray-500 border-gray-800' : 'bg-white text-gray-400 border-gray-200'}`}>Loading...</div>
          ) : activeBookings.length === 0 ? (
            <div className={`p-10 text-center rounded-2xl border shadow-xl flex flex-col items-center justify-center ${isDark ? 'bg-[#15171e] border-gray-800' : 'bg-white border-gray-200'}`}>
              <QrCode size={48} className="text-gray-400 mb-4" />
              <p className={`font-bold mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No active bookings found.</p>
              <Link to="/dashboard" className="bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30 px-6 py-2 rounded-full font-bold hover:bg-[#00e5ff] hover:text-black transition">
                Book a Slot Now
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeBookings.map(booking => {
                const fineData = getFineForReservation(booking);
                const totalEstimated = (booking.totalAmount || 0) + fineData.fine;

                return (
                  <div key={booking.id} className={`p-6 rounded-3xl border shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col h-full group ${isDark ? 'bg-gradient-to-b from-[#15171e] to-[#0b0c10] border-gray-800 hover:border-[#00e5ff]/50' : 'bg-white border-gray-200 hover:border-blue-400'}`}>
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#00e5ff] opacity-5 group-hover:opacity-10 rounded-full blur-3xl transition-opacity"></div>
                    
                    <div className="flex justify-between items-start mb-6 z-10">
                      <div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${
                          booking.status === 'CONFIRMED' ? 'bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30' :
                          booking.status === 'ENTERED' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' :
                          'bg-gray-500/10 text-gray-500 border border-gray-500/30'
                        }`}>
                          {booking.status === 'CONFIRMED' && <div className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse"></div>}
                          {booking.status}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 font-bold tracking-wider">#{booking.id}</span>
                    </div>
                    
                    <div className="flex justify-between items-end mb-6 z-10">
                      <div>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Reserved Spot</p>
                        <h3 className={`text-4xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{getSlotNumber(booking.slotId)}</h3>
                      </div>
                      <div className="text-right">
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Total</p>
                        <h3 className={`text-xl font-black ${isDark ? 'text-[#00e5ff]' : 'text-blue-600'}`}>Rs {totalEstimated.toFixed(2)}</h3>
                        {fineData.fine > 0 && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">+ Rs {fineData.fine.toFixed(2)} Fine</p>}
                      </div>
                    </div>
                    
                    <div className={`${isDark ? 'bg-[#1a1c23]/60 border-gray-800/50' : 'bg-gray-50 border-gray-200'} rounded-2xl p-4 border space-y-3 mb-6 z-10`}>
                      <div className="flex items-center gap-3">
                        <div className={`${isDark ? 'bg-[#0b0c10] border-gray-800 text-gray-400' : 'bg-white border-gray-200 text-gray-500'} p-2 rounded-lg border`}><Car size={16} /></div>
                        <div>
                          <p className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Vehicle</p>
                          <p className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{getVehiclePlate(booking.vehicleId)}</p>
                        </div>
                      </div>
                      <div className={`w-full h-px ${isDark ? 'bg-gray-800/50' : 'bg-gray-200'}`}></div>
                      <div className="flex items-center gap-3">
                        <div className={`${isDark ? 'bg-[#0b0c10] border-gray-800 text-gray-400' : 'bg-white border-gray-200 text-gray-500'} p-2 rounded-lg border`}><Clock size={16} /></div>
                        <div>
                          <p className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{formatDate(booking.startTime)}</p>
                          <p className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{formatTime(booking.startTime)} <span className="text-gray-400 mx-1">→</span> {formatTime(booking.endTime)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-auto flex flex-col gap-3 z-10">
                      {(booking.status === 'CONFIRMED' || booking.status === 'ENTERED') && (
                        <button 
                          onClick={() => setQrModalBooking(booking)}
                          className={`w-full text-sm font-black py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 ${isDark ? 'bg-[#00e5ff] hover:bg-[#00c3d9] text-black shadow-[0_0_15px_rgba(0,229,255,0.3)]' : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'}`}
                        >
                          <QrCode size={18} /> View Entrance QR
                        </button>
                      )}
                      
                      <div className="flex gap-3">
                        <button 
                          onClick={() => openRescheduleModal(booking)}
                          className={`flex-1 border text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${isDark ? 'bg-[#1a1c23] hover:bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'}`}
                        >
                          <Clock size={14} /> Reschedule
                        </button>
                        <button 
                          onClick={() => handleCancelBookingClick(booking.id)}
                          className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Booking History Section */}
        <section>
          <h2 className={`text-2xl font-black mb-6 flex items-center gap-2 pt-6 border-t ${isDark ? 'text-white border-gray-800' : 'text-gray-900 border-gray-200'}`}>
            <History className="text-gray-400" /> Booking History
          </h2>

          {isLoading ? (
            <div className={`p-10 text-center font-bold rounded-2xl border ${isDark ? 'text-gray-500 bg-[#15171e] border-gray-800' : 'text-gray-400 bg-white border-gray-200'}`}>Loading...</div>
          ) : historyBookings.length === 0 ? (
            <div className={`p-10 text-center rounded-2xl border ${isDark ? 'text-gray-500 bg-[#15171e] border-gray-800' : 'text-gray-400 bg-white border-gray-200'}`}>
              You don't have any past bookings yet.
            </div>
          ) : (
            <div className={`rounded-2xl border overflow-hidden shadow-2xl ${isDark ? 'bg-[#15171e] border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-xs uppercase tracking-wider ${isDark ? 'bg-[#1a1c23] border-gray-800 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                      <th className="p-4 font-black">ID</th>
                      <th className="p-4 font-black">Date</th>
                      <th className="p-4 font-black">Time</th>
                      <th className="p-4 font-black">Spot</th>
                      <th className="p-4 font-black text-right">Base Amount</th>
                      <th className="p-4 font-black text-right">Penalty</th>
                      <th className="p-4 font-black text-right">Total Paid</th>
                      <th className="p-4 font-black">Status</th>
                      <th className="p-4 font-black text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-200'}`}>
                   {historyBookings.map(booking => {
                      const relatedComplaint = complaints.find(c => c.bookingId === booking.id);
                      const baseAmt = booking.totalAmount || 0;
                      const penalty = booking.overstayFine || 0; 
                      const totalPaid = baseAmt + penalty;
                      
                      return (
                        <tr key={booking.id} className={`transition ${isDark ? 'hover:bg-[#1a1c23]/50' : 'hover:bg-gray-50'}`}>
                          <td className="p-4 text-sm font-bold text-gray-400">#{booking.id}</td>
                          <td className={`p-4 text-sm flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}><CalendarDays size={14} className="text-gray-400"/> {formatDate(booking.startTime)}</td>
                          <td className={`p-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</td>
                          <td className={`p-4 text-sm font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{getSlotNumber(booking.slotId)}</td>
                          <td className={`p-4 text-sm text-right ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Rs {baseAmt.toFixed(2)}</td>
                          
                          <td className="p-4 text-sm text-red-500 text-right font-semibold">Rs {penalty.toFixed(2)}</td>
                          
                          <td className={`p-4 text-sm font-bold text-right ${isDark ? 'text-[#00e5ff]' : 'text-blue-600'}`}>Rs {totalPaid.toFixed(2)}</td>
                          
                          <td className="p-4 text-left">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                booking.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                                'bg-red-500/10 text-red-500 border border-red-500/20'
                              }`}>
                                {booking.status === 'COMPLETED' ? <CheckCircle size={12} /> : null} {booking.status}
                              </span>
                              
                              {relatedComplaint && relatedComplaint.status === 'PENDING' && (
                                <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-[10px] font-bold border border-red-500/50 flex items-center gap-1" title="Issue Reported">
                                  ⚠️ COMPLAINT
                                </span>
                              )}
                              
                              {relatedComplaint && relatedComplaint.status === 'RESOLVED' && (
                                <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-[10px] font-bold border border-green-500/50 flex items-center gap-1" title="Issue Resolved">
                                  <Shield size={10} /> RESOLVED
                                </span>
                              )}
                            </div>
                          </td>
                          
                          <td className="p-4 text-right">
                            {booking.status === 'COMPLETED' && (
                              <button 
                                onClick={() => openNewReviewModal(booking.id)} 
                                className="text-xs font-bold text-[#ffd32a] border border-[#ffd32a]/30 bg-[#ffd32a]/10 hover:bg-[#ffd32a] hover:text-black px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ml-auto"
                              >
                                <Star size={14} className="fill-current" /> Add Review
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* --- CUSTOMER REVIEWS SECTION --- */}
        <section className="pb-10">
          <h2 className={`text-2xl font-black mb-6 flex items-center gap-2 pt-6 border-t ${isDark ? 'text-white border-gray-800' : 'text-gray-900 border-gray-200'}`}>
            <MessageSquare className="text-gray-400" /> My Feedback & Reviews
          </h2>

          {!isLoading && myReviews.length === 0 ? (
            <div className={`p-10 text-center rounded-2xl border ${isDark ? 'text-gray-500 bg-[#15171e] border-gray-800' : 'text-gray-400 bg-white border-gray-200'}`}>
              You haven't posted any reviews yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myReviews.map(review => (
                <div key={review.id} className={`border p-6 rounded-2xl flex flex-col shadow-lg transition relative ${isDark ? 'bg-[#15171e] border-gray-800 hover:border-[#00e5ff]/40' : 'bg-white border-gray-200 hover:border-blue-400'}`}>
                  
                  {review.bookingId && (
                    <div className={`absolute top-0 right-0 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl rounded-tr-2xl border-b border-l flex items-center gap-1 ${isDark ? 'bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/20' : 'bg-blue-500/10 text-blue-600 border-blue-200'}`}>
                      <Hash size={10} /> Booking {review.bookingId}
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4 mt-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={i < review.rating ? "text-[#ffd32a] fill-[#ffd32a]" : "text-gray-400"} />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditReviewModal(review)} className="text-gray-400 hover:text-[#00e5ff] transition" title="Edit Review"><Edit size={16}/></button>
                      <button onClick={() => handleDeleteReviewClick(review.id)} className="text-gray-400 hover:text-red-500 transition" title="Delete Review"><Trash2 size={16}/></button>
                    </div>
                  </div>
                  
                  <p className={`text-sm italic mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>"{review.comment}"</p>
                  
                  {review.adminReply && (
                    <div className={`mt-auto border p-4 rounded-xl border-l-2 ${isDark ? 'bg-[#1a1c23] border-gray-700 border-l-[#00e5ff]' : 'bg-gray-50 border-gray-200 border-l-blue-500'}`}>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 ${isDark ? 'text-[#00e5ff]' : 'text-blue-600'}`}><Shield size={12}/> Admin Reply</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>{review.adminReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default MyReservations;