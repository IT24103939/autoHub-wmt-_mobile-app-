# 🚗 Garage and Spare Parts Marketplace

A comprehensive mobile platform built to seamlessly connect end users, garage owners, and spare parts suppliers. The app allows users to easily locate local garages, book appointments, and browse or purchase automotive spare parts directly from verified suppliers.

## ✨ Key Features

*   **👥 Role-Based Access Control:** Distinct profiles and functionalities for Users, Garage Owners, and Spare Part Suppliers.
*   **🏪 Garage Management:** Garage owners can easily register, manage their garage details, and oversee user appointments.
*   **🛒 Spare Parts Marketplace:** Suppliers can add and manage inventory, while users can browse, add items to their cart, and securely purchase spare parts.
*   **🔐 Secure Authentication:** Complete user registration and login system featuring secure password hashing using `bcrypt` and JWT-based session management.
*   **📱 Native Mobile Experience:** Built with React Native and Expo for a smooth, high-performance experience on both iOS and Android platforms.
*   **📧 Automated Notifications:** Integrated email services via Nodemailer for registration and order updates.

## 🛠️ Technology Stack

*   **Frontend:** React Native (Expo SDK 54), TypeScript, React Navigation 7
*   **Backend:** Node.js, Express.js (Deployed on Render)
*   **Database:** MongoDB, Mongoose
*   **Authentication:** JWT, bcryptjs
*   **CI/CD:** Render (Backend), EAS Build (Frontend APK)

## 🌐 Deployment Status

*   **Backend API:** `https://mobile-app-backend-i1rk.onrender.com/api`
*   **Health Check:** `https://mobile-app-backend-i1rk.onrender.com/api/health`
*   **Note:** The backend is on a free tier and may sleep after 15 minutes of inactivity. The first request after a sleep period may take 30-60 seconds to respond.

## 🏗️ Build & Stabilization

The application has been hardened for production APK stability:
*   **Global Error Boundary:** Prevents silent crashes by showing a recovery screen.
*   **Native Bridge Stabilization:** Added a startup delay to ensure the native bridge is ready before rendering complex UI.
*   **Adaptive Icon Support:** Correctly configured for modern Android compatibility.
*   **Response Polyfill Fix:** Resolved issues with `fetch` polyfills in production environments.

### Generating an Android APK
To generate a new installable APK using EAS Build:
1.  Install EAS CLI: `npm install -g eas-cli`
2.  Log in: `eas login`
3.  Build: `eas build --platform android --profile preview`

## 📁 Project Structure

```text
wmt/
├── backend-node/             # Node.js Express Backend
│   ├── src/
│   │   ├── routes/           # Express API endpoints
│   │   └── server.js         # Core API setup and database connection
├── src/                      # React Native Frontend App
│   ├── context/              # Auth and Shop state providers
│   ├── navigation/           # React Navigation setup
│   ├── screens/              # Application screens
│   ├── services/             # API clients (pointing to Render)
│   └── hooks/                # Custom hooks (useAuth, useShop, useAppTheme)
├── App.tsx                   # Main entry point with ErrorBoundary
├── app.json                  # Expo config (CNG enabled)
└── eas.json                  # EAS Build profiles
```

## 🚀 Development

1.  **Frontend**: `npm start`
2.  **Backend**: `cd backend-node && npm run dev`

Ensure your `src/services/ApiClient.ts` is configured with the correct `API_BASE_URL`.
