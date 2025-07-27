# Render Deployment Guide

## Prerequisites
1. Create a GitHub repository and push your code
2. Create a free Render account at https://render.com

## Deployment Steps

### Method 1: Using render.yaml (Recommended)
1. **Connect GitHub Repository**
   - Go to Render Dashboard
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

2. **Environment Variables**
   - DATABASE_URL will be automatically set from the PostgreSQL database
   - All other environment variables are configured in render.yaml

### Method 2: Manual Setup
1. **Create PostgreSQL Database**
   - Go to Render Dashboard
   - Click "New" → "PostgreSQL"
   - Name: `mylittlebank-db`
   - Plan: Free
   - Copy the Internal Database URL for next step

2. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: mylittlebank-app
     - **Environment**: Node
     - **Build Command**: `npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Free

3. **Set Environment Variables**
   - In your web service settings
   - Add environment variable:
     - **Key**: `DATABASE_URL`
     - **Value**: [Your PostgreSQL Internal Database URL]
     - **Key**: `NODE_ENV`
     - **Value**: `production`

## Database Setup
After deployment, you'll need to push your database schema:

1. **Get your DATABASE_URL** from Render PostgreSQL dashboard
2. **Set it locally** for migration:
   ```bash
   export DATABASE_URL="your-render-database-url"
   ```
3. **Push schema**:
   ```bash
   npm run db:push
   ```

## Important Notes
- **Free Tier Limitations**: 
  - Web service spins down after 15 minutes of inactivity
  - 750 hours/month (enough for most personal projects)
  - PostgreSQL: 1GB storage, 97 connections

- **Custom Domain**: Available even on free tier
- **Automatic HTTPS**: Included by default
- **Auto-deploys**: Triggered by GitHub pushes

## Monitoring
- Check deployment logs in Render dashboard
- Monitor database usage in PostgreSQL service
- Set up custom domain if needed

## Troubleshooting
- If build fails, check that all dependencies are in `dependencies` not `devDependencies`
- Ensure DATABASE_URL is properly set
- Check logs for any runtime errors