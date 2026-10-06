package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.controller;

import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.Review;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

// This class handles all the web requests for reviews
@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*") // Allows the frontend to connect without CORS errors
public class ReviewController {

    @Autowired
    private ReviewService reviewService; // Connects to the service layer

    // This method saves a new review to the database
    @PostMapping("/add")
    public ResponseEntity<Review> addReview(@RequestBody Review review) {
        return ResponseEntity.ok(reviewService.addReview(review));
    }

    // This method gets all the reviews from the database
    @GetMapping("/all")
    public ResponseEntity<List<Review>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    // This method deletes a review using its ID number
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok("Review deleted successfully");
    }

    // This method updates an old review with new details and performs validations
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateReview(@PathVariable Long id, @RequestBody Review review) {
        
        // Backend validation: Ensures the review comment is not null or empty
        if (review.getComment() == null || review.getComment().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Review comment cannot be empty!");
        }
        
        // Backend validation: Ensures the review comment does not exceed the 1000 character limit
        if (review.getComment().length() > 1000) {
            return ResponseEntity.badRequest().body("Review comment must be 1000 characters or less!");
        }

        Review updated = reviewService.updateReview(id, review);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.badRequest().body("Review update failed."); // Returns an error message if the update fails
    }

    // This method allows an admin to reply to a review
    @PutMapping("/reply/{id}")
    public ResponseEntity<Review> addAdminReply(@PathVariable Long id, @RequestBody String reply) {
        Review updated = reviewService.addAdminReply(id, reply);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.badRequest().build(); // Returns an error if it fails
    }
}