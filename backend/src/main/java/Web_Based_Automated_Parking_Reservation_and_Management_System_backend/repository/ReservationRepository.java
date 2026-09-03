package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.repository;

import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // Retrieves all bookings for a specific user by their ID.
    List<Reservation> findByUserId(Long userId);

    // Check if there are any active bookings before soft deleting.
    boolean existsBySlotIdAndStatus(Long parkingSlotId, String status);

    // Delete all related bookings from the database when performing a permanent hard delete.
    @Transactional
    void deleteBySlotId(Long parkingSlotId);
}
