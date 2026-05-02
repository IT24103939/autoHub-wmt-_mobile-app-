# MongoDB & Backend Setup Guide

## Option 1: Using Docker Compose (Recommended)

### Prerequisites
- Docker and Docker Compose installed

### Start MongoDB and Mongo Express

```bash
# Navigate to project root
cd "year2 sem2/wmt/project wmt mobile app"

# Start MongoDB and Mongo Express
docker-compose up -d

# Verify containers are running
docker-compose ps
```

**MongoDB Connection Details:**
- Host: `localhost:27017`
- Username: `root`
- Password: `mongodb`
- Database: `wmt_garage_db`

**Mongo Express Web UI (Optional):**
- Access at: http://localhost:8081
- Username: admin
- Password: pass (default)

---

## Option 2: Local MongoDB Installation

### Windows

1. Download MongoDB Community Edition from https://www.mongodb.com/try/download/community
2. Run the installer and follow instructions
3. MongoDB runs on `localhost:27017` by default
4. Update `backend/src/main/resources/application.properties`:
   ```properties
   spring.data.mongodb.uri=mongodb://localhost:27017/wmt_garage_db
   ```

### macOS (with Homebrew)

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
mongod --config /usr/local/etc/mongod.conf

# Verify connection
mongo --version
```

### Linux (Ubuntu/Debian)

```bash
# Install MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg
echo "deb [ signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

---

## Building and Running the Backend

### 1. Build the Backend

```bash
cd backend
mvn clean package
```

### 2. Run the Backend

```bash
# Using Maven
mvn spring-boot:run

# Or run the JAR directly
java -jar target/garage-spare-parts-backend-0.0.1-SNAPSHOT.jar
```

The backend will start on `http://localhost:8080`

---

## Verify Backend is Running

### Health Check Endpoint
```bash
curl http://localhost:8080/api/health
# Expected response: {"status":"ok"}
```

### Test Login (Seed Users)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0700000001",
    "password": "123456"
  }'
```

---

## Database Collections

The following MongoDB collections are automatically created:

1. **users** - User accounts (USER, GARAGE_OWNER, SUPPLIER)
2. **garages** - Garage information and services
3. **appointments** - Appointment bookings
4. **spare_parts** - Spare parts catalog (future)

---

## Seed Data

The backend automatically seeds:
- **3 Demo Users** on first startup
- **2 Sample Garages** with services

### Demo Login Credentials

| Role | Phone | Password |
|------|-------|----------|
| Customer | 0700000001 | 123456 |
| Garage Owner | 0700000002 | 123456 |
| Supplier | 0700000003 | 123456 |

---

## Backend API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register

### Account
- `GET /api/account/me` - Get current user
- `PUT /api/account/me` - Update account
- `DELETE /api/account/me` - Delete account

### Garages
- `GET /api/garages` - List all garages
- `GET /api/garages/{id}` - Get garage details
- `GET /api/garages/owner` - Get owner's garages (requires X-User-Id header)
- `POST /api/garages` - Create garage
- `PUT /api/garages/{id}` - Update garage
- `DELETE /api/garages/{id}` - Delete garage

### Appointments
- `POST /api/appointments` - Book appointment
- `GET /api/appointments/{id}` - Get appointment details
- `GET /api/appointments/garage/{garageId}` - Get garage appointments
- `GET /api/appointments/owner/my-appointments` - Get owner's appointments
- `GET /api/appointments/customer/my-appointments` - Get customer's appointments
- `PUT /api/appointments/{id}` - Update appointment
- `PATCH /api/appointments/{id}/status` - Update appointment status
- `DELETE /api/appointments/{id}` - Cancel appointment

---

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongod` or `docker-compose up` 
- Check connection string in `application.properties`
- Verify firewall isn't blocking port 27017

### Port Already in Use
```bash
# Kill process using port 8080 (Backend)
lsof -ti:8080 | xargs kill -9

# Kill process using port 27017 (MongoDB)
lsof -ti:27017 | xargs kill -9

# Kill process using port 8081 (Mongo Express)
lsof -ti:8081 | xargs kill -9
```

### Seed Data Not Appearing
- Delete the MongoDB database and restart the application
- Check logs for any seeding errors

---

## Stopping Services

### Docker Compose
```bash
docker-compose down
```

### Manual MongoDB
```bash
# macOS
brew services stop mongodb-community

# Linux
sudo systemctl stop mongod

# Windows - Use Task Manager or Services
```

