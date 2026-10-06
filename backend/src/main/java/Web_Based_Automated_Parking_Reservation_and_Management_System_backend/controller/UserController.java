package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.controller;

import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.User;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    // Register API
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        String response = userService.registerUser(user);
        if (response.startsWith("Error")) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    // Verify OTP API
    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOTP(@RequestParam String email, @RequestParam String otpCode) {
        String response = userService.verifyOTP(email, otpCode);
        if (response.startsWith("Error")) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    // Login API
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String email, @RequestParam String password) {
        Object response = userService.loginUser(email, password);

        // Checks if the response is a string, which indicates an error.
        if (response instanceof String) {
            return ResponseEntity.badRequest().body(response);
        }

        // Returns the User object in JSON format with a 200 OK HTTP status upon success.
        return ResponseEntity.ok(response);
    }

    // NEW FEATURE: Allow Admin or Super Admin to create Staff members
    @PostMapping("/admin/create-employee")
    public ResponseEntity<?> createEmployee(@RequestBody User newEmployee, @RequestParam Long creatorId) {
        try {
            User createdUser = userService.createEmployee(newEmployee, creatorId);
            return ResponseEntity.ok(createdUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage()); // Send the exception message to the frontend.
        }
    }

    //  Get User Profile by ID API
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        if (user == null) {
            return ResponseEntity.badRequest().body("Error: User not found!");
        }
        return ResponseEntity.ok(user);
    }

    //  Update User Profile API
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        String response = userService.updateUser(id, updatedUser);
        if (response.startsWith("Error")) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    // Delete User Account API
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        String response = userService.deleteUser(id);
        if (response.startsWith("Error")) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/users/count")
    public ResponseEntity<Long> getTotalUserCount() {
        // Utilizes the userService instead of the userRepository.
        long count = userService.getUserCount();
        return ResponseEntity.ok(count);
    }

    // Get All Users API for Admin Dashboard
    @GetMapping("/all")
    public ResponseEntity<java.util.List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    //Block User API
    @PutMapping("/block/{id}")
    public ResponseEntity<String> toggleBlockUser(@PathVariable Long id) {
        String response = userService.toggleBlockUser(id);
        if (response.startsWith("Error")) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

}