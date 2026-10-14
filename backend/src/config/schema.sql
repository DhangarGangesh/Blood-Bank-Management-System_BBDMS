-- PostgreSQL Schema for Blood Bank Donor Management System (BBDMS)

DROP TABLE IF EXISTS health_screenings CASCADE;
DROP TABLE IF EXISTS donors CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS blood_units CASCADE;
DROP TABLE IF EXISTS blood_inventory CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'donor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Donors table
CREATE TABLE donors (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    address TEXT,
    eligibility_status VARCHAR(50) DEFAULT 'Eligible',
    last_donation_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Health Screenings table
CREATE TABLE health_screenings (
    id SERIAL PRIMARY KEY,
    donor_id INT REFERENCES donors(id) ON DELETE CASCADE,
    age INT,
    weight NUMERIC(5,2),
    recent_illness VARCHAR(255),
    medication VARCHAR(255),
    recent_donation VARCHAR(255),
    eligible BOOLEAN DEFAULT TRUE,
    screening_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blood Units table
CREATE TABLE blood_units (
    id SERIAL PRIMARY KEY,
    blood_group VARCHAR(10) NOT NULL,
    component_type VARCHAR(50) NOT NULL,
    collection_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'Available',
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blood Inventory aggregate table
CREATE TABLE blood_inventory (
    id SERIAL PRIMARY KEY,
    blood_group VARCHAR(10) NOT NULL,
    component_type VARCHAR(50) NOT NULL,
    available_units INT DEFAULT 0,
    reserved_units INT DEFAULT 0,
    quarantine_units INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_bg_comp UNIQUE (blood_group, component_type)
);

-- Indices for rapid querying
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_donors_user_id ON donors(user_id);
CREATE INDEX idx_blood_units_bg ON blood_units(blood_group);
CREATE INDEX idx_blood_inventory_bg_comp ON blood_inventory(blood_group, component_type);
