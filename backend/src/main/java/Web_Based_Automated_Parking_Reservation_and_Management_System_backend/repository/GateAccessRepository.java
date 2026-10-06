package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.repository;

import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.GateAccess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GateAccessRepository extends JpaRepository<GateAccess, Long> {

    // Retrieves the exact access pass using the provided QR code
    GateAccess findByQrCode(String qrCode);

    // Retrieves the access pass associated with the specific booking.
    GateAccess findByReservationId(Long reservationId);
}
