package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.vehicle;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "License plate is required")
    @Column(name = "license_plate", unique = true, nullable = false)
    private String licensePlate;

    @NotBlank(message = "Vehicle make is required")
    @Column(nullable = false)
    private String make;

    @NotBlank(message = "Vehicle color is required")
    @Column(nullable = false)
    private String color;

    @NotBlank(message = "Vehicle type is required")
    @Column(name = "vehicle_type", nullable = false)
    private String vehicleType;

    @NotNull(message = "User ID is required")
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "status")
    private String status = "ACTIVE";
}