# 🅿️ easy-Park — Web-Based Automated Parking Reservation and Management System

> A full-stack web application that lets drivers find and reserve parking slots online, lets gate staff manage vehicle entry and exit (including complaints), and gives administrators full control over slots, users, reviews, complaints and revenue.

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.0-brightgreen)
![React](https://img.shields.io/badge/React-19-61dafb)
![MySQL](https://img.shields.io/badge/MySQL-8-blue)
![Status](https://img.shields.io/badge/status-in%20development-yellow)

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Complaints Module (Vehicle Entry & Exit)](#-complaints-module-vehicle-entry--exit)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [API Overview](#-api-overview)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Testing](#-testing)
- [Team Members](#-team-members)
- [Known Limitations & Roadmap](#-known-limitations--roadmap)
- [License](#-license)

---

## 📝 About the Project

**easy-Park** removes the guesswork from finding parking. Drivers register, add their vehicles, search for available slots and reserve them for a chosen time window. On arrival, gate staff look up the booking (by booking ID or QR scan), record the vehicle's entry and exit, and apply overstay fines when needed. Administrators manage parking slots, staff accounts, reviews, complaints and view a revenue dashboard.

| | |
|---|---|
| **Institution** | Sri Lanka Institute of Information Technology (SLIIT) |
| **Module** | Software Engineering – SE2030 |
| **Group Number** | 2026-Y2-S1-MLB-B4G2-02 |
| **Development Method** | Agile (3 sprints) |

---

## ✨ Features

### 👤 Driver
- Register with email **OTP verification**, log in, and manage profile
- Add, view and delete vehicles (licence plate format validation, e.g. `ABC-1234`)
- Search available parking slots and **reserve** a slot for a start/end time
- Automatic price calculation (slot hourly rate × duration)
- Demo payment page and **email booking receipt**
- View, edit and cancel reservations in **My Reservations**
- Submit, edit and delete **reviews** (1–5 stars) and read admin replies
- See complaint status (**Pending / Resolved**) on bookings

### 🚧 Gate Staff
- Search a booking by **booking ID** or QR scanner mode
- Record **vehicle entry** and **vehicle exit** with live timestamps
- **Overstay fine** calculation and recording on exit
- View slot timeline by slot number
- **Add, edit and delete complaints** for a booking (see below)

### 🛠 Admin / Super Admin
- Dashboard with total users, vehicles, reservations and **total revenue** (charts via Recharts)
- Slot management: add slots, set status (`AVAILABLE`, `BOOKED`, `MAINTENANCE`), bulk price update, soft/hard delete
- User management: view, block/unblock, delete users
- Create **staff / admin accounts** (only `SUPER_ADMIN` can create `ADMIN` accounts)
- Review management: view, delete and **reply** to reviews
- **Complaints tab**: view every complaint and mark it as **RESOLVED**
- PDF report export (jsPDF)

### ⚙️ System
- Scheduled job (every minute) that auto-completes expired confirmed bookings
- QR-code gate pass generation (ZXing)
- Light / dark theme
- Interactive API docs with Swagger UI

---

## 🆕 Complaints Module (Vehicle Entry & Exit)

The latest addition to the system lets staff record an issue against a booking while handling a vehicle at the gate (for example: damage, wrong-slot parking, or a dispute), and lets admins follow it through to resolution.

### How it works

| Role | What they can do |
|------|------------------|
| **Staff** | On the Vehicle Entry & Exit screen, after finding a booking, **add**, **edit** or **delete** a complaint for that booking |
| **Admin** | Open the **Complaints** tab to see all issues (ID, booking, driver, description, date) and click **Resolve** to change the status from `PENDING` → `RESOLVED` |
| **Driver** | In **My Reservations**, bookings with a complaint show a **⚠️ COMPLAINT** badge, coloured by status (pending or resolved) |

### Rules
- One complaint is linked to one booking (`bookingId`) and the driver who made it (`userId`).
- New complaints start with the status `PENDING`; descriptions are limited to **500 characters**.
- Staff can manage a complaint only while the booking is **`ENTERED`**, or within **30 minutes after the vehicle exits** (`COMPLETED`). This window is enforced in the staff UI.

### Complaint API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/complaints/add` | Create a complaint |
| `GET` | `/api/complaints/booking/{bookingId}` | Get the complaint for a booking |
| `GET` | `/api/complaints/all` | List all complaints (admin) |
| `PUT` | `/api/complaints/update/{id}` | Edit description / set status to `RESOLVED` |
| `DELETE` | `/api/complaints/delete/{id}` | Delete a complaint |

**Example request body** (`POST /api/complaints/add`):

```json
{
  "bookingId": 12,
  "userId": 3,
  "description": "Vehicle parked across two slots.",
  "status": "PENDING"
}
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, React Router, Tailwind CSS 4, Axios, Recharts, Lucide icons, jsPDF, react-qr-code |
| **Backend** | Java 17, Spring Boot 4.1.0 (Web MVC, Data JPA, Security, Validation, Mail, Scheduling), Lombok |
| **Database** | MySQL (Hibernate, auto schema update) |
| **Other** | ZXing (QR codes), springdoc-openapi (Swagger UI), Gmail SMTP (OTP & receipts) |
| **Tools** | Git, GitHub, Maven Wrapper, ESLint |

---

## 🏗 System Architecture

```
┌──────────────────┐    REST (JSON)    ┌─────────────────────────┐    JPA/Hibernate    ┌─────────┐
│  React + Vite    │ ────────────────► │  Spring Boot Backend    │ ──────────────────► │  MySQL  │
│  (port 5173)     │ ◄──────────────── │  (port 8080)            │ ◄────────────────── │         │
└──────────────────┘                   └─────────────────────────┘                     └─────────┘
                                                  │
                                                  └──► Gmail SMTP (OTP, booking receipts)
```

The backend follows a layered design: **Controller → Service → Repository → Entity**.

**Main entities:** `User`, `Vehicle`, `ParkingSlot`, `Reservation`, `GateAccess`, `Review`, `Complaint`

**Frontend routes**

| Route | Page |
|-------|------|
| `/` | Login |
| `/register`, `/verify` | Registration and OTP verification |
| `/dashboard` | Driver dashboard (vehicles, slot search, booking) |
| `/reservations` | My Reservations |
| `/profile` | Profile |
| `/staff` | Staff dashboard (vehicle entry/exit, complaints) |
| `/admin` | Admin dashboard |

---

## 🚀 Getting Started

### Prerequisites

- [Java JDK 17](https://adoptium.net/)
- [Node.js](https://nodejs.org/) 18+ and npm
- [MySQL](https://www.mysql.com/) 8+
- A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833) (for OTP emails)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Set up the database

```sql
CREATE DATABASE parking_db_new;
```

Tables are created automatically on first run (`spring.jpa.hibernate.ddl-auto=update`).

### 3. Run the backend

Set these environment variables (they have placeholder defaults in `application.properties`):

| Variable | Description |
|----------|-------------|
| `DB_USERNAME` | MySQL username (default `root`) |
| `DB_PASSWORD` | MySQL password |
| `MAIL_USERNAME` | Gmail address used to send emails |
| `MAIL_PASSWORD` | Gmail **App Password** |

```bash
cd backend
./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run
```

The API runs at **http://localhost:8080** and Swagger UI is available at **http://localhost:8080/swagger-ui/index.html**.

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

> ⚠️ The frontend calls the API at `http://localhost:8080`, so start the backend first.

### 5. Create the first admin

Registration creates `DRIVER` accounts. To get your first admin, register a user and change its `role` to `SUPER_ADMIN` directly in the `users` table. After that, admins can create staff accounts from the Admin dashboard.

---

## 🔌 API Overview

Base URL: `http://localhost:8080/api`

| Resource | Base path | Main endpoints |
|----------|-----------|----------------|
| Users | `/users` | `register`, `verify-otp`, `login`, `{id}`, `update/{id}`, `delete/{id}`, `all`, `block/{id}`, `admin/create-employee` |
| Vehicles | `/vehicles` | `add`, `all`, `{id}`, `delete/{id}` |
| Parking slots | `/slots` | `add`, `all`, `available`, `{id}/status`, `update-price-all`, `delete/{id}` |
| Reservations | `/reservations` | `create`, `all`, `user/{userId}`, `{id}/status`, `update/{id}`, `enter/{id}`, `exit/{id}`, `{id}` (DELETE) |
| Gate access | `/gate` | `generate/{reservationId}`, `checkin`, `checkout` |
| Reviews | `/reviews` | `add`, `all`, `update/{id}`, `delete/{id}`, `reply/{id}` |
| **Complaints** | `/complaints` | `add`, `booking/{bookingId}`, `all`, `update/{id}`, `delete/{id}` |
| Dashboard | `/admin/dashboard` | `stats` |

Full interactive documentation: **Swagger UI** (see above).

---

## 📂 Project Structure

```
your-repo-name/
├── backend/
│   ├── src/main/java/.../
│   │   ├── config/          # Security configuration
│   │   ├── controller/      # REST controllers (incl. ComplaintController)
│   │   ├── service/         # Business logic, email, scheduling
│   │   ├── repository/      # Spring Data JPA repositories
│   │   ├── entity/          # JPA entities (incl. Complaint)
│   │   └── dto/             # Data transfer objects
│   ├── src/main/resources/application.properties
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── pages/           # Login, Register, VerifyOTP, Dashboard,
│   │   │                    # MyReservations, Profile, StaffDashboard, AdminDashboard
│   │   ├── App.jsx          # Routes
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── docs/                    # Design document, diagrams, screenshots
└── README.md
```

---

## 🖼 Screenshots

Add your screenshots to `docs/screenshots/` and update the links below.

| Login | Driver Dashboard |
|-------|------------------|
| ![Login](docs/screenshots/login.png) | ![Dashboard](docs/screenshots/dashboard.png) |

| Staff – Vehicle Entry/Exit & Complaints | Admin – Complaints Tab |
|-----------------------------------------|------------------------|
| ![Staff](docs/screenshots/staff-complaints.png) | ![Admin](docs/screenshots/admin-complaints.png) |

---

## 🧪 Testing

```bash
# Backend
cd backend
./mvnw test

# Frontend lint
cd frontend
npm run lint
```

Each team member also tested their own module during their sprint (registration, reservation, vehicle management, reviews & payment, entry/exit & complaints, admin management).

---

## 👥 Team Members

**Group 2026-Y2-S1-MLB-B4G2-02 — SE2030, SLIIT**

| Reg. No. | Name | Responsibility |
|----------|------|----------------|
| IT25101727 | Rathnayake H.A.N.N | Driver registration & authentication |
| IT25103658 | Subasinha S.A.D.H | Parking search & slot reservation |
| IT25100811 | Hapuarachchi K.H.H.A.M | Vehicle registration |
| IT25102669 | Mandinu H.R | Reviews & payments |
| IT25101825 | Silva N.H.M.A | Vehicle entry & exit, **complaints** |
| IT25103692 | Dilmith W.A.S | Admin management & dashboard (slots, users, revenue) |

---

## 🗺 Known Limitations & Roadmap

- [x] User registration with OTP email verification
- [x] Vehicle management
- [x] Slot search and reservation
- [x] Reviews and demo payment
- [x] Vehicle entry/exit with overstay fines
- [x] Complaints (add / update / resolve / delete)
- [x] Admin dashboard and management
- [ ] Secure authentication: password hashing (BCrypt) and JWT-based, role-protected endpoints (all endpoints are currently open)
- [ ] Real payment gateway (current payment page is a demo)
- [ ] Move the complaint time-window check to the backend
- [ ] Configurable API base URL (currently `http://localhost:8080` in the frontend)
- [ ] Automated unit and integration tests

---

## 📄 License

This project was developed for academic purposes as part of the SE2030 module at SLIIT. Add a license of your choice (e.g. MIT) in a `LICENSE` file.

---

⭐ If you find this project useful, give it a star!
