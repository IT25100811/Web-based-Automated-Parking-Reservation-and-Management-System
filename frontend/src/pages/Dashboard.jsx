import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Car, User, Plus, CheckCircle, X, Edit, Trash2, CalendarDays, Clock, CreditCard, Sun, Moon, ChevronLeft, ChevronRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

// --- HELPER FUNCTION: Spring Boot Date Parser ---
const parseBackendDate = (d) => {
  if (!d) return new Date(NaN);
  if (Array.isArray(d)) {
    return new Date(d[0], d[1] - 1, d[2], d[3] || 0, d[4] || 0);
  }
  return new Date(d);
};

// --- PREMIUM DATE PICKER COMPONENT ---
const PremiumDatePicker = ({ value, onChange, theme }) => {
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
        className={`w-full ${theme.bgInput} border ${theme.borderInput} ${theme.textMain} p-3 rounded-xl flex items-center justify-between cursor-pointer hover:border-[#00e5ff] transition`}
      >
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-[#00e5ff]" />
          <span className="text-sm font-semibold">{value || "Select Date"}</span>
        </div>
      </div>

      {isOpen && (
        <div className={`absolute z-[100] mt-2 p-4 rounded-2xl shadow-2xl border ${theme.borderMain} ${theme.bgCard} w-72 animate-fade-in`}>
          <div className="flex justify-between items-center mb-4">
            <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className={`p-1 rounded-md hover:${theme.bgInput} ${theme.textMuted}`}><ChevronLeft size={18}/></button>
            <span className={`font-black text-sm ${theme.textMain}`}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
            <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className={`p-1 rounded-md hover:${theme.bgInput} ${theme.textMuted}`}><ChevronRight size={18}/></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className={`text-[10px] font-bold ${theme.textMuted}`}>{d}</div>)}
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
                  className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${isDisabled ? 'opacity-20 cursor-not-allowed' : isSelected ? 'bg-[#00e5ff] text-black shadow-[0_0_15px_rgba(0,229,255,0.4)] transform scale-110' : `${theme.textMain} hover:bg-[#00e5ff]/20`}`}
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
const PremiumTimePicker = ({ value, onChange, theme, placeholder, alignRight = false }) => {
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
        className={`w-full ${theme.bgInput} border ${theme.borderInput} ${theme.textMain} p-3 rounded-xl flex items-center justify-between cursor-pointer hover:border-[#00e5ff] transition`}
      >
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[#00e5ff]" />
          <span className="text-sm font-semibold">{displayTime}</span>
        </div>
      </div>

      {isOpen && (
        <div className={`absolute z-[100] mt-2 p-4 rounded-2xl shadow-2xl border ${theme.borderMain} ${theme.bgCard} w-64 animate-fade-in ${alignRight ? 'right-0' : 'left-0'}`}>
          <div className={`flex justify-center items-center gap-2 border-b ${theme.borderMain} pb-4 mb-4`}>
            <div className={`text-2xl font-black ${theme.textMain}`}>{time.h} : {time.m}</div>
            <div className="bg-[#00e5ff]/10 text-[#00e5ff] px-2 py-1 rounded-md text-xs font-bold">{time.p}</div>
          </div>
          
          <div className="flex gap-2 h-40">
            <div className={`flex-1 overflow-y-auto ${theme.bgInput} rounded-xl p-1 no-scrollbar text-center`}>
              {hoursList.map(h => (
                <div key={`h-${h}`} onClick={() => setTime({...time, h})} className={`py-2 text-sm cursor-pointer rounded-lg font-bold transition ${time.h === h ? 'bg-[#00e5ff] text-black' : `${theme.textMuted} hover:text-[#00e5ff]`}`}>{h}</div>
              ))}
            </div>
            <div className={`flex-1 overflow-y-auto ${theme.bgInput} rounded-xl p-1 no-scrollbar text-center`}>
              {minsList.map(m => (
                <div key={`m-${m}`} onClick={() => setTime({...time, m})} className={`py-2 text-sm cursor-pointer rounded-lg font-bold transition ${time.m === m ? 'bg-[#00e5ff] text-black' : `${theme.textMuted} hover:text-[#00e5ff]`}`}>{m}</div>
              ))}
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div onClick={() => setTime({...time, p: 'AM'})} className={`flex-1 flex items-center justify-center rounded-xl text-sm font-bold cursor-pointer transition ${time.p === 'AM' ? 'bg-[#00e5ff] text-black' : `${theme.bgInput}${theme.textMuted}`}`}>AM</div>
              <div onClick={() => setTime({...time, p: 'PM'})} className={`flex-1 flex items-center justify-center rounded-xl text-sm font-bold cursor-pointer transition ${time.p === 'PM' ? 'bg-[#00e5ff] text-black' : `${theme.bgInput}${theme.textMuted}`}`}>PM</div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button type="button" onClick={() => setIsOpen(false)} className={`flex-1 py-2 rounded-xl text-xs font-bold ${theme.bgInput} ${theme.textMuted} hover:bg-gray-500 hover:text-white transition`}>Cancel</button>
            <button type="button" onClick={handleApply} className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#00e5ff] text-black hover:bg-[#00c3d9] transition shadow-[0_0_10px_rgba(0,229,255,0.3)]">Apply Time</button>
          </div>
        </div>
      )}
    </div>
  );
};

function Dashboard() {
  const navigate = useNavigate();
  
  const userName = localStorage.getItem('easyParkUserName') || 'User';
  const userId = localStorage.getItem('easyParkUserId');

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('easyParkTheme') !== 'light';
  });

  useEffect(() => {
    localStorage.setItem('easyParkTheme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const theme = {
    bgMain: isDark ? 'bg-[#0b0c10]' : 'bg-[#f4f7fe]',
    bgNav: isDark ? 'bg-[#12141a]' : 'bg-white',
    bgCard: isDark ? 'bg-[#15171e]' : 'bg-white',
    bgInput: isDark ? 'bg-[#1a1c23]' : 'bg-gray-50',
    textMain: isDark ? 'text-white' : 'text-gray-900',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-500',
    borderMain: isDark ? 'border-gray-800' : 'border-gray-200',
    borderInput: isDark ? 'border-gray-700' : 'border-gray-300',
  };

  const [parkingSpots, setParkingSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [vehicles, setVehicles] = useState([]);
  const [myReservations, setMyReservations] = useState([]); 
  const [allReservations, setAllReservations] = useState([]); 
  const [bookingMessage, setBookingMessage] = useState('');

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' });

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [vehicleMessage, setVehicleMessage] = useState('');
  const [newVehicle, setNewVehicle] = useState({
    id: null, licensePlate: '', make: '', color: '', vehicleType: 'Car', status: 'ACTIVE'
  });

  useEffect(() => {
    fetchSlots();
    fetchVehicles();
    if (userId) {
      fetchMyReservations();
      fetchAllReservations(); 
    }
  }, [userId]);

  // --- REAL-TIME TIME VALIDATION EFFECT ---
  useEffect(() => {
    if (startTime && endTime) {
      const parseTimeStr = (t) => {
        if(!t || typeof t !== 'string') return 0;
        const parts = t.split(':');
        return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
      };
      const startMins = parseTimeStr(startTime);
      const endMins = parseTimeStr(endTime);

      if (endMins <= startMins) {
        setBookingMessage('Failed: End time must be after start time.');
      } else {
        setBookingMessage((prev) => prev === 'Failed: End time must be after start time.' ? '' : prev);
      }
    }
  }, [startTime, endTime]);

  const fetchSlots = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/slots/all');
      const activeSlotsOnly = response.data.filter(slot => slot.active !== false);
      setParkingSpots(activeSlotsOnly); 
    } catch (error) {
      console.error("Error fetching parking slots:", error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/vehicles/all');
      const myVehicles = response.data.filter(v => v.userId === parseInt(userId));
      setVehicles(myVehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const fetchAllReservations = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/reservations/all');
      setAllReservations(response.data);
    } catch (error) {
      console.error("Error fetching all reservations:", error);
    }
  };

  const fetchMyReservations = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/reservations/user/${userId}`);
      const now = new Date();
      
      const activeOnly = response.data.filter(res => {
        const statusStr = String(res.status || '').toUpperCase().trim();
        if (!['CONFIRMED', 'ENTERED', 'PENDING'].includes(statusStr)) return false;
        
        let endObj = parseBackendDate(res.endTime);
        return !isNaN(endObj.getTime()) && endObj > now;
      });
      
      setMyReservations(activeOnly);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  const estimatedTotal = (() => {
    if (!bookingDate || !startTime || !endTime || !selectedSpot) return "0.00";
    
    const parseTimeStr = (t) => {
      if(!t || typeof t !== 'string') return 0;
      const parts = t.split(':');
      const h = parseInt(parts[0]) || 0;
      const m = parseInt(parts[1]) || 0;
      return h * 60 + m;
    };
    
    const startMins = parseTimeStr(startTime);
    const endMins = parseTimeStr(endTime);
    
    if (endMins > startMins) {
      const diffInMinutes = endMins - startMins;
      const exactHours = diffInMinutes / 60; 

      const basePrice = Number(selectedSpot.price) || 100;
      const after6hPrice = basePrice / 2; 

      let total = 0;

      if (exactHours > 0) {
        if (exactHours <= 6) {
          total = exactHours * basePrice;
        } else {
          total = (6 * basePrice) + ((exactHours - 6) * after6hPrice);
        }
      }
      return isNaN(total) ? "0.00" : total.toFixed(2);
    }
    return "0.00";
  })();

  const isTimeFullySelected = bookingDate && startTime && endTime;

  // --- DYNAMIC MAP STATUS EVALUATOR ---
  const getDynamicSlotStatus = (slot) => {
    if (slot.status === 'MAINTENANCE') return 'MAINTENANCE';

    if (isTimeFullySelected) {
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        const [year, month, day] = bookingDate.split('-').map(Number);
        
        const checkStart = new Date(year, month - 1, day, startH, startM, 0);
        const checkEnd = new Date(year, month - 1, day, endH, endM, 0);

        const overlappingRes = allReservations.filter(r => {
            if (String(r.slotId) !== String(slot.id)) return false;
            const rStatus = String(r.status || '').toUpperCase().trim();
            if (!['CONFIRMED', 'ENTERED', 'PENDING'].includes(rStatus)) return false;

            const rStart = parseBackendDate(r.startTime);
            const rEnd = parseBackendDate(r.endTime);

            if (isNaN(rStart.getTime()) || isNaN(rEnd.getTime())) return false;
            return (checkStart < rEnd && checkEnd > rStart);
        });

        if (overlappingRes.length > 0) {
            const isMine = overlappingRes.some(r => String(r.userId) === String(userId));
            return isMine ? 'YOUR_BOOKING' : 'BOOKED';
        }

        return 'AVAILABLE';

    } else {
        const now = new Date();

        const myActiveForSlot = myReservations.some(r => String(r.slotId) === String(slot.id));
        if (myActiveForSlot) return 'YOUR_BOOKING';

        const currentlyOccupied = allReservations.some(r => {
            if (String(r.slotId) !== String(slot.id)) return false;
            const rStatus = String(r.status || '').toUpperCase().trim();
            if (!['CONFIRMED', 'ENTERED', 'PENDING'].includes(rStatus)) return false;

            const rStart = parseBackendDate(r.startTime);
            const rEnd = parseBackendDate(r.endTime);
            return (now >= rStart && now < rEnd); 
        });

        if (currentlyOccupied) return 'BOOKED';

        return 'AVAILABLE';
    }
  };

  const handleProceedToPay = () => {
    if (!bookingDate || !startTime || !endTime || !selectedVehicle) {
      setBookingMessage('Failed: Please fill all details.');
      setTimeout(() => setBookingMessage(''), 3000);
      return;
    }

    const startDateTime = new Date(`${bookingDate}T${startTime}:00`);
    const endDateTime = new Date(`${bookingDate}T${endTime}:00`);
    const currentDateTime = new Date();

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      setBookingMessage('Failed: Invalid date or time selected.');
      setTimeout(() => setBookingMessage(''), 4000);
      return;
    }

    if (startDateTime < currentDateTime) {
      setBookingMessage('Failed: Cannot book for past dates or times.');
      setTimeout(() => setBookingMessage(''), 4000);
      return;
    }

    if (endDateTime <= startDateTime) {
      setBookingMessage('Failed: End time must be after start time.');
      setTimeout(() => setBookingMessage(''), 4000);
      return;
    }

    const diffInHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
    if (diffInHours > 24) {
      setBookingMessage('Failed: Maximum booking duration is 24 hours.');
      setTimeout(() => setBookingMessage(''), 4000);
      return;
    }

    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    if (startDateTime > sixMonthsFromNow) {
      setBookingMessage('Failed: You can only book up to 6 months in advance.');
      setTimeout(() => setBookingMessage(''), 4000);
      return;
    }

    // SLOT OVERLAP PROTECTION
    const isSlotDoubleBooked = allReservations.some(res => {
      if (String(res.slotId) !== String(selectedSpot.id)) return false;
      const rStatus = String(res.status || '').toUpperCase().trim();
      if (!['CONFIRMED', 'ENTERED', 'PENDING'].includes(rStatus)) return false;
      
      const rStart = parseBackendDate(res.startTime);
      const rEnd = parseBackendDate(res.endTime);
      
      return (startDateTime < rEnd) && (endDateTime > rStart);
    });

    if (isSlotDoubleBooked) {
      setBookingMessage('Failed: This slot is already booked for the selected time window.');
      setTimeout(() => setBookingMessage(''), 4000);
      return;
    }

    // VEHICLE OVERLAP PROTECTION
    const activeBookingsForSelectedVehicle = myReservations.filter(res => 
      (res.status === 'CONFIRMED' || res.status === 'ENTERED') && 
      String(res.vehicleId) === String(selectedVehicle)
    );
    
    if (activeBookingsForSelectedVehicle.length >= 2) {
      setBookingMessage('Failed: Maximum 2 active bookings allowed per vehicle.');
      setTimeout(() => setBookingMessage(''), 4000);
      return;
    }

    const isVehicleDoubleBooked = activeBookingsForSelectedVehicle.some(res => {
      const resStart = parseBackendDate(res.startTime);
      const resEnd = parseBackendDate(res.endTime);
      return (startDateTime < resEnd) && (endDateTime > resStart);
    });

    if (isVehicleDoubleBooked) {
      setBookingMessage('Failed: This vehicle is already booked for the selected time window.');
      setTimeout(() => setBookingMessage(''), 4000);
      return;
    }

    setShowPaymentModal(true);
  };

  const processPaymentAndBook = async (e) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    setTimeout(async () => {
      try {
        const pad = (n) => n.toString().padStart(2, '0');
        const d = new Date(bookingDate);
        const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

        const startDateTimeStr = `${dateStr}T${startTime}:00`;
        const endDateTimeStr = `${dateStr}T${endTime}:00`;

        const bookingData = {
          userId: parseInt(userId), 
          vehicleId: parseInt(selectedVehicle),
          slotId: selectedSpot.id, 
          startTime: startDateTimeStr,
          endTime: endDateTimeStr,
          status: "CONFIRMED", 
          totalAmount: parseFloat(estimatedTotal)
        };

        await axios.post('http://localhost:8080/api/reservations/create', bookingData);
        
        setBookingMessage('Payment & Booking Successful! 🎉');
        setShowPaymentModal(false);
        setCardDetails({ number: '', name: '', expiry: '', cvv: '' });
        
        fetchSlots(); 
        fetchMyReservations(); 
        fetchAllReservations();

        setTimeout(() => {
          setBookingMessage('');
          setSelectedSpot(null); 
          setBookingDate('');
          setStartTime('');
          setEndTime('');
          navigate('/reservations');
        }, 2000);

      } catch (error) {
        console.error(error);
        alert('Booking Failed during finalization. Try again.');
      } finally {
        setIsProcessingPayment(false);
      }
    }, 1500);
  };

  // --- SMART LICENSE PLATE FORMATTER ---
  const handleLicensePlateChange = (e) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    
    const hyphenIdx = val.indexOf('-');
    if (hyphenIdx !== -1) {
      // If hyphen exists, strictly separate letters and numbers
      const letters = val.substring(0, hyphenIdx).replace(/[^A-Z]/g, '').substring(0, 3);
      const numbers = val.substring(hyphenIdx + 1).replace(/[^0-9]/g, '').substring(0, 4);
      
      if (letters.length === 0) {
        val = ''; 
      } else if (numbers.length === 0 && val.endsWith('-')) {
        val = letters + '-';
      } else if (numbers.length > 0) {
        val = letters + '-' + numbers;
      } else {
        val = letters;
      }
    } else {
      // No hyphen typed yet, auto-format
      const letters = val.replace(/[^A-Z]/g, '').substring(0, 3);
      const rawRemaining = val.substring(letters.length);
      const numbers = rawRemaining.replace(/[^0-9]/g, '').substring(0, 4);
      
      if (letters.length > 0 && numbers.length > 0) {
        val = letters + '-' + numbers;
      } else if (letters.length > 0) {
        val = letters;
      } else {
        val = ''; 
      }
    }
    
    setNewVehicle({...newVehicle, licensePlate: val});
  };

const validateVehicleForm = () => {
    if (!newVehicle.licensePlate.trim() || !newVehicle.make.trim() || !newVehicle.color.trim() || !newVehicle.vehicleType) {
      setVehicleMessage("Failed: All fields are required!");
      return false;
    }

    const plateRegex = /^[A-Z]{2,3}-\d{4}$/; 
    if (!plateRegex.test(newVehicle.licensePlate)) {
      setVehicleMessage("Failed: Invalid License Plate! Must be 2-3 letters & 4 digits (e.g., ABC-1234)");
      return false;
    }

    // ALUTH VALIDATION EKA: Make & Color
    const makeColorRegex = /^[A-Z][a-zA-Z\s]{0,49}$/;

    if (!makeColorRegex.test(newVehicle.make)) {
      setVehicleMessage("Failed: Brand/Make must start with a Capital letter, contain only letters, and be max 50 chars.");
      return false;
    }

    if (!makeColorRegex.test(newVehicle.color)) {
      setVehicleMessage("Failed: Color must start with a Capital letter, contain only letters, and be max 50 chars.");
      return false;
    }

    return true;
  };

  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    if (!validateVehicleForm()) return; 

    setIsAddingVehicle(true);
    setVehicleMessage('');
    try {
      const vehicleData = { ...newVehicle, userId: parseInt(userId) };
      await axios.post('http://localhost:8080/api/vehicles/add', vehicleData);
      setVehicleMessage(newVehicle.id ? 'Vehicle updated successfully! 🚗' : 'Vehicle added successfully! 🚗');
      fetchVehicles(); 
      setTimeout(() => {
        setShowVehicleModal(false);
        setVehicleMessage('');
      }, 1500);
    } catch (error) {
      console.error(error);
      setVehicleMessage('Failed to save vehicle. It might already exist.');
    } finally {
      setIsAddingVehicle(false);
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this vehicle?")) {
      try {
        await axios.delete(`http://localhost:8080/api/vehicles/delete/${id}`);
        fetchVehicles(); 
      } catch (error) {
        alert("Cannot delete this vehicle. It might be linked to an active booking.");
      }
    }
  };

  const openAddModal = () => {
    setNewVehicle({ id: null, licensePlate: '', make: '', color: '', vehicleType: 'Car', status: 'ACTIVE' });
    setVehicleMessage(''); 
    setShowVehicleModal(true);
  };

  const openEditModal = (vehicle) => {
    setNewVehicle(vehicle);
    setVehicleMessage(''); 
    setShowVehicleModal(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const getSpotStyles = (status) => {
    switch (status) {
      case 'YOUR_BOOKING': return { border: 'border-[#a855f7]', header: 'bg-[#a855f7] text-white', text: 'text-[#a855f7]' };
      case 'BOOKED': return { border: 'border-[#ff4757]', header: 'bg-[#ff4757] text-white', text: 'text-[#ff4757]' };
      case 'MAINTENANCE': return { border: 'border-[#ffd32a]', header: 'bg-[#ffd32a] text-black', text: 'text-[#ffd32a]' };
      default: return { border: 'border-[#00e5ff]', header: 'bg-[#00e5ff] text-black', text: 'text-[#00e5ff]' }; // AVAILABLE
    }
  };

  const selectedDisplayStatus = selectedSpot ? getDynamicSlotStatus(selectedSpot) : '';
  const hasBookingError = bookingMessage && bookingMessage.includes('Failed');

  return (
    <div className={`min-h-screen ${theme.bgMain} ${isDark ? 'text-gray-300' : 'text-gray-700'} font-sans selection:bg-[#00e5ff] selection:text-black pb-40 relative transition-colors duration-300`}>
      
      {/* --- PAYMENT MODAL --- */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`${theme.bgCard} p-8 rounded-2xl border ${isDark ? 'border-[#00e5ff]/30' : 'border-gray-300'} shadow-[0_0_50px_rgba(0,229,255,0.2)] w-full max-w-md relative`}>
            <button onClick={() => !isProcessingPayment && setShowPaymentModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition">
              <X size={24} />
            </button>
            <h2 className={`text-2xl font-black ${theme.textMain} mb-2 flex items-center gap-2`}>
              <CreditCard className="text-[#00e5ff]" /> Secure Payment
            </h2>
            <p className={`text-sm ${theme.textMuted} mb-6`}>Complete payment to confirm Slot {selectedSpot?.slotNumber}</p>

            <div className={`${theme.bgInput} p-4 rounded-xl border ${theme.borderInput} mb-6 flex justify-between items-center`}>
              <span className={`${theme.textMuted} font-bold text-sm`}>Total Amount:</span>
              <span className="text-2xl font-black text-[#00e5ff]">Rs {estimatedTotal}</span>
            </div>

            <form onSubmit={processPaymentAndBook} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold ${theme.textMuted} mb-2 uppercase tracking-wider`}>Card Number</label>
                <input type="text" required value={cardDetails.number} onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  val = val.replace(/(.{4})/g, '$1 ').trim();
                  setCardDetails({...cardDetails, number: val});
                }} maxLength="19" className={`w-full ${theme.bgInput} border ${theme.borderInput} ${theme.textMain} px-4 py-3 rounded-xl focus:outline-none focus:border-[#00e5ff] transition tracking-widest font-mono`} placeholder="0000 0000 0000 0000"/>
              </div>
              
              <div>
                <label className={`block text-xs font-bold ${theme.textMuted} mb-2 uppercase tracking-wider`}>Cardholder Name</label>
                <input type="text" required value={cardDetails.name} onChange={(e) => {
                  const val = e.target.value.replace(/[^A-Za-z\s]/g, '');
                  setCardDetails({...cardDetails, name: val});
                }} className={`w-full ${theme.bgInput} border ${theme.borderInput} ${theme.textMain} px-4 py-3 rounded-xl focus:outline-none focus:border-[#00e5ff] transition uppercase`} placeholder="JOHN DOE"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold ${theme.textMuted} mb-2 uppercase tracking-wider`}>Expiry Date</label>
                  <input type="text" required autoComplete="off" value={cardDetails.expiry} onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.length > 0) {
                      if (val.length === 1 && parseInt(val) > 1) val = '0' + val;
                      if (val.length >= 2) {
                        let mm = parseInt(val.substring(0, 2));
                        if (mm === 0) mm = '01';
                        else if (mm > 12) mm = '12';
                        else mm = val.substring(0, 2);
                        val = mm + val.substring(2);
                      }
                      if (val.length >= 3) {
                        let dd = val.substring(2, 4);
                        if (dd.length === 2) {
                          let parsedDd = parseInt(dd);
                          if (parsedDd > 31) parsedDd = 31;
                          dd = parsedDd === 0 ? '01' : parsedDd.toString().padStart(2, '0');
                          val = val.substring(0, 2) + dd;
                        }
                      }
                      if (val.length >= 3) {
                        val = val.substring(0, 2) + '/' + val.substring(2, 4);
                      }
                    }
                    setCardDetails({...cardDetails, expiry: val});
                  }} maxLength="5" className={`w-full ${theme.bgInput} border ${theme.borderInput} ${theme.textMain} px-4 py-3 rounded-xl focus:outline-none focus:border-[#00e5ff] transition tracking-widest`} placeholder="MM/YY"/>
                </div>

                <div>
                  <label className={`block text-xs font-bold ${theme.textMuted} mb-2 uppercase tracking-wider`}>CVV</label>
                  <input type="password" required autoComplete="off" value={cardDetails.cvv} onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value.replace(/\D/g, '')})} maxLength="3" className={`w-full ${theme.bgInput} border ${theme.borderInput} ${theme.textMain} px-4 py-3 rounded-xl focus:outline-none focus:border-[#00e5ff] transition tracking-widest font-mono`} placeholder="•••"/>
                </div>
              </div>
              <button type="submit" disabled={isProcessingPayment} className="w-full bg-gradient-to-r from-[#00e5ff] to-blue-500 hover:from-[#00c3d9] hover:to-blue-600 text-black font-black py-4 rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all mt-6 disabled:opacity-50">
                {isProcessingPayment ? 'Processing Payment...' : 'Pay Now & Confirm'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- VEHICLE MODAL --- */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`${theme.bgCard} p-8 rounded-2xl border ${isDark ? 'border-[#00e5ff]/30' : 'border-gray-300'} shadow-[0_0_40px_rgba(0,229,255,0.15)] w-full max-w-md relative`}>
            <button onClick={() => setShowVehicleModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"><X size={24} /></button>
            <h2 className={`text-2xl font-black ${theme.textMain} mb-2`}>{newVehicle.id ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
            <p className={`text-sm ${theme.textMuted} mb-6`}>Manage your vehicle details below</p>
            {vehicleMessage && <div className={`mb-4 p-3 rounded-xl text-center text-sm font-bold border ${vehicleMessage.includes('Failed') ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-green-500/10 border-green-500 text-green-500'}`}>{vehicleMessage}</div>}
            <form onSubmit={handleSaveVehicle} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold ${theme.textMuted} mb-2 uppercase tracking-wider`}>License Plate (Number)</label>
                {/* ADVANCED FORMATTER onChange UPDATED HERE */}
                <input 
                  type="text" 
                  required 
                  maxLength="8"
                  value={newVehicle.licensePlate} 
                  onChange={handleLicensePlateChange} 
                  className={`w-full ${theme.bgInput} border ${theme.borderInput} ${theme.textMain} px-4 py-3 rounded-xl focus:outline-none focus:border-[#00e5ff] transition`} 
                  placeholder="e.g., CBA-1234"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold ${theme.textMuted} mb-2 uppercase tracking-wider`}>Make/Brand</label>
                  <input 
                    type="text" 
                    required 
                    maxLength="50" 
                    value={newVehicle.make} 
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^a-zA-Z\s]/g, ''); // Only letters and spaces are allowed.
                      if (val.length > 0) val = val.charAt(0).toUpperCase() + val.slice(1); // Automatically capitalize the first letter.
                      setNewVehicle({...newVehicle, make: val});
                    }} 
                    className={`w-full ${theme.bgInput} border ${theme.borderInput} ${theme.textMain} px-4 py-3 rounded-xl focus:outline-none focus:border-[#00e5ff] transition`} 
                    placeholder="e.g., Toyota"
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold ${theme.textMuted} mb-2 uppercase tracking-wider`}>Color</label>
                  <input 
                    type="text" 
                    required 
                    maxLength="50" 
                    value={newVehicle.color} 
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                      if (val.length > 0) val = val.charAt(0).toUpperCase() + val.slice(1);
                      setNewVehicle({...newVehicle, color: val});
                    }} 
                    className={`w-full ${theme.bgInput} border ${theme.borderInput} ${theme.textMain} px-4 py-3 rounded-xl focus:outline-none focus:border-[#00e5ff] transition`} 
                    placeholder="e.g., Black"
                  />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-bold ${theme.textMuted} mb-2 uppercase tracking-wider`}>Vehicle Type</label>
                <select value={newVehicle.vehicleType} onChange={(e) => setNewVehicle({...newVehicle, vehicleType: e.target.value})} className={`w-full ${theme.bgInput} border ${theme.borderInput} ${theme.textMain} px-4 py-3 rounded-xl focus:outline-none focus:border-[#00e5ff] transition cursor-pointer`}>
                  <option value="Car">Car</option>
                  <option value="Bike">Bike</option>
                  <option value="Van">Van</option>
                  <option value="EV">Electric Vehicle (EV)</option>
                </select>
              </div>
              {newVehicle.id && (
                <div>
                  <label className={`block text-xs font-bold ${theme.textMuted} mb-2 uppercase tracking-wider`}>Status</label>
                  <select value={newVehicle.status} onChange={(e) => setNewVehicle({...newVehicle, status: e.target.value})} className={`w-full ${theme.bgInput} border ${theme.borderInput} ${theme.textMain} px-4 py-3 rounded-xl focus:outline-none focus:border-[#ff4757] transition cursor-pointer`}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Deactivate (Soft Delete)</option>
                  </select>
                </div>
              )}
              <button type="submit" disabled={isAddingVehicle} className="w-full bg-[#00e5ff] hover:bg-[#00c3d9] text-black font-black py-4 rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all mt-6 disabled:opacity-50">
                {isAddingVehicle ? 'Saving...' : 'Save Vehicle'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className={`${theme.bgNav} border-b ${theme.borderMain} px-8 py-4 flex justify-between items-center shadow-sm mb-8 transition-colors`}>
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-blue-500 tracking-wide">
          EASY<span className={theme.textMain}>PARK</span>
        </h1>
        <div className="flex items-center gap-6">
          <span className="text-sm font-bold text-[#00e5ff] border-b-2 border-[#00e5ff] pb-1">Dashboard</span>
          <Link to="/reservations" className={`text-sm font-bold ${theme.textMuted} hover:text-[#00e5ff] transition`}>My Reservations</Link>
          
          <div 
            onClick={() => setIsDark(!isDark)}
            className={`relative w-[72px] h-[36px] rounded-full cursor-pointer transition-all duration-500 flex items-center p-1 ${
              isDark 
                ? 'bg-[#0b0c10] shadow-[inset_0px_2px_8px_rgba(0,0,0,0.8)] border border-gray-800' 
                : 'bg-[#e2e8f0] shadow-[inset_0px_2px_8px_rgba(0,0,0,0.1)] border border-gray-300'
            }`}
          >
            <div className="absolute w-full flex justify-between px-2.5 left-0 pointer-events-none">
              <Sun size={14} className={`${isDark ? 'text-gray-500' : 'opacity-0'} transition-opacity duration-300`} />
              <Moon size={14} className={`${isDark ? 'opacity-0' : 'text-gray-500'} transition-opacity duration-300`} />
            </div>
            <div 
              className={`absolute w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 shadow-md ${
                isDark 
                  ? 'translate-x-[34px] bg-[#1a1c23] shadow-[0_2px_5px_rgba(0,0,0,0.5)] border border-gray-700' 
                  : 'translate-x-0 bg-gradient-to-br from-[#ffc85a] to-[#ed8b00] shadow-[0_2px_8px_rgba(237,139,0,0.5)]'
              }`}
            >
              {isDark ? <Moon size={14} className="text-gray-300" /> : <Sun size={14} className="text-white" />}
            </div>
          </div>

          <div className={`flex items-center gap-2 text-sm font-semibold ${theme.textMuted} ${theme.bgInput} px-4 py-2 rounded-full border ${theme.borderInput} ml-2 cursor-pointer hover:border-[#00e5ff] transition`} onClick={() => navigate('/profile')}>
            <User size={16} className="text-[#00e5ff]" />
            {userName}
          </div>
          <button onClick={handleLogout} className={`text-sm font-bold ${theme.textMuted} hover:text-red-500 transition`}>Logout</button>
        </div>
      </nav>

      <div className="px-6 max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left Column: My Vehicles */}
        <div className="xl:col-span-1 space-y-6">
          <div className={`${theme.bgCard} p-6 rounded-2xl border ${theme.borderMain} shadow-xl transition-colors`}>
            <h3 className={`text-lg font-black ${theme.textMain} mb-5 flex items-center gap-2`}>🚗 My Vehicles</h3>
            {vehicles.length === 0 ? (
              <div className={`text-center ${theme.textMuted} text-sm py-4 border border-dashed ${theme.borderMain} rounded-xl`}>No vehicles found. Add one below!</div>
            ) : (
              <div className="space-y-3">
                {vehicles.map(v => (
                  <div key={v.id} className={`p-4 border rounded-xl flex justify-between items-center transition cursor-default ${v.status === 'INACTIVE' ? 'border-red-500/30 bg-red-500/5' : `${theme.borderInput}${theme.bgInput} hover:border-[#00e5ff]`}`}>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <p className={`font-extrabold ${theme.textMain} uppercase`}>{v.licensePlate}</p>
                        {v.status === 'INACTIVE' && <span className="text-[9px] text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded uppercase font-bold">Deactivated</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{v.vehicleType}</span>
                        <p className={`text-xs ${theme.textMuted} capitalize`}>{v.color} {v.make}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-3 ${theme.bgNav} px-3 py-2 rounded-lg border ${theme.borderMain}`}>
                      <button onClick={() => openEditModal(v)} className={`${theme.textMuted} hover:text-[#00e5ff] transition transform hover:scale-110`}><Edit size={16} /></button>
                      <div className={`w-px h-4 ${theme.borderInput}`}></div>
                      <button onClick={() => handleDeleteVehicle(v.id)} className={`${theme.textMuted} hover:text-red-500 transition transform hover:scale-110`}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={openAddModal} className={`mt-5 w-full border border-dashed ${theme.borderMain} ${theme.textMuted} font-bold py-3 rounded-xl hover:${theme.bgInput} hover:text-[#00e5ff] transition flex justify-center items-center gap-2 text-sm`}>
              <Plus size={16} /> Add New Vehicle
            </button>
          </div>
        </div>

        {/* Center Column: Parking Map */}
        <div className={`xl:col-span-2 ${theme.bgCard} rounded-2xl border ${theme.borderMain} p-6 shadow-xl relative transition-colors`}>
          <div className={`border-2 border-dashed ${theme.borderInput} ${theme.bgInput} rounded-lg py-3 px-4 flex justify-between items-center mb-8`}>
            <span className={`${theme.textMuted} font-bold tracking-[0.2em] text-sm uppercase`}>Entrance / Exit Gate</span>
            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${isTimeFullySelected ? 'bg-green-500/10 text-green-500 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30 animate-pulse'}`}>
              {isTimeFullySelected ? 'Custom Time View' : 'Current Live View'}
            </span>
          </div>

          {parkingSpots.length === 0 ? (
            <div className={`text-center ${theme.textMuted} py-10 font-bold`}>No slots found in the database.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {parkingSpots.map((spot) => {
                
                const displayStatus = getDynamicSlotStatus(spot);
                const styles = getSpotStyles(displayStatus);
                const isSelected = selectedSpot?.id === spot.id;
                
                return (
                  <div key={spot.id} onClick={() => setSelectedSpot(spot)} className={`rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${styles.border} ${isSelected ? 'shadow-[0_0_20px_rgba(0,229,255,0.4)] scale-105' : 'hover:shadow-md'}`}>
                    <div className={`py-1 text-center font-extrabold text-sm ${styles.header}`}>{spot.slotNumber}</div>
                    <div className={`${isDark ? 'bg-[#0b0c10]' : 'bg-gray-50'} py-4 flex flex-col items-center justify-center`}>
                      <Car className={`mb-1 ${styles.text}`} size={20} />
                      <span className={`text-[10px] font-bold ${theme.textMuted} tracking-wider mt-1`}>SLOT</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className={`mt-8 flex flex-wrap justify-center gap-5 text-xs font-semibold ${theme.textMuted} ${theme.bgNav} py-3 rounded-full border ${theme.borderMain}`}>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]"></div> Available</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#a855f7] shadow-[0_0_8px_#a855f7]"></div> Your Booking</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#ff4757]"></div> Booked</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#ffd32a]"></div> Maintenance</div>
          </div>
        </div>

        {/* Right Column: Premium Booking Wizard */}
        <div className={`xl:col-span-1 ${theme.bgCard} rounded-2xl border ${theme.borderMain} shadow-xl flex flex-col transition-colors overflow-visible`}>
          
          {/* STEP 1: Time Selection (Always Visible at top) */}
          <div className={`p-6 border-b ${theme.borderMain} ${isDark ? 'bg-[#0b0c10]/40' : 'bg-gray-50/50'} rounded-t-2xl`}>
            <h3 className={`text-lg font-black ${theme.textMain} mb-2 flex items-center gap-2`}>
              <Clock className="text-[#00e5ff]" /> 1. Set Time Window
            </h3>
            <p className={`text-[11px] font-bold ${theme.textMuted} mb-4 leading-relaxed`}>Select Date & Time below to view exact slot availability on the map.</p>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-bold ${theme.textMuted} mb-1.5`}>Booking Date</label>
                <PremiumDatePicker value={bookingDate} onChange={setBookingDate} theme={theme} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold ${theme.textMuted} mb-1.5`}>Start Time</label>
                  <PremiumTimePicker value={startTime} onChange={setStartTime} theme={theme} placeholder="Start" />
                </div>
                <div>
                  <label className={`block text-xs font-bold ${theme.textMuted} mb-1.5`}>End Time</label>
                  <PremiumTimePicker value={endTime} onChange={setEndTime} theme={theme} placeholder="End" alignRight={true} />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: Slot Selection & Checkout */}
          <div className="p-6 flex-1 flex flex-col">
            <h3 className={`text-lg font-black ${theme.textMain} mb-4 flex items-center gap-2`}>
              <ShieldCheck className="text-[#00e5ff]" /> 2. Confirm & Book
            </h3>

            {/* ERROR MESSAGE MOVED HERE SO IT'S ALWAYS VISIBLE */}
            {bookingMessage && (
              <div className={`mb-4 p-3 rounded-xl text-center text-sm font-bold border ${bookingMessage.includes('Failed') ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-green-500/10 border-green-500 text-green-500'} flex items-center justify-center gap-2`}>
                {!bookingMessage.includes('Failed') ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                {bookingMessage}
              </div>
            )}

            {!selectedSpot ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 py-10 border-2 border-dashed border-gray-700/50 rounded-xl">
                <Car size={36} className={`${theme.textMuted} mb-3`} />
                <p className={`text-sm ${theme.textMuted} leading-relaxed px-4`}>Check availability on map and click a <strong className="text-[#00e5ff]">Cyan</strong> slot to book.</p>
              </div>
            ) : (
              <div className="flex flex-col flex-1 animate-fade-in">
                <div className="space-y-3 text-sm mb-5 bg-[#00e5ff]/5 border border-[#00e5ff]/20 p-4 rounded-xl">
                  <div className={`flex justify-between items-center border-b ${theme.borderMain} pb-2`}>
                    <span className={theme.textMuted}>Selected Slot:</span>
                    <span className="font-black text-xl text-white tracking-widest">{selectedSpot.slotNumber}</span>
                  </div>
                  <div className={`flex justify-between items-center border-b ${theme.borderMain} pb-2`}>
                    <span className={theme.textMuted}>Status:</span>
                    <span className={`font-black ${getSpotStyles(selectedDisplayStatus).text}`}>
                      {selectedDisplayStatus === 'YOUR_BOOKING' ? 'YOUR BOOKING' : selectedDisplayStatus}
                    </span>
                  </div>
                  <div className={`flex justify-between items-center pt-1`}>
                    <span className={theme.textMuted}>Rate:</span>
                    <div className="text-right">
                      <span className="font-black text-[#00e5ff] block">Rs {selectedSpot.price || '100'}/hr (First 6h)</span>
                      <span className={`text-[9px] font-bold ${theme.textMuted} uppercase tracking-wider`}>Rs {(selectedSpot.price || 100) / 2}/hr (After 6h)</span>
                    </div>
                  </div>
                </div>

                {selectedDisplayStatus !== 'MAINTENANCE' && (
                  <div className="mb-4">
                    <label className={`block text-xs font-bold ${theme.textMuted} mb-2`}>Assign Vehicle:</label>
                    <select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} className={`w-full ${theme.bgInput} border ${theme.borderInput} ${theme.textMain} p-3 rounded-xl focus:border-[#00e5ff] outline-none text-sm font-semibold cursor-pointer transition`}>
                      <option value="">-- Choose a Vehicle --</option>
                      {vehicles.filter(v => v.status === 'ACTIVE').map(v => (
                        <option key={v.id} value={v.id}>{v.licensePlate} ({v.vehicleType})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mt-auto">
                  {isTimeFullySelected && selectedSpot && (
                    <div className="mb-4 p-4 bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-xl flex justify-between items-center shadow-lg">
                        <span className={`text-sm font-bold ${theme.textMuted}`}>Est. Total:</span>
                        <span className="text-2xl font-black text-[#00e5ff]">Rs {estimatedTotal}</span>
                    </div>
                  )}

                  <button 
                    disabled={selectedDisplayStatus !== 'AVAILABLE' || !selectedVehicle || !isTimeFullySelected || hasBookingError} 
                    onClick={handleProceedToPay} 
                    className={`w-full py-4 rounded-xl font-bold text-[15px] transition-all flex items-center justify-center gap-2 ${selectedDisplayStatus === 'AVAILABLE' && selectedVehicle && isTimeFullySelected && !hasBookingError ? 'bg-gradient-to-r from-[#00e5ff] to-blue-500 hover:from-[#00c3d9] hover:to-blue-600 text-black shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] transform hover:-translate-y-1' : 'bg-gray-400/10 border border-gray-600/30 text-gray-500 cursor-not-allowed'}`}
                  >
                    {selectedDisplayStatus === 'MAINTENANCE' ? 'Under Maintenance' : 
                     selectedDisplayStatus === 'YOUR_BOOKING' ? 'Already Booked by You' : 
                     selectedDisplayStatus === 'BOOKED' ? 'Slot Currently Booked' : 
                     (!isTimeFullySelected ? 'Select Time Above ☝️' : 
                     (hasBookingError ? 'Invalid Time Range' :
                     (!selectedVehicle ? 'Select Vehicle to Book' : <><CreditCard size={18} /> Proceed to Pay Rs {estimatedTotal}</>)))}
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;