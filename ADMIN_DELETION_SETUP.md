# Admin User Deletion with Email Notifications

## 📧 Email Notification Feature

Admin can now delete user accounts and automatically send notification emails to the deleted user explaining why their account was removed.

### Features Implemented

✅ **Admin User Deletion**
- Admin can view all users in the system
- Search users by name or phone
- Delete user accounts with custom reason
- Automatic email notification sent to deleted user

✅ **Email Notification**
- Professional HTML email template
- Includes deletion reason from admin
- Lists consequences of account deletion
- Contact information for support
- Fallback plain text version

✅ **Users Management Screen**
- List all users with role badges
- Search/filter functionality
- Quick suspend/delete actions
- Role-based color coding
- Deletion confirmation modal with reasoning

---

## 🛠️ Backend Setup

### 1. Install Email Package

Add nodemailer to your backend:

```bash
cd backend-node
npm install nodemailer
```

Update `package.json` dependencies to include `nodemailer: "^6.9.x"`

### 2. Environment Variables

Added to `.env` file:

```env
# Email Service Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@example.com

# Alternative: Use other email services
# For SendGrid:
# EMAIL_SERVICE=sendgrid
# SENDGRID_API_KEY=your-sendgrid-api-key

# For custom SMTP:
# EMAIL_HOST=smtp.example.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@example.com
# EMAIL_PASSWORD=your-password
```

### 3. Configure Email Service

The email service is configured in `backend-node/src/services/emailService.js`:

```javascript
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

### 4. Admin Routes

New endpoints added in `backend-node/src/routes/adminRoutes.js`:

```
GET  /api/admin/users              - List all users (paginated)
GET  /api/admin/users/:id          - Get single user details
POST /api/admin/users/:id/delete   - Delete user with reason
POST /api/admin/users/:id/suspend  - Suspend user account
GET  /api/admin/stats              - Get system statistics
```

**Delete User Endpoint:**
```bash
POST /api/admin/users/:userId/delete
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "reason": "Violation of terms of service"
}
```

**Response:**
```json
{
  "message": "User account deleted successfully",
  "deletedUser": {
    "id": "user-id",
    "fullName": "John Doe",
    "phone": "0700000001",
    "role": "USER"
  },
  "emailSent": true
}
```

---

## 📱 Mobile App Implementation

### 1. Screens Created

**AdminUsersManagementScreen.tsx**
- Browse all system users
- Search by name or phone
- Role badges with color coding
- Action buttons (Suspend/Delete)
- Deletion confirmation modal

### 2. Services Updated

**AdminApiService.ts** - New methods added:
```typescript
// Delete user account
deleteUserAccount(userId: string, reason: string): Promise<any>

// Suspend user account
suspendUserAccount(userId: string, reason: string): Promise<any>

// Get all users list
getAllUsers(page: number, limit: number): Promise<UserManagementData[]>
```

### 3. Navigation Routes

Added to AppNavigator:
```typescript
AdminHome          → Admin Dashboard
  ├── AdminUsers   → Users Management (NEW)
  ├── AdminAccount → Account Settings
  └── Profile      → Profile Screen
```

---

## 📧 Email Configuration Guide

### Gmail Configuration (Recommended for Testing)

1. **Generate App Password:**
   - Go to https://myaccount.google.com/security
   - Enable 2-Factor Authentication
   - Go to App passwords → Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password

2. **Add to `.env`:**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   EMAIL_FROM=noreply@wmtapp.com
   ```

### SendGrid Configuration (Production)

1. **Create SendGrid Account:**
   - Sign up at https://sendgrid.com
   - Create API key

2. **Add to `.env`:**
   ```env
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **Update emailService.js:**
   ```javascript
   const sgMail = require('@sendgrid/mail');
   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
   ```

### Custom SMTP Configuration

For any SMTP server:

```env
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=noreply@example.com
```

---

## 🔐 Security Considerations

1. **Admin-Only Access:**
   - Delete endpoint requires `requireAdmin` middleware
   - JWT token with `ADMIN` role required
   - Cannot delete own account (hard-coded check)

2. **Audit Logging:**
   - All deletions logged to console (TODO: implement database audit table)
   - Log includes: admin name, deleted user, reason, timestamp

3. **Email Safety:**
   - Reason displayed in email notification
   - Support contact included
   - Professional, clear language

4. **Error Handling:**
   - Email failure doesn't block account deletion
   - Logs warning but continues with hard delete
   - Client receives `emailSent: true/false` status

---

## 📋 User Flow

### Admin Deletes User Account

```
1. Admin opens Users Management screen
   ↓
