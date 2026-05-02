# MongoDB & Backend Integration - Implementation Summary

## ✅ What Was Built

### Backend (Spring Boot + MongoDB)

**New MongoDB Documents:**
- ✅ User (authentication & profiles)
- ✅ Garage (business information)
- ✅ Appointment (booking system)

**New Repositories:**
- ✅ UserRepository
- ✅ GarageRepository
- ✅ AppointmentRepository

**Services (Business Logic):**
- ✅ AuthService (refactored from in-memory to MongoDB)
- ✅ GarageService (CRUD operations)
- ✅ AppointmentService (booking & slot management)

**REST Controllers:**
- ✅ AuthController (login/register)
- ✅ AccountController (user profile)
- ✅ GarageController (garage CRUD)
- ✅ AppointmentController (booking endpoints)

**Configuration:**
- ✅ MongoDB URI: `mongodb://localhost:27017/wmt_garage_db`
- ✅ CORS enabled on all controllers
- ✅ Auto-seeding of demo users and sample garages

**Docker Compose:**
- ✅ MongoDB container on port 27017
- ✅ Mongo Express UI on port 8081

---

### Mobile App API Services

**New Service Classes:**
- ✅ ApiClient.ts - Base HTTP client with auth headers
- ✅ AuthApiService.ts - Login/register/account management
- ✅ GarageApiService.ts - Garage CRUD operations
- ✅ AppointmentApiService.ts - Appointment booking API

**Features:**
- ✅ Automatic X-User-Id header injection
- ✅ AbortController-based timeouts (30 seconds default)
- ✅ Centralized error handling
- ✅ Type-safe responses with TypeScript generics

---

## 🚀 Getting Started

### Step 1: Start MongoDB

```bash
cd "year2 sem2/wmt/project wmt mobile app"
docker-compose up -d
```

### Step 2: Run the Backend

```bash
cd backend
mvn spring-boot:run
```

**OR** (if Maven isn't installed):
```bash
cd backend
./mvnw spring-boot:run  # On Windows: mvnw.cmd spring-boot:run
```

### Step 3: Verify it's Working

```bash
# Health check
curl http://localhost:8080/api/health

# List all garages
curl http://localhost:8080/api/garages
```

### Step 4: Update Mobile App to Use APIs

The mobile app is already configured with API services, but you need to update the authentication context to use them.

**In src/context/AuthContext.tsx:**

```typescript
import { authApiService } from "../services/AuthApiService";
import { apiClient } from "../services/ApiClient";

// In the login function:
const login = async (phone: string, password: string, role: Role) => {
  try {
    // Call the real backend API
    const response = await authApiService.login({ phone, password });
    
    // Set API authentication
    apiClient.setAuthHeaders(response.user.id, response.token);
    
    // Update context
    setCurrentUser(response.user);
    setIsAuthenticated(true);
  } catch (error) {
    throw error instanceof Error ? error : new Error("Login failed");
  }
};
```

---

## 📊 Database Collections Created

### Users Collection Example
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "phone": "0700000001",
  "fullName": "Demo User",
  "password": "123456",
  "role": "USER",
  "createdAt": 1712239200000,
  "updatedAt": 1712239200000
}
```

### Garages Collection Example
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "ownerId": "507f1f77bcf86cd799439011",
  "name": "AutoCare Garage",
  "address": "123 Main St",
  "city": "Springfield",
  "description": "Professional auto repair and maintenance",
  "openingHours": "08:00 - 18:00",
  "services": ["Oil Change", "Tire Replacement", "Brake Service"],
  "mapQuery": "AutoCare Garage Springfield",
  "createdAt": 1712239200000,
  "updatedAt": 1712239200000
}
```

### Appointments Collection Example
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "garageId": "507f1f77bcf86cd799439012",
  "garageOwnerId": "507f1f77bcf86cd799439011",
  "garageName": "AutoCare Garage",
  "customerId": "507f1f77bcf86cd799439010",
  "customerName": "John Doe",
  "customerPhone": "0700000001",
  "service": "Oil Change",
  "appointmentDate": "2024-04-10",
  "appointmentTime": "14:00",
  "notes": "Standard oil change needed",
  "status": "PENDING",
  "createdAt": 1712239200000,
  "updatedAt": 1712239200000
}
```

---

## 🔑 Demo Credentials

| Role | Phone | Password |
|------|-------|----------|
| Customer | 0700000001 | 123456 |
| Garage Owner | 0700000002 | 123456 |
| Supplier | 0700000003 | 123456 |

These are automatically seeded on first backend startup.

---

## 📋 API Service Usage Examples

### Login and Setup
```typescript
import { authApiService } from "@/services/AuthApiService";
import { apiClient } from "@/services/ApiClient";

// Login
const response = await authApiService.login({
  phone: "0700000002",
  password: "123456"
});

// Setup API client for authenticated requests
apiClient.setAuthHeaders(response.user.id, response.token);
```

### Get All Garages
```typescript
import { garageApiService } from "@/services/GarageApiService";

