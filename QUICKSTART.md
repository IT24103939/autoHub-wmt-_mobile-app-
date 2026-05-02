# 🚀 Quick Start Guide - After Port 8081 Cleanup

## Status ✅
- **Port 8081** (Mongo Express) has been cleared
- **MongoDB** and **Spring Boot Backend** need to be started

---

## 📋 Step-by-Step Setup

### Step 1: Install MongoDB (One-time)

**Windows Installation:**
1. Download from: https://www.mongodb.com/try/download/community
2. Run installer with default settings
3. MongoDB will auto-start as a Windows Service
4. Verify: Open Command Prompt and run `mongod --version`

**Ubuntu/Linux:**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongod
```

**macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

---

### Step 2: Build the Backend (One-time)

You need Maven installed first:

**Windows:**
1. Download Maven from: https://maven.apache.org/download.cgi
2. Extract to a folder (e.g., `C:\Maven`)
3. Add to Windows environment variables:
   - Variable name: `MAVEN_HOME`
   - Value: `C:\Maven\apache-maven-3.9.12`
4. Add `%MAVEN_HOME%\bin` to PATH
5. Verify: `mvn --version`

**Or use online Maven:**
```bash
cd "D:\year2 sem2\wmt\project wmt mobile app\backend"
mvn clean package
```

---

### Step 3: Start the Backend

**Option A: Using the built JAR (if compiled)**
```bash
cd "D:\year2 sem2\wmt\project wmt mobile app\backend"
java -jar target/garage-spare-parts-backend-0.0.1-SNAPSHOT.jar
```

**Option B: Using Maven**
```bash
cd "D:\year2 sem2\wmt\project wmt mobile app\backend"
mvn spring-boot:run
```

---

### Step 4: Verify Backend is Running

```bash
# Test health endpoint
curl http://localhost:8080/api/health

# Expected response:
# {"status":"ok"}
```

---

### Step 5: Start Mobile App

```bash
cd "D:\year2 sem2\wmt\project wmt mobile app"
npm start
```

Or with Expo:
```bash
npx expo start
```

---

## 🗝️ Test Credentials

| Role | Phone | Password |
|------|-------|----------|
| Customer | 0700000001 | 123456 |
| Garage Owner | 0700000002 | 123456 |
| Supplier | 0700000003 | 123456 |

---

## 📡 Backend API Endpoints (Available)

Once backend is running on `http://localhost:8080`:

```bash
# Health check
curl http://localhost:8080/api/health

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"0700000001","password":"123456"}'

# List all garages
curl http://localhost:8080/api/garages
```

---

## ⚙️ Environment Details

- **Backend Port:** 8080
- **Mobile App Port:** 8081 (Expo) ✅ *Now cleared*
- **MongoDB Port:** 27017
- **Database Name:** wmt_garage_db

---

## 🆘 Troubleshooting

### Maven Not Found
```bash
# Option 1: Install Maven locally
# Download from https://maven.apache.org/download.cgi

# Option 2: Use online Maven
# Run from "D:\year2 sem2\wmt\project wmt mobile app\backend"
```

### MongoDB Connection Fails
- Ensure MongoDB is running: `mongod.exe` starts automatically on Windows
- Check database is accessible: `mongo --version`
- If not installed, download from https://www.mongodb.com/try/download/community

### Port Already in Use
```bash
# Find process on port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

---

## 📚 Documentation Files Available

- **MONGODB_SETUP.md** - Detailed MongoDB installation
- **DATABASE.md** - Complete API documentation
- **BACKEND_INTEGRATION.md** - Architecture & integration guide

---

## ✨ What's Ready

✅ **Codebase**: Spring Boot + MongoDB backend fully built
✅ **API Services**: TypeScript services for mobile app (ApiClient, AuthApiService, GarageApiService, AppointmentApiService)
✅ **Database Models**: User, Garage, Appointment documents
✅ **REST Endpoints**: Auth, Account, Garage, Appointment controllers
✅ **Docker Compose**: Ready for containerized deployment
✅ **Documentation**: Comprehensive guides included

---

## 🎯 Next Actions

1. **Install MongoDB** (if not already installed)
2. **Install Maven** (if not already installed)
3. **Build Backend**: `mvn clean package` in backend directory
4. **Start Backend**: `java -jar target/garage-spare-parts-backend-0.0.1-SNAPSHOT.jar`
5. **Test API**: Use curl commands above
6. **Start Mobile App**: `npm start` or `npx expo start`

Once all are running:
- Backend: http://localhost:8080
- Mobile App: Expo on your device/emulator
- MongoDB: localhost:27017

---

**All services are configured and ready to launch!**

