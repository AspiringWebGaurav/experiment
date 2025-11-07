# 🚀 Quick Reference - Project Management System

## 📝 Quick Start

### First Time Setup

```bash
# Seed database with existing projects
node scripts/seed-projects.js
```

### Access Admin Panel

1. Go to `/admin/login`
2. Sign in with Google
3. Navigate to Dashboard → Projects

## 🎯 Key Features

| Feature            | Description                | Limit                  |
| ------------------ | -------------------------- | ---------------------- |
| **Max Projects**   | Total projects allowed     | 10                     |
| **Active Display** | Projects shown on frontend | Based on active status |
| **Title Length**   | Project title              | 3-100 chars            |
| **Description**    | Project details            | 10-500 chars           |
| **Tech Icons**     | Technology stack icons     | 1-10 icons             |
| **Grid Layout**    | Frontend display           | 2x2 pairs              |

## 🎨 UI Actions

| Button         | Action                      | Location  |
| -------------- | --------------------------- | --------- |
| ➕ Add Project | Create new project          | Top right |
| ✏️ Edit        | Modify project              | Each card |
| 🗑️ Delete      | Remove project              | Each card |
| 👁️ Eye (green) | Active - Hide from frontend | Each card |
| 👁️ Eye (gray)  | Inactive - Show on frontend | Each card |
| 💾 Save        | Commit changes              | Edit form |
| ❌ Cancel      | Discard changes             | Edit form |

## ⚠️ Warnings

### Asymmetric Layout Warning

Shows when project count creates uneven grid:

- **7 projects** = Special warning ⚠️
- **9 projects** = Asymmetric warning ⚠️

### Max Projects Warning

Cannot add more when 10 projects exist.

## 📊 Project States

```
🟢 Active     → Visible on frontend
⚪ Inactive   → Hidden from frontend (still in database)
🔵 Editing    → Currently being modified
🗑️ Deleted    → Permanently removed
```

## 🔧 Validation Rules

### Required Fields ✓

- Title
- Description
- Image URL
- At least 1 technology icon
- Project link

### Format Requirements

```typescript
Title:       3-100 characters
Description: 10-500 characters
Image:       /path.svg or https://...
Icons:       /icon.svg or https://...
Link:        https://github.com/...
Order:       1-10
```

## 🎯 Common Workflows

### Add New Project

```
1. Click "Add Project"
2. Fill all fields
3. Add 3-5 tech icons
4. Set order (auto-suggested)
5. Check "Active"
6. Click "Create Project"
```

### Edit Existing Project

```
1. Click Edit (✏️) icon
2. Modify fields
3. Click "Update Project"
```

### Hide from Frontend

```
1. Click Eye (👁️) icon
2. Project becomes inactive
3. Removed from frontend display
4. Still accessible in admin
```

### Delete Project

```
1. Click Delete (🗑️) icon
2. Confirm in popup
3. Project permanently removed
```

## 🐛 Quick Troubleshooting

| Issue                   | Solution                         |
| ----------------------- | -------------------------------- |
| Can't add project       | Check if at 10 project limit     |
| Project not on frontend | Verify it's marked "Active"      |
| Validation error        | Check character limits & formats |
| Layout looks odd        | Add even number of projects      |

## 📱 File Locations

```
Admin UI:          /app/admin/dashboard/page.tsx
Frontend Display:  /components/RecentProjects.tsx
API Routes:        /app/api/projects/route.ts
State Management:  /contexts/ProjectContext.tsx
Types:             /types/project.ts
Admin Component:   /components/admin/ProjectManager.tsx
```

## 💡 Pro Tips

✨ **Best Practices**

- Add projects in pairs (2, 4, 6, 8, 10) for symmetry
- Use consistent icon styles
- Keep descriptions concise but descriptive
- Test on mobile after changes
- Use inactive instead of delete for temporary removal

✨ **Keyboard Shortcuts**

- `Tab` - Navigate between fields
- `Enter` - Submit form (when in text input)
- `Esc` - Cancel editing (not implemented yet)

## 🎉 Status Indicators

```
🔵 Loading...         → Data fetching from database
✅ Success!           → Operation completed
❌ Error              → Something went wrong
⚠️ Warning           → Action needs attention
📝 Editing           → Form is open
```

## 📞 Need Help?

- 📖 Full Guide: `/docs/PROJECT_MANAGEMENT_GUIDE.md`
- 🔥 Check Firebase Console for database
- 🌐 Browser console for errors
- 🔍 Network tab for API issues

---

**Quick Reference v1.0** | Last Updated: 2025
