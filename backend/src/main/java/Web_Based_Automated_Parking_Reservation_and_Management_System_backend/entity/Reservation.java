package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
@Getter
@Setter
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // IDs used to identify the associated user, vehicle, and parking slot.
    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long vehicleId;

    @Column(nullable = false)
    private Long slotId;

    // Specifies the start and end times for the booking.
    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    // Maintains the current status (e.g., PENDING, CONFIRMED, CANCELLED, ENTERED, COMPLETED).
    private String status = "PENDING";

    // The total amount to be paid.
    private Double totalAmount;

    // The fine calculated for overstaying past the booking time
    @Column(name = "overstay_fine")
    private Double overstayFine = 0.0;

    // ALUTH: Vehicle eka athulata ena live time eka
    @Column(name = "actual_entry_time")
    private LocalDateTime actualEntryTime;

    // ALUTH: Vehicle eka eliyata yana live time eka
    @Column(name = "actual_exit_time")
    private LocalDateTime actualExitTime;
}