package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.repository;

import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    Optional<Complaint> findByBookingId(Long bookingId);
}