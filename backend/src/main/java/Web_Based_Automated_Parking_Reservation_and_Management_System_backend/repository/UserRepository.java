package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.repository;

import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // A custom method to retrieve a user by their email address, which is required for the login process.
    User findByEmail(String email);




}