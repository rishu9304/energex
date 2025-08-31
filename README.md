# 🚀 Energex - Full-Stack Microservice Application

[![Test Suite](https://github.com/YOUR_USERNAME/energex-test/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/energex-test/actions/workflows/ci.yml)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)
[![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?logo=php)](https://www.php.net/)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-17-61DAFB?logo=react)](https://reactjs.org/)

A complete full-stack microservice application built for software engineer screening, featuring modern architecture with containerized services.

## 📋 Table of Contents

- [🏗️ Architecture Overview](#️-architecture-overview)
- [🛠️ Technology Stack](#️-technology-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Start](#-quick-start)
- [🔧 Services](#-services)
- [🧪 Testing](#-testing)
- [🐳 Docker Configuration](#-docker-configuration)
- [🌐 API Endpoints](#-api-endpoints)
- [🔒 Authentication](#-authentication)
- [💾 Database Schema](#-database-schema)
- [📊 Performance & Caching](#-performance--caching)
- [🚦 CI/CD Pipeline](#-cicd-pipeline)
- [📝 Development Notes](#-development-notes)

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React.js      │    │   Node.js       │    │   Lumen PHP     │
│   Frontend      │◄──►│   Cache Service │◄──►│   API Service   │
│   (Port 8080)   │    │   (Port 3000)   │    │   (Port 8000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │     Redis       │    │     MySQL       │
│  Reverse Proxy  │    │     Cache       │    │    Database     │
│   (Port 80)     │    │   (Port 6379)   │    │   (Port 3306)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Microservices Architecture

- **Frontend Service**: React.js application for user interface
- **API Service**: Lumen (PHP) for core business logic and authentication
- **Cache Service**: Node.js (TypeScript) for high-performance caching
- **Database Service**: MySQL for persistent data storage
- **Cache Store**: Redis for fast data retrieval
- **Reverse Proxy**: Nginx for load balancing and routing

## 🛠️ Technology Stack

### Backend Services
- **Lumen 10.x** (PHP 8.2) - Lightweight Laravel framework
- **Node.js 18** (TypeScript) - High-performance caching service
- **MySQL 8.0** - Relational database
- **Redis 7** - In-memory cache store

### Frontend
- **React.js 17** - Modern JavaScript UI library
- **Axios** - HTTP client for API communication

### DevOps & Tools
- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse proxy and load balancer
- **PHPUnit** - PHP testing framework
- **Jest & Supertest** - Node.js testing
- **GitHub Actions** - CI/CD pipeline

### Authentication & Security
- **JWT (JSON Web Tokens)** - Stateless authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
energex-test/
├── 📁 lumen-api/              # PHP Lumen API Service
│   ├── 📁 app/
│   │   ├── 📁 Http/
│   │   │   ├── 📁 Controllers/
│   │   │   │   ├── AuthController.php
│   │   │   │   └── PostController.php
│   │   │   └── 📁 Middleware/
│   │   │       ├── Authenticate.php
│   │   │       └── CorsMiddleware.php
│   │   └── 📁 Models/
│   │       ├── User.php
│   │       └── Post.php
│   ├── 📁 database/migrations/
│   ├── 📁 tests/
│   ├── composer.json
│   └── Dockerfile
│
├── 📁 node-cache/             # Node.js Cache Service
│   ├── 📁 src/
│   │   ├── index.ts
│   │   ├── 📁 routes/
│   │   └── 📁 config/
│   ├── 📁 tests/
│   ├── package.json
│   └── Dockerfile
│
├── 📁 frontend/               # React.js Frontend
│   ├── 📁 src/
│   │   ├── App.js
│   │   └── index.js
│   ├── 📁 public/
│   ├── package.json
│   └── Dockerfile
│
├── 📁 database/               # Database Initialization
│   └── init.sql
│
├── 📁 nginx/                  # Nginx Configuration
│   └── nginx.conf
│
├── docker-compose.yml         # Docker Orchestration
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- No other services required (everything runs in containers)

### 1. Clone and Start
```bash
# Clone the repository
git clone <repository-url>
cd energex-test

# Start all services
docker compose up --build
```

### 2. Access the Application
- **Frontend**: http://localhost:8080
- **API Documentation**: http://localhost:8000/api
- **Cache Service**: http://localhost:3000
- **Nginx Proxy**: http://localhost:80

### 3. Verify Services
```bash
# Check all services are running
docker compose ps

# View logs
docker compose logs -f
```

## 🔧 Services

### 🌐 Lumen API Service (Port 8000)
- **Purpose**: Core business logic, authentication, and data management
- **Features**:
  - JWT-based authentication
  - RESTful API endpoints
  - MySQL database integration
  - Redis caching support
  - CORS middleware
  - Input validation and sanitization

### ⚡ Node.js Cache Service (Port 3000)
- **Purpose**: High-performance caching layer for frequently accessed data
- **Features**:
  - TypeScript for type safety
  - Redis integration
  - Database connection pooling
  - Performance optimized endpoints
  - Comprehensive error handling

### 🎨 React Frontend (Port 8080)
- **Purpose**: User interface and user experience
- **Features**:
  - Modern React.js application
  - Responsive design
  - API integration with Axios
  - Authentication state management
  - Error handling and loading states

### 🗄️ MySQL Database (Port 3306)
- **Purpose**: Persistent data storage
- **Features**:
  - User management
  - Post/content management
  - Relational data structure
  - Migration support

### 🚀 Redis Cache (Port 6379)
- **Purpose**: In-memory caching for performance
- **Features**:
  - Session storage
  - API response caching
  - Real-time data caching

## 🧪 Testing

### PHP API Tests (PHPUnit)
```bash
# Run all PHP tests
docker compose exec lumen php vendor/bin/phpunit --testdox

# Run specific test classes
docker compose exec lumen php vendor/bin/phpunit tests/Feature/AuthTest.php
docker compose exec lumen php vendor/bin/phpunit tests/Feature/PostTest.php

# Run with coverage
docker compose exec lumen php vendor/bin/phpunit --coverage-text
```

### Node.js Tests (Jest)
```bash
# Run all Node.js tests
docker compose exec node-cache npm test

# Run with coverage
docker compose exec node-cache npm test -- --coverage

# Run in watch mode
docker compose exec node-cache npm test -- --watch
```

### Test Coverage
- **AuthTest.php**: User registration, login, JWT token validation, password hashing
- **PostTest.php**: CRUD operations, authorization, caching, data validation
- **cache.test.ts**: Redis operations, cache invalidation, performance tests
- **Integration**: Service-to-service communication, API endpoints

## 🐳 Docker Configuration

### Services Overview
```yaml
services:
  lumen:      # PHP API (Port 8000)
  node-cache: # Node.js Cache (Port 3000)  
  frontend:   # React App (Port 8080)
  mysql:      # Database (Port 3306)
  redis:      # Cache Store (Port 6379)
  nginx:      # Reverse Proxy (Port 80)
```

### Health Checks
- MySQL and Redis services include health checks
- Dependent services wait for healthy status
- Automatic restart policies configured

### Networking
- All services communicate via `energex-network`
- Internal service discovery using service names
- Exposed ports for external access

## 🌐 API Endpoints

### Authentication Endpoints
```
POST /api/register    # User registration
POST /api/login       # User authentication
POST /api/logout      # User logout
GET  /api/me          # Get current user
```

### Post Management Endpoints
```
GET    /api/posts     # Get all posts
POST   /api/posts     # Create new post
GET    /api/posts/{id} # Get specific post
PUT    /api/posts/{id} # Update post
DELETE /api/posts/{id} # Delete post
```

### Cache Service Endpoints
```
GET /cache/posts      # Get cached posts
GET /cache/stats      # Cache statistics
```

### Example API Usage
```bash
# Register a new user
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get posts (with JWT token)
curl -X GET http://localhost:8000/api/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔒 Authentication

### JWT Implementation
- **Token Generation**: On successful login
- **Token Validation**: Middleware protection
- **Token Expiration**: Configurable expiry time
- **Refresh Mechanism**: Token refresh endpoint

### Security Features
- Password hashing with bcrypt
- CORS protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## 💾 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Posts Table
```sql
CREATE TABLE posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 📊 Performance & Caching

### Caching Strategy
1. **Database Query Caching**: Frequently accessed data
2. **API Response Caching**: Common API responses
3. **Session Caching**: User session data
4. **Static Content Caching**: Frontend assets

### Performance Optimizations
- **Connection Pooling**: Database connections
- **Query Optimization**: Indexed database queries
- **Lazy Loading**: Frontend components
- **Compression**: Nginx gzip compression

## 🧪 CI/CD Pipeline

### Simple Test Automation

The project includes a streamlined GitHub Actions workflow for automated testing:

**Workflow**: `.github/workflows/ci.yml`
- **Triggers**: Push to main/develop, Pull requests
- **Purpose**: Build services and run test cases using Docker

### 🛠️ Test Workflow

```yaml
name: 🧪 Test Suite
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker Services
        run: docker compose build --parallel
      
      - name: Start Services
        run: docker compose up -d
      
      - name: Run PHP API Tests
        run: docker compose exec -T lumen php vendor/bin/phpunit --testdox --stop-on-failure
      
      - name: Run Node.js Tests
        run: docker compose exec -T node-cache npm test -- --colors --verbose --coverage
      
      - name: Test Frontend
        run: curl -f http://localhost:8080
```

### 📊 Test Steps

1. **🏗️ Build Phase**: Build all Docker services in parallel
2. **🚀 Start Phase**: Start all services and wait for readiness
3. **🧪 Test Phase**: Run test suites for each service
4. **🧹 Cleanup Phase**: Stop and remove containers

### 🚀 Running Tests Locally

```bash
# Same commands as CI pipeline
docker compose build --parallel
docker compose up -d

# Wait for services
sleep 30

# Run tests (using actual test suites)
docker compose exec lumen php vendor/bin/phpunit --testdox
docker compose exec node-cache npm test -- --coverage
curl -f http://localhost:8080

# Cleanup
docker compose down -v
```

## 📝 Development Notes

### SSL Certificate Issue Resolution
During development, we encountered SSL certificate issues with Composer in Docker. This was resolved by:
```dockerfile
# SSL workaround for Composer
RUN composer config --global disable-tls true && \
    composer config --global secure-http false
```

### CORS Configuration
CORS is handled at multiple levels:
- **Lumen Middleware**: `CorsMiddleware.php`
- **Nginx Configuration**: Proxy headers
- **Frontend Configuration**: Axios defaults

### Environment Variables
Key environment variables:
```env
# Database
DB_HOST=mysql
DB_DATABASE=energex
DB_USERNAME=energex
DB_PASSWORD=secret

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key

# Frontend
REACT_APP_API_URL=http://lumen:8000/api
REACT_APP_CACHE_URL=http://node-cache:3000
```

---

## 🎉 Project Complete!

This full-stack microservice application demonstrates:
- ✅ Modern microservices architecture
- ✅ Containerized deployment with Docker
- ✅ JWT authentication and security
- ✅ High-performance caching
- ✅ Comprehensive testing
- ✅ CI/CD pipeline ready
- ✅ Production-ready configuration

**Ready for demonstration and deployment!** 🚀

---

*Built with ❤️ for software engineering excellence*