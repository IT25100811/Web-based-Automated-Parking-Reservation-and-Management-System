package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.service;

import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.Vehicle;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    @Autowired
    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    // Saves a new vehicle to the database.
    public Vehicle saveVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    // Retrieves all vehicle records stored in the database.
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    // Retrieves a specific vehicle record by its unique ID.
    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id).orElse(null);
    }

    // Deletes a vehicle record from the system.
    public void deleteVehicle(Long id) {
        vehicleRepository.deleteById(id);
    }
}
