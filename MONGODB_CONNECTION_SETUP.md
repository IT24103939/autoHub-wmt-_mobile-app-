# MongoDB Setup Guide for WMT App

## Quick Start - 3 Options

### ⭐ Option 1: MongoDB Atlas (Cloud - Easiest)

**Steps:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free tier available)
3. Create a new project and cluster
4. Go to Database → Collections
5. Click "Connect" button
6. Choose "Driver" and copy connection string
7. Replace in `.env`:
   ```
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/wmt_garage_db?retryWrites=true&w=majority
   ```
8. Start backend:
   ```bash
   cd d:\wmt\backend-node
   npm start
   ```

**Your current .env is ready for this!** Just update with your real Atlas credentials.

---

### Option 2: Local MongoDB (Windows)

**Steps:**
1. Download from: https://www.mongodb.com/try/download/community
2. Run installer → "Install MongoDB as a Windows Service"
3. MongoDB starts automatically on `localhost:27017`
4. Update `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/wmt_garage_db
   ```
5. Start backend:
   ```bash
   npm start
   ```

---

### Option 3: Docker Compose

**Requirements:** Docker Desktop installed

**Steps:**
```bash
cd d:\wmt
docker-compose up -d mongodb
```

Then start backend:
```bash
cd backend-node
npm start
```

MongoDB will be available on `localhost:27017` with credentials:
- Username: `root`
- Password: `mongodb`

---

## Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:27017"
- MongoDB is not running
- Use one of the 3 options above to start it

### Error: "Authentication failed"
- Check username/password in connection string
- For Atlas: Make sure IP is whitelisted (0.0.0.0/0 for development)

### Error: "Database not found"
- Backend will auto-create `wmt_garage_db` on first connection ✅

---

## Current Status

✅ `.env` file is configured for MongoDB Atlas (cloud)
⏳ Awaiting: Atlas account setup or local MongoDB installation
⏳ Next: Run `npm start` in `backend-node` folder after MongoDB is ready
