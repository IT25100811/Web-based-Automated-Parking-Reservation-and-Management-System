package Web_Based_Automated_Parking_Reservation_and_Management_System_backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

// Oyaage file structure eka anuwa me imports deka danna oni.
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.User;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.repository.UserRepository;

@EnableAsync
@SpringBootApplication
@EnableScheduling
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	// System eka start weddi Super Admin nattam auto hadenawa
	@Bean
	CommandLineRunner initSuperAdmin(UserRepository userRepository) {
		return args -> {
			if (userRepository.findByEmail("superadmin@easypark.com") == null) {
				User superAdmin = new User();
				superAdmin.setName("System Master");
				superAdmin.setEmail("superadmin@easypark.com");
				superAdmin.setPassword("SuperAdmin@123"); // Password eka methana set karanawa
				superAdmin.setRole("SUPER_ADMIN");
				superAdmin.setEmailVerified(true);
				superAdmin.setBlocked(false);
				userRepository.save(superAdmin);
				System.out.println("✅ SUPER_ADMIN account created successfully!");
			}
		};
	}
}