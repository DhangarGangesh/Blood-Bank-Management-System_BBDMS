# Blood Bank Donor Management System (BBDMS)

A full-stack web application for academic demonstration built using **React + Vite**, **Node.js + Express**, and **PostgreSQL**.

---

## Implemented Modules & Role-Based Access Control (RBAC)

The system enforces strict role-based segregation between Donor and Staff/Admin portals across both backend API middleware and frontend route guards:

### 1. Donor Management Module *(Donor Login)*
> **Target Role**: `donor` (e.g., `aarav.sharma@example.com`, `priya.patel@example.com`)  
> **Accessible Pages**: Donor Dashboard, Profile, Health Screening.  
> **Restrictions**: Donors **cannot** access Blood Inventory or Add Blood Unit (HTTP 403 Forbidden).

- **Donor Registration**: Name, Email, Phone, DOB, Gender, Blood Group, Address, Password (`/register`).
- **Donor Login**: Email + Password JWT authentication (`/login`) with automatic redirection to `/donor-dashboard`.
- **Donor Dashboard**: Name, Blood Group badge, Contact Details, Eligibility Status, Last Donation Date (`/donor-dashboard`).
- **Donor Profile**: View & edit personal details with real-time updates (`/profile`).
- **Health Screening / Eligibility**: Rule-based screening evaluating age (18–65), weight (≥50kg), recent illness, medication, and donation timing to set status (`Eligible` or `Not Eligible`) (`/screening`).

---

### 2. Blood Inventory Management Module *(Staff / Admin Login)*
> **Target Role**: `admin` / `staff` (e.g., `admin@lifesave.org`)  
> **Accessible Pages**: Inventory Dashboard, Add Blood Unit, Donor Oversight Directory.  
> **Restrictions**: Restricted strictly to hospital Staff and System Administrators.

- **Staff Authentication**: Secure JWT login with immediate redirection to `/inventory`.
- **Inventory Dashboard Table**: Tracks Blood Groups (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`), Component Types (`Whole Blood`, `RBC`, `Plasma`, `Platelets`), Available, Reserved, Quarantine, and Total units (`/inventory`).
- **Low Stock Indicator**: Dynamically tags inventory with **`LOW STOCK`** (yellow badge) if available units are below threshold (< 5 units) or **`AVAILABLE`** (green badge).
- **Add Blood Unit Form**: Collection date, expiry date, status (`Available`, `Reserved`, `Quarantine`, `Expired`), and quantity (`/inventory/add`).
- **Quantity Adjustments**: Direct increase/decrease controls (+/- buttons) and unit deletion.
- **Search & Filtering**: Filter inventory stock by Blood Group, Component Type, and Status.
- **Donor Directory Oversight**: Staff access to inspect all registered donors, contact records, and current eligibility statuses (`/admin/donors`).

---

## Tech Stack & Design System
- **Frontend**: React 18, Vite, React Router DOM v6, Lucide Icons, Vanilla CSS Design System
- **UI/UX Theme**: Hospital-Grade Healthcare Theme (Crisp white backgrounds, deep crimson medical accents `#b91c1c`, subtle gray surfaces `#f8fafc`, clinical status badges, toast notification engine)
- **Backend**: Node.js, Express.js, JWT (`jsonwebtoken`), Bcryptjs, CORS
- **Database**: PostgreSQL (via `pg` node pool) + Automatic In-Memory fallback for demo resilience

---

## Quick Setup & Execution Guide

### Step 1: Install Dependencies

#### Backend Installation:
```bash
cd backend
npm install
```

#### Frontend Installation:
```bash
cd frontend
npm install
```

---

### Step 2: Database Setup (PostgreSQL)

1. Make sure PostgreSQL service is running on `localhost:5432`.
2. Create the database:
```sql
CREATE DATABASE bbdms_db;
```
3. Configure credentials in `backend/.env`:
```env
PORT=5000
JWT_SECRET=bbdms_secret_key_2026_super_secure
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bbdms_db
DB_USER=postgres
DB_PASSWORD=postgres
```
*(Note: If PostgreSQL is not active on your machine, the application will automatically activate its In-Memory Demo Fallback so all features work seamlessly out of the box!)*

### Step 3: Database Seeding & Reset Scripts

The application includes a rich, realistic deterministic dataset (60+ donors, 4 staff/admin accounts, 32 aggregated inventory categories, and 44 individual blood bag units):

#### Idempotent Seeding (Safe to run multiple times):
```bash
cd backend
npm run seed
```
*(Uses `ON CONFLICT` clauses so existing records and non-demo accounts are preserved without duplicates).*

#### Safe Demo Reset (Clears and reseeds only demo data):
```bash
cd backend
npm run seed:reset
```

*(Note: If PostgreSQL is not active on your machine, the backend's In-Memory Demo Fallback automatically loads this exact same rich dataset into memory on startup so all dashboards, tables, searches, and filters are immediately populated!)*

---

### Step 4: Running the Application

#### Start Backend Server (Port 5000):
```bash
cd backend
npm run dev
```

#### Start Frontend Application (Port 3000):
```bash
cd frontend
npm run dev
```

---

## Test Credentials (Demo Dataset)

All accounts use the standard demo password: **`password123`** (can also be filled with a single click using the demo buttons on the [Login page](http://localhost:3000/login)):

### Hospital Staff & Administrative Accounts
| Role | Name | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **System Admin** | Dr. Sunita Rao | `admin@lifesave.org` | `password123` | Full Access: Inventory, Add Unit, Donor Directory |
| **Nurse Staff** | Nurse Anita Desai | `nurse.anita@lifesave.org` | `password123` | Staff Portal: Inventory Management & Directory |
| **Lab Technician** | Vikram Mehta | `lab.vikram@lifesave.org` | `password123` | Staff Portal: Blood Inventory & Quarantine audits |
| **Donor Coordinator**| Kavita Reddy | `coordinator.kavita@lifesave.org` | `password123` | Staff Portal: Donor Outreach & Directory |

### Sample Donor Accounts (Selected from 60+ Seeded Donors)
| Donor Account | Blood Group | Eligibility Status | Location | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `aarav.sharma@example.com` | **O+** | **Eligible** | Mumbai, MH | Active donor, 5 months since last donation |
| `priya.patel@example.com` | **A+** | **Eligible** | Kolkata, WB | Active donor, 8 months since last donation |
| `rohan.verma@example.com` | **AB-** | **Not Eligible** | Bengaluru, KA | Temporary restriction: Active medication |
| `ananya.iyer@example.com` | **B+** | **Eligible** | Chennai, TN | Active donor, B+ Surgery reserve |
| `vikram.malhotra@example.com` | **O-** | **Eligible** | New Delhi, DL | Universal RBC donor |
| `rahul.nair@example.com` | **B-** | **Not Eligible** | Kochi, KL | Temporary restriction: Weight under 50kg |
| `pooja.kapoor@example.com` | **O-** | **Eligible** | Chandigarh, CH | Active O- donor |

---

## URLs & Ports

- **Frontend Application**: `http://localhost:3000`
- **Backend REST API**: `http://localhost:5000/api`
- **API Health Check**: `http://localhost:5000/api/health`

