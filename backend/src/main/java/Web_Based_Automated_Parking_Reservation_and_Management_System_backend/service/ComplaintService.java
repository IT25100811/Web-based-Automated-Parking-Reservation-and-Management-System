package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.service;

import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.Complaint;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;

    @Autowired
    public ComplaintService(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    // Save a new complaint.
    public Complaint addComplaint(Complaint complaint) {
        return complaintRepository.save(complaint);
    }

    // Find the complaint by Booking ID (for Staff/User UI).
    public Optional<Complaint> getComplaintByBookingId(Long bookingId) {
        return complaintRepository.findByBookingId(bookingId);
    }

    // Get all complaints (for the Admin UI).
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    // Edit the complaint or set the status to "RESOLVED".
    public Complaint updateComplaint(Long id, Complaint updatedComplaint) {
        return complaintRepository.findById(id).map(existingComplaint -> {
            existingComplaint.setDescription(updatedComplaint.getDescription());
            existingComplaint.setStatus(updatedComplaint.getStatus());
            return complaintRepository.save(existingComplaint);
        }).orElse(null);
    }

    // Delete the complaint from the database.
    public boolean deleteComplaint(Long id) {
        if (complaintRepository.existsById(id)) {
            complaintRepository.deleteById(id);
            return true;
        }
        return false;
    }
}