# Work Experience Feature - Quick Start

## 🚀 Quick Setup (3 Steps)

### 1️⃣ Run Migration Script

```bash
node scripts/migrate-work-experience.mjs
```

This migrates your 4 existing work experiences to the database.

### 2️⃣ Start Your Dev Server

```bash
npm run dev
```

### 3️⃣ Access Admin Panel

Navigate to: `http://localhost:3000/admin/dashboard?tab=work-experience`

## ✨ What's New

### Admin Panel Features

- 💼 **Third Tab**: "Work Experience" added to dashboard
- 🎨 **Icon Library**: Browse 100+ tech icons
- 📤 **Custom Upload**: Upload your own icons (max 5MB)
- 🔗 **URL Input**: Enter custom icon URLs
- 📝 **Rich Fields**: Title, description, company, duration, location
- 👁️ **Visibility Toggle**: Show/hide on frontend
- 📊 **Up to 10 Entries**: Manage 10 work experiences max
- ♻️ **Recycle Bin**: Deleted items recoverable for 15-30 days

### Frontend Updates

- 🔄 **Dynamic Loading**: Fetches from database automatically
- 📱 **Fully Responsive**: Works on all screen sizes
- ✨ **Enhanced Display**: Shows company, duration, location

## 📋 What Was Created

### New Files

```
✅ types/workExperience.ts                    - Type definitions
✅ app/api/work-experience/route.ts           - CRUD API endpoints
✅ contexts/WorkExperienceContext.tsx         - State management
✅ components/admin/WorkExperienceManager.tsx - Admin component
✅ scripts/migrate-work-experience.mjs        - Migration script
✅ docs/WORK_EXPERIENCE_GUIDE.md              - Full documentation
```

### Updated Files

```
✅ types/recycleBin.ts           - Added workExperience support
✅ app/admin/layout.tsx          - Added WorkExperienceProvider
✅ app/admin/dashboard/page.tsx  - Added Work Experience tab
✅ components/Experience.tsx     - Now fetches from database
```

## 🎯 Key Features

| Feature             | Description                                      |
| ------------------- | ------------------------------------------------ |
| **Max Entries**     | 10 work experiences                              |
| **Icon Sources**    | Library (100+), Upload, URL                      |
| **Image Upload**    | Max 5MB, stored in Firebase Storage              |
| **Validation**      | Title (3-150), Desc (10-500), Required thumbnail |
| **Optional Fields** | Company, Duration, Location                      |
| **Recycle Bin**     | 15-30 day retention                              |
| **Frontend**        | Auto-displays active experiences only            |

## 📖 Usage Examples

### Add New Experience

1. Click "Add Experience"
2. Enter: "Senior React Developer"
3. Choose icon from library or upload
4. Add description, company, dates
5. Click "Create Experience"

### Edit Experience

1. Click "Edit" on any card
2. Modify fields
3. Click "Update Experience"

### Delete Experience

1. Click "Delete"
2. Confirm (moves to recycle bin)

## 🔍 Validation Rules

```
Title:       3-150 characters (required)
Description: 10-500 characters (required)
Thumbnail:   Valid URL/upload (required)
Company:     0-100 characters (optional)
Duration:    0-50 characters (optional)
Location:    0-100 characters (optional)
Order:       1-10 (auto-assigned)
Max Total:   10 experiences
```

## 🛠️ Tech Stack

- **Backend**: Next.js API Routes + Firestore
- **Frontend**: React + TypeScript
- **Storage**: Firebase Storage for images
- **State**: React Context API
- **Validation**: Client + Server side
- **UI**: Tailwind CSS + lucide-react icons

## 📊 Architecture

```
User → Frontend (Experience.tsx) → API (/api/work-experience) → Firestore
         ↓
    Context (WorkExperienceContext)
         ↓
    Admin (WorkExperienceManager)
```

## ✅ Testing Checklist

- [ ] Run migration script successfully
- [ ] See 4 migrated experiences in admin panel
- [ ] Create a new work experience
- [ ] Edit an existing experience
- [ ] Toggle visibility (Active/Hidden)
- [ ] Delete an experience (check recycle bin)
- [ ] Upload custom icon
- [ ] Select icon from library
- [ ] View on frontend homepage
- [ ] Test responsiveness (mobile/tablet/desktop)

## 🎨 Icon Library Categories

- Frontend (React, Vue, Angular, etc.)
- Backend (Node.js, Python, Java, etc.)
- Database (MongoDB, PostgreSQL, etc.)
- Cloud (AWS, Azure, GCP, etc.)
- Tools (Git, Docker, etc.)
- Mobile (React Native, Flutter, etc.)
- AI/ML (TensorFlow, PyTorch, etc.)

## 📝 Best Practices

✅ **DO:**

- Use clear, professional job titles
- Write concise, achievement-focused descriptions
- Choose relevant icons matching tech stack
- Keep 4-8 active experiences for best display
- Include company names for credibility
- Add duration for timeline context

❌ **DON'T:**

- Use overly long titles or descriptions
- Mix different icon styles
- Exceed 10 total experiences
- Leave required fields empty
- Upload images larger than 5MB

## 🔗 Related Documentation

- Full Guide: `/docs/WORK_EXPERIENCE_GUIDE.md`
- API Reference: See inline comments in `app/api/work-experience/route.ts`
- Types: See `types/workExperience.ts`
- Context: See `contexts/WorkExperienceContext.tsx`

## 🎉 You're All Set!

Your Work Experience system is now:

- ✅ Fully integrated with admin panel
- ✅ Database-driven and dynamic
- ✅ Supports up to 10 experiences
- ✅ Has icon library + custom upload
- ✅ Fully responsive and accessible
- ✅ Production-ready!

Navigate to the admin panel and start managing your work experiences! 🚀

---

**Questions?** Check `/docs/WORK_EXPERIENCE_GUIDE.md` for detailed documentation.
