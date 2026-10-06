package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.service;

import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.Reservation;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.util.List;
import java.time.Duration;
import java.time.LocalDateTime;

import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.ParkingSlot;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.repository.ParkingSlotRepository;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.User;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.repository.UserRepository;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.Vehicle;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.repository.VehicleRepository;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final EmailService emailService;

    @Autowired
    public ReservationService(ReservationRepository reservationRepository,
                              ParkingSlotRepository parkingSlotRepository,
                              UserRepository userRepository,
                              VehicleRepository vehicleRepository,
                              EmailService emailService) {
        this.reservationRepository = reservationRepository;
        this.parkingSlotRepository = parkingSlotRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.emailService = emailService;
    }

    // This method creates a new booking in the system
    public Reservation createReservation(Reservation reservation) {

        Duration duration = Duration.between(reservation.getStartTime(), reservation.getEndTime());
        double hours = Math.ceil(duration.toMinutes() / 60.0);

        double hourlyRate = 500.00;
        ParkingSlot slot = null;

        if (reservation.getSlotId() != null) {
            slot = parkingSlotRepository.findById(reservation.getSlotId()).orElse(null);
            if (slot != null && slot.getPrice() != null) {
                hourlyRate = slot.getPrice();
            }
        }

        double calculatedPrice = hours * hourlyRate;
        reservation.setTotalAmount(calculatedPrice);

        Reservation savedReservation = reservationRepository.save(reservation);

        // Sends the email receipt to the user
        if (reservation.getUserId() != null && slot != null) {
            User user = userRepository.findById(reservation.getUserId()).orElse(null);

            String vehiclePlate = "Unknown Vehicle";
            if (reservation.getVehicleId() != null) {
                Vehicle vehicle = vehicleRepository.findById(reservation.getVehicleId()).orElse(null);
                if (vehicle != null) {
                    vehiclePlate = vehicle.getLicensePlate();
                }
            }

            if (user != null) {
                try {
                    emailService.sendBookingReceipt(
                            user.getEmail(),
                            user.getName(),
                            slot.getSlotNumber(),
                            vehiclePlate,
                            reservation.getStartTime().toString(),
                            reservation.getEndTime().toString(),
                            calculatedPrice,
                            savedReservation.getId()
                    );
                    System.out.println("✅ Booking Receipt Email sent successfully to: " + user.getEmail());
                } catch (Exception e) {
                    System.out.println("❌ Failed to send email! Reason: " + e.getMessage());
                }
            }
        }

        return savedReservation;
    }

    // This method gets all bookings from the database
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    // This method gets bookings for a specific user
    public List<Reservation> getReservationsByUserId(Long userId) {
        return reservationRepository.findByUserId(userId);
    }

    // This method updates the status of a booking
    public Reservation updateReservationStatus(Long id, String status) {
        Reservation reservation = reservationRepository.findById(id).orElse(null);
        if (reservation != null) {
            reservation.setStatus(status);
            return reservationRepository.save(reservation);
        }
        return null;
    }

    // This method deletes a booking
    public void deleteReservation(Long id) {
        // Slot is always 'AVAILABLE' now, so we only need to delete the booking
        reservationRepository.deleteById(id);
    }

    // This method automatically completes expired bookings
    @Scheduled(fixedRate = 60000) // Automatically runs a check every 1 minute
    public void autoReleaseExpiredSlots() {
        List<Reservation> allReservations = reservationRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        for (Reservation res : allReservations) {
            // Checks if the end time is earlier than the current time
            if (res.getEndTime() != null && res.getEndTime().isBefore(now) && "CONFIRMED".equals(res.getStatus())) {

                // Updates the booking history status to COMPLETED
                res.setStatus("COMPLETED");
                reservationRepository.save(res);
                System.out.println("🔄 Auto-completed expired booking ID: " + res.getId());
            }
        }
    }
}