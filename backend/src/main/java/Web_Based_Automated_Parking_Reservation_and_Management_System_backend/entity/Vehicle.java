package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

// This class represents the Vehicle table in the database
@Entity
@Table(name = "vehicles")
@Getter
@Setter
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The license plate cannot be blank and must follow a specific format (e.g., ABC-1234)
    @NotBlank(message = "License plate is required")
    @Pattern(regexp = "^[A-Z0-9]{2,3}-[0-9]{4}$", message = "Invalid format! Use format like ABC-1234")
    @Column(name = "license_plate", unique = true, nullable = false)
    private String licensePlate;

    // The vehicle make (brand) cannot be empty, must be 2-30 characters, and no numbers
    @NotBlank(message = "Vehicle make is required")
    @Size(min = 2, max = 30, message = "Make must be between 2 and 30 characters")
    @Pattern(regexp = "^[a-zA-Z\\s]+$", message = "Brand name cannot contain numbers")
    @Column(nullable = false)
    private String make;

    // The vehicle color is required
    @NotBlank(message = "Vehicle color is required")
    @Column(nullable = false)
    private String color;

    // The vehicle type (e.g., Car, Van, Bike, SUV) is required
    @NotBlank(message = "Vehicle type is required")
    @Pattern(regexp = "^(Car|Bike|Van|Electric Vehicle \\(EV\\)|SUV)$", message = "Invalid vehicle type! Please select a valid category.")
    @Column(name = "vehicle_type", nullable = false)
    private String vehicleType;

    // Every vehicle must belong to a registered user
    @NotNull(message = "User ID is required")
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // The default status of a newly added vehicle is ACTIVE
    @Column(name = "status")
    private String status = "ACTIVE";
}