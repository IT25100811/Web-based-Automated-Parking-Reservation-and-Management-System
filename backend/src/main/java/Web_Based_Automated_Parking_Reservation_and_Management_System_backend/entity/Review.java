package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Identifies the user who submitted the review.
    private Long userId;

    private String userName;

    private Long bookingId;

    // Represents the star rating given (1 to 5).
    private Integer rating;

    // The comment or feedback provided by the driver.
    // Validates that the comment is not empty and restricts it to a maximum of 1000 characters.
    @NotBlank(message = "Review comment cannot be empty")
    @Size(max = 1000, message = "Review comment must be 1000 characters or less")
    @Column(columnDefinition = "TEXT")
    private String comment;

    // Records the timestamp when the review was submitted.
    private LocalDateTime reviewDate;

    // Saves the reply provided by the administrator.
    @Column(columnDefinition = "TEXT")
    private String adminReply;
}