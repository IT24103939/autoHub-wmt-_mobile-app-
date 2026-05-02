# Admin Account Implementation Guide

## 📱 Mobile App Developer Perspective

This document describes the complete admin account setup for the WMT Mobile App project.

## 🔑 Admin Login Credentials

Use these credentials to login as admin:
- **Phone**: `0700000000`
- **Password**: `123456`
- **Role**: `ADMIN`

## 🏗️ Architecture Overview

### Backend Changes
- ✅ Added `ADMIN` role to User model enum
- ✅ Updated auth routes to accept `ADMIN` role in registration
- ✅ Added admin seed account in database initialization

### Frontend/Mobile App Changes
- ✅ Created `AdminDashboardScreen.tsx` - System overview and management controls
- ✅ Created `AdminAccountScreen.tsx` - Admin profile and account settings
- ✅ Created `AdminApiService.ts` - API client for admin endpoints
- ✅ Updated `AppNavigator.tsx` - Added admin navigation routes
- ✅ Updated `types/models.ts` - Added `ADMIN` to Role type

## 📊 Admin Screens

### 1. Admin Dashboard (`AdminDashboardScreen.tsx`)
**Purpose**: System overview and quick access controls

**Features**:
- System statistics (Total Users, Garages, Appointments, Suppliers)
- Management action buttons
- Real-time API status
- Last sync timestamp

**Key Components**:
- `StatCard` - Displays key metrics in colored cards
- Action buttons for managing different resources
- System information panel

### 2. Admin Account (`AdminAccountScreen.tsx`)
**Purpose**: Admin profile and security settings

**Features**:
- View/edit admin profile (fullName, phone)
- Display admin role and privileges
- Security options (change password, activity log)
- Logout functionality
- List of admin privileges

**Key Components**:
- Avatar and role badge
- Edit mode for profile information
- Privilege list with descriptions
- Security action buttons

## 🛠️ API Endpoints to Implement

The `AdminApiService.ts` file outlines the following endpoints that should be implemented in the backend:

```
GET  /admin/stats                    - Get system statistics
GET  /admin/users                    - List all users (paginated)
GET  /admin/users/:id                - Get user details
POST /admin/users/:id/suspend        - Suspend user account
POST /admin/users/:id/unsuspend      - Re-enable user account
GET  /admin/garages                  - List all garages (paginated)
GET  /admin/appointments             - List all appointments (paginated)
GET  /admin/activity-logs            - Get activity/audit logs
GET  /admin/reports/:type            - Generate reports (daily/weekly/monthly)
PUT  /admin/profile                  - Update admin profile
```

## 🔐 Role-Based Access Control

### Current Implementation
- Authentication middleware validates JWT token and sets `req.authRole`
- Role is encoded in JWT token: `{ sub: userId, role: userRole }`

### Admin Middleware (TODO)
Create `/middleware/requireAdmin.js`:
```javascript
const requireAdmin = (req, res, next) => {
  if (req.authRole !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
module.exports = requireAdmin;
```

Then protect admin routes:
```javascript
router.get('/admin/stats', requireAdmin, async (req, res) => {
  // ... implementation
});
```

## 📱 Navigation Structure

### Admin User Flow
```
Login Screen (phone: 0700000000, password: 123456)
    ↓
Admin Dashboard (AdminHome)
    ├── Dashboard overview with stats
    ├── Management action buttons
    └── Navigate to Account Settings
         ↓
      Admin Account (AdminAccount)
         ├── View profile
         ├── Edit profile
         └── Security settings
```

## 🚀 Next Steps

1. **Backend**:
   - [ ] Implement `/admin/stats` endpoint
   - [ ] Implement `/admin/users` management endpoints
   - [ ] Implement `/admin/garages` endpoint
   - [ ] Implement `/admin/appointments` endpoint
   - [ ] Add `requireAdmin` middleware for protection
   - [ ] Create audit logging system

2. **Mobile App**:
   - [ ] Connect AdminApiService to actual API endpoints
   - [ ] Implement Users Management screen with list/search
   - [ ] Implement Garages Management screen
   - [ ] Implement Appointments Management screen
   - [ ] Implement Activity Log viewer
   - [ ] Add error handling and loading states

3. **Testing**:
   - [ ] Test admin login flow
   - [ ] Test navigation to admin screens
   - [ ] Verify role-based access control
   - [ ] Test API error handling

## 🎨 UI/UX Considerations (Mobile-First)

- Dashboard uses color-coded stat cards for quick visual scanning
- Large touch targets for buttons (min 44x44 pts)
- Bottom tab bar might be added for quick access to Dashboard/Account/Logout
- Responsive layout adapts to screen sizes
- Consistent theme colors from `useAppTheme` hook

## 🔄 Theme Integration

All screens use the `useTheme()` hook to access:
- `colors.primary` - Primary actions
- `colors.success` - Positive actions
- `colors.warning` - Caution actions
- `colors.info` - Informational
- `colors.error` - Destructive actions
- `colors.surface` - Card backgrounds
- `colors.text` / `colors.textSecondary` - Text colors

## 📝 Notes

- Admin accounts are created with role `ADMIN`
- Admin role is restricted to backend route validation (implement middleware)
- No special UI restrictions - admin sees all screens but API rejects unauthorized requests
- Consider implementing activity logging for admin actions for compliance
- Consider Multi-Factor Authentication (MFA) for admin accounts in future

---

**Created**: April 2026
**Developer**: WMT Mobile App Team
