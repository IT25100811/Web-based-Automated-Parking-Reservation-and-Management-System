package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.service;

import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.Review;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.User;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository; // Retrieves the email address for a specific user.
    private final JavaMailSender mailSender; // Sends the email.

    // Constructor Injection (Best Practice)
    @Autowired
    public ReviewService(ReviewRepository reviewRepository, UserRepository userRepository, JavaMailSender mailSender) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.mailSender = mailSender;
    }

    public Review addReview(Review review) {
        review.setReviewDate(LocalDateTime.now()); // Automatically sets the current timestamp.
        return reviewRepository.save(review);
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }

    // Allows a user to edit their review (UC-05 Extension).
    public Review updateReview(Long id, Review updatedData) {
        Optional<Review> existing = reviewRepository.findById(id);
        if (existing.isPresent()) {
            Review review = existing.get();
            review.setRating(updatedData.getRating());
            review.setComment(updatedData.getComment());
            review.setReviewDate(LocalDateTime.now()); // Records the timestamp when the record was last updated.
            return reviewRepository.save(review);
        }
        return null;
    }

    // Allows the admin to submit a reply and sends an email notification
    public Review addAdminReply(Long id, String reply) {
        Optional<Review> existing = reviewRepository.findById(id);
        if (existing.isPresent()) {
            Review review = existing.get();
            review.setAdminReply(reply);
            Review savedReview = reviewRepository.save(review);

            // Sends an email notification to the user when the admin replies
            if (review.getUserId() != null) {
                Optional<User> userOpt = userRepository.findById(review.getUserId());
                if (userOpt.isPresent()) {
                    try {
                        SimpleMailMessage message = new SimpleMailMessage();
                        message.setTo(userOpt.get().getEmail());
                        message.setSubject("EasyPark - Admin replied to your review! 💬");
                        message.setText("Hi " + userOpt.get().getName() + ",\n\n"
                                + "An admin has replied to your recent review on EasyPark.\n\n"
                                + "Your Review: \"" + review.getComment() + "\"\n\n"
                                + "Admin Reply: \"" + reply + "\"\n\n"
                                + "Thank you for your valuable feedback!\n\n"
                                + "Best Regards,\nEasyPark Team");

                        mailSender.send(message);
                        System.out.println("✅ Reply email sent successfully to: " + userOpt.get().getEmail());
                    } catch (Exception e) {
                        System.out.println("❌ Failed to send reply email! Reason: " + e.getMessage());
                    }
                }
            }
            return savedReview;
        }
        return null;
    }
}