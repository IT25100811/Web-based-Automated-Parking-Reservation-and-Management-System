package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity;

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
    private String slotNumber;

    // Represents the status, which can only be AVAILABLE, BOOKED, or MAINTENANCE.
    @Column(nullable = false)
    private String status = "AVAILABLE";

    // Saves the hourly rate (price) set by the admin into the database.
    @Column(name = "price")
    private Double price;


    // Soft delete
    @Column(name = "is_active", columnDefinition = "boolean default true")
    private boolean active = true;

}

