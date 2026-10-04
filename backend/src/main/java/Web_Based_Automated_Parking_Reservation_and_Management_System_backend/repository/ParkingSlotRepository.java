package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.repository;

import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.ParkingSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {

    // Retrieves only the available slots, which are required when a driver makes a booking.
    List<ParkingSlot> findByStatus(String status);

    // Get all active (non-deleted) slots.
    List<ParkingSlot> findByActiveTrue();
}

