package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.controller;

import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.Complaint;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "http://localhost:5173") // React frontend port eka
public class ComplaintController {

    private final ComplaintService complaintService;

    @Autowired
    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    // POST http://localhost:8080/api/complaints/add
    @PostMapping("/add")
    public ResponseEntity<Complaint> addComplaint(@RequestBody Complaint complaint) {
        Complaint savedComplaint = complaintService.addComplaint(complaint);
        return ResponseEntity.ok(savedComplaint);
    }

    // GET http://localhost:8080/api/complaints/booking/{bookingId}
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<Complaint> getComplaintByBookingId(@PathVariable Long bookingId) {
        Optional<Complaint> complaint = complaintService.getComplaintByBookingId(bookingId);
        return complaint.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // GET http://localhost:8080/api/complaints/all
    @GetMapping("/all")
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    // PUT http://localhost:8080/api/complaints/update/{id}
    @PutMapping("/update/{id}")
    public ResponseEntity<Complaint> updateComplaint(@PathVariable Long id, @RequestBody Complaint complaint) {
        Complaint updated = complaintService.updateComplaint(id, complaint);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    // DELETE http://localhost:8080/api/complaints/delete/{id}
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteComplaint(@PathVariable Long id) {
        boolean deleted = complaintService.deleteComplaint(id);
        if (deleted) {
            return ResponseEntity.ok("Complaint deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }
}