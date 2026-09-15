package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.slot;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "parking_slots")
@Getter
@Setter
public class ParkingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Slot number is required")
    @Column(name = "slot_number", unique = true, nullable = false)
    private String slotNumber; // for example: "A1", "B5"

    // AVAILABLE, BOOKED, MAINTENANCE - one of them
    @Column(nullable = false)
    private String status = "AVAILABLE";

    // newly added: save the hourly rate given by Admin to the database
    @Column(name = "price")
    private Double price;

}