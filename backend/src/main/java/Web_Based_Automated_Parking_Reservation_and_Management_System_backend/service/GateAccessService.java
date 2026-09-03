package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.service;

import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.GateAccess;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.repository.GateAccessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class GateAccessService {

    private final GateAccessRepository gateAccessRepository;

    @Autowired
    public GateAccessService(GateAccessRepository gateAccessRepository) {
        this.gateAccessRepository = gateAccessRepository;
    }

    // 1. Generates a new QR pass upon successful booking.
    public GateAccess generateGatePass(Long reservationId) {
        GateAccess gateAccess = new GateAccess();
        gateAccess.setReservationId(reservationId);

        // Automatically generates a random string for the QR code.
        gateAccess.setQrCode("QR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        return gateAccessRepository.save(gateAccess);
    }

    // 2. Processes the vehicle check-in upon arrival via QR scan.
    public GateAccess checkIn(String qrCode) {
        GateAccess gateAccess = gateAccessRepository.findByQrCode(qrCode);

        // Grants access only if the QR code is valid and not already checked in.
        if (gateAccess != null && "PENDING".equals(gateAccess.getAccessStatus())) {
            gateAccess.setEntryTime(LocalDateTime.now());
            gateAccess.setAccessStatus("CHECKED_IN");
            return gateAccessRepository.save(gateAccess);
        }
        return null; // Returns null if the QR code is invalid
    }

    // 3. Processes the vehicle check-out upon departure.
    public GateAccess checkOut(String qrCode) {
        GateAccess gateAccess = gateAccessRepository.findByQrCode(qrCode);

        // Allows check-out only if the vehicle is currently inside the premises.
        if (gateAccess != null && "CHECKED_IN".equals(gateAccess.getAccessStatus())) {
            gateAccess.setExitTime(LocalDateTime.now());
            gateAccess.setAccessStatus("CHECKED_OUT");
            return gateAccessRepository.save(gateAccess);
        }
        return null;
    }
}