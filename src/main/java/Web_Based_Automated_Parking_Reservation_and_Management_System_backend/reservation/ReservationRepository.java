package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.reservation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

    @Repository
    public interface ReservationRepository extends JpaRepository<Reservation, Long> {

        // Find all bookings by a user ID.
        List<Reservation> findByUserId(Long userId);
    }
