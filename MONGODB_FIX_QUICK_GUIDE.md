# MongoDB Connection Error - FIX SUMMARY

## What's Wrong?
❌ MongoDB is not running on `localhost:27017`
❌ Your backend can't start without a database connection

## Current Status
✅ Your `.env` file is already configured for MongoDB Atlas (cloud option)
⏳ You need to either:
   1. Set up a free MongoDB Atlas account, OR
   2. Install MongoDB locally, OR  
   3. Use Docker to run MongoDB

## Quick Fix Steps

### FASTEST OPTION - MongoDB Atlas (Cloud):

```bash
# 1. Go to: https://www.mongodb.com/cloud/atlas
# 2. Create free account
# 3. Create a cluster
# 4. Click "Connect" → "Drivers" → Copy connection string
# 5. Update your .env file MONGODB_URI with the string you copied
# 6. Run backend:

cd d:\wmt\backend-node
npm start
```

### ALTERNATIVE - Local MongoDB (If you want to install):

```bash
# 1. Download: https://www.mongodb.com/try/download/community
# 2. Run installer (Windows service option)
# 3. MongoDB auto-starts on localhost:27017
# 4. Update .env to use local connection:
#    MONGODB_URI=mongodb://localhost:27017/wmt_garage_db
# 5. Run backend:

cd d:\wmt\backend-node
npm start
```

## Error Details:
- **Current error:** `connect ECONNREFUSED 127.0.0.1:27017`
- **Cause:** No database service listening on port 27017
- **Solution:** Start MongoDB using one of the options above

## Next Steps:
1. Choose MongoDB Atlas OR Local Installation
2. Set up/start MongoDB
3. Update `.env` with correct connection string
4. Run `npm start` in `backend-node` folder
5. Backend should now start successfully ✅
