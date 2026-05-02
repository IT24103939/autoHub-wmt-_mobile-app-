# MongoDB & Backend API Integration Guide

## 📋 Overview

This guide covers the complete MongoDB integration for the WMT Garage & Spare Parts mobile app:

1. **MongoDB Database Setup** - Running MongoDB locally or with Docker
2. **Spring Boot Backend** - REST API endpoints connected to MongoDB
3. **React Native Mobile App** - API client services to call backend endpoints
4. **API Specifications** - Complete endpoint documentation

---

## 🚀 Quick Start

### 1. Start MongoDB (Using Docker - Recommended)

```bash
# Navigate to project directory
cd "year2 sem2/wmt/project wmt mobile app"

# Start MongoDB and optional Mongo Express UI
docker-compose up -d

# Verify services are running
docker-compose ps
```

**MongoDB Details:**
- **URI:** `mongodb://localhost:27017/wmt_garage_db`
- **Username:** root
- **Password:** mongodb
- **Database:** wmt_garage_db

**Mongo Express (Optional Web UI):**
- **URL:** http://localhost:8081
- **Username:** admin
- **Password:** pass

### 2. Build and Run the Backend

```bash
# Navigate to backend directory
cd backend

# Build the project (if Maven is installed)
mvn clean package

# Run the backend
mvn spring-boot:run

# Or start it in the background
java -jar target/garage-spare-parts-backend-0.0.1-SNAPSHOT.jar &
```

**Backend Running on:** `http://localhost:8080`

### 3. Verify Backend Connection

```bash
# Test health endpoint
curl http://localhost:8080/api/health

# Expected response:
# {"status":"ok"}
```

### 4. Test Seed User Login

```bash
# Login as customer
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0700000001",
    "password": "123456"
  }'

# Expected response includes user ID and token
```

---

## 📦 MongoDB Collections & Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  phone: String,           // Unique, normalized
  fullName: String,
  password: String,        // Plain text in demo (should be hashed in production)
  role: String,           // "USER", "GARAGE_OWNER", "SUPPLIER"
  createdAt: Number,      // Timestamp
  updatedAt: Number       // Timestamp
}
```

### Garages Collection
```javascript
{
  _id: ObjectId,
  ownerId: String,        // References user._id
  name: String,
  address: String,
  city: String,
  description: String,    // Optional
  openingHours: String,   // Format: "HH:MM - HH:MM"
  services: [String],     // Array of service names
  mapQuery: String,       // Google Maps search query
  createdAt: Number,
  updatedAt: Number
}
```

### Appointments Collection
```javascript
{
  _id: ObjectId,
  garageId: String,           // References garage._id
  garageOwnerId: String,      // References user._id
  garageName: String,
  customerId: String,         // References user._id
  customerName: String,
  customerPhone: String,
  service: String,            // Service name
  appointmentDate: String,    // Format: "YYYY-MM-DD"
  appointmentTime: String,    // Format: "HH:MM"
  notes: String,              // Optional customer notes
  status: String,             // "PENDING", "CONFIRMED", "CANCELLED"
  createdAt: Number,
  updatedAt: Number
}
```

---

## 🔌 Mobile App API Services

The mobile app includes three API service classes to communicate with the backend:

### 1. ApiClient (Base HTTP Client)

Location: `src/services/ApiClient.ts`

Handles all HTTP requests with:
- Automatic header management
- User authentication (X-User-Id header)
- Error handling
- Timeout management

```typescript
import { apiClient } from "@/services/ApiClient";

// Set authentication
apiClient.setAuthHeaders(userId, token);

// Make requests
const user = await apiClient.get<User>("/account/me");
const garage = await apiClient.post<Garage>("/garages", garageData);
```

### 2. AuthApiService (Authentication)

Location: `src/services/AuthApiService.ts`

Methods:
- `login(request)` - User login
- `register(request)` - User registration
- `getCurrentUser()` - Get logged-in user info
- `updateAccount(fullName, phone, currentPassword, newPassword?)` - Update account
- `deleteAccount()` - Delete account

```typescript
import { authApiService } from "@/services/AuthApiService";

const response = await authApiService.login({
  phone: "0700000001",
  password: "123456"
});

const { token, user } = response;
apiClient.setAuthHeaders(user.id, token);
```

### 3. GarageApiService (Garage Management)

Location: `src/services/GarageApiService.ts`

Methods:
- `getAllGarages()` - List all garages
- `getGarageById(id)` - Get garage details
- `getOwnerGarages()` - Get owner's garages (requires auth)
- `createGarage(garage)` - Create new garage
- `updateGarage(id, updates)` - Update garage
- `deleteGarage(id)` - Delete garage

```typescript
import { garageApiService } from "@/services/GarageApiService";

const garages = await garageApiService.getAllGarages();
const ownerGarages = await garageApiService.getOwnerGarages();

const updated = await garageApiService.updateGarage(garageId, {
  name: "New Name",
  openingHours: "08:00 - 18:00"
});
```

### 4. AppointmentApiService (Appointment Management)

Location: `src/services/AppointmentApiService.ts`

Methods:
- `bookAppointment(appointment)` - Book new appointment
- `getAppointmentById(id)` - Get appointment details
- `getGarageAppointments(garageId)` - Get garage's appointments
- `getOwnerAppointments()` - Get owner's appointments (requires auth)
- `getCustomerAppointments()` - Get customer's appointments (requires auth)
- `updateAppointment(id, updates)` - Update appointment
- `updateAppointmentStatus(id, status)` - Change appointment status
- `cancelAppointment(id)` - Cancel appointment

```typescript
import { appointmentApiService } from "@/services/AppointmentApiService";

