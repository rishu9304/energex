-- Energex Database Initialization Script
-- Creates the database schema and inserts sample data

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS energex;
USE energex;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL DEFAULT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_posts_user_id (user_id),
    INDEX idx_posts_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample users (passwords are hashed for 'password123')
INSERT IGNORE INTO users (id, name, email, password, created_at, updated_at) VALUES
(1, 'John Doe', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW()),
(2, 'Jane Smith', 'jane@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW()),
(3, 'Bob Johnson', 'bob@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW());

-- Insert sample posts
INSERT IGNORE INTO posts (id, title, content, user_id, created_at, updated_at) VALUES
(1, 'Welcome to Energex', 'This is the first post on our new platform. We are excited to share our journey with you!', 1, NOW(), NOW()),
(2, 'Getting Started with the API', 'Learn how to use our RESTful API to build amazing applications. This post covers authentication, endpoints, and best practices.', 1, NOW(), NOW()),
(3, 'Redis Caching Benefits', 'Discover how Redis caching improves our API performance by reducing database queries and providing faster response times.', 2, NOW(), NOW()),
(4, 'Docker Containerization', 'Our application is fully containerized using Docker, making deployment and scaling much easier across different environments.', 2, NOW(), NOW()),
(5, 'Frontend with React', 'The frontend is built with React and Material-UI, providing a modern and responsive user experience.', 3, NOW(), NOW());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_title ON posts(title);
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);

-- Show table information
SHOW TABLES;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as post_count FROM posts;
