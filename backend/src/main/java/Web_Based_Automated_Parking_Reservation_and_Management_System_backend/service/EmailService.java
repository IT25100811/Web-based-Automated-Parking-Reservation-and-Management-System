package Web_Based_Automated_Parking_Reservation_and_Management_System_backend.service;

import jakarta.mail.internet.MimeMessage;
import jakarta.activation.DataSource;
import jakarta.mail.util.ByteArrayDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;

// Imports for QR Code generation
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Generates a QR Code and converts it into a byte array
    private byte[] generateQRCodeImage(String text) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, 250, 250);

        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        return pngOutputStream.toByteArray();
    }

    @Async
    public void sendVerificationOTP(String toEmail, String otpCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Parking System - Verify Your Account");
        message.setText("Welcome to our Automated Parking System!\n\nYour OTP code for registration is: " + otpCode + "\n\nPlease use this code to verify your account.");

        mailSender.send(message);
    }

    // Generates and sends the receipt upon successful driver payment (With inline QR code & Vehicle Info)
    public void sendBookingReceipt(String toEmail, String userName, String slotNumber, String vehiclePlate, String startTime, String endTime, double amount, Long bookingId) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8"); // true = multipart message

            helper.setTo(toEmail);

            // Added the ID to the subject to stop emails from grouping together.
            helper.setSubject("EasyPark - Booking Confirmed #" + bookingId + "✅");

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy | hh:mm a");
            String formattedStart = LocalDateTime.parse(startTime).format(formatter);
            String formattedEnd = LocalDateTime.parse(endTime).format(formatter);

            String htmlContent = "<div style=\"font-family: Arial, sans-serif; background-color: #0b0c10; color: #ffffff; padding: 40px 20px; border-radius: 10px; max-width: 600px; margin: auto; border: 1px solid #1a1c23;\">"
                    + "<h2 style=\"color: #00e5ff; text-align: center; font-size: 28px; margin-bottom: 5px; letter-spacing: 2px; margin-top: 0;\">EASY<span style=\"color: #ffffff;\">PARK</span></h2>"
                    + "<p style=\"text-align: center; color: #a0aec0; font-size: 14px; margin-top: 0;\">Official Booking Receipt</p>"
                    + "<hr style=\"border: 0; border-top: 1px solid #1a1c23; margin: 20px 0;\">"

                    + "<h3 style=\"color: #ffffff; font-size: 20px;\">Hi " + userName + ",</h3>"
                    + "<p style=\"color: #d1d5db; font-size: 15px; line-height: 1.6;\">Your payment was successful and your parking slot is confirmed. Here are your booking details:</p>"

                    + "<div style=\"background-color: #15171e; padding: 25px; border-radius: 12px; border-left: 4px solid #00e5ff; margin: 30px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.3);\">"
                    + "    <p style=\"margin: 10px 0; font-size: 16px;\"><strong style=\"color: #a0aec0; display: inline-block; width: 120px;\">Booking ID:</strong> <span style=\"color: #ffffff;\">#" + bookingId + "</span></p>"
                    + "    <p style=\"margin: 10px 0; font-size: 16px;\"><strong style=\"color: #a0aec0; display: inline-block; width: 120px;\">Vehicle No:</strong> <span style=\"color: #ffffff; font-weight: bold; padding: 2px 6px; background-color: #1a1c23; border-radius: 4px; border: 1px solid #374151;\">" + vehiclePlate + "</span></p>"
                    + "    <p style=\"margin: 10px 0; font-size: 16px;\"><strong style=\"color: #a0aec0; display: inline-block; width: 120px;\">Parking Slot:</strong> <span style=\"color: #00e5ff; font-weight: bold; font-size: 20px;\">" + slotNumber + "</span></p>"
                    + "    <p style=\"margin: 10px 0; font-size: 16px;\"><strong style=\"color: #a0aec0; display: inline-block; width: 120px;\">Start Time:</strong> <span style=\"color: #ffffff;\">" + formattedStart + "</span></p>"
                    + "    <p style=\"margin: 10px 0; font-size: 16px;\"><strong style=\"color: #a0aec0; display: inline-block; width: 120px;\">End Time:</strong> <span style=\"color: #ffffff;\">" + formattedEnd + "</span></p>"
                    + "    <p style=\"margin: 20px 0 0 0; font-size: 18px; border-top: 1px dashed #374151; padding-top: 20px;\"><strong style=\"color: #a0aec0; display: inline-block; width: 120px;\">Total Paid:</strong> <span style=\"color: #00e5ff; font-weight: bold; font-size: 24px;\">Rs " + String.format("%.2f", amount) + "</span></p>"
                    + "</div>"

                    + "<div style=\"text-align: center; margin: 30px 0; background-color: #1a1c23; padding: 20px; border-radius: 12px;\">"
                    + "    <p style=\"color: #d1d5db; font-size: 14px; margin-bottom: 15px;\">🚘 <b>IMPORTANT:</b> Show this QR code to the scanner at the gate for quick Entry/Exit.</p>"
                    + "    <img src=\"cid:qrImage\" style=\"width: 200px; height: 200px; border: 5px solid #ffffff; border-radius: 10px; background-color: #ffffff;\" alt=\"Booking QR Code\" />"
                    + "</div>"

                    + "<p style=\"color: #d1d5db; font-size: 14px; text-align: center; line-height: 1.6;\">Please show this receipt or your dashboard QR code at the entrance gate.</p>"
                    + "<p style=\"color: #a0aec0; font-size: 12px; text-align: center; margin-top: 40px;\">© 2026 EasyPark Management System.<br>Malabe, Western Province, Sri Lanka.</p>"
                    + "</div>";

            helper.setText(htmlContent, true);

            String qrData = "EASYPARK-BOOKING-" + bookingId;
            byte[] qrCodeImage = generateQRCodeImage(qrData);

            // Using a Native DataSource ensures the QR code loads perfectly.
            DataSource dataSource = new ByteArrayDataSource(qrCodeImage, "image/png");
            helper.addInline("qrImage", dataSource);

            mailSender.send(message);
            System.out.println("✅ HTML Booking receipt with inline QR and Vehicle Info sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send HTML booking receipt email: " + e.getMessage());
        }
    }
}