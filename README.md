# Web-based Automated Parking Reservation and Management System

## 📌 Project Overview
The Web-based Automated Parking Reservation and Management System is a comprehensive software solution designed to streamline and automate the operations of modern parking facilities. This system eliminates manual parking management inefficiencies by providing real-time slot availability, automated gate access, seamless online reservations, and integrated payment processing. 

Built with a scalable layer-based architecture, the platform ensures high performance, security, and a seamless user experience for both administrators and drivers.

## 🚀 Key Features
*   **User Management:** Secure user registration, authentication, and role-based access control (Admin, User).
*   **Vehicle Management:** Registration and tracking of user vehicles for automated identification.
*   **Slot Management:** Real-time monitoring and allocation of physical parking slots.
*   **Reservation System:** Advance booking of parking spaces with conflict prevention.
*   **Gate Access Control:** Automated entry and exit management integrated with active reservations and vehicle data.
*   **Payment & Review System:** Secure transaction processing for parking fees and a feedback mechanism for service improvement.

## 🛠️ Technology Stack
**Frontend:**
*   React.js (via Vite)
*   Tailwind CSS (for responsive and modern UI design)

**Backend:**
*   Java 17
*   Spring Boot (RESTful APIs)
*   Spring Data JPA / Hibernate (ORM)
*   Layered Architecture (Controller, Service, Repository, Entity, DTO)

**Database & Tools:**
*   MySQL (Relational Database Management)
*   Git & GitHub (Version Control)
*   Maven (Dependency Management)

## 🏗️ System Architecture
The backend follows a standard multi-tier software engineering architecture to ensure separation of concerns, maintainability, and scalability:
1.  **Controller Layer:** Handles incoming HTTP REST requests and routes them to appropriate services.
2.  **Service Layer:** Contains the core business logic and transaction management.
3.  **Repository Layer:** Manages data persistence and database interactions using Spring Data JPA.
4.  **Entity/Model Layer:** Represents the database schema via Java POJOs.
5.  **DTO (Data Transfer Object) Layer:** Ensures secure and optimized data transfer between the client and server.

## 👥 Team Members & Contributions
This project was developed collaboratively by the following team members, with each member taking ownership of specific core modules:

*   **Akindu Menuja** - Vehicle Management Module
*   **Nirmali** - User Management & Authentication Module
*   **Supun** - Parking Slot Management Module
*   **Dimani** - Reservation System Module
*   **Anjana** - Gate Access Control Module
*   **Radisen** - Payment & Review Module

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js and npm (for Frontend)
*   Java 17 or higher (for Backend)
*   MySQL Server
*   Maven

### Backend Setup
1. Navigate to the `backend` directory: `cd backend`
2. Update the `application.properties` file with your MySQL credentials.
3. Build the project: `mvn clean install`
4. Run the Spring Boot application: `mvn spring-boot:run`

### Frontend Setup
1. Navigate to the `frontend` directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
