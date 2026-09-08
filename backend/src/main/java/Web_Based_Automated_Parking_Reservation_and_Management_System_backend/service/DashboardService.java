package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.service;

import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.dto.DashboardStats;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.entity.Reservation;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.repository.ReservationRepository;
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.repository.UserRepository; // Oyaage User repo eka
import Web_Based_Automated_Parking_Reservation_and_Management_System_backend.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    public DashboardStats getSystemStatistics() {
        DashboardStats stats = new DashboardStats();

        // 1. Counts the total number of rows in the table.
        stats.setTotalUsers(userRepository.count());
        stats.setTotalVehicles(vehicleRepository.count());
        stats.setTotalReservations(reservationRepository.count());

        // 2. Calculates the total revenue by summing up all booking payments.
        List<Reservation> allReservations = reservationRepository.findAll();
        double totalMoney = 0.0;

        for (Reservation res : allReservations) {
            if (res.getTotalAmount() != null) {
                totalMoney += res.getTotalAmount(); // Sums up the payment amounts.
            }
        }
        stats.setTotalRevenue(totalMoney);

        return stats;
    }
}