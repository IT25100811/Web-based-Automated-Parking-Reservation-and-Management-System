package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.service;

import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.ParkingSlot;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.repository.ParkingSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ParkingSlotService {

    private final ParkingSlotRepository slotRepository;

    @Autowired
    public ParkingSlotService(ParkingSlotRepository slotRepository) {
        this.slotRepository = slotRepository;
    }

    // 1. Allows an administrator to add a new slot.
    public ParkingSlot addSlot(ParkingSlot slot) {
        return slotRepository.save(slot);
    }

    // 2. Retrieves all slots for display on the admin dashboard.
    public List<ParkingSlot> getAllSlots() {
        return slotRepository.findAll();
    }

    // 3. Retrieves only the available slots for drivers to make a booking
    public List<ParkingSlot> getAvailableSlots() {
        return slotRepository.findByStatus("AVAILABLE");
    }

    // 4. Allows an administrator to update a slot's status to maintenance or booked (e.g., for maintenance blocking).
    public ParkingSlot updateSlotStatus(Long id, String newStatus) {
        ParkingSlot slot = slotRepository.findById(id).orElse(null);
        if (slot != null) {
            slot.setStatus(newStatus);
            return slotRepository.save(slot);
        }
        return null;
    }
    // 5. Method to update price for ALL slots
    public void updateAllSlotPrices(double price) {
        List<ParkingSlot> slots = slotRepository.findAll();
        for (ParkingSlot slot : slots) {
            slot.setPrice(price);
        }
        slotRepository.saveAll(slots);
    }
}
