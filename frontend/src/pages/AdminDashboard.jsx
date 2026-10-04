import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Plus, Edit, Trash2, CheckCircle, X, BarChart3, Car, Users, Wrench, LayoutGrid, FileText, Download, MessageSquare, Star, Reply, Send, Ban, Unlock, TrendingUp, AlertTriangle, User, RefreshCw, Sun, Moon, CalendarDays, Search, Eye, DollarSign, Clock3, ArrowRightLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- HELPER FUNCTION: Spring Boot Date Parser ---
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

// Safe Time Formatter for Display
const formatTime = (dateInput) => {
  if (!dateInput) return 'Pending';
  const d = parseBackendDate(dateInput);
  if (isNaN(d.getTime())) return 'Invalid Time';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

function AdminDashboard() {
  const navigate = useNavigate();
  const adminName = localStorage.getItem('easyParkUserName') || 'Administrator';
  const adminId = localStorage.getItem('easyParkUserId') || 1; 

  // --- THEME STATE ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const [activeTab, setActiveTab] = useState('slots'); 
  const [slots, setSlots] = useState([]);
  const [users, setUsers] = useState([]); 
  const [vehicles, setVehicles] = useState([]); 
  const [totalUsers, setTotalUsers] = useState(0); 
  const [reservations, setReservations] = useState([]); 
  
  const [reviews, setReviews] = useState([]);
  const [filterRating, setFilterRating] = useState('ALL');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const [complaints, setComplaints] = useState([]);

  // Booking Management States
  const [searchBookingId, setSearchBookingId] = useState('');
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);

  // Slot Modal States
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [currentSlot, setCurrentSlot] = useState({
    id: null, slotNumber: '', location: 'Main Yard', price: 100.00, status: 'AVAILABLE', active: true
  });

  // Bulk Price Update States
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [bulkPrice, setBulkPrice] = useState(100.00);
  const [isUpdatingBulkPrice, setIsUpdatingBulkPrice] = useState(false);

  // Delete Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);

  // User Creation States
  const [showUserModal, setShowUserModal] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [newUser, setNewUser] = useState({
    name: '', email: '', password: '', role: 'STAFF'
  });

  const [currentTime, setCurrentTime] = useState(Date.now());
  const [messageModal, setMessageModal] = useState({ isOpen: false, message: '', type: 'success' });
  const [actionConfirmModal, setActionConfirmModal] = useState({ isOpen: false, title: '', message: '', actionType: '', data: null });

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

  useEffect(() => {
    const isAnyModalOpen = selectedBookingDetails || showSlotModal || showBulkPriceModal || showUserModal || showDeleteModal || messageModal.isOpen || actionConfirmModal.isOpen;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedBookingDetails, showSlotModal, showBulkPriceModal, showUserModal, showDeleteModal, messageModal.isOpen, actionConfirmModal.isOpen]);

  useEffect(() => {
    fetchSlots();
    fetchUserCount(); 
    fetchAllUsers();
    fetchAllVehicles();
    fetchReviews();
    fetchAllReservations(); 
    fetchAllComplaints(); 
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/slots/all');
      setSlots(response.data);
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  const fetchUserCount = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/users/admin/users/count');
      setTotalUsers(response.data);
    } catch (error) {
      console.error("Error fetching user count:", error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/users/all');
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching all users:", error);
    }
  };

  const fetchAllVehicles = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/vehicles/all');
      setVehicles(response.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/reviews/all');
      setReviews(response.data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const fetchAllReservations = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/reservations/all');
      setReservations(response.data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  const fetchAllComplaints = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/complaints/all');
      setComplaints(response.data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };


  // --- TOP STATS CALCULATIONS ---
  const driverCount = users.filter(u => !u.role || u.role === 'DRIVER' || u.role === 'USER').length;
  const staffCount = users.filter(u => u.role === 'STAFF' || u.role === 'ADMIN').length;

  const totalSlots = slots.filter(s => s.active !== false).length;
  const maintenanceCount = slots.filter(s => s.status === 'MAINTENANCE' && s.active !== false).length;
  const activeCount = totalSlots - maintenanceCount; 
  const availableCount = totalSlots - maintenanceCount;

  let totalBookedHours = 0;
  let completedHours = 0;
  let pendingHours = 0;

  const currentMonth = new Date(currentTime).getMonth();
  const currentYear = new Date(currentTime).getFullYear();

  reservations.forEach(res => {
    const start = parseBackendDate(res.startTime);
    const end = parseBackendDate(res.endTime);
    
    if (start.getMonth() === currentMonth && start.getFullYear() === currentYear) {
      if (['CONFIRMED', 'ENTERED', 'COMPLETED'].includes(res.status)) {
        const durationHrs = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        totalBookedHours += durationHrs;
        
        if (res.status === 'COMPLETED') {
          completedHours += durationHrs;
        } else {
          pendingHours += durationHrs;
        }
      }
    }
  });

  // PROPER DB-BASED REVENUE CALCULATION
  const totalBaseRevenue = reservations.reduce((acc, res) => acc + (['CONFIRMED', 'ENTERED', 'COMPLETED'].includes(res.status) ? (res.totalAmount || 0) : 0), 0);
  const totalOverstayFines = reservations.reduce((acc, res) => acc + (['CONFIRMED', 'ENTERED', 'COMPLETED'].includes(res.status) ? (res.overstayFine || 0) : 0), 0);
  const grandTotalRevenue = totalBaseRevenue + totalOverstayFines;

  const calculateWeeklyRevenue = () => {
    const today = new Date();
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      last7Days.push({
        dateString: d.toISOString().split('T')[0],
        name: `${dateStr} (${dayStr})`, 
        revenue: 0
      });
    }

    reservations.forEach(res => {
      if(['CONFIRMED', 'COMPLETED', 'ENTERED'].includes(res.status)) {
        const resStart = parseBackendDate(res.startTime);
        const resDate = resStart.toISOString().split('T')[0];
        const dayMatch = last7Days.find(d => d.dateString === resDate);
        if (dayMatch) {
          // Direct Database Values
          dayMatch.revenue += (res.totalAmount || 0) + (res.overstayFine || 0);
        }
      }
    });
    return last7Days;
  };

  const calculateMonthlyRevenue = () => {
    const today = new Date();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      last6Months.push({
        monthKey: `${d.getFullYear()}-${d.getMonth()}`,
        name: monthStr,
        revenue: 0
      });
    }

    reservations.forEach(res => {
       if(['CONFIRMED', 'COMPLETED', 'ENTERED'].includes(res.status)) {
        const resDate = parseBackendDate(res.startTime);
        const resMonthKey = `${resDate.getFullYear()}-${resDate.getMonth()}`;
        const monthMatch = last6Months.find(m => m.monthKey === resMonthKey);
        if (monthMatch) {
          // Direct Database Values
          monthMatch.revenue += (res.totalAmount || 0) + (res.overstayFine || 0);
        }
      }
    });
    return last6Months;
  };

  const weeklyRevenueData = calculateWeeklyRevenue();
  const monthlyRevenueData = calculateMonthlyRevenue();


  const executeConfirmedAction = async () => {
    const { actionType, data } = actionConfirmModal;
    setActionConfirmModal({ ...actionConfirmModal, isOpen: false });

    if (actionType === 'RESTORE_SLOT') {
      try {
        await axios.post('http://localhost:8080/api/slots/add', { ...data, active: true });
        setMessageModal({ isOpen: true, message: "Slot restored and activated successfully! ✅", type: 'success' });
        fetchSlots();
      } catch (error) {
        setMessageModal({ isOpen: true, message: "Failed to restore slot.", type: 'error' });
      }
    } else if (actionType === 'TOGGLE_BLOCK_USER') {
      try {
        await axios.put(`http://localhost:8080/api/users/block/${data.id}`);
        fetchAllUsers(); 
        setMessageModal({ isOpen: true, message: `User status updated successfully!`, type: 'success' });
      } catch (error) {
        setMessageModal({ isOpen: true, message: error.response?.data || `Failed to update user status.`, type: 'error' });
      }
    } else if (actionType === 'DELETE_USER') {
      try {
        await axios.delete(`http://localhost:8080/api/users/delete/${data}`);
        fetchAllUsers();
        fetchUserCount();
        setMessageModal({ isOpen: true, message: "User account deleted permanently.", type: 'success' });
      } catch (error) {
        setMessageModal({ isOpen: true, message: error.response?.data || "Cannot delete user. They might have active bookings.", type: 'error' });
      }
    } else if (actionType === 'DELETE_REVIEW') {
      try {
        await axios.delete(`http://localhost:8080/api/reviews/delete/${data}`);
        fetchReviews(); 
        setMessageModal({ isOpen: true, message: "Customer review removed successfully.", type: 'success' });
      } catch (error) {
        setMessageModal({ isOpen: true, message: "Failed to delete review.", type: 'error' });
      }
    } else if (actionType === 'RESOLVE_COMPLAINT') {
      try {
        await axios.put(`http://localhost:8080/api/complaints/update/${data.id}`, {
          ...data,
          status: 'RESOLVED'
        });
        fetchAllComplaints(); 
        setMessageModal({ isOpen: true, message: "Complaint marked as resolved!", type: 'success' });
      } catch (error) {
        console.error("Error resolving complaint:", error);
        setMessageModal({ isOpen: true, message: "Failed to resolve the complaint.", type: 'error' });
      }
    }
  };

  const handleSaveSlot = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    try {
      await axios.post('http://localhost:8080/api/slots/add', currentSlot);
      setMessage(currentSlot.id ? 'Slot updated successfully! 🚀' : 'New parking slot added successfully! 🎉');
      fetchSlots();
      setTimeout(() => { setShowSlotModal(false); setMessage(''); }, 1500);
    } catch (error) {
      setMessage('Failed to save slot. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setIsSavingUser(true);
    setUserMessage('');
    try {
      await axios.post(`http://localhost:8080/api/users/admin/create-employee?creatorId=${adminId}`, newUser);
      setUserMessage('Staff member added successfully! 🎉');
      fetchAllUsers();
      fetchUserCount();
      setTimeout(() => { setShowUserModal(false); setUserMessage(''); }, 1500);
    } catch (error) {
      const errorMsg = error.response?.data || 'Failed to add user. Check permissions.';
      setUserMessage(errorMsg);
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleBulkPriceUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingBulkPrice(true);
    try {
      await axios.put(`http://localhost:8080/api/slots/update-price-all?price=${bulkPrice}`);
      fetchSlots();
      setMessageModal({ isOpen: true, message: 'All parking slot prices have been updated successfully! 🎉', type: 'success' });
      setShowBulkPriceModal(false);
    } catch (error) {
      console.error("Error updating bulk prices:", error);
      setMessageModal({ isOpen: true, message: 'Failed to update all prices. Please try again.', type: 'error' });
    } finally {
      setIsUpdatingBulkPrice(false);
    }
  };

  const handleToggleMaintenance = async (slot) => {
    const newStatus = slot.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
    try {
      await axios.post('http://localhost:8080/api/slots/add', { ...slot, status: newStatus });
      fetchSlots(); 
    } catch (error) {
      setMessageModal({ isOpen: true, message: "Failed to update slot status.", type: 'error' });
    }
  };

  const handleDeleteClick = (id) => {
    setSlotToDelete(id);
    setShowDeleteModal(true);
  };

  const executeDelete = async (type) => {
    try {
      const isHardDelete = type === 'HARD';
      await axios.delete(`http://localhost:8080/api/slots/delete/${slotToDelete}?hardDelete=${isHardDelete}`);
      setMessageModal({ isOpen: true, message: isHardDelete ? "Slot permanently deleted! 🗑️" : "Slot deactivated successfully! 👁️‍🗨️️", type: 'success' });
      fetchSlots();
    } catch (error) {
      setMessageModal({ isOpen: true, message: error.response?.data || "Error deleting slot", type: 'error' });
    } finally {
      setShowDeleteModal(false);
      setSlotToDelete(null);
    }
  };

  const handleRestoreSlot = (slot) => {
    setActionConfirmModal({
      isOpen: true,
      title: 'Restore Slot',
      message: `Are you sure you want to restore slot ${slot.slotNumber} back to the system?`,
      actionType: 'RESTORE_SLOT',
      data: slot
    });
  };

  const handleToggleBlockUser = (user) => {
    const action = user.blocked ? 'unblock' : 'suspend';
    setActionConfirmModal({
      isOpen: true,
      title: `${user.blocked ? 'Unblock' : 'Suspend'} User`,
      message: `Are you sure you want to ${action} this user's account?`,
      actionType: 'TOGGLE_BLOCK_USER',
      data: user
    });
  };

  const handleDeleteUser = (id) => {
    setActionConfirmModal({
      isOpen: true,
      title: 'Delete User Account',
      message: 'Are you sure you want to permanently delete this user account?',
      actionType: 'DELETE_USER',
      data: id
    });
  };

  const handleReplySubmit = async (reviewId) => {
    if (!replyText.trim()) return;
    try {
      await axios.put(`http://localhost:8080/api/reviews/reply/${reviewId}`, replyText, {
        headers: { 'Content-Type': 'text/plain' }
      });
      setReplyingTo(null);
      setReplyText('');
      fetchReviews(); 
      setMessageModal({ isOpen: true, message: "Reply sent successfully!", type: 'success' });
    } catch (error) {
      console.error(error);
      setMessageModal({ isOpen: true, message: "Failed to submit reply. Please try again.", type: 'error' });
    }
  };

  const handleDeleteReview = (id) => {
    setActionConfirmModal({
      isOpen: true,
      title: 'Delete Customer Review',
      message: 'Admin Warning: Are you sure you want to permanently delete this customer review?',
      actionType: 'DELETE_REVIEW',
      data: id
    });
  };

  const handleResolveComplaint = (complaint) => {
    setActionConfirmModal({
      isOpen: true,
      title: 'Resolve Complaint',
      message: 'Are you sure you want to mark this issue/complaint as RESOLVED?',
      actionType: 'RESOLVE_COMPLAINT',
      data: complaint
    });
  };

  const openAddModal = () => {
    setCurrentSlot({ id: null, slotNumber: '', location: 'Main Yard', price: 100.00, status: 'AVAILABLE', active: true });
    setShowSlotModal(true);
  };

  const openAddUserModal = () => {
    setNewUser({ name: '', email: '', password: '', role: 'STAFF' });
    setUserMessage('');
    setShowUserModal(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  const getSlotNumber = (slotId) => {
    const slot = slots.find(s => s.id === slotId);
    return slot ? slot.slotNumber : `#${slotId}`;
  };

  const getVehicleInfo = (vehicleId) => {
    const v = vehicles.find(v => v.id === vehicleId);
    return v ? `${v.licensePlate} (${v.make})` : 'Unknown Vehicle';
  };

  const formatDateDay = (dateInput) => {
    if (!dateInput) return "N/A";
    const date = parseBackendDate(dateInput);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getDisplayedBookings = () => {
    if (searchBookingId.trim()) {
      return reservations.filter(r => r.id.toString().includes(searchBookingId.trim()));
    }
    const today = new Date();
    return reservations.filter(res => {
      const d = parseBackendDate(res.startTime);
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    });
  };

  const slotStatusData = [
    { name: 'Available', value: availableCount },
    { name: 'Maintenance', value: maintenanceCount },
  ];
  const PIE_COLORS = ['#00e5ff', '#ff4757'];

  const generatePDFReport = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Header Background
      doc.setFillColor(26, 28, 35); 
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setFontSize(24);
      doc.setTextColor(0, 229, 255); 
      doc.setFont("helvetica", "bold");
      doc.text("EASYPARK", 14, 25);
      
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "normal");
      doc.text("System Analytics & Revenue Report", pageWidth - 14, 25, { align: "right" });
      
      const exactTime = new Date().toLocaleString('en-US', { 
        year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit', second: '2-digit' 
      });
      
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(10);
      doc.text(`Generated On: ${exactTime}`, 14, 50);
      doc.text(`Generated By: ${adminName}`, pageWidth - 14, 50, { align: "right" });
      
      doc.setDrawColor(220, 220, 220);
      doc.line(14, 55, pageWidth - 14, 55);

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("1. System Overview", 14, 65);
      
      autoTable(doc, {
        startY: 70,
        head: [['Total Users', 'Active Slots', 'Available', 'Maintenance']],
        body: [[totalUsers, availableCount + maintenanceCount, availableCount, maintenanceCount]],
        theme: 'grid',
        headStyles: { fillColor: [45, 55, 72], textColor: 255, halign: 'center' },
        bodyStyles: { halign: 'center', fontSize: 12 },
        styles: { font: "helvetica" }
      });

      let currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 90;

      doc.text("2. Financial Summary (All Time)", 14, currentY);
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Total Base Revenue', 'Total Overstay Fines Collected', 'Grand Total Revenue']],
        body: [[`Rs ${totalBaseRevenue.toFixed(2)}`, `Rs ${totalOverstayFines.toFixed(2)}`, `Rs ${grandTotalRevenue.toFixed(2)}`]],
        theme: 'grid',
        headStyles: { fillColor: [168, 85, 247], textColor: 255, halign: 'center' },
        bodyStyles: { halign: 'center', fontSize: 12, fontStyle: 'bold', textColor: [40, 40, 40] }
      });

      currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : currentY + 30;

      doc.text("3. Weekly Revenue Breakdown (Last 7 Days)", 14, currentY);
      
      const weeklyBody = weeklyRevenueData.map(item => [item.name, `Rs ${item.revenue.toFixed(2)}`]);
      const totalWeekly = weeklyRevenueData.reduce((sum, item) => sum + item.revenue, 0);
      weeklyBody.push(['TOTAL WEEKLY REVENUE', `Rs ${totalWeekly.toFixed(2)}`]);

      autoTable(doc, {
        startY: currentY + 5,
        head: [['Date', 'Revenue (Includes Fines)']],
        body: weeklyBody,
        theme: 'striped',
        headStyles: { fillColor: [0, 200, 220], textColor: 0 },
        willDrawCell: function(data) {
          if (data.row.index === weeklyBody.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [230, 230, 230];
          }
        }
      });

      currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : currentY + 50;

      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.text("4. Monthly Income Trend (Last 6 Months)", 14, currentY);
      
      const monthlyBody = monthlyRevenueData.map(item => [item.name, `Rs ${item.revenue.toFixed(2)}`]);
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Month', 'Revenue (Includes Fines)']],
        body: monthlyBody,
        theme: 'striped',
        headStyles: { fillColor: [108, 99, 255], textColor: 255 }
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount} | EasyPark System Analytics`, pageWidth / 2, 290, { align: 'center' });
      }

      doc.save(`EasyPark_Official_Report_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error: ", error);
      setMessageModal({ isOpen: true, message: "Failed to generate PDF! Please try again.", type: 'error' });
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-xl border ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-xs font-bold mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
          <p className={`font-black ${theme === 'dark' ? 'text-[#00e5ff]' : 'text-blue-600'}`}>Rs {payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  const filteredReviews = filterRating === 'ALL' 
    ? reviews 
    : reviews.filter(r => r.rating === parseInt(filterRating));

  return (
    <div className={`min-h-screen font-sans selection:bg-[#00e5ff] selection:text-black pb-12 transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0b0c10] text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
      
      {/* MESSAGE MODAL */}
      {messageModal.isOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
          <div className={`p-8 rounded-3xl border w-full max-w-sm relative flex flex-col items-center text-center shadow-2xl transition-colors max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] ${theme === 'dark' ? 'bg-[#15171e]' : 'bg-white'} ${messageModal.type === 'error' ? 'border-red-500/50' : 'border-green-500/50'}`}>
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

      {/* GENERIC ACTION CONFIRMATION MODAL */}
      {actionConfirmModal.isOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
          <div className={`p-8 rounded-3xl border w-full max-w-sm relative flex flex-col items-center text-center shadow-2xl transition-colors max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] ${theme === 'dark' ? 'bg-[#15171e] border-yellow-500/50' : 'bg-white border-yellow-400'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${theme === 'dark' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'}`}>
              <AlertTriangle className="text-yellow-500" size={32} />
            </div>
            <h2 className={`text-xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {actionConfirmModal.title}
            </h2>
            <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {actionConfirmModal.message}
            </p>
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setActionConfirmModal({ ...actionConfirmModal, isOpen: false })} 
                className={`flex-1 py-3 rounded-xl font-bold transition ${theme === 'dark' ? 'bg-[#1a1c23] hover:bg-gray-800 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
              >
                Cancel
              </button>
              <button 
                onClick={executeConfirmedAction} 
                className="flex-1 py-3 rounded-xl font-bold transition bg-yellow-500 hover:bg-yellow-600 text-white shadow-[0_0_15px_rgba(234,179,8,0.4)]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* --- Detailed Booking View Modal (Scheduled vs Actual) --- */}
      {selectedBookingDetails && (
        <div className="fixed inset-0 z-[120] overflow-y-auto bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="flex min-h-full items-center justify-center p-4 py-10">
            <div className={`p-8 rounded-3xl border shadow-2xl w-full max-w-2xl relative transition-colors ${theme === 'dark' ? 'bg-[#15171e] border-[#00e5ff]/30 shadow-[0_0_40px_rgba(0,229,255,0.15)]' : 'bg-white border-blue-200'}`}>
              
              <button onClick={() => setSelectedBookingDetails(null)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"><X size={24} /></button>
              <h2 className={`text-2xl font-black mb-1 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <CalendarDays size={24} className={theme==='dark'?'text-[#00e5ff]':'text-blue-500'}/> Booking #{selectedBookingDetails.id} Details
              </h2>
              <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Comprehensive view of reservation and financial data.</p>
            
            <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6">
              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1"><User size={12}/> Customer Info</p>
                <p className={`text-sm font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{getUserName(selectedBookingDetails.userId)}</p>
              </div>
              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1"><Car size={12}/> Vehicle Info</p>
                <p className={`text-sm font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{getVehicleInfo(selectedBookingDetails.vehicleId)}</p>
              </div>
              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1"><LayoutGrid size={12}/> Assigned Slot</p>
                <p className={`text-sm font-black ${theme === 'dark' ? 'text-[#00e5ff]' : 'text-blue-600'}`}>{getSlotNumber(selectedBookingDetails.slotId)}</p>
              </div>
              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Status</p>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  selectedBookingDetails.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 border border-green-500/30' :
                  selectedBookingDetails.status === 'ENTERED' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' :
                  'bg-blue-500/10 text-[#00e5ff] border border-blue-500/30'
                }`}>{selectedBookingDetails.status}</span>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border mb-6 ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
               <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-1"><Clock3 size={12}/> Time Schedule</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-700/50">
                 <div>
                   <span className={`text-[10px] uppercase tracking-wider block mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Scheduled Entry Time</span>
                   <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatDateDay(selectedBookingDetails.startTime)} {formatTime(selectedBookingDetails.startTime)}</span>
                 </div>
                 <div>
                   <span className={`text-[10px] uppercase tracking-wider block mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Scheduled Exit Time</span>
                   <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatDateDay(selectedBookingDetails.endTime)} {formatTime(selectedBookingDetails.endTime)}</span>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <span className={`text-[10px] uppercase tracking-wider block mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Actual Entry (Entered)</span>
                   {selectedBookingDetails.actualEntryTime ? (
                     <span className="text-sm font-bold text-green-500 flex items-center gap-1">
                       <CheckCircle size={14}/> {formatDateDay(selectedBookingDetails.actualEntryTime)} {formatTime(selectedBookingDetails.actualEntryTime)}
                     </span>
                   ) : (
                     <span className="text-sm font-bold text-gray-500">Pending</span>
                   )}
                 </div>
                 <div>
                   <span className={`text-[10px] uppercase tracking-wider block mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Actual Exit (Completed)</span>
                   {selectedBookingDetails.actualExitTime ? (
                     <span className="text-sm font-black text-red-500 flex items-center gap-1">
                       <ArrowRightLeft size={14}/> {formatDateDay(selectedBookingDetails.actualExitTime)} {formatTime(selectedBookingDetails.actualExitTime)}
                     </span>
                   ) : selectedBookingDetails.status === 'ENTERED' ? (
                     <span className="text-sm font-bold text-yellow-500 flex items-center gap-1">
                       <Car size={14}/> Inside Premises
                     </span>
                   ) : (
                     <span className="text-sm font-bold text-gray-500">Pending</span>
                   )}
                 </div>
               </div>
            </div>

            <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-green-500/5 border-green-500/20' : 'bg-green-50 border-green-200'}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-green-500 mb-3 flex items-center gap-1"><DollarSign size={12}/> Financials</p>
              <div className="flex justify-between items-center mb-2">
                 <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Base Amount Paid:</span>
                 <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Rs {(selectedBookingDetails.totalAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                 <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Overstay Fine (Penalty):</span>
                 <span className="text-sm font-bold text-red-500">Rs {(selectedBookingDetails.overstayFine || 0).toFixed(2)}</span>
              </div>
              <div className="w-full h-px bg-gray-500/20 mb-3"></div>
              <div className="flex justify-between items-center">
                 <span className="text-xs font-black uppercase tracking-wider text-green-500">Total Collected:</span>
                 <span className="text-2xl font-black text-green-500">Rs {((selectedBookingDetails.totalAmount || 0) + (selectedBookingDetails.overstayFine || 0)).toFixed(2)}</span>
              </div>
            </div>
            
            <button onClick={() => setSelectedBookingDetails(null)} className={`w-full py-4 mt-6 rounded-xl font-bold transition ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>Close Details</button>
          </div>
        </div>
      </div>
    )}

      {/* Delete SLOT Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
          <div className={`p-8 rounded-3xl border shadow-2xl w-full max-w-md relative text-center max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] transition-colors ${theme === 'dark' ? 'bg-[#15171e] border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.15)]' : 'bg-white border-red-200'}`}>
            <button onClick={() => { setShowDeleteModal(false); setSlotToDelete(null); }} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"><X size={24} /></button>
            
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${theme === 'dark' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-red-50 text-red-500 border-red-200'}`}>
              <AlertTriangle size={32} />
            </div>
            
            <h2 className={`text-2xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Delete Parking Slot</h2>
            <p className={`text-sm mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>How would you like to remove this slot from the system?</p>

            <div className="space-y-3">
              <button 
                onClick={() => executeDelete('SOFT')} 
                className={`w-full font-bold py-3 px-4 rounded-xl transition flex items-center justify-between group border ${theme === 'dark' ? 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border-yellow-500/30' : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-600 border-yellow-200'}`}
              >
                <span className="flex items-center gap-2"><Ban size={18} /> Soft Delete</span>
                <span className="text-[10px] opacity-0 group-hover:opacity-100 transition">(Keeps History)</span>
              </button>
              
              <button 
                onClick={() => executeDelete('HARD')} 
                className={`w-full font-bold py-3 px-4 rounded-xl transition flex items-center justify-between group border ${theme === 'dark' ? 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30' : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'}`}
              >
                <span className="flex items-center gap-2"><Trash2 size={18} /> Hard Delete</span>
                <span className="text-[10px] opacity-0 group-hover:opacity-100 transition">(Permanent)</span>
              </button>
              
              <button 
                onClick={() => { setShowDeleteModal(false); setSlotToDelete(null); }} 
                className={`w-full font-bold py-3 rounded-xl transition mt-4 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Slot Modal */}
      {showSlotModal && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
          <div className={`p-8 rounded-3xl border shadow-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] transition-colors ${theme === 'dark' ? 'bg-[#15171e] border-[#00e5ff]/30 shadow-[0_0_40px_rgba(0,229,255,0.15)]' : 'bg-white border-blue-200'}`}>
            <button onClick={() => setShowSlotModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"><X size={24} /></button>
            <h2 className={`text-2xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{currentSlot.id ? 'Edit Parking Slot' : 'Add New Slot'}</h2>
            
            <form onSubmit={handleSaveSlot} className="space-y-4 mt-6">
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Slot Number / ID</label>
                <input type="text" required value={currentSlot.slotNumber} onChange={(e) => setCurrentSlot({...currentSlot, slotNumber: e.target.value.toUpperCase()})} className={`w-full border px-4 py-3 rounded-xl focus:outline-none transition ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-700 text-white focus:border-[#00e5ff]' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'}`} placeholder="e.g., A10"/>
              </div>
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Location / Zone</label>
                <input type="text" required value={currentSlot.location} onChange={(e) => setCurrentSlot({...currentSlot, location: e.target.value})} className={`w-full border px-4 py-3 rounded-xl focus:outline-none transition ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-700 text-white focus:border-[#00e5ff]' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'}`} placeholder="e.g., Main Yard Floor 1"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Hourly Rate (Rs/hr)</label>
                  <input type="number" required value={currentSlot.price} onChange={(e) => setCurrentSlot({...currentSlot, price: parseFloat(e.target.value)})} className={`w-full border px-4 py-3 rounded-xl focus:outline-none transition ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-700 text-white focus:border-[#00e5ff]' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'}`}/>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Status Flag</label>
                  <select value={currentSlot.status} onChange={(e) => setCurrentSlot({...currentSlot, status: e.target.value})} className={`w-full border px-4 py-3 rounded-xl focus:outline-none transition cursor-pointer ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-700 text-white focus:border-[#00e5ff]' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'}`}>
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={isSaving} className={`w-full font-black py-4 rounded-xl transition-all mt-6 disabled:opacity-50 ${theme === 'dark' ? 'bg-[#00e5ff] hover:bg-[#00c3d9] text-black shadow-[0_0_15px_rgba(0,229,255,0.3)]' : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'}`}>{isSaving ? 'Saving Slot...' : 'Save Slot'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Price Update Modal */}
      {showBulkPriceModal && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
          <div className={`p-8 rounded-3xl border shadow-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] transition-colors ${theme === 'dark' ? 'bg-[#15171e] border-[#a855f7]/30 shadow-[0_0_40px_rgba(168,85,247,0.15)]' : 'bg-white border-purple-200'}`}>
            <button onClick={() => setShowBulkPriceModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"><X size={24} /></button>
            <h2 className={`text-2xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Bulk Price Update</h2>
            <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Set a uniform base price (First 6 hours) for ALL parking slots at once. The subsequent hourly rate will be calculated automatically.</p>

            <form onSubmit={handleBulkPriceUpdate} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>New Base Hourly Rate (Rs/hr)</label>
                <input type="number" min="0" step="0.01" required value={bulkPrice} onChange={(e) => setBulkPrice(e.target.value)} className={`w-full border px-4 py-3 rounded-xl focus:outline-none transition text-2xl font-black text-center ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-700 text-[#00e5ff] focus:border-[#a855f7]' : 'bg-gray-50 border-gray-300 text-blue-600 focus:border-purple-500'}`} placeholder="e.g., 100"/>
              </div>
              
              <button type="submit" disabled={isUpdatingBulkPrice} className="w-full bg-gradient-to-r from-[#a855f7] to-[#d946ef] hover:opacity-90 text-white font-black py-4 rounded-xl shadow-lg transition-all mt-6 disabled:opacity-50">
                {isUpdatingBulkPrice ? 'Updating All Slots...' : 'Update All Slots'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
          <div className={`p-8 rounded-3xl border shadow-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] transition-colors ${theme === 'dark' ? 'bg-[#15171e] border-[#a855f7]/30 shadow-[0_0_40px_rgba(168,85,247,0.15)]' : 'bg-white border-purple-200'}`}>
            <button onClick={() => setShowUserModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"><X size={24} /></button>
            <h2 className={`text-2xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Add New System User</h2>

            <form onSubmit={handleSaveUser} className="space-y-4 mt-6">
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Full Name</label>
                <input type="text" required value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className={`w-full border px-4 py-3 rounded-xl focus:outline-none transition ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-700 text-white focus:border-[#a855f7]' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500'}`} placeholder="e.g., John Doe"/>
              </div>
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Email Address</label>
                <input type="email" required value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className={`w-full border px-4 py-3 rounded-xl focus:outline-none transition ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-700 text-white focus:border-[#a855f7]' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500'}`} placeholder="e.g., staff@easypark.com"/>
              </div>
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Temporary Password</label>
                <input type="password" required value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className={`w-full border px-4 py-3 rounded-xl focus:outline-none transition ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-700 text-white focus:border-[#a855f7]' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500'}`} placeholder="Minimum 6 characters"/>
              </div>
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Role / Access Level</label>
                <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className={`w-full border px-4 py-3 rounded-xl focus:outline-none transition cursor-pointer ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-700 text-white focus:border-[#a855f7]' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500'}`}>
                  <option value="STAFF">STAFF (Basic access)</option>
                  <option value="ADMIN">ADMIN (Full access)</option>
                </select>
              </div>
              <button type="submit" disabled={isSavingUser} className="w-full bg-gradient-to-r from-[#a855f7] to-[#d946ef] hover:opacity-90 text-white font-black py-4 rounded-xl shadow-lg transition-all mt-6 disabled:opacity-50">
                {isSavingUser ? 'Adding User...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- NAVBAR WITH THEME TOGGLE BUTTON --- */}
      <nav className={`border-b px-8 py-4 flex justify-between items-center shadow-lg mb-8 transition-colors duration-300 ${theme === 'dark' ? 'bg-[#12141a] border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-blue-500 tracking-wide">EASY<span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>PARK</span></h1>
          <span className="bg-[#ff4757]/10 text-[#ff4757] border border-[#ff4757]/30 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase">Admin Portal</span>
        </div>
        <div className="flex items-center gap-4">
          
          {/* THEME TOGGLE SLIDER BUTTON */}
          <div 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`relative w-[72px] h-[36px] rounded-full cursor-pointer transition-all duration-500 flex items-center p-1 ${
              theme === 'dark' 
                ? 'bg-[#0b0c10] shadow-[inset_0px_2px_8px_rgba(0,0,0,0.8)] border border-gray-800' 
                : 'bg-[#e2e8f0] shadow-[inset_0px_2px_8px_rgba(0,0,0,0.1)] border border-gray-300'
            }`}
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <div className="absolute w-full flex justify-between px-2.5 left-0 pointer-events-none">
              <Sun size={14} className={`${theme === 'dark' ? 'text-gray-500' : 'opacity-0'} transition-opacity duration-300`} />
              <Moon size={14} className={`${theme === 'dark' ? 'opacity-0' : 'text-gray-500'} transition-opacity duration-300`} />
            </div>
            
            <div 
              className={`absolute w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 shadow-md ${
                theme === 'dark' 
                  ? 'translate-x-[34px] bg-[#1a1c23] shadow-[0_2px_5px_rgba(0,0,0,0.5)] border border-gray-700' 
                  : 'translate-x-0 bg-gradient-to-br from-[#ffc85a] to-[#ed8b00] shadow-[0_2px_8px_rgba(237,139,0,0.5)]'
              }`}
            >
              {theme === 'dark' ? <Moon size={14} className="text-gray-300" /> : <Sun size={14} className="text-white" />}
            </div>
          </div>

          <div className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border transition-colors ${theme === 'dark' ? 'text-gray-400 bg-[#1a1c23] border-gray-700' : 'text-gray-700 bg-gray-50 border-gray-200'}`}>
            <Shield size={16} className="text-[#ff4757]" /> {adminName}
          </div>
          <button onClick={handleLogout} className={`text-sm font-bold transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>Logout</button>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto px-6 space-y-8">
        
        {/* NEW STATS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className={`p-6 rounded-2xl border shadow-2xl flex items-center justify-between transition-colors ${theme === 'dark' ? 'bg-[#15171e] border-gray-800' : 'bg-white border-gray-100'}`}>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Users Breakdown</p>
              <h3 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{driverCount} <span className="text-lg text-gray-500 font-bold">Drivers</span></h3>
              <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-wider">STAFF & ADMINS: {staffCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center border border-blue-500/30"><Users size={24} /></div>
          </div>
          <div className={`p-6 rounded-2xl border shadow-2xl flex items-center justify-between transition-colors ${theme === 'dark' ? 'bg-[#15171e] border-gray-800' : 'bg-white border-gray-100'}`}>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Available / Active Slots</p>
              <h3 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}><span className="text-[#00e5ff]">{availableCount}</span> <span className="text-gray-500 text-2xl"> / {totalSlots}</span></h3>
              <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-wider">TOTAL SLOTS: {totalSlots} (Inc. Maint)</p>
            </div>
            <div className="w-12 h-12 bg-[#00e5ff]/10 text-[#00e5ff] rounded-xl flex items-center justify-center border border-[#00e5ff]/30"><Car size={24} /></div>
          </div>
          <div className={`p-6 rounded-2xl border shadow-2xl flex items-center justify-between transition-colors ${theme === 'dark' ? 'bg-[#15171e] border-gray-800' : 'bg-white border-gray-100'}`}>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Monthly Slot Hours</p>
              <h3 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}><span className="text-[#a855f7]">{totalBookedHours.toFixed(1)}</span> <span className="text-lg text-gray-500 font-bold">hrs</span></h3>
              <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-wider">DONE: {completedHours.toFixed(1)}h | PEND: {pendingHours.toFixed(1)}h</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 text-[#a855f7] rounded-xl flex items-center justify-center border border-purple-500/30"><Clock3 size={24} /></div>
          </div>
          <div className={`p-6 rounded-2xl border shadow-2xl flex items-center justify-between transition-colors ${theme === 'dark' ? 'bg-[#15171e] border-gray-800' : 'bg-white border-gray-100'}`}>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Under Maintenance</p>
              <h3 className="text-3xl font-black text-yellow-500">{maintenanceCount}</h3>
              <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-wider">MAINTENANCE SLOTS</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center border border-yellow-500/30"><Wrench size={24} /></div>
          </div>
        </div>

        <div className={`flex flex-wrap gap-4 border-b pb-2 transition-colors ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
          <button onClick={() => setActiveTab('slots')} className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-black transition-all ${activeTab === 'slots' ? (theme === 'dark' ? 'bg-[#15171e] text-[#00e5ff] border-t border-l border-r border-[#00e5ff]/30 shadow-[0_-10px_15px_rgba(0,229,255,0.05)]' : 'bg-white text-blue-600 border-t border-l border-r border-blue-200 shadow-sm') : 'bg-transparent text-gray-500 hover:text-gray-400'}`}> 
            <LayoutGrid size={18}/> Slot Management 
          </button>
          <button onClick={() => setActiveTab('bookings')} className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-black transition-all ${activeTab === 'bookings' ? (theme === 'dark' ? 'bg-[#15171e] text-green-500 border-t border-l border-r border-green-500/30 shadow-[0_-10px_15px_rgba(34,197,94,0.05)]' : 'bg-white text-green-600 border-t border-l border-r border-green-200 shadow-sm') : 'bg-transparent text-gray-500 hover:text-gray-400'}`}> 
            <CalendarDays size={18}/> Booking Management 
          </button>
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-black transition-all ${activeTab === 'users' ? (theme === 'dark' ? 'bg-[#15171e] text-[#a855f7] border-t border-l border-r border-[#a855f7]/30 shadow-[0_-10px_15px_rgba(168,85,247,0.05)]' : 'bg-white text-purple-600 border-t border-l border-r border-purple-200 shadow-sm') : 'bg-transparent text-gray-500 hover:text-gray-400'}`}> 
            <Users size={18}/> User Management 
          </button>
          <button onClick={() => setActiveTab('reviews')} className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-black transition-all ${activeTab === 'reviews' ? (theme === 'dark' ? 'bg-[#15171e] text-[#00e5ff] border-t border-l border-r border-[#00e5ff]/30 shadow-[0_-10px_15px_rgba(0,229,255,0.05)]' : 'bg-white text-blue-600 border-t border-l border-r border-blue-200 shadow-sm') : 'bg-transparent text-gray-500 hover:text-gray-400'}`}> 
            <MessageSquare size={18}/> Customer Reviews 
          </button>
          <button onClick={() => setActiveTab('reports')} className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-black transition-all ${activeTab === 'reports' ? (theme === 'dark' ? 'bg-[#15171e] text-[#00e5ff] border-t border-l border-r border-[#00e5ff]/30 shadow-[0_-10px_15px_rgba(0,229,255,0.05)]' : 'bg-white text-blue-600 border-t border-l border-r border-blue-200 shadow-sm') : 'bg-transparent text-gray-500 hover:text-gray-400'}`}> 
            <FileText size={18}/> Reports & Analytics 
          </button>
          <button onClick={() => setActiveTab('complaints')} className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-black transition-all ${activeTab === 'complaints' ? (theme === 'dark' ? 'bg-[#15171e] text-red-500 border-t border-l border-r border-red-500/30 shadow-[0_-10px_15px_rgba(239,68,68,0.05)]' : 'bg-white text-red-500 border-t border-l border-r border-red-200 shadow-sm') : 'bg-transparent text-gray-500 hover:text-red-400'}`}> 
            <AlertTriangle size={18}/> Complaints 
          </button>
        </div>

        {/* --- SLOT MANAGEMENT TAB --- */}
        {activeTab === 'slots' && (
          <div className={`rounded-b-2xl rounded-tr-2xl border p-8 shadow-2xl animate-fade-in -mt-2 transition-colors ${theme === 'dark' ? 'bg-[#15171e] border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div>
                <h2 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Parking Slot Management</h2>
                <p className="text-xs text-gray-400 mt-1">Add, update pricing, or manage slot statuses across the system</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button onClick={() => setShowBulkPriceModal(true)} className="bg-[#a855f7] hover:bg-[#9333ea] text-white font-black px-5 py-3 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.3)] transition flex items-center gap-2 text-sm">
                  💰 Set Price for All
                </button>
                <button onClick={openAddModal} className="bg-[#00e5ff] hover:bg-[#00c3d9] text-black font-black px-5 py-3 rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.3)] transition flex items-center gap-2 text-sm">
                  <Plus size={16} /> Add New Slot
                </button>
              </div>
            </div>

            {slots.length === 0 ? (
              <div className={`text-center py-12 border border-dashed rounded-xl font-bold ${theme === 'dark' ? 'text-gray-500 border-gray-700' : 'text-gray-400 border-gray-300'}`}>No parking slots found in the database. Add one to get started!</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {slots.map(slot => {
                  const isDeactivated = slot.active === false;
                  const displayStatus = slot.status === 'MAINTENANCE' ? 'MAINTENANCE' : 'AVAILABLE';

                  return (
                    <div key={slot.id} className={`p-5 rounded-xl flex flex-col justify-between transition border ${
                      isDeactivated 
                        ? (theme === 'dark' ? 'bg-[#0f1115] border-red-900/50 opacity-70' : 'bg-red-50 border-red-200 opacity-70') 
                        : (theme === 'dark' ? 'bg-[#1a1c23] border-gray-700 hover:border-[#00e5ff]' : 'bg-gray-50 border-gray-200 hover:border-blue-400')
                    }`}>
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className={`text-lg font-black ${isDeactivated ? 'text-gray-500 line-through' : (theme === 'dark' ? 'text-white' : 'text-gray-900')}`}>{slot.slotNumber}</span>
                          
                          {isDeactivated ? (
                            <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-red-900/30 text-red-500 border border-red-900/50">DEACTIVATED</span>
                          ) : (
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                              displayStatus === 'AVAILABLE' ? 'bg-cyan-500/10 text-[#00e5ff] border border-cyan-500/30' :
                              displayStatus === 'MAINTENANCE' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' :
                              'bg-red-500/10 text-[#ff4757] border border-red-500/30'
                            }`}>{displayStatus}</span>
                          )}
                        </div>
                        <p className={`text-xs mb-1 ${isDeactivated ? 'text-gray-500' : 'text-gray-400'}`}>📍 {slot.location}</p>
                        <p className={`text-sm font-bold mb-4 ${isDeactivated ? 'text-gray-500' : (theme === 'dark' ? 'text-[#00e5ff]' : 'text-blue-600')}`}>Rs {slot.price ? slot.price.toFixed(2) : '100.00'} / hr</p>
                      </div>
                      
                      <div className={`flex gap-2 border-t pt-3 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                        {isDeactivated ? (
                          <button onClick={() => handleRestoreSlot(slot)} className="w-full bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white border border-green-500/30 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2">
                            <RefreshCw size={14} /> Restore Slot
                          </button>
                        ) : (
                          <>
                            <button onClick={() => setCurrentSlot(slot) || setShowSlotModal(true)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}><Edit size={14} /> Edit</button>
                            <button onClick={() => handleToggleMaintenance(slot)} className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center ${displayStatus === 'MAINTENANCE' ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-white' : (theme === 'dark' ? 'bg-gray-800 hover:bg-yellow-500/20 hover:text-yellow-500 text-gray-400' : 'bg-gray-200 hover:bg-yellow-100 hover:text-yellow-600 text-gray-500')}`}><Wrench size={14} /></button>
                            <button onClick={() => handleDeleteClick(slot.id)} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center"><Trash2 size={14} /></button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- BOOKING MANAGEMENT TAB --- */}
        {activeTab === 'bookings' && (
          <div className={`rounded-b-2xl rounded-tr-2xl border p-8 shadow-2xl animate-fade-in -mt-2 transition-colors ${theme === 'dark' ? 'bg-[#15171e] border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Booking Management</h2>
                <p className="text-xs text-gray-400 mt-1">View comprehensive details of all bookings (Current Month by default)</p>
              </div>
              <div className={`flex items-center border rounded-xl px-4 py-2 w-full md:w-auto ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-700' : 'bg-gray-50 border-gray-300'}`}>
                <Search size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                <input 
                  type="text" 
                  placeholder="Search by Booking ID..." 
                  value={searchBookingId}
                  onChange={(e) => setSearchBookingId(e.target.value)}
                  className={`ml-2 bg-transparent border-none focus:outline-none text-sm w-full md:w-48 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                />
              </div>
            </div>

            <div className={`overflow-x-auto rounded-xl border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-xs uppercase tracking-wider ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-800 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                    <th className="p-4 font-black">ID</th>
                    <th className="p-4 font-black">User</th>
                    <th className="p-4 font-black">Slot</th>
                    <th className="p-4 font-black">Date</th>
                    <th className="p-4 font-black">Status</th>
                    <th className="p-4 font-black text-right">Total Paid</th>
                    <th className="p-4 font-black text-center">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-800 bg-[#15171e]' : 'divide-gray-200 bg-white'}`}>
                  {getDisplayedBookings().length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500 font-bold">No bookings found.</td>
                    </tr>
                  ) : (
                    getDisplayedBookings().map(booking => {
                      const baseAmt = booking.totalAmount || 0;
                      const fineAmt = booking.overstayFine || 0;
                      const totalPaid = baseAmt + fineAmt;
                      
                      return (
                        <tr key={booking.id} className={`transition ${theme === 'dark' ? 'hover:bg-[#1a1c23]/50' : 'hover:bg-gray-50'}`}>
                          <td className="p-4 text-sm font-bold text-gray-400">#{booking.id}</td>
                          <td className={`p-4 text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{getUserName(booking.userId)}</td>
                          <td className={`p-4 text-sm font-black ${theme === 'dark' ? 'text-[#00e5ff]' : 'text-blue-600'}`}>{getSlotNumber(booking.slotId)}</td>
                          <td className="p-4 text-sm text-gray-400">{formatDateDay(booking.startTime)}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                booking.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 border border-green-500/30' :
                                booking.status === 'ENTERED' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' :
                                'bg-blue-500/10 text-[#00e5ff] border border-blue-500/30'
                              }`}>{booking.status}
                            </span>
                          </td>
                          <td className="p-4 text-sm font-bold text-green-500 text-right">Rs {totalPaid.toFixed(2)}</td>
                          <td className="p-4 text-center">
                            <button 
                              onClick={() => setSelectedBookingDetails(booking)}
                              className="text-gray-400 hover:text-[#00e5ff] transition" title="View Full Details"
                            >
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- USER MANAGEMENT TAB --- */}
        {activeTab === 'users' && (
          <div className={`rounded-b-2xl rounded-tr-2xl border p-8 shadow-2xl animate-fade-in -mt-2 transition-colors ${theme === 'dark' ? 'bg-[#15171e] border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div>
                <h2 className={`text-xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>System Users</h2>
                <p className="text-xs text-gray-400">Manage all registered Admins, Staff, and Drivers (Block or Delete accounts)</p>
              </div>
              <button 
                onClick={openAddUserModal} 
                className="bg-[#a855f7] hover:bg-[#9333ea] text-white font-black px-5 py-3 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.3)] transition flex items-center gap-2 text-sm"
              >
                <Plus size={16} /> Add Staff / Admin
              </button>
            </div>
            
            <div className={`overflow-x-auto rounded-xl border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-xs uppercase tracking-wider ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-800 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                    <th className="p-4 font-black">ID</th>
                    <th className="p-4 font-black">Full Name</th>
                    <th className="p-4 font-black">Email Address</th>
                    <th className="p-4 font-black">Role / Access</th>
                    <th className="p-4 font-black">Account Status</th>
                    <th className="p-4 font-black text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-800 bg-[#15171e]' : 'divide-gray-200 bg-white'}`}>
                  {users.map(user => (
                    <tr key={user.id} className={`transition ${theme === 'dark' ? 'hover:bg-[#1a1c23]/50' : 'hover:bg-gray-50'}`}>
                      <td className="p-4 text-sm font-bold text-gray-400">#{user.id}</td>
                      <td className={`p-4 text-sm font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.name}</td>
                      <td className="p-4 text-sm text-gray-400">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center w-max gap-1.5 ${
                          user.role === 'SUPER_ADMIN' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/30' :
                          user.role === 'ADMIN' ? 'bg-red-500/10 text-[#ff4757] border border-red-500/30' :
                          user.role === 'STAFF' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' :
                          'bg-blue-500/10 text-[#00e5ff] border border-blue-500/30'
                        }`}>
                          <Shield size={10} /> {user.role || 'DRIVER'}
                        </span>
                      </td>
                      <td className="p-4">
                        {user.blocked ? (
                          <span className="text-xs font-bold text-red-500 flex items-center gap-1"><Ban size={14}/> Suspended</span>
                        ) : user.emailVerified ? (
                          <span className="text-xs font-bold text-green-500 flex items-center gap-1"><CheckCircle size={14}/> Active</span>
                        ) : (
                          <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><X size={14}/> Unverified</span>
                        )}
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        {user.role !== 'SUPER_ADMIN' && user.id !== parseInt(adminId) && (
                          <>
                            <button 
                              onClick={() => handleToggleBlockUser(user)} 
                              className={`p-2 rounded-lg transition ${user.blocked ? 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white' : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white'}`} 
                              title={user.blocked ? "Unblock User" : "Block User"}
                            >
                              {user.blocked ? <Unlock size={16} /> : <Ban size={16} />}
                            </button>
                            <button onClick={() => handleDeleteUser(user.id)} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-lg transition" title="Delete User">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- CUSTOMER REVIEWS TAB --- */}
        {activeTab === 'reviews' && (
          <div className={`rounded-b-2xl rounded-tr-2xl border p-8 shadow-2xl animate-fade-in -mt-2 transition-colors ${theme === 'dark' ? 'bg-[#15171e] border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
              <div>
                <h2 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Customer Feedback</h2>
                <p className="text-xs text-gray-400 mt-1">Monitor, filter, reply to, or delete driver reviews</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-gray-400 uppercase">Filter by Rating:</label>
                <select 
                  value={filterRating} 
                  onChange={(e) => setFilterRating(e.target.value)}
                  className={`border px-4 py-2 rounded-xl focus:outline-none cursor-pointer text-sm font-bold ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-700 text-white focus:border-[#00e5ff]' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'}`}
                >
                  <option value="ALL">All Reviews</option>
                  <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                  <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                  <option value="3">⭐⭐⭐ (3 Stars)</option>
                  <option value="2">⭐⭐ (2 Stars)</option>
                  <option value="1">⭐ (1 Star)</option>
                </select>
              </div>
            </div>

            {filteredReviews.length === 0 ? (
              <div className={`text-center py-12 border border-dashed rounded-xl font-bold flex flex-col items-center justify-center ${theme === 'dark' ? 'text-gray-500 border-gray-700' : 'text-gray-400 border-gray-300'}`}>
                <MessageSquare size={48} className="mb-4 opacity-50" />
                No reviews found for this criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredReviews.map(review => (
                  <div key={review.id} className={`border p-6 rounded-2xl flex flex-col transition shadow-lg relative group ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-700 hover:border-[#00e5ff]/50' : 'bg-gray-50 border-gray-200 hover:border-blue-300'}`}>
                    
                    <button 
                      onClick={() => handleDeleteReview(review.id)}
                      className={`absolute top-4 right-4 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${theme === 'dark' ? 'text-gray-600 hover:text-red-500 bg-[#0b0c10]' : 'text-gray-400 hover:text-red-500 bg-white shadow-sm'}`}
                      title="Delete Review"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="flex justify-between items-start mb-4 pr-8">
                      <div>
                        <h4 className={`font-black text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{review.userName || 'Driver'}</h4>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{formatDateDay(review.reviewDate)}</p>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? "text-[#ffd32a] fill-[#ffd32a]" : "text-gray-300"} />
                        ))}
                      </div>
                    </div>
                    
                    <p className={`text-sm italic mb-6 flex-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>"{review.comment}"</p>
                    
                    <div className={`mt-auto border-t pt-4 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                      {review.adminReply ? (
                        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
                          <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Shield size={12}/> Admin Response</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{review.adminReply}</p>
                        </div>
                      ) : (
                        replyingTo === review.id ? (
                          <div className="flex flex-col gap-2 animate-fade-in">
                            <textarea 
                              className={`w-full border px-3 py-2 rounded-lg focus:outline-none text-sm resize-none ${theme === 'dark' ? 'bg-[#0b0c10] border-gray-700 text-white focus:border-[#00e5ff]' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                              rows="2"
                              placeholder="Type your reply here..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                            ></textarea>
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setReplyingTo(null)} className="text-xs text-gray-400 hover:text-gray-500 px-3 py-1.5 transition">Cancel</button>
                              <button onClick={() => handleReplySubmit(review.id)} className="bg-[#00e5ff] hover:bg-[#00c3d9] text-black font-bold px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition"><Send size={12}/> Send Reply</button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => { setReplyingTo(review.id); setReplyText(''); }} 
                            className={`text-xs font-bold flex items-center gap-1.5 transition w-max ${theme === 'dark' ? 'text-gray-400 hover:text-[#00e5ff]' : 'text-gray-500 hover:text-blue-600'}`}
                          >
                            <Reply size={14} /> Reply to Customer
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- COMPLAINTS TAB --- */}
        {activeTab === 'complaints' && (
          <div className={`rounded-b-2xl rounded-tr-2xl border p-8 shadow-2xl animate-fade-in -mt-2 transition-colors ${theme === 'dark' ? 'bg-[#15171e] border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>System Complaints & Issues</h2>
                <p className="text-xs text-gray-400 mt-1">Review and resolve issues reported by staff at the gate</p>
              </div>
            </div>

            {complaints.length === 0 ? (
              <div className={`text-center py-12 border border-dashed rounded-xl font-bold flex flex-col items-center justify-center ${theme === 'dark' ? 'text-gray-500 border-gray-700' : 'text-gray-400 border-gray-300'}`}>
                <AlertTriangle size={48} className="mb-4 opacity-50" />
                No complaints found. Everything is running smoothly!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {complaints.map(complaint => (
                  <div key={complaint.id} className={`border p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-800 hover:border-red-500/50' : 'bg-gray-50 border-gray-200 hover:border-red-300'}`}>
                    <div className="flex-1">
                      
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className={`text-sm font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Issue #{complaint.id}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-md border shadow-sm ${theme === 'dark' ? 'text-gray-400 bg-[#0b0c10] border-gray-800' : 'text-gray-600 bg-white border-gray-200'}`}>Booking #{complaint.bookingId}</span>
                        
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md border flex items-center gap-1 shadow-sm ${theme === 'dark' ? 'text-[#00e5ff] bg-[#00e5ff]/10 border-[#00e5ff]/30' : 'text-blue-600 bg-blue-50 border-blue-200'}`}>
                          <User size={12} /> {getUserName(complaint.userId)}
                        </span>

                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          complaint.status === 'RESOLVED' ? 'bg-green-500/10 text-green-500 border border-green-500/30' : 'bg-red-500/10 text-red-500 border border-red-500/30'
                        }`}>
                          {complaint.status}
                        </span>
                      </div>

                      <p className={`text-sm italic mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>"{complaint.description}"</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-2">Reported Date: {formatDateDay(complaint.createdAt)}</p>
                    </div>
                    <div>
                      {complaint.status === 'PENDING' ? (
                        <button 
                          onClick={() => handleResolveComplaint(complaint)}
                          className="bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white border border-green-500/30 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap"
                        >
                          <CheckCircle size={14} /> Mark as Resolved
                        </button>
                      ) : (
                        <div className={`text-green-500 text-xs font-bold flex items-center gap-1 px-4 py-2 border border-green-500/20 rounded-lg ${theme === 'dark' ? 'bg-[#0b0c10]' : 'bg-green-50'}`}>
                          <CheckCircle size={14} /> Resolved
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- REPORTS TAB --- */}
        {activeTab === 'reports' && (
          <div className={`rounded-b-2xl rounded-tr-2xl border p-8 shadow-2xl animate-fade-in -mt-2 transition-colors ${theme === 'dark' ? 'bg-[#15171e] border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Revenue Analytics & Reports</h2>
                <p className="text-xs text-gray-400 mt-1">Track real-time system performance including overstay penalty collections.</p>
              </div>
              <button onClick={generatePDFReport} className={`font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2 text-sm border ${theme === 'dark' ? 'bg-[#1a1c23] hover:border-[#00e5ff] text-gray-300 border-gray-700' : 'bg-gray-50 hover:border-blue-400 text-gray-700 border-gray-300'}`}>
                <Download size={16} className={theme === 'dark' ? 'text-[#00e5ff]' : 'text-blue-500'} /> Export Report (PDF)
              </button>
            </div>

            {/* Total Revenue Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                 <p className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2 flex items-center gap-1"><DollarSign size={14}/> Total Base Revenue</p>
                 <h3 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Rs {totalBaseRevenue.toFixed(2)}</h3>
              </div>
              <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
                 <p className="text-xs font-bold uppercase text-red-500 tracking-wider mb-2 flex items-center gap-1"><AlertTriangle size={14}/> Overstay Fines</p>
                 <h3 className="text-3xl font-black text-red-500">Rs {totalOverstayFines.toFixed(2)}</h3>
              </div>
              <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#00e5ff]/5 border-[#00e5ff]/20' : 'bg-blue-50 border-blue-200'}`}>
                 <p className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1 ${theme === 'dark' ? 'text-[#00e5ff]' : 'text-blue-600'}`}><TrendingUp size={14}/> Grand Total Revenue</p>
                 <h3 className={`text-3xl font-black ${theme === 'dark' ? 'text-[#00e5ff]' : 'text-blue-600'}`}>Rs {grandTotalRevenue.toFixed(2)}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className={`border p-6 rounded-2xl ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <h3 className={`text-sm font-black mb-6 uppercase tracking-wider flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  <BarChart3 size={16} className={theme === 'dark' ? 'text-[#00e5ff]' : 'text-blue-500'} /> Weekly Revenue (Last 7 Days)
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#2d3748' : '#e2e8f0'} vertical={false} />
                      <XAxis dataKey="name" stroke={theme === 'dark' ? '#a0aec0' : '#718096'} fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke={theme === 'dark' ? '#a0aec0' : '#718096'} fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: theme === 'dark' ? '#2d3748' : '#e2e8f0', opacity: 0.4 }} />
                      <Bar dataKey="revenue" fill={theme === 'dark' ? '#00e5ff' : '#3b82f6'} radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={`border p-6 rounded-2xl ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <h3 className={`text-sm font-black mb-6 uppercase tracking-wider flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  <TrendingUp size={16} className={theme === 'dark' ? 'text-[#a855f7]' : 'text-purple-500'} /> Monthly Income (Last 6 Months)
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#2d3748' : '#e2e8f0'} vertical={false} />
                      <XAxis dataKey="name" stroke={theme === 'dark' ? '#a0aec0' : '#718096'} fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke={theme === 'dark' ? '#a0aec0' : '#718096'} fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: theme === 'dark' ? '#2d3748' : '#e2e8f0', opacity: 0.4 }} />
                      <Bar dataKey="revenue" fill={theme === 'dark' ? '#a855f7' : '#a855f7'} radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            <div className={`border p-6 rounded-2xl w-full lg:w-1/2 mx-auto ${theme === 'dark' ? 'bg-[#1a1c23] border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`text-sm font-black mb-2 uppercase tracking-wider flex items-center gap-2 justify-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                <Car size={16} className="text-[#ff4757]" /> Live Slot Utilization
              </h3>
              <div className="h-[300px] w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={slotStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {slotStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: theme === 'dark' ? '#1a1c23' : '#fff', borderColor: theme === 'dark' ? '#374151' : '#e2e8f0', borderRadius: '8px', color: theme === 'dark' ? '#fff' : '#000', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center pointer-events-none mt-4">
                  <p className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{slots.length}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Slots</p>
                </div>
              </div>
              <div className="flex justify-center gap-6 mt-4 text-xs font-bold text-gray-400">
                <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#00e5ff]"></div> Available ({availableCount})</span>
                <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#ff4757]"></div> Maint. ({maintenanceCount})</span>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;