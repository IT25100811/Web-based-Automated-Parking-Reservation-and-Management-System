package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank(message = "Password is required")
    private String password;



    // Identifies the user's role to determine whether they are a DRIVER, ADMIN, or STAFF.
    private String role = "DRIVER";

    // Indicates whether the user's email has been verified (defaults to false).
    private boolean isEmailVerified = false;

    // Stores the OTP code that was sent to the user's email for verification.
    private String otpCode;

    private boolean blocked = false;


}
