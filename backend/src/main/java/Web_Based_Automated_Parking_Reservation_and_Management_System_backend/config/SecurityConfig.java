package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Disabling CSRF protection to allow POST requests.
                .csrf(csrf -> csrf.disable())

                // 2. Allow unauthenticated access to all APIs, including Swagger UI.
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                );

        return http.build();
    }
}

