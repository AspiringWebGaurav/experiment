# 🚀 Work Experience Feature - Quick Reference

## 📍 Access Points

| What                 | Where                                           |
| -------------------- | ----------------------------------------------- |
| **Admin Panel**      | `/admin/dashboard?tab=work-experience`          |
| **Frontend Display** | Homepage → "My work experience" section         |
| **API Endpoint**     | `/api/work-experience` (GET, POST, PUT, DELETE) |

## ⚡ Quick Actions

### Add New Experience

```
1. Click "Add Experience" button
2. Enter title, description
3. Choose icon (Library / Upload / URL)
4. Optional: Add company, duration, location
5. Click "Create Experience"
```

### Edit Experience

```
1. Click "Edit" on any experience card
2. Modify fields
3. Click "Update Experience"
```

### Delete Experience

```
1. Click "Delete" on any experience card
2. Confirm deletion
→ Moves to Recycle Bin (recoverable for 15-30 days)
```

### Toggle Visibility

```
Click "Active" / "Hidden" button
→ Show/hide on frontend without deleting
```

## 🎯 Field Limits

| Field         | Required | Min | Max    |
| ------------- | -------- | --- | ------ |
| Title         | ✅ Yes   | 3   | 150    |
| Description   | ✅ Yes   | 10  | 500    |
| Thumbnail     | ✅ Yes   | -   | 5MB    |
| Company       | ❌ No    | -   | 100    |
| Duration      | ❌ No    | -   | 50     |
| Location      | ❌ No    | -   | 100    |
| **Max Total** | -        | -   | **10** |

## 🎨 Icon Options

| Option            | How to Use                          | Best For                             |
| ----------------- | ----------------------------------- | ------------------------------------ |
| **Icon Library**  | Click "Browse Icons" → Select       | Tech stack icons (React, Node, etc.) |
| **Custom Upload** | Click "Upload Custom" → Choose file | Company logos, custom graphics       |
| **Manual URL**    | Click "Enter URL" → Paste URL       | External CDN icons, public images    |

## 📂 File Locations

```
📁 Types & Validation
   └── types/workExperience.ts

📁 API Routes
   └── app/api/work-experience/route.ts

📁 Context (State)
   └── contexts/WorkExperienceContext.tsx

📁 Admin Component
   └── components/admin/WorkExperienceManager.tsx

📁 Frontend Display
   └── components/Experience.tsx

📁 Migration Script
   └── scripts/migrate-work-experience.mjs

📁 Documentation
   ├── docs/WORK_EXPERIENCE_GUIDE.md
   ├── docs/WORK_EXPERIENCE_QUICK_START.md
   ├── docs/WORK_EXPERIENCE_MIGRATION_SETUP.md
   └── docs/WORK_EXPERIENCE_IMPLEMENTATION_COMPLETE.md
```

## 🛠️ Common Tasks

### Setup (First Time)

```bash
# Option 1: Manual entry (recommended)
npm run dev
# → Go to /admin/dashboard?tab=work-experience
# → Add experiences through UI

# Option 2: Run migration
# 1. Add serviceAccountKey.json to project root
# 2. Run:
node scripts/migrate-work-experience.mjs
```

### View Frontend

```
1. Go to homepage (/)
2. Scroll to "My work experience" section
3. See active experiences displayed
```

### Check Database

```
Firebase Console
→ Firestore Database
→ Collection: workExperience
→ View documents
```

## ⚠️ Important Notes

| ⚠️                   | Note                                          |
| -------------------- | --------------------------------------------- |
| **Max Limit**        | Cannot add more than 10 experiences           |
| **Required Fields**  | Title, Description, Thumbnail are required    |
| **Image Size**       | Max 5MB for uploads                           |
| **Deleted Items**    | Go to Recycle Bin, recoverable for 15-30 days |
| **Frontend Display** | Only shows experiences marked as "Active"     |
| **Sorting**          | Displayed by order number (1-10)              |

## 🎯 Best Practices

✅ **DO:**

- Use 4-8 active experiences for optimal display
- Write achievement-focused descriptions
- Choose icons matching tech stack
- Include company names for credibility
- Add duration for timeline context
- Keep descriptions concise (2-3 sentences)

❌ **DON'T:**

- Exceed 10 total experiences
- Use generic job titles
- Upload images larger than 5MB
- Leave required fields empty
- Mix drastically different icon styles

## 🔥 Quick Tips

💡 **Tip 1**: Use the icon library first - it has 100+ professional tech icons
💡 **Tip 2**: Order by importance or chronology (drag-drop coming soon)
💡 **Tip 3**: Hide instead of delete to keep history without cluttering frontend
💡 **Tip 4**: Upload company logos for branded look
💡 **Tip 5**: Use the character counters to optimize descriptions

## 🐛 Troubleshooting

| Problem                 | Solution                                    |
| ----------------------- | ------------------------------------------- |
| Can't add more          | At 10 experience limit - delete or hide one |
| Upload fails            | Check file is < 5MB and is an image         |
| Not showing on frontend | Check "Show on frontend" is enabled         |
| Icons not loading       | Verify URL is publicly accessible           |
| Form won't submit       | Fix validation errors (red text)            |

## 📞 Help Resources

| Resource                   | Location                                          |
| -------------------------- | ------------------------------------------------- |
| **Quick Start**            | `docs/WORK_EXPERIENCE_QUICK_START.md`             |
| **Full Guide**             | `docs/WORK_EXPERIENCE_GUIDE.md`                   |
| **Migration Setup**        | `docs/WORK_EXPERIENCE_MIGRATION_SETUP.md`         |
| **Implementation Details** | `docs/WORK_EXPERIENCE_IMPLEMENTATION_COMPLETE.md` |
| **Code Documentation**     | Inline comments in all files                      |

## 🎨 Icon Library Categories

- **Frontend**: React, Vue, Angular, Next.js, TypeScript, JavaScript, etc.
- **Backend**: Node.js, Python, Java, Go, PHP, Ruby, etc.
- **Database**: MongoDB, PostgreSQL, MySQL, Redis, etc.
- **Cloud**: AWS, Azure, GCP, Firebase, Vercel, etc.
- **Tools**: Git, Docker, VS Code, Figma, etc.
- **Mobile**: React Native, Flutter, Swift, Kotlin, etc.
- **AI/ML**: TensorFlow, PyTorch, Scikit-learn, etc.

## ⌨️ Keyboard Shortcuts

Coming soon in future updates!

## 🎯 Status Overview

You can see at a glance:

```
Work Experience Manager
4/10 work experiences • 3 active
```

This shows:

- **4/10**: You have 4 out of 10 maximum experiences
- **3 active**: 3 are shown on the frontend

---

**Last Updated**: 2025-11-08
**Version**: 1.0.0
**Status**: ✅ Production Ready
