package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.vehicle;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    // Custom method to retrieve only vehicles with an ACTIVE status.
    List<Vehicle> findByStatus(String status);
}

