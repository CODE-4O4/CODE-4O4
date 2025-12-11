# Admin Password Setup

## Security Update

The admin password has been moved from the codebase to environment variables for better security.

## Setup Instructions

### 1. Local Development

Add the following line to your `.env.local` file:

```bash
ADMIN_PASSWORD=your_secure_password_here
```

**Replace `your_secure_password_here` with a strong password of your choice.**

### 2. Production (Vercel)

If you're deploying to Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add a new environment variable:
   - **Name**: `ADMIN_PASSWORD`
   - **Value**: Your secure password
   - **Environment**: Production (and Preview if needed)
5. Redeploy your application

### 3. Other Hosting Platforms

For other platforms, add the `ADMIN_PASSWORD` environment variable through their respective configuration interfaces.

## Important Notes

- ⚠️ **Never commit your `.env.local` file to Git** (it's already in `.gitignore`)
- ⚠️ **Use a strong, unique password** for production
- ✅ The application will now return a "Server configuration error" if `ADMIN_PASSWORD` is not set
- ✅ No password is hardcoded in the source code anymore

## Testing

After setting the environment variable:

1. Restart your development server
2. Navigate to the admin login page
3. Use your configured password to authenticate
