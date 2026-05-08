-- Event Manager Database Schema
-- Run this script to initialize the database

CREATE DATABASE IF NOT EXISTS event_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE event_manager;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'organizer', 'admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATETIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  max_participants INT DEFAULT NULL,
  organizer_id INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_registration (user_id, event_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_registrations_user ON registrations(user_id);
CREATE INDEX idx_registrations_event ON registrations(event_id);

-- Seed: default admin user
-- password: Admin1234!
-- hash generated with bcrypt rounds=10
INSERT INTO users (username, email, password_hash, role)
VALUES (
  'admin',
  'admin@eventmanager.local',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
  'admin'
);

-- Seed: demo organizer user
-- password: password
INSERT INTO users (username, email, password_hash, role)
VALUES (
  'demo_organizer',
  'organizer@eventmanager.local',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
  'organizer'
);

-- Seed: demo events
INSERT INTO events (title, description, event_date, location, max_participants, organizer_id, status)
VALUES
  ('Tech Meetup Budapest 2026', 'Evi tech talalkzo Budapest sziveben. Eloadasok, networking es sok erdekesseg!', '2026-09-15 18:00:00', 'Budapest, Akv\u00e1rium Klub', 200, 2, 'approved'),
  ('React Workshop', 'Halado React fejlesztes: hooks, context, performance optimalizalas.', '2026-10-05 10:00:00', 'Budapest, Teleki ter 8.', 30, 2, 'approved'),
  ('Robotics Demo Day', 'Autonom robotok bemutatoja es kozonseg interakcio.', '2026-11-20 14:00:00', 'Budapest, BME Q epulet', 100, 2, 'approved');