const garages = await garageApiService.getAllGarages();
```

### Book an Appointment
```typescript
import { appointmentApiService } from "@/services/AppointmentApiService";

const appointment = await appointmentApiService.bookAppointment({
  garageId: "garage-id-123",
  garageOwnerId: "owner-id-456",
  garageName: "FastFix Auto",
  customerId: "customer-id-789",
  customerName: "John Doe",
  customerPhone: "0700000001",
  service: "Oil Change",
  appointmentDate: "2024-04-15",
  appointmentTime: "10:00"
});
```

### Get Owner's Appointments
```typescript
const appointments = await appointmentApiService.getOwnerAppointments();
```

### Update Garage Information
```typescript
const updated = await garageApiService.updateGarage("garage-id-123", {
  name: "New Garage Name",
  openingHours: "09:00 - 19:00",
  services: ["Oil Change", "Tire Service", "Battery Replacement"]
});
```

---

## 🗂️ Project Structure

```
project wmt mobile app/
├── backend/                          # Spring Boot Backend
│   ├── pom.xml                       # Maven dependencies (with MongoDB)
│   ├── src/main/java/com/wmt/backend/
│   │   ├── document/                 # MongoDB documents (User, Garage, Appointment)
│   │   ├── repository/               # MongoDB repositories
│   │   ├── service/                  # Business logic (Auth, Garage, Appointment)
│   │   ├── controller/               # REST endpoints
│   │   ├── dto/                      # Data transfer objects
│   │   ├── exception/                # Exception handling
│   │   └── config/                   # Configuration (CORS, etc.)
│   └── src/main/resources/
│       └── application.properties    # MongoDB URI configuration
│
├── src/                              # React Native Frontend
│   ├── services/                     # API Client Services
│   │   ├── ApiClient.ts             # Base HTTP client
│   │   ├── AuthApiService.ts        # Authentication API
│   │   ├── GarageApiService.ts      # Garage API
│   │   └── AppointmentApiService.ts # Appointment API
│   ├── context/                      # State management (Auth, Shop)
│   ├── screens/                      # UI screens
│   └── types/                        # TypeScript models
│
├── docker-compose.yml                # MongoDB & Mongo Express containers
├── MONGODB_SETUP.md                  # MongoDB installation guide
├── DATABASE.md                       # Complete API documentation
└── README.md                         # Project overview
```

---

## ⚡ Performance Considerations

### Database Indexing
MongoDB automatically creates indexes on:
- `users.phone` - For fast lookups
- `garages.ownerId` - For owner queries
- `appointments.garageId` - For garage appointment queries
- `appointments.customerId` - For customer queries

### API Caching (Future)
Consider implementing:
- Client-side caching for garage lists (rarely changes)
- Cache invalidation on updates
- Local SQLite cache for offline support

### Request Optimization
- Batch appointment queries by date range
- Paginate large result sets
- Use projection to return only needed fields

---

## 🔐 Security Notes

**Current Implementation (Demo):**
- ❌ Passwords stored in plain text
- ✅ CORS enabled
- ✅ User ID header validation
- ⚠️  Basic token generation

**For Production:**
1. Hash passwords with bcrypt: `npm install bcryptjs`
2. Implement JWT validation
3. Add rate limiting
4. Use HTTPS instead of HTTP
5. Implement refresh tokens
6. Add request validation middleware
7. Sanitize user inputs

---

## 🐛 Common Issues & Solutions

### MongoDB Connection Fails
```bash
# Check if containers are running
docker-compose ps

# View logs
docker-compose logs mongodb

# Restart
docker-compose restart mongodb
```

### Backend Won't Start
```bash
# Check if port 8080 is in use
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or use different port in application.properties
server.port=8085
```

### API Calls Return 404
- Verify endpoint path matches exactly
- Check backend is running on localhost:8080
- Verify X-User-Id header is included for protected endpoints

### Mobile App Still Using Mock Data
- Ensure API services are imported correctly
- Check apiClient.setAuthHeaders() is called after login
- Verify API endpoints in services match backend paths

---

## 📚 Additional Resources

- [Spring Boot Data MongoDB Documentation](https://spring.io/projects/spring-data-mongodb)
- [MongoDB Best Practices](https://docs.mongodb.com/manual/administration/production-checklist/)
- [REST API Design Best Practices](https://restfulapi.net/)
- [React Native Networking Guide](https://reactnative.dev/docs/network)

---

## ✨ What's Next

1. **Update Authentication Flow** - Integrate API services with AuthContext
2. **Test API Integration** - Verify all endpoints work from mobile app
3. **Add Error Handling** - Implement proper error recovery
4. **Implement Caching** - Cache garage lists for offline support
5. **Database Backup** - Set up MongoDB backup strategy
6. **Performance Tuning** - Optimize queries and indexes
7. **Deploy to Production** - Use MongoDB Atlas and cloud deployment

---

**Built with ❤️ as a senior developer approach to mobile app architecture**

