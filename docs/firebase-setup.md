# Empire City Firebase Setup Guide

Empire City includes real-time host-authoritative multiplayer backed by Firebase Realtime Database and Anonymous Authentication.

## Prerequisites
1. A Google account to access [Firebase Console](https://console.firebase.google.com).
2. A new or existing Firebase Project.

## Step-by-Step Setup
1. **Create Firebase Project**:
   - In the Firebase Console, click "Add project" and name it (e.g. `empire-city-game`).
2. **Enable Anonymous Authentication**:
   - Navigate to **Build > Authentication > Sign-in method**.
   - Enable the **Anonymous** provider and click "Save".
3. **Create Realtime Database**:
   - Navigate to **Build > Realtime Database**.
   - Click "Create Database", choose your preferred region (e.g., `europe-west1` or `us-central1`), and start in **Locked mode**.
4. **Deploy Security Rules**:
   - Go to the **Rules** tab in the Realtime Database console.
   - Paste the contents of `database.rules.json` from the repository root:
     ```json
     {
       "rules": {
         "rooms": {
           "$roomCode": {
             ".read": "auth != null",
             "meta": {
               ".write": "auth != null && (!data.exists() || data.child('hostId').val() === auth.uid)"
             },
             "players": {
               "$uid": {
                 ".write": "auth != null && ($uid === auth.uid || data.parent().parent().child('meta/hostId').val() === auth.uid)"
               }
             },
             "state": {
               ".write": "auth != null && data.parent().child('meta/hostId').val() === auth.uid"
             },
             "actions": {
               "$actionId": {
                 ".write": "auth != null && (!data.exists() || data.parent().parent().child('meta/hostId').val() === auth.uid)"
               }
             },
             "events": {
               ".write": "auth != null && data.parent().child('meta/hostId').val() === auth.uid"
             },
             "chat": {
               "$messageId": {
                 ".write": "auth != null && (!data.exists() && newData.child('senderId').val() === auth.uid && newData.child('text').val().length <= 200)"
               }
             }
           }
         }
       }
     }
     ```
   - Click "Publish".
5. **Configure Web App Credentials**:
   - In Project Settings, click the **Web icon (`</>`)** to register an app.
   - Copy the configuration object and populate `.env`:
     ```env
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
     VITE_FIREBASE_PROJECT_ID=your_project
     VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```
6. **Graceful Fallback**:
   - If keys are missing or invalid, Empire City provides friendly notice and defaults to seamless local multiplayer or solo bot play without crashing.
