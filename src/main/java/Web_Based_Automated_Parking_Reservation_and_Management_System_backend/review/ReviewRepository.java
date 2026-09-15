package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

    @Repository
    public interface ReviewRepository extends JpaRepository<Review, Long> {
        // Find the users review
        List<Review> findByUserId(Long userId);
    }