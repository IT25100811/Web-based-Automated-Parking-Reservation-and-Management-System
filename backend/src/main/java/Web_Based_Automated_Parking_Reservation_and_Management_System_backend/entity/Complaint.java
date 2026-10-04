package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
@Getter
@Setter
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long bookingId; // Link this to the booking.
    private Long userId;    // Link this to the user.

    @Column(length = 500)
    private String description;

    private String status = "PENDING"; // PENDING or RESOLVED
    private LocalDateTime createdAt = LocalDateTime.now();
}