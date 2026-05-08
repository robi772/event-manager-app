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

-- Seed: default admin user (password: Admin1234!)
INSERT INTO users (username, email, password_hash, role)
VALUES (
  'admin',
  'admin@eventmanager.local',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin'
);

-- Seed: demo organizer user (password: Demo1234!)
INSERT INTO users (username, email, password_hash, role)
VALUES (
  'demo_organizer',
  'organizer@eventmanager.local',
  '$2a$10$rOzByGEGY4JF4DUibLKMuuNcUWXyYj7K7b7yL.Vk3VxrZ2lFq5oRq',
  'organizer'
);

-- Seed: demo events
INSERT INTO events (title, description, event_date, location, max_participants, organizer_id, status)
VALUES
  ('Tech Meetup Budapest 2025', 'Évi tech találkozó Budapest szívében. Előadások, networking és sok érdekesség!', '2025-09-15 18:00:00', 'Budapest, Akvárium Klub', 200, 2, 'approved'),
  ('React Workshop', 'Haladó React fejlesztés: hooks, context, performance optimalizálás.', '2025-10-05 10:00:00', 'Budapest, Teleki tér 8.', 30, 2, 'approved'),
  ('Robotics Demo Day', 'Autonóm robotok bemutatója és közönség interakció.', '2025-11-20 14:00:00', 'Budapest, BME Q épület', 100, 2, 'approved');
