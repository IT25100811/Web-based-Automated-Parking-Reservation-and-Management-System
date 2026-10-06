package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.controller;

import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.service.DashboardService;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.dto.DashboardStats;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    // Retrieves all system statistics simultaneously for admin use.
    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getSystemStatistics());
    }
}
