# MongoDB Setup Guide for SmartFit Application

This guide will help you set up MongoDB for the SmartFit application and migrate all existing data from localStorage/sessionStorage to MongoDB.

## Prerequisites

1. **MongoDB Installation**: Make sure MongoDB is installed and running on your system
   - **Windows**: Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - **macOS**: `brew install mongodb-community`
   - **Linux**: Follow [official installation guide](https://docs.mongodb.com/manual/installation/)

2. **Node.js and npm**: Ensure you have Node.js (v16+) and npm installed

## Quick Setup

### 1. Start MongoDB Server

**Windows:**
```bash
# Start MongoDB service
net start MongoDB

# Or start manually
mongod --dbpath "C:\data\db"
```

**macOS/Linux:**
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or start manually
mongod --dbpath /data/db
```

### 2. Verify MongoDB Connection

```bash
# Test connection
mongo --eval "db.runCommand('ping')"
```

### 3. Run the Application

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

## Environment Configuration

The application uses environment variables for configuration. The `.env` file is already created with:

```env
MONGODB_URI=mongodb://localhost:27017/smartfit
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
NODE_ENV=development
```

## Data Migration

### Automatic Migration
The application will automatically:
1. Connect to MongoDB on startup
2. Create all necessary collections and indexes
3. Handle all CRUD operations through the MongoStorage class

### Manual Migration (Optional)
If you want to run the migration script manually:

```bash
# Run the migration script
node scripts/migrate-to-mongodb.js
```

## Database Structure

### Collections Created:
- **users**: User accounts and authentication
- **measurements**: Body measurements for fit analysis
- **products**: Product information and measurements
- **fitAnalyses**: Fit analysis results
- **favorites**: User favorite products
- **recommendations**: AI-generated recommendations
- **userHistory**: User activity history
- **notifications**: User notifications

### Indexes Created:
- Unique email and username for users
- User ID indexes for all user-related collections
- Composite indexes for favorites (userId + productId)

## API Endpoints

All existing API endpoints remain the same. The application now uses MongoDB for all data storage:

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Measurements
- `GET /api/measurements` - Get user measurements
- `POST /api/measurements` - Create/update measurements

### Products
- `POST /api/products` - Create product
- `GET /api/products/:id` - Get product by ID

### Fit Analysis
- `POST /api/fit-predict` - Analyze fit for a product
- `GET /api/fit-analyses` - Get user's fit analyses

### Favorites
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:productId` - Remove from favorites

### Recommendations
- `GET /api/recommendations` - Get recommendations
- `POST /api/recommendations` - Create recommendation

### History
- `GET /api/history` - Get user history
- `POST /api/history` - Add to history

### Notifications
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/:id/read` - Mark as read

## Troubleshooting

### MongoDB Connection Issues
1. **Check if MongoDB is running**:
   ```bash
   # Windows
   net start MongoDB

   # macOS/Linux
   sudo systemctl status mongod
   ```

2. **Verify connection string**:
   - Default: `mongodb://localhost:27017/smartfit`
   - For MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/smartfit`

3. **Check MongoDB logs**:
   - Windows: `C:\Program Files\MongoDB\Server\5.0\log\mongod.log`
   - macOS/Linux: `/var/log/mongodb/mongod.log`

### Common Issues
- **Port already in use**: Change PORT in .env file
- **Authentication failed**: Check MongoDB credentials
- **Collection not found**: Restart the server to auto-create collections

## Testing the Setup

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Test endpoints**:
   - Visit `http://localhost:5000`
   - Try registering a new user
   - Add measurements
   - Test fit analysis

3. **Verify MongoDB data**:
   ```bash
   # Connect to MongoDB
   mongo

   # Check collections
   use smartfit
   show collections

   # Check data
   db.users.find()
   db.measurements.find()
   ```

## Production Deployment

For production deployment:

1. **Use MongoDB Atlas**:
   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Update `MONGODB_URI` in `.env` with your connection string

2. **Set secure JWT secret**:
   - Generate a strong random string
   - Update `JWT_SECRET` in `.env`

3. **Set NODE_ENV=production**:
   ```bash
   export NODE_ENV=production
   ```

## Backup and Restore

### Backup MongoDB
```bash
mongodump --db smartfit --out ./backup
```

### Restore MongoDB
```bash
mongorestore --db smartfit ./backup/smartfit
```

## Support

If you encounter any issues:
1. Check the console logs for error messages
2. Verify MongoDB is running and accessible
3. Ensure all environment variables are correctly set
4. Check the troubleshooting section above
