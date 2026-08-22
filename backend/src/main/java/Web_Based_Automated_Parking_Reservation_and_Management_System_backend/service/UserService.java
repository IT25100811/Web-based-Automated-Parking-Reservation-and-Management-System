package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.service;

import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.User;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Random;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // 1. Handles the creation of a new user account during the registration process.
    public String registerUser(User user) {
        User existingUser = userRepository.findByEmail(user.getEmail());

        // Check if user already exists in the database
        if (existingUser != null) {
            if (existingUser.isEmailVerified()) {
                // If verified, block new registration
                return "Error: Email is already registered!";
            } else {
                // If unverified, update the existing record with new details and a new OTP
                String generatedOtp = String.format("%06d", new Random().nextInt(999999));
                existingUser.setOtpCode(generatedOtp);
                existingUser.setName(user.getName());
                existingUser.setPassword(user.getPassword());

                try {
                    emailService.sendVerificationOTP(existingUser.getEmail(), generatedOtp);
                    userRepository.save(existingUser);
                    return "Registration updated! Please check your email for the new OTP.";
                } catch (Exception e) {
                    System.err.println("Email sending failed: " + e.getMessage());
                    return "Error: Failed to send OTP email. Please try again.";
                }
            }
        }

        // For a completely new user
        String generatedOtp = String.format("%06d", new Random().nextInt(999999));
        user.setOtpCode(generatedOtp);
        user.setEmailVerified(false);

        User savedUser = userRepository.save(user);

        try {
            emailService.sendVerificationOTP(savedUser.getEmail(), generatedOtp);
            return "Registration successful! Please check your email for the OTP.";
        } catch (Exception e) {
            // Rollback if email fails for a new user
            userRepository.delete(savedUser);
            System.err.println("Email sending failed: " + e.getMessage());
            return "Error: Failed to send OTP email. Please check your connection and try again.";
        }
    }

    // 2. Handles the verification process for the provided OTP.
    public String verifyOTP(String email, String otpCode) {
        User user = userRepository.findByEmail(email);

        if (user == null) {
            return "Error: User not found!";
        }
        if (user.isEmailVerified()) {
            return "Error: User is already verified!";
        }
        if (otpCode.equals(user.getOtpCode())) {
            // Verifies the user if the provided OTP is correct.
            user.setEmailVerified(true);
            user.setOtpCode(null); // Clears the OTP record after successful verification.
            userRepository.save(user);
            return "Account successfully verified! You can now login.";
        }
        return "Error: Invalid OTP!";
    }

    // Updates the user login implementation and authentication logic.
    public Object loginUser(String email, String password) {
        User user = userRepository.findByEmail(email);

        if (user != null && user.getPassword().equals(password)) {
            // Checks whether the user account has been blocked.
            if (user.isBlocked()) {
                return "Error: Your account has been blocked by the Administrator!";
            }
            if (!user.isEmailVerified()) {
                return "Error: Please verify your email with the OTP first!";
            }
            return user;
        }
        return "Error: Invalid email or password!";
    }

    // --- ALUTH FEATURE: Super Admin/Admin ta Staff hadanna ---
    public User createEmployee(User newEmployee, Long creatorId) throws Exception {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new Exception("Error: Creator account not found!"));

        String creatorRole = creator.getRole();
        String newRole = newEmployee.getRole();

        // 1. Check Permissions
        if (creatorRole == null || (!creatorRole.equals("SUPER_ADMIN") && !creatorRole.equals("ADMIN"))) {
            throw new Exception("Error: You do not have permission to create staff accounts.");
        }

        if ("ADMIN".equals(newRole) && !"SUPER_ADMIN".equals(creatorRole)) {
            throw new Exception("Error: Only the SUPER_ADMIN can create other ADMIN accounts.");
        }

        // 2. Check if email already exists
        if (userRepository.findByEmail(newEmployee.getEmail()) != null) {
            throw new Exception("Error: This email is already registered in the system!");
        }

        // 3. Save new employee (Auto verified, no OTP needed)
        newEmployee.setEmailVerified(true);
        newEmployee.setBlocked(false);

        return userRepository.save(newEmployee);
    }

    // New: Function to handle blocking or unblocking user accounts.
    public String toggleBlockUser(Long id) {
        java.util.Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            // SECURITY: Super Admin wa block karanna ba
            if ("SUPER_ADMIN".equals(user.getRole())) {
                return "Error: Action Denied. You cannot block the System Super Admin!";
            }

            user.setBlocked(!user.isBlocked()); // Toggles the current boolean state
            userRepository.save(user);
            return user.isBlocked() ? "User blocked successfully!" : "User unblocked successfully!";
        }
        return "Error: User not found!";
    }

    // 4. Retrieves user details by ID to display their profile information.
    public User getUserById(Long id) {
        Optional<User> user = userRepository.findById(id);
        return user.orElse(null);
    }

    // 5. Updates the user profile information, including name, email, and password.
    public String updateUser(Long id, User updatedUser) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setName(updatedUser.getName());
            user.setEmail(updatedUser.getEmail());
            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                user.setPassword(updatedUser.getPassword());
            }
            userRepository.save(user);
            return "User profile updated successfully!";
        }
        return "Error: User not found!";
    }

    // 6. Delete User Account
    public String deleteUser(Long id) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            // SECURITY: Super Admin wa delete karanna ba
            if ("SUPER_ADMIN".equals(user.getRole())) {
                return "Error: Action Denied. Cannot delete the System Super Admin!";
            }

            userRepository.deleteById(id);
            return "User account deleted successfully!";
        }
        return "Error: User not found!";
    }

    public long getTotalUsersCount() {
        return userRepository.count();
    }
    public long getUserCount() {
        return userRepository.count();
    }

    // 7. Get All Users
    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }
}