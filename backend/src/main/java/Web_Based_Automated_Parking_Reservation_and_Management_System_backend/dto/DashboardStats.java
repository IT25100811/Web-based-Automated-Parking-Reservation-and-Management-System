package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DashboardStats {
    private long totalUsers;
    private long totalVehicles;
    private long totalReservations;
    private double totalRevenue;
}