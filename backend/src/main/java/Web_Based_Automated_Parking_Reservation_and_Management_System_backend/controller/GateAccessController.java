package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.controller;

import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.GateAccess;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.service.GateAccessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gate")
@CrossOrigin(origins = "*")
public class GateAccessController {

    private final GateAccessService gateAccessService;

    @Autowired
    public GateAccessController(GateAccessService gateAccessService) {
        this.gateAccessService = gateAccessService;
    }

    // API endpoint to generate the pass.
    @PostMapping("/generate/{reservationId}")
    public ResponseEntity<GateAccess> generatePass(@PathVariable Long reservationId) {
        return ResponseEntity.ok(gateAccessService.generateGatePass(reservationId));
    }

    // API endpoint for gate check-in via QR code scanning.
    @PostMapping("/checkin")
    public ResponseEntity<String> checkIn(@RequestParam String qrCode) {
        GateAccess result = gateAccessService.checkIn(qrCode);
        if (result != null) {
            return ResponseEntity.ok("Check-in successful! Gate Opening...");
        }
        return ResponseEntity.badRequest().body("Invalid QR Code or already checked in.");
    }

    // API endpoint for gate check-out via QR code scanning.
    @PostMapping("/checkout")
    public ResponseEntity<String> checkOut(@RequestParam String qrCode) {
        GateAccess result = gateAccessService.checkOut(qrCode);
        if (result != null) {
            return ResponseEntity.ok("Check-out successful! Gate Opening...");
        }
        return ResponseEntity.badRequest().body("Invalid QR Code or not checked in.");
    }
}
