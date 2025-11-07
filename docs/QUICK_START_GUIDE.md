# Quick Start Guide - Enhanced Project Manager 🚀

## What's New?

Your project management system now has:

- 📸 **Click-to-upload images** (no more URL typing!)
- 🎨 **Visual icon grid** with circular previews
- 🗑️ **Recycle bin** for safe deletions
- ⚡ **Better UX** with fewer clicks

---

## How to Upload Images

### Main Project Image:

**Option 1: From Your Computer**

1. Click **"Upload from Device"** button (blue)
2. Select image file
3. Preview appears automatically ✨

**Option 2: From URL**

1. Click **"From URL"** button (purple)
2. Paste image URL
3. Press Enter or click "Upload"
4. Preview appears ✨

**Option 3: Direct Link** (fallback)

- Paste URL directly in the text input below buttons

**Remove Image:**

- Click the red **X** button on preview

---

## How to Add Tech Stack Icons

### Visual Grid Method:

1. You'll see circular placeholders in a grid
2. Click any **empty circle with upload icon**
3. Select icon file (SVG, PNG recommended)
4. Icon uploads and shows in circular preview
5. Repeat for more icons (up to 10)

### Add More Slots:

- Click **"+ Add Icon Slot"** below grid

### Remove Icon:

- Hover over filled icon
- Click red **X** button that appears

### Progress Counter:

- See **"3/8 filled"** to track your progress

---

## Recycle Bin Features

### When You Delete a Project:

1. Click trash icon on project card
2. Confirm deletion
3. **Project moves to Recycle Bin** (NOT permanently deleted!)
4. Badge appears on Recycle Bin button in navbar

### Restore Deleted Projects:

1. Click **Recycle Bin icon** in navbar (top-right)
2. See all deleted projects with expiry dates
3. Click **"Restore"** on any project
4. Project returns to main list ✨

### Expiry System:

- Deleted items expire in **15 days** by default
- Extend expiry before it runs out
- Expired items are permanently removed

---

## Navbar Features

### What's in the Navbar (Top-Right):

1. **🔔 Notification Bell** - System notifications
2. **🗑️ Recycle Bin** - Badge shows deleted items count
3. **👤 Profile Menu** - Dropdown with:
   - Profile
   - **Version Notes** (changelog)
   - Settings
   - Logout

---

## Troubleshooting

### "I don't see the new features!"

**Quick Fix:**

```bash
# 1. Hard refresh your browser
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R

# 2. If that doesn't work, restart dev server
Ctrl + C (stop)
npm run dev (start)
```

### "Upload button doesn't work"

**Check:**

- Are you selecting an image file? (JPG, PNG, WebP, SVG)
- Check browser console for errors (F12 → Console)
- Verify Firebase Storage is configured

### "Navbar looks different"

**Try:**

1. Clear browser cache (F12 → Application → Clear storage)
2. Check if you're logged in
3. Verify `.env.local` has correct Firebase config

### "Recycle bin is empty but badge shows number"

**Fix:**

- Refresh the page
- Check localStorage in DevTools → Application → Local Storage
- Clear site data if needed

---

## Tips & Tricks

### Image Upload:

- ✅ **Best format:** PNG or WebP for quality
- ✅ **Recommended size:** 1200x800px for main images
- ✅ **Icons:** 128x128px SVG or PNG
- ✅ Upload will resize any size, but smaller = faster load

### Tech Stack Icons:

- ✅ Use SVG for crisp icons at any size
- ✅ Square images work best (circular crop applied)
- ✅ Common sources: [DevIcons](https://devicon.dev/), [Simple Icons](https://simpleicons.org/)

### Form Efficiency:

- ⚡ Press **Tab** to move between fields
- ⚡ Press **Enter** in URL input to trigger upload
- ⚡ Use **Ctrl+V** to paste URLs quickly
- ⚡ Icons upload in background (continue filling form)

### Keyboard Shortcuts:

- **Tab** - Next field
- **Shift+Tab** - Previous field
- **Ctrl+S** - Save (when focused on form)
- **Esc** - Close modals/dropdowns

---

## Common Workflows

### Creating a New Project:

```
1. Click "Create New Project"
2. Type title and description
3. Upload main image (click blue button)
4. Upload 3-5 tech icons (click circle placeholders)
5. Add project link
6. Add tags (comma-separated)
7. Click "Create Project"
✅ Done! Toast confirms success
```

### Editing Existing Project:

```
1. Find project card
2. Click Edit icon (pencil)
3. Make changes:
   - Update text fields
   - Replace images (click X then upload new)
   - Add/remove icons
4. Click "Save Changes"
✅ Toast confirms update
```

### Safe Deletion Workflow:

```
1. Click Delete icon (trash) on project
2. Confirm deletion dialog
3. Project moves to Recycle Bin
4. Notice badge on navbar Recycle Bin button
5. Later: Click Recycle Bin → Restore if needed
✅ Nothing is lost unless you permanently delete
```

---

## API Endpoints Reference

### Upload Image:

```typescript
POST /api/upload-image
Content-Type: multipart/form-data

Body:
  file: File | null
  url: string | null
  base64: string | null
  folder: "images" | "icons"

Response:
  { success: true, url: "https://..." }
```

### Projects CRUD:

```typescript
GET    /api/projects          → Fetch all
POST   /api/projects          → Create new
PATCH  /api/projects          → Update existing
DELETE /api/projects          → Delete (moves to bin first)
```

---

## File Locations

### Where Things Are Saved:

**Images:**

```
Firebase Storage → projects/images/uuid-filename.ext
Example: projects/images/a1b2c3d4-hero.jpg
```

**Icons:**

```
Firebase Storage → projects/icons/uuid-filename.ext
Example: projects/icons/e5f6g7h8-react.svg
```

**Project Data:**

```
Firestore → projects collection
LocalStorage → recycleBin-{userId} (deleted items)
```

---

## Need Help?

### Check These Files:

- **Full guide:** `docs/PROJECT_CRUD_ENHANCEMENT_GUIDE.md`
- **Completion details:** `docs/CRUD_ENHANCEMENT_COMPLETION.md`
- **This guide:** `docs/QUICK_START_GUIDE.md`

### Common Issues Documentation:

- Firebase setup: `docs/firebase-service-account-README.md`
- Admin panel: `docs/ADMIN_PANEL_README.md`

### Developer Console:

Press **F12** and check:

- **Console** tab - JavaScript errors
- **Network** tab - API request failures
- **Application** → Storage - Uploaded files

---

## Next Steps

1. **Test the system:**

   - Create a sample project
   - Upload images and icons
   - Delete and restore it

2. **Customize:**

   - Adjust icon grid columns (4/6/8) in ProjectManager.tsx
   - Change recycle bin expiry days in RecycleBinContext.tsx
   - Update max icons limit (MAX_ICON_LISTS constant)

3. **Deploy:**
   - Test thoroughly in dev
   - Build: `npm run build`
   - Deploy to Vercel/Netlify

---

**Happy Project Managing! 🎉**

_Last updated: ${new Date().toLocaleDateString()}_
