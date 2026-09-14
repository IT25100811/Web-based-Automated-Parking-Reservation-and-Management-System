package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.reservation;

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

        // IDs to identify the user, vehicle and parking slot.
        @Column(nullable = false)
        private Long userId;

        @Column(nullable = false)
        private Long vehicleId;

        @Column(nullable = false)
        private Long slotId;

        // Booking start time and end time.
        @Column(nullable = false)
        private LocalDateTime startTime;

        @Column(nullable = false)
        private LocalDateTime endTime;

        // Reservation status : PENDING, CONFIRMED, CANCELLED.
        private String status = "PENDING";

        // Total amount to be paid.
        private Double totalAmount;
    }

