# Portfolio Admin Panel

A secure, enterprise-grade admin panel for managing Gaurav's portfolio, built with Next.js, Firebase Authentication, and Firestore.

## Features

- ✅ **Secure Authentication**: Google OAuth with Firebase Authentication
- ✅ **User Authorization**: Only allows access to `gauravpatil9262@gmail.com` (UID: `cgwqNNfMfPNmsAHJfgWGcRSsIRG2`)
- ✅ **Real-time Notifications**: Firebase Realtime Database integration with notification bell
- ✅ **Responsive Design**: Works seamlessly on desktop and mobile devices
- ✅ **Modern UI**: Clean, minimal design with smooth animations
- ✅ **Protected Routes**: Automatic redirect to login for unauthorized users
- ✅ **Loading States**: Global loading context with beautiful loader animations

## Project Structure

```
app/
  admin/
    layout.tsx          # Admin-specific layout with providers
    login/
      page.tsx          # Login route with responsive detection
      _components/
        DesktopLogin.tsx  # Desktop login UI
        MobileLogin.tsx   # Mobile login UI
    dashboard/
      page.tsx          # Main dashboard page
  api/
    notifications/
      route.ts          # API routes for notifications CRUD

components/
  admin/
    AppLoader.tsx       # Global loading indicator
    BrandLogo.tsx       # Portfolio admin logo
    Footer.tsx          # Admin footer component
    Navbar.tsx          # Admin navigation bar
    NotificationBell.tsx # Notification dropdown
    ToasterProvider.tsx  # Toast notifications provider

contexts/
  LoadingContext.tsx    # Global loading state management
  NotificationContext.tsx # Notification state management

lib/
  auth.ts              # Firebase authentication functions
  firebase.ts          # Firebase initialization
  notificationHelpers.ts # Helper functions for notifications
  utils.ts             # Utility functions

types/
  notification.ts      # TypeScript notification types
```

## Setup Instructions

### 1. Environment Variables

All necessary environment variables are already configured in `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCMKuKgoWq7s_b_798pJq9QgGbHgUEy9kM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=gaurav-portfolio-improved.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://gaurav-portfolio-improved-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=gaurav-portfolio-improved
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=gaurav-portfolio-improved.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=761696179429
NEXT_PUBLIC_FIREBASE_APP_ID=1:761696179429:web:8919d6a499c2e8f0d4b00c
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-WQKV3WPPD8
NEXT_PUBLIC_ALLOWED_EMAIL=gauravpatil9262@gmail.com
NEXT_PUBLIC_ALLOWED_UID=cgwqNNfMfPNmsAHJfgWGcRSsIRG2
```

### 2. Firebase Configuration

The Firebase project is already configured with:

- **Project ID**: `gaurav-portfolio-improved`
- **Authentication**: Google OAuth enabled
- **Firestore**: For notification storage
- **Realtime Database**: For real-time updates

### 3. Running the Application

```bash
# Install dependencies (already done)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### 4. Accessing the Admin Panel

1. Navigate to `http://localhost:3000/admin/login`
2. Click "Continue with Google"
3. Sign in with `gauravpatil9262@gmail.com`
4. You'll be redirected to the dashboard at `/admin/dashboard`

## Security Features

1. **Email Validation**: Only the specified email can access the panel
2. **UID Validation**: Additional UID check for extra security
3. **Protected Routes**: Unauthorized users are automatically redirected to login
4. **Auto Sign-Out**: Users with incorrect credentials are immediately signed out
5. **Firebase Rules**: Should be configured in Firebase Console for production

## Firebase Firestore Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Notifications - only authenticated user can read/write their own
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null
        && request.auth.uid == "cgwqNNfMfPNmsAHJfgWGcRSsIRG2";
    }

    // User preferences
    match /userPreferences/{userId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId
        && userId == "cgwqNNfMfPNmsAHJfgWGcRSsIRG2";
    }
  }
}
```

## Firebase Realtime Database Rules (Recommended)

```json
{
  "rules": {
    "notifications": {
      "$uid": {
        ".read": "$uid === 'cgwqNNfMfPNmsAHJfgWGcRSsIRG2' && auth.uid === $uid",
        ".write": "$uid === 'cgwqNNfMfPNmsAHJfgWGcRSsIRG2' && auth.uid === $uid"
      }
    }
  }
}
```

## API Routes

### Notifications API (`/api/notifications`)

**GET** - Fetch notifications

```
GET /api/notifications?userId=<userId>
```

**POST** - Create notification

```json
{
  "userId": "string",
  "type": "login|logout|timesheet|todo|version|system|error|success|info|warning",
  "title": "string",
  "message": "string",
  "data": {}
}
```

**PATCH** - Update notification

```json
{
  "notificationId": "string",
  "userId": "string",
  "action": "mark-read|mark-all-read"
}
```

**DELETE** - Delete notification

```json
{
  "notificationId": "string",
  "userId": "string",
  "action": "clear-all" // optional
}
```

## Type Safety

TypeScript is configured with:

- `strict: false` for rapid development
- `skipLibCheck: true` to avoid external type errors
- Build errors are ignored (`ignoreBuildErrors: true`)

## Extending the Dashboard

To add new features:

1. **Add new pages** in `app/admin/`
2. **Create components** in `components/admin/`
3. **Add API routes** in `app/api/`
4. **Update navigation** in `components/admin/Navbar.tsx`

## Troubleshooting

### Authentication Issues

- Ensure the email `gauravpatil9262@gmail.com` is enabled in Firebase Console
- Check that Google OAuth is enabled in Firebase Authentication
- Verify UID matches `cgwqNNfMfPNmsAHJfgWGcRSsIRG2`

### Notification Issues

- Check Firestore rules allow read/write for the user
- Verify API routes are accessible
- Check browser console for errors

### Build Issues

- TypeScript errors are ignored by default
- ESLint errors are ignored by default
- Check `next.config.js` for configuration

## Production Deployment

1. Set up environment variables on your hosting platform
2. Configure Firebase security rules (see above)
3. Build the application: `npm run build`
4. Deploy to your preferred platform (Vercel, Netlify, etc.)

## Support

For issues or questions, contact the developer.

---

Built with ❤️ using Next.js 16, Firebase, and TypeScript
