package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity;



import jakarta.persistence.*;
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
    @Column(columnDefinition = "TEXT")
    private String comment;

    // Records the timestamp when the review was submitted.
    private LocalDateTime reviewDate;

    //  Saves the reply provided by the administrator.
    @Column(columnDefinition = "TEXT")
    private String adminReply;
}


