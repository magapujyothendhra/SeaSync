# SeaSync Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Set Up Firebase

SeaSync requires Firebase for data storage and photo uploads.

#### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add Project"**
3. Enter project name (e.g., "SeaSync")
4. Follow the setup wizard
5. Once created, click the **Web icon (</>)** to add a web app
6. Register your app and copy the configuration

#### Configure Firebase Credentials

1. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Add your Firebase credentials to `.env`:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdefghijk
   ```

#### Set Up Firestore Database

1. In Firebase Console, navigate to **Firestore Database**
2. Click **Create Database**
3. Choose **Test mode** (for development)
4. Select your region (choose closest to your users)
5. Click **Enable**

#### Set Up Firebase Storage

1. In Firebase Console, navigate to **Storage**
2. Click **Get Started**
3. Choose **Test mode** (for development)
4. Click **Done**

#### Configure Security Rules (Development)

**Firestore Rules:**
1. Go to **Firestore Database** → **Rules** tab
2. Replace with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pollution_reports/{document=**} {
      allow read, write: if true;
    }
  }
}
```
3. Click **Publish**

**Storage Rules:**
1. Go to **Storage** → **Rules** tab
2. Replace with:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /reports/{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```
3. Click **Publish**

⚠️ **Important**: These rules allow all read/write access for testing. For production, implement proper authentication and access controls.

### 3. Run the App

#### Web Preview (Recommended for first test)
```bash
bun run start-web
```

#### Mobile Device (Best experience)
```bash
bun run start
```
Then scan the QR code with:
- **iOS**: Expo Go app or Camera app
- **Android**: Expo Go app

## Features Overview

### 🏠 Home Screen
- View pollution statistics
- See recent reports
- Quick access to report and map
- Online/offline status indicator

### 📝 Report Screen
- Select pollution type (plastic, oil spill, debris, etc.)
- Add description
- Take photo or upload from gallery
- Automatic GPS location capture
- Works offline - syncs when online

### 🗺️ Map Screen
- View all pollution reports
- Filter by pollution type
- See report details
- Real-time data refresh

## Offline Functionality

SeaSync works completely offline:

1. **Report Creation**: Reports are saved locally when offline
2. **Photo Storage**: Photos are stored as base64 in AsyncStorage
3. **Automatic Sync**: When connection is restored, reports automatically upload
4. **Queue Management**: Failed uploads are retried
5. **Visual Feedback**: Syncing status shown in UI

## Testing Offline Mode

### On Mobile Device
1. Open the app
2. Turn on Airplane Mode
3. Create a pollution report
4. Turn off Airplane Mode
5. Watch the report sync automatically

### On Web
1. Open DevTools (F12)
2. Go to Network tab
3. Select "Offline" from throttling dropdown
4. Create a pollution report
5. Go back "Online"
6. Report will sync

## Data Structure

### Pollution Report
```typescript
{
  id: string;              // Firestore document ID
  type: PollutionType;     // Type of pollution
  description: string;     // User description
  photoUrl?: string;       // Firebase Storage URL
  latitude: number;        // GPS latitude
  longitude: number;       // GPS longitude
  timestamp: number;       // Unix timestamp
  synced: boolean;         // Sync status
  userId?: string;         // Future: user identification
}
```

### Offline Queue
Reports are stored in AsyncStorage with key `seasync_offline_queue` until successfully synced to Firebase.

## Permissions Required

- **Location**: Required for GPS coordinates
- **Camera**: Optional for taking photos
- **Media Library**: Optional for uploading photos

## Troubleshooting

### Firebase Connection Issues

**Error**: "Failed to fetch reports"
- **Solution**: Check your Firebase credentials in `.env`
- **Solution**: Verify Firestore security rules are set correctly
- **Solution**: Ensure Firestore is initialized in Firebase Console

**Error**: "Failed to upload photo"
- **Solution**: Check Firebase Storage is enabled
- **Solution**: Verify Storage security rules are set correctly
- **Solution**: Check your Storage bucket name in `.env`

### Location Not Working

**iOS Simulator**
- Location doesn't work in iOS Simulator by default
- Use a real device for location testing
- Or set a custom location in Simulator: Features → Location

**Android Emulator**
- Enable location in emulator settings
- Set a location using emulator controls

**Web**
- Browser will prompt for location permission
- Make sure you're using HTTPS (or localhost)

### Offline Sync Not Working

- Check network connectivity indicator in the app
- View console logs for sync attempts
- Clear AsyncStorage if queue gets corrupted:
  - Go to Settings (add clear cache feature)
  - Or clear app data and reinstall

### App Not Loading

1. **Clear cache**:
   ```bash
   bunx expo start --clear
   ```

2. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules
   bun install
   ```

3. **Check environment variables**:
   - Ensure `.env` file exists
   - Verify all Firebase credentials are correct
   - Restart dev server after changing `.env`

## Production Deployment

### Security Rules (Production)

Before deploying to production, update Firebase security rules:

**Firestore (with authentication)**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pollution_reports/{document=**} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

**Storage (with authentication)**:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /reports/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Environment Variables

For production, use environment-specific Firebase projects:
- Development: `seasync-dev`
- Production: `seasync-prod`

Configure different `.env` files or use EAS Secrets for deployment.

## Next Steps

### Recommended Enhancements

1. **User Authentication**
   - Add Firebase Auth
   - Track report creators
   - Enable user profiles

2. **Real Map Integration**
   - Add MapView (requires custom dev build)
   - Show markers for each report
   - Cluster nearby reports

3. **Analytics**
   - Track pollution trends
   - Generate reports
   - Visualize data

4. **Notifications**
   - Alert users to nearby pollution
   - Sync completion notifications
   - Weekly impact summaries

5. **Social Features**
   - Share reports
   - Upvote/comment on reports
   - Leaderboards for contributors

## Support

Need help? Check these resources:
- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Documentation](https://reactnative.dev/)

## License

This project is open source and available for environmental conservation efforts.

