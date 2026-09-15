package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    
    User findByEmail(String email);




}