const appointment = await appointmentApiService.bookAppointment({
  garageId: "garage-123",
  garageOwnerId: "owner-456",
  garageName: "Fast Fix",
  customerId: "customer-789",
  customerName: "John Doe",
  customerPhone: "0700000001",
  service: "Oil Change",
  appointmentDate: "2024-04-10",
  appointmentTime: "14:00"
});
```

---

## 🔐 Authentication Flow

### 1. During App Startup (AuthContext)

```typescript
// In AuthContext, after successful login
const { token, user } = await authApiService.login(credentials);

// Set API client headers for subsequent requests
apiClient.setAuthHeaders(user.id, token);

// Store in context
setCurrentUser(user);
setIsAuthenticated(true);
```

### 2. Protected Endpoints

All endpoints except `/auth/login` and `/auth/register` require `X-User-Id` header:

```bash
curl -H "X-User-Id: user-id-123" http://localhost:8080/api/account/me
```

---

## 📡 REST API Endpoints

### Authentication

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/auth/login` | Login | `{phone, password}` |
| POST | `/auth/register` | Register | `{phone, fullName, password, role}` |

### Account

| Method | Endpoint | Description | Headers |
|--------|----------|-------------|---------|
| GET | `/account/me` | Get current user | X-User-Id |
| PUT | `/account/me` | Update account | X-User-Id |
| DELETE | `/account/me` | Delete account | X-User-Id |

### Garages

| Method | Endpoint | Description | Headers |
|--------|----------|-------------|---------|
| GET | `/garages` | List all garages | - |
| GET | `/garages/{id}` | Get garage details | - |
| GET | `/garages/owner` | Get owner's garages | X-User-Id |
| POST | `/garages` | Create garage | X-User-Id |
| PUT | `/garages/{id}` | Update garage | X-User-Id |
| DELETE | `/garages/{id}` | Delete garage | X-User-Id |

### Appointments

| Method | Endpoint | Description | Headers |
|--------|----------|-------------|---------|
| POST | `/appointments` | Book appointment | - |
| GET | `/appointments/{id}` | Get appointment | - |
| GET | `/appointments/garage/{garageId}` | Get garage appointments | - |
| GET | `/appointments/owner/my-appointments` | Get owner's appointments | X-User-Id |
| GET | `/appointments/customer/my-appointments` | Get customer's appointments | X-User-Id |
| PUT | `/appointments/{id}` | Update appointment | - |
| PATCH | `/appointments/{id}/status?status=CONFIRMED` | Update status | - |
| DELETE | `/appointments/{id}` | Cancel appointment | - |

---

## 🔍 Error Handling

All API services throw errors with descriptive messages:

```typescript
try {
  await garageApiService.updateGarage(id, updates);
} catch (error) {
  console.error(error.message); // e.g., "Garage not found or unauthorized"
  Alert.alert("Error", error.message);
}
```

Common HTTP Status Codes:
- **200/201** - Success
- **400** - Bad request (validation error)
- **401** - Unauthorized (missing/invalid credentials)
- **404** - Not found
- **409** - Conflict (e.g., duplicate appointment slot)
- **500** - Server error

---

## 🧪 Testing the Integration

### 1. Test Backend API Directly

```bash
# List all garages
curl http://localhost:8080/api/garages

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"0700000001","password":"123456"}'

# Book an appointment
curl -X POST http://localhost:8080/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "garageId":"garage-id",
    "customerId":"customer-id",
    "appointmentDate":"2024-04-10",
    "appointmentTime":"14:00"
  }'
```

### 2. Test from Mobile App

Update your login screen to use the real API:

```typescript
// In LoginScreen.tsx
const handleLogin = async () => {
  try {
    const response = await authApiService.login({
      phone,
      password
    });
    
    // Set API auth headers
    apiClient.setAuthHeaders(response.user.id, response.token);
    
    // Update auth context
    handleLoginSuccess(response.user);
  } catch (error) {
    Alert.alert("Login Failed", error.message);
  }
};
```

---

## 🛠️ Troubleshooting

### MongoDB Connection Errors

**Symptom:** Backend won't start, connection refused on 27017

**Solution:**
```bash
# Check if MongoDB is running
docker-compose ps

# Restart if needed
docker-compose down
docker-compose up -d

# Verify connection
telnet localhost 27017
```

### CORS Errors in Mobile App

**Backend has CORS enabled for all origins** (`@CrossOrigin(origins = "*")`), so this shouldn't be an issue.

If you still see CORS errors:
1. Verify backend is running on port 8080
2. Check API endpoint paths match exactly
3. Debug with browser DevTools if testing in web

### Seed Data Not Loading

**Symptom:** Demo users login fails

**Solution:**
1. Delete MongoDB volume: `docker-compose down -v`
2. Restart: `docker-compose up -d`
3. Restart backend - seed data will auto-populate

### Appointment Slot Conflicts

**Symptom:** Booking appointment returns 409 conflict error

**Solution:** This is intentional - each garage/date/time combo can only have one appointment. Check available slots in the UI before booking.

---

## 📚 Next Steps

1. **Production Deployment:**
   - Use MongoDB Atlas instead of local instance
   - Implement JWT token verification
   - Hash passwords using bcrypt
   - Add request validation middleware

2. **Real Data:**
   - Replace mock garage and spare parts data
   - Connect inventory system
   - Implement real payment processing

3. **Advanced Features:**
   - Appointment reminders via SMS/email
   - Push notifications
   - Real-time appointment updates via WebSockets
   - Analytics and reporting

---

## 📖 Documentation Links

- [Spring Boot MongoDB](https://spring.io/projects/spring-data-mongodb)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Native Fetch API](https://reactnative.dev/docs/network)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

