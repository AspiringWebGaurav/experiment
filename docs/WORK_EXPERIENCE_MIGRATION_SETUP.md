# Work Experience Migration - Setup Instructions

## 🔑 Firebase Service Account Setup

Before running the migration script, you need to set up Firebase Admin SDK credentials.

### Option 1: Get Service Account Key (Recommended for Migration)

1. **Go to Firebase Console**

   - Visit: https://console.firebase.google.com/
   - Select your project

2. **Navigate to Service Accounts**

   - Click the ⚙️ (Settings) icon → Project settings
   - Go to the "Service accounts" tab

3. **Generate Private Key**

   - Click "Generate new private key"
   - Click "Generate key" in the confirmation dialog
   - A JSON file will be downloaded

4. **Add to Project**

   - Rename the downloaded file to `serviceAccountKey.json`
   - Move it to your project root directory: `c:\github\experiment\`
   - ⚠️ **IMPORTANT**: Add to `.gitignore` (should already be there)

5. **Run Migration**
   ```bash
   node scripts/migrate-work-experience.mjs
   ```

### Option 2: Manual Setup (No Migration Script Needed)

If you prefer not to use the migration script, you can manually add work experiences through the admin panel:

1. **Start your development server**

   ```bash
   npm run dev
   ```

2. **Navigate to Admin Panel**

   - Go to: `http://localhost:3000/admin/dashboard?tab=work-experience`

3. **Add Experiences Manually**

   - Click "Add Experience"
   - Fill in the details for each of your 4 work experiences:

   **Experience 1:**

   - Title: `Frontend Engineer Intern`
   - Description: `Assisted in the development of a web-based platform using React.js, enhancing interactivity.`
   - Icon: Browse icons → Select React icon
   - Company: (leave empty or add company name)
   - Status: ✓ Show on frontend

   **Experience 2:**

   - Title: `Mobile App Dev - JSM Tech`
   - Description: `Designed and developed mobile app for both iOS & Android platforms using React Native.`
   - Icon: Browse icons → Select React Native or Mobile icon
   - Company: `JSM Tech`
   - Status: ✓ Show on frontend

   **Experience 3:**

   - Title: `Freelance App Dev Project`
   - Description: `Led the dev of a mobile app for a client, from initial concept to deployment on app stores.`
   - Icon: Browse icons → Select appropriate icon
   - Company: (leave empty)
   - Status: ✓ Show on frontend

   **Experience 4:**

   - Title: `Lead Frontend Developer`
   - Description: `Developed and maintained user-facing features using modern frontend technologies.`
   - Icon: Browse icons → Select JavaScript/TypeScript icon
   - Company: (leave empty)
   - Status: ✓ Show on frontend

## 🎯 Which Option Should I Choose?

### Choose Option 1 (Migration Script) if:

- ✅ You want to automate the process
- ✅ You have many experiences to migrate
- ✅ You want to preserve exact data
- ✅ You're comfortable with Firebase Admin SDK

### Choose Option 2 (Manual Setup) if:

- ✅ You only have 4 experiences (quick to add manually)
- ✅ You want to customize each experience during setup
- ✅ You prefer not to deal with service account setup
- ✅ You want to test the admin panel functionality
- ✅ You want to choose better icons than the default SVGs

## 📝 Migration Script Details

The migration script (`scripts/migrate-work-experience.mjs`) will:

1. ✅ Read the 4 hardcoded work experiences from `data/index.ts`
2. ✅ Upload the icon images (`/exp1.svg`, `/exp2.svg`, etc.) to Firebase Storage
3. ✅ Create Firestore documents with the data
4. ✅ Set proper ordering (1-4)
5. ✅ Mark all as active
6. ✅ Use fallback CDN icons if local images aren't found

### Expected Migration Output

```
🔧 Initializing Firebase Admin...
✅ Service account loaded from: serviceAccountKey.json

📦 Starting work experience migration...

📝 Processing: Frontend Engineer Intern
   Description: Assisted in the development of a web-based platform...
   📤 Uploading thumbnail...
   ✅ Uploaded: https://storage.googleapis.com/...
   ✅ Created in Firestore with ID: abc123

📝 Processing: Mobile App Dev - JSM Tech
   Description: Designed and developed mobile app for both iOS...
   📤 Uploading thumbnail...
   ✅ Uploaded: https://storage.googleapis.com/...
   ✅ Created in Firestore with ID: def456

📝 Processing: Freelance App Dev Project
   Description: Led the dev of a mobile app for a client...
   📤 Uploading thumbnail...
   ✅ Uploaded: https://storage.googleapis.com/...
   ✅ Created in Firestore with ID: ghi789

📝 Processing: Lead Frontend Developer
   Description: Developed and maintained user-facing features...
   📤 Uploading thumbnail...
   ✅ Uploaded: https://storage.googleapis.com/...
   ✅ Created in Firestore with ID: jkl012

============================================================
📊 Migration Summary:
============================================================
✅ Successfully migrated: 4
❌ Failed: 0
📦 Total processed: 4
============================================================

✨ Migration complete!
🎉 All done! You can now manage work experiences from the admin panel.
```

## 🔒 Security Notes

### Service Account Key

- ⚠️ **NEVER commit this file to Git**
- ⚠️ **Keep it secure and private**
- ✅ Already in `.gitignore` as `serviceAccountKey.json`
- ✅ Grants admin access to your Firebase project
- 🔄 Can be regenerated if compromised

### Alternative: Environment Variables

For production, use environment variables instead:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

## 🆘 Troubleshooting

### "Service account not found"

- ✅ Check file is named exactly `serviceAccountKey.json`
- ✅ Check file is in project root (not in subdirectory)
- ✅ Check file is valid JSON (not corrupted download)

### "Permission denied"

- ✅ Ensure service account has Firestore and Storage permissions
- ✅ Check Firebase rules allow server-side writes

### "Storage upload failed"

- ✅ Script will use CDN fallback icons automatically
- ✅ Check Firebase Storage is enabled in console

### "Already exists" warning

- ℹ️ Script will add new entries without deleting existing ones
- ✅ Safe to run multiple times (creates duplicates)
- 🗑️ Delete duplicates manually from admin panel if needed

## ✅ Verification Steps

After migration (either option):

1. **Check Admin Panel**

   - Go to: `/admin/dashboard?tab=work-experience`
   - Should see 4 work experiences

2. **Check Frontend**

   - Go to homepage
   - Scroll to "My work experience" section
   - Should see 4 experiences displayed

3. **Test CRUD Operations**
   - ✅ Edit an experience
   - ✅ Toggle visibility
   - ✅ Add a new experience
   - ✅ Delete an experience (check recycle bin)

## 📚 Next Steps

After successful setup:

1. ✅ Customize work experiences with better descriptions
2. ✅ Upload custom company logos
3. ✅ Add duration and location information
4. ✅ Order experiences strategically
5. ✅ Test responsive design on mobile

---

**Recommended:** Use **Option 2 (Manual Setup)** for a quick start, then run the migration script later if you have more experiences to add.
