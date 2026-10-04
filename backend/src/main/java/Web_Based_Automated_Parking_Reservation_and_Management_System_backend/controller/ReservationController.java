package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.controller;

import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.Reservation;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.GateAccess;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.service.ReservationService;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.repository.ReservationRepository;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.repository.GateAccessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

// This class handles all the web requests for parking reservations
@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "*") // Allows the frontend to connect without errors
public class ReservationController {

    private final ReservationService reservationService;
    private final ReservationRepository reservationRepository;
    private final GateAccessRepository gateAccessRepository;

    @Autowired
    public ReservationController(ReservationService reservationService,
                                 ReservationRepository reservationRepository,
                                 GateAccessRepository gateAccessRepository) {
        this.reservationService = reservationService;
        this.reservationRepository = reservationRepository;
        this.gateAccessRepository = gateAccessRepository;
    }

    // This method saves a new booking to the database
    @PostMapping("/create")
    public ResponseEntity<Reservation> createReservation(@RequestBody Reservation reservation) {
        return ResponseEntity.ok(reservationService.createReservation(reservation));
    }

    // This method gets all the bookings from the database
    @GetMapping("/all")
    public ResponseEntity<List<Reservation>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    // This method gets bookings only for a specific user using their user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Reservation>> getUserReservations(@PathVariable Long userId) {
        return ResponseEntity.ok(reservationService.getReservationsByUserId(userId));
    }

    // This method updates the status of a booking (like CONFIRMED or CANCELLED)
    @PutMapping("/{id}/status")
    public ResponseEntity<Reservation> updateStatus(@PathVariable Long id, @RequestParam String status) {
        Reservation updatedReservation = reservationService.updateReservationStatus(id, status);
        if (updatedReservation != null) {
            return ResponseEntity.ok(updatedReservation);
        }
        return ResponseEntity.notFound().build();
    }

    // This method deletes a booking using its ID
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteReservation(@PathVariable Long id) {
        reservationService.deleteReservation(id);
        return ResponseEntity.ok("Booking cancelled successfully");
    }

    // Reschedule Update Endpoint Eka
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateReservation(@PathVariable Long id, @RequestBody Reservation updatedData) {

        Optional<Reservation> optionalReservation = reservationRepository.findById(id);

        if (!optionalReservation.isPresent()) {
            return ResponseEntity.badRequest().body("Reservation not found!");
        }

        Reservation existing = optionalReservation.get();

        // Update ONLY the slot and time. Do NOT change ID or User
        existing.setSlotId(updatedData.getSlotId());
        existing.setStartTime(updatedData.getStartTime());
        existing.setEndTime(updatedData.getEndTime());

        reservationRepository.save(existing);
        return ResponseEntity.ok("Updated successfully");
    }

    //Endpoint to mark vehicle entry with the current system time.
    @PutMapping("/enter/{id}")
    public ResponseEntity<?> markEntry(@PathVariable Long id) {

        Optional<Reservation> optionalReservation = reservationRepository.findById(id);

        if (!optionalReservation.isPresent()) {
            return ResponseEntity.badRequest().body("Reservation not found!");
        }

        Reservation existing = optionalReservation.get();
        existing.setStatus("ENTERED");

        // THIS IS WHERE THE LIVE ENTRY TIME IS SAVED!
        existing.setActualEntryTime(java.time.LocalDateTime.now());
        reservationRepository.save(existing);

        // Create a GateAccess record.
        GateAccess gateAccess = gateAccessRepository.findByReservationId(id);
        if (gateAccess == null) {
            gateAccess = new GateAccess();
            gateAccess.setReservationId(id);
            gateAccess.setQrCode(String.valueOf(id)); // Embed the Booking ID into the QR code.
        }
        gateAccess.setAccessStatus("1"); // Set the entry status to 1.
        gateAccess.setEntryTime(existing.getActualEntryTime()); // Get the exact time from the reservation.
        gateAccessRepository.save(gateAccess);

        return ResponseEntity.ok(existing);
    }

    // Vehicle Exit (Live Time) and Overstay Fine Save Karana Endpoint eka
    @PutMapping("/exit/{id}")
    public ResponseEntity<?> markExit(@PathVariable Long id, @RequestBody Map<String, Object> payload) {

        Optional<Reservation> optionalReservation = reservationRepository.findById(id);

        if (!optionalReservation.isPresent()) {
            return ResponseEntity.badRequest().body("Reservation not found!");
        }

        Reservation existing = optionalReservation.get();
        existing.setStatus("COMPLETED");

        // THIS IS WHERE THE LIVE EXIT TIME IS SAVED!
        existing.setActualExitTime(java.time.LocalDateTime.now());

        // Extract the overstayFine from the payload and save it to the database.
        if (payload.containsKey("overstayFine")) {
            existing.setOverstayFine(Double.valueOf(payload.get("overstayFine").toString()));
        }
        reservationRepository.save(existing);

        //GateAccess Record Update
        GateAccess gateAccess = gateAccessRepository.findByReservationId(id);
        if (gateAccess == null) {
            gateAccess = new GateAccess();
            gateAccess.setReservationId(id);
            gateAccess.setQrCode(String.valueOf(id)); // Inject the Booking ID into the QR code.
        }
        gateAccess.setAccessStatus("0"); // Set the exit status to 0.
        gateAccess.setExitTime(existing.getActualExitTime()); // Use the exact time from the existing reservation.
        gateAccessRepository.save(gateAccess);

        return ResponseEntity.ok(existing);
    }
}