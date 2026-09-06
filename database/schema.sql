-- =========================================================
-- schema.sql — creates the database and users table
-- Run this once in MySQL before starting the backend.
-- =========================================================

CREATE DATABASE IF NOT EXISTS user_management;

USE user_management;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional sample data so the table isn't empty on first run.
INSERT INTO users (name, email, phone) VALUES
  ('Aditi Rao', 'aditi.rao@example.com', '9876543210'),
  ('John Carter', 'john.carter@example.com', '9123456780'),
  ('Meera Nair', 'meera.nair@example.com', '9988776655');
