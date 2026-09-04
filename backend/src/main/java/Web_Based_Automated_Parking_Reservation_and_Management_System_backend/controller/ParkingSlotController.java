package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.controller;

import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.ParkingSlot;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.service.ParkingSlotService;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.repository.ParkingSlotRepository;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/slots")
@CrossOrigin(origins = "*")
public class ParkingSlotController {

    private final ParkingSlotService slotService;
    private final ParkingSlotRepository parkingSlotRepository;
    private final ReservationRepository reservationRepository;

    @Autowired
    public ParkingSlotController(ParkingSlotService slotService,
                                 ParkingSlotRepository parkingSlotRepository,
                                 ReservationRepository reservationRepository) {
        this.slotService = slotService;
        this.parkingSlotRepository = parkingSlotRepository;
        this.reservationRepository = reservationRepository;
    }

    // Allows an administrator to add a new parking slot.
    @PostMapping("/add")
    public ResponseEntity<ParkingSlot> addSlot(@RequestBody ParkingSlot slot) {
        return ResponseEntity.ok(slotService.addSlot(slot));
    }

    // Allows an administrator to view all slots.
    @GetMapping("/all")
    public ResponseEntity<List<ParkingSlot>> getAllSlots() {
        // UI ekata yawanne Active (makapu nathi) slots witharai
        return ResponseEntity.ok(parkingSlotRepository.findAll());
    }

    // Allows drivers to view currently available slots.
    @GetMapping("/available")
    public ResponseEntity<List<ParkingSlot>> getAvailableSlots() {
        return ResponseEntity.ok(slotService.getAvailableSlots());
    }

    // Allows an administrator to update the status of a slot.
    @PutMapping("/{id}/status")
    public ResponseEntity<ParkingSlot> updateStatus(@PathVariable Long id, @RequestParam String status) {
        ParkingSlot updatedSlot = slotService.updateSlotStatus(id, status);
        if (updatedSlot != null) {
            return ResponseEntity.ok(updatedSlot);
        }
        return ResponseEntity.notFound().build();
    }

    // Endpoint to update price for ALL slots at once
    @PutMapping("/update-price-all")
    public org.springframework.http.ResponseEntity<String> updateAllPrices(@RequestParam double price) {
        slotService.updateAllSlotPrices(price);
        return org.springframework.http.ResponseEntity.ok("All slot prices updated successfully!");
    }

    // NEW DELETE API (Soft & Hard Delete)
    @DeleteMapping("/delete/{id}")
    @Transactional
    public ResponseEntity<?> deleteSlot(@PathVariable Long id, @RequestParam(defaultValue = "false") boolean hardDelete) {

        if (hardDelete) {
            // === OPTION 1: PERMANENT (HARD) DELETE ===
            // First, delete all bookings related to the slot to avoid Foreign Key errors.
            reservationRepository.deleteBySlotId(id);

            // Then, completely delete the slot from the database.
            parkingSlotRepository.deleteById(id);
            return ResponseEntity.ok("Slot and all past records permanently deleted.");

        } else {
            // === OPTION 2: SOFT DELETE ===
            // Check if there is a currently active reservation.
            boolean hasActiveReservations = reservationRepository.existsBySlotIdAndStatus(id, "CONFIRMED");

            if (hasActiveReservations) {
                return ResponseEntity.badRequest().body("Cannot delete this slot. It is currently reserved.");
            }

            Optional<ParkingSlot> slotOptional = parkingSlotRepository.findById(id);
            if (slotOptional.isPresent()) {
                ParkingSlot slot = slotOptional.get();
                slot.setActive(false); // Set isActive to false instead of deleting the record from the database.
                parkingSlotRepository.save(slot);
                return ResponseEntity.ok("Slot deactivated successfully. Past history is safe.");
            }
            return ResponseEntity.notFound().build();
        }
    }
}