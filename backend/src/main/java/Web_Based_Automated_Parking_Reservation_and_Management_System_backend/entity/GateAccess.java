package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "gate_access")
@Getter
@Setter
public class GateAccess {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Identifies the specific booking associated with this request.
    @Column(nullable = false)
    private Long reservationId;

    // The QR code string scanned at the gate.
    @Column(unique = true)
    private String qrCode;

    // Records the entry and exit timestamps.
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;

    // PENDING, CHECKED_IN, CHECKED_OUT
    private String accessStatus = "PENDING";
}