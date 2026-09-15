package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.review;

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

    // Who's posted the review
    private Long userId;

    private String userName;

    private Long bookingId;

    // How many stars given (1-5)
    private Integer rating;

    // Users comments
    @Column(columnDefinition = "TEXT")
    private String comment;

    // Time review posted
    private LocalDateTime reviewDate;

    // Admin's reply
    @Column(columnDefinition = "TEXT")
    private String adminReply;
}
