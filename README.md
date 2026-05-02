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

*   **Frontend:** React Native, Expo, TypeScript, React Navigation
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB, Mongoose
*   **Authentication:** JWT, bcryptjs
*   **Other:** Nodemailer (Email services)

## 📁 Project Structure

```text
wmt/
├── backend-node/             # Node.js Express Backend
│   ├── src/
│   │   ├── controllers/      # API route handlers
│   │   ├── models/           # Mongoose database schemas
│   │   ├── routes/           # Express API endpoints
│   │   └── server.js         # Core API setup and database connection
│   └── package.json
├── src/                      # React Native Frontend App
│   ├── assets/               # Images, icons, and static assets
│   ├── components/           # Reusable UI components (common, garage, spareParts)
│   ├── navigation/           # React Navigation setup
│   ├── screens/              # Application screens (Auth, Garages, SpareParts, Cart, Profile)
│   ├── services/             # API clients and HTTP services
│   ├── store/                # State management slices
│   └── types/                # TypeScript interfaces and models
├── App.tsx                   # Main React Native entry point
├── app.json                  # Expo configuration
├── package.json              # Frontend dependencies
├── QUICKSTART.md             # Frontend/Backend setup guide
└── README.md                 # Project Overview
```

## 🚀 Getting Started

To run the project locally, you will need to set up your MongoDB database, configure your environment variables (including your database URI and JWT secrets), and install the necessary dependencies for both the frontend and backend.

Please refer to the `QUICKSTART.md` or `MONGODB_SETUP.md` files for a detailed, step-by-step installation guide.

## 🔒 Security Notes

*   Ensure that your `.env` files in both the frontend and `backend-node` directories containing your database credentials and API keys are never committed to version control.
*   The system uses `bcryptjs` to hash all passwords securely before storing them in the MongoDB database.

## 🤝 Contributing

When contributing to this project, please ensure you test both the backend Express API endpoints and the frontend React Native screens before creating a pull request.