2. Searches for / selects user
   ↓
3. Clicks "Delete" button
   ↓
4. Confirmation modal appears with:
   - User details (name, phone, role)
   - Warning: "This action cannot be undone!"
   - Text field to enter deletion reason
   ↓
5. Admin enters reason (e.g., "Spam account")
   ↓
6. Confirms deletion
   ↓
7. API request: POST /api/admin/users/{id}/delete
   ↓
8. Backend:
   - Validates admin role
   - Prevents self-deletion
   - Sends email notification with reason
   - Deletes user from database
   ↓
9. User receives email:
   - Subject: "Account Deletion Notification - WMT Mobile App"
   - Body includes deletion reason
   - Lists consequences
   - Support contact info
   ↓
10. Alert shown to admin: "Account deleted successfully"
```

---

## ✉️ Email Template Content

**Subject:** Account Deletion Notification - WMT Mobile App

**Email includes:**
- Deletion notification header
- User greeting with full name
- Alert box with deletion notice
- Admin name who performed deletion
- **Deletion reason** (from admin input)
- Deletion date and time
- Consequences listed:
  - Account removed from system
  - Cannot login anymore
  - Appointments cancelled
  - Records retained for compliance
- Support contact: support@wmtapp.com
- Professional footer with copyright

---

## 🐛 Troubleshooting

### Email Not Sending

1. **Check credentials:**
   ```bash
   # Test email service manually
   node -e "
   const nodemailer = require('nodemailer');
   const transporter = nodemailer.createTransport({
     service: 'gmail',
     auth: { user: 'your-email@gmail.com', pass: 'your-app-password' }
   });
   transporter.verify((err, success) => {
     console.log(err || success);
   });
   "
   ```

2. **Gmail specific issues:**
   - Check "Less secure app access" is enabled
   - App password must be 16 characters
   - 2FA must be enabled

3. **Check service running:**
   ```bash
   npm run dev
   # Look for any email service initialization errors
   ```

### User Not Receiving Email

1. Check spam folder
2. Verify email address in deletion request
3. Check backend logs for email errors
4. Verify `EMAIL_FROM` is set correctly

---

## 🚀 Testing

### Test Delete Endpoint

```bash
# 1. Login as admin
POST http://localhost:8080/api/auth/login
{
  "phone": "0700000000",
  "password": "123456"
}

# Copy token from response

# 2. Delete a user
POST http://localhost:8080/api/admin/users/{userId}/delete
Authorization: Bearer <token>
{
  "reason": "Test deletion reason"
}
```

### Test Mobile App Flow

1. Login as admin (0700000000 / 123456)
2. Tap "👥 Manage Users"
3. Search for a test user
4. Tap "🗑️ Delete"
5. Enter deletion reason
6. Confirm deletion
7. Check user's email inbox

---

## 📦 Files Modified/Created

### Backend
- ✅ `src/services/emailService.js` - Email sending utility
- ✅ `src/routes/adminRoutes.js` - Admin API endpoints
- ✅ `src/server.js` - Register admin routes

### Frontend
- ✅ `src/screens/admin/AdminUsersManagementScreen.tsx` - Users management UI
- ✅ `src/services/AdminApiService.ts` - Delete method added
- ✅ `src/navigation/AppNavigator.tsx` - Route added

---

## ✅ Verification Checklist

- [ ] Email service configured with `.env` variables
- [ ] Email credentials tested and verified
- [ ] Admin login works (0700000000 / 123456)
- [ ] Users Management screen navigates from Dashboard
- [ ] Can search users by name/phone
- [ ] Delete button opens confirmation modal
- [ ] Reason is required to confirm deletion
- [ ] Email received after deletion
- [ ] Email contains deletion reason
- [ ] User no longer exists in database
- [ ] Cannot delete own admin account
- [ ] Error handling works for invalid operations

---

**Last Updated:** April 2026
**Status:** Ready for Testing
