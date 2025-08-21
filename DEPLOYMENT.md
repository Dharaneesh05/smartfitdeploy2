# SmartFit Deployment Guide for Render

This guide will help you deploy your SmartFit application to Render.com with MongoDB Atlas.

## Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **MongoDB Atlas Cluster**: Set up your cluster as mentioned in the setup

## Deployment Steps

### 1. Prepare Your Repository

Make sure your repository includes:
- All source code
- `package.json` with proper build scripts
- `render.yaml` configuration
- `.env.example` for reference

### 2. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster or use your existing one
3. Get your connection string:
   ```
   mongodb+srv://dharaneeshc23aid:<password>@smartfit.u09ehga.mongodb.net/?retryWrites=true&w=majority&appName=smartfit
   ```
4. Replace `<password>` with your actual database password
5. Whitelist Render IP addresses (0.0.0.0/0 for all IPs during testing)

### 3. Deploy to Render

#### Option A: Using Render Dashboard

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: smartfit
   - **Environment**: Node
   - **Region**: Choose closest to your users
   - **Branch**: main (or your preferred branch)
   - **Root Directory**: (leave empty if root)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free or paid based on needs

5. Add environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A strong random string for JWT encryption
   - `PORT`: 5000
   - `NODE_ENV`: production

#### Option B: Using render.yaml (Infrastructure as Code)

1. Push your code with `render.yaml` to GitHub
2. In Render Dashboard, go to "Blueprints"
3. Connect your repository
4. Render will automatically detect and deploy using the configuration

### 4. Environment Variables

Set these in Render dashboard under your service's "Environment" section:

```env
MONGODB_URI=mongodb+srv://dharaneeshc23aid:your-password@smartfit.u09ehga.mongodb.net/smartfit?retryWrites=true&w=majority&appName=smartfit
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
NODE_ENV=production
```

### 5. Build and Deployment Process

Render will automatically:
1. Install dependencies: `npm install`
2. Build the application: `npm run build`
3. Start the server: `npm start`

### 6. Custom Domain (Optional)

1. In your Render service, go to "Settings"
2. Click "Add Custom Domain"
3. Follow the instructions to configure your DNS

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check that all dependencies are in package.json
   - Verify build script works locally

2. **MongoDB Connection Issues**:
   - Verify your MongoDB Atlas connection string
   - Check IP whitelisting in MongoDB Atlas
   - Verify database user permissions

3. **Application Errors**:
   - Check Render logs in the dashboard
   - Verify environment variables are set correctly

4. **Port Issues**:
   - Ensure your application listens on the PORT environment variable
   - Render provides the port via environment variable

### Checking Logs

1. In Render dashboard, go to your service
2. Click "Logs" tab to see real-time logs
3. Check both build logs and runtime logs

### Database Migration

If you need to migrate existing data:
1. Use `mongodump` to backup local data
2. Use `mongorestore` to import to MongoDB Atlas
3. Or use MongoDB Atlas migration tools

## Monitoring and Maintenance

1. **Health Checks**: Render automatically monitors your service
2. **Auto-deploy**: Enable auto-deploy on git push to main branch
3. **Scale**: Upgrade plan if you need more resources
4. **Backups**: MongoDB Atlas provides automatic backups

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to git
2. **MongoDB Atlas**: Use proper authentication and IP whitelisting
3. **JWT Secret**: Use a strong, random secret key
4. **HTTPS**: Render provides SSL certificates automatically

## Cost Optimization

1. **Free Tier**: Render offers free tier for testing
2. **MongoDB Atlas**: Free tier available (512MB storage)
3. **Auto-sleep**: Free services sleep after inactivity

## Support

If you encounter issues:
1. Check Render documentation: https://render.com/docs
2. Check MongoDB Atlas documentation: https://docs.atlas.mongodb.com
3. Review application logs in Render dashboard
