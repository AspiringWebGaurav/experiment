# 🎨 Project Management System - Visual Architecture

## 📊 System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTIONS                            │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
         ┌──────────▼──────────┐        ┌─────────▼──────────┐
         │   FRONTEND VIEW     │        │   ADMIN PANEL      │
         │   (/)               │        │   (/admin)         │
         └──────────┬──────────┘        └─────────┬──────────┘
                    │                              │
         ┌──────────▼──────────┐        ┌─────────▼──────────┐
         │  RecentProjects     │        │  ProjectManager    │
         │  Component          │        │  Component         │
         └──────────┬──────────┘        └─────────┬──────────┘
                    │                              │
                    │                   ┌──────────▼──────────┐
                    │                   │  ProjectContext     │
                    │                   │  (State Mgmt)       │
                    │                   └──────────┬──────────┘
                    │                              │
         ┌──────────▼──────────────────────────────▼──────────┐
         │              API ROUTES (/api/projects)            │
         │  GET    │  POST   │  PUT    │  DELETE             │
         └──────────┬──────────────────────────────┬──────────┘
                    │                              │
         ┌──────────▼──────────────────────────────▼──────────┐
         │              FIRESTORE DATABASE                     │
         │              Collection: "projects"                 │
         └─────────────────────────────────────────────────────┘
```

## 🔄 CRUD Operations Flow

### CREATE Project

```
User clicks "Add Project"
         │
         ▼
Form opens with validation
         │
         ▼
User fills fields
         │
         ▼
Client validation checks
         │
         ├─ ❌ Invalid → Show errors
         │
         └─ ✅ Valid
                │
                ▼
         POST /api/projects
                │
                ├─ Server validation
                │
                ├─ Check max limit (10)
                │
                ├─ Add to Firestore
                │
                ▼
         Success response
                │
                ▼
         Update context state
                │
                ▼
         Toast notification
                │
                ▼
         UI updates (no shake!)
```

### READ Projects

```
Page loads / Context initializes
         │
         ▼
GET /api/projects
         │
         ▼
Firestore query (orderBy: order)
         │
         ▼
Return sorted projects
         │
         ▼
Context state updates
         │
         ├─ Admin: Shows all projects
         │
         └─ Frontend: Filters isActive=true
                │
                ▼
         Render project list/cards
```

### UPDATE Project

```
User clicks Edit icon
         │
         ▼
Form pre-fills with data
         │
         ▼
User modifies fields
         │
         ▼
Client validation checks
         │
         └─ ✅ Valid
                │
                ▼
         PUT /api/projects
                │
                ├─ Server validation
                │
                ├─ Update Firestore doc
                │
                ▼
         Success response
                │
                ▼
         Update context state
                │
                ▼
         Toast notification
                │
                ▼
         UI updates
```

### DELETE Project

```
User clicks Delete icon
         │
         ▼
Confirmation dialog
         │
         ├─ Cancel → Do nothing
         │
         └─ Confirm
                │
                ▼
         DELETE /api/projects
                │
                ├─ Check if exists
                │
                ├─ Remove from Firestore
                │
                ▼
         Success response
                │
                ▼
         Remove from context state
                │
                ▼
         Toast notification
                │
                ▼
         UI updates (card removed)
```

## 🎯 Component Hierarchy

```
App Root
│
├─ AdminLayout (with providers)
│  │
│  ├─ LoadingProvider
│  │  │
│  │  ├─ NotificationProvider
│  │  │  │
│  │  │  ├─ RecycleBinProvider
│  │  │  │  │
│  │  │  │  └─ ProjectProvider ⭐
│  │  │  │     │
│  │  │  │     ├─ ToasterProvider
│  │  │  │     ├─ AppLoader
│  │  │  │     │
│  │  │  │     └─ DashboardPage
│  │  │  │        │
│  │  │  │        ├─ Navbar
│  │  │  │        ├─ Breadcrumb
│  │  │  │        ├─ HorizontalScrollPanel
│  │  │  │        │
│  │  │  │        └─ ProjectManager ⭐
│  │  │  │           │
│  │  │  │           ├─ Header (+ Add Button)
│  │  │  │           ├─ Warning Banner
│  │  │  │           ├─ Create/Edit Form
│  │  │  │           │  ├─ Title Input
│  │  │  │           │  ├─ Description Textarea
│  │  │  │           │  ├─ Image Input
│  │  │  │           │  ├─ Link Input
│  │  │  │           │  ├─ Icon Manager
│  │  │  │           │  ├─ Order Input
│  │  │  │           │  └─ Active Checkbox
│  │  │  │           │
│  │  │  │           └─ Projects Grid
│  │  │  │              └─ Project Cards
│  │  │  │                 ├─ Eye Toggle
│  │  │  │                 ├─ Edit Button
│  │  │  │                 └─ Delete Button
│
│
└─ HomePage
   │
   └─ RecentProjects ⭐
      │
      └─ (Fetches from API)
         │
         ├─ Loading State
         ├─ Error State
         ├─ Empty State
         │
         └─ Project Pins (3D)
```

## 📦 Data Structure

### Project Object

```typescript
{
  id: "abc123",                    // Auto-generated
  title: "3D Solar System",        // 3-100 chars
  des: "Explore the wonders...",   // 10-500 chars
  img: "/p1.svg",                  // URL
  iconLists: [                     // 1-10 URLs
    "/re.svg",
    "/tail.svg",
    "/ts.svg"
  ],
  link: "https://github.com/...",  // URL
  order: 1,                         // 1-10
  isActive: true,                   // boolean
  createdAt: Timestamp,             // Auto
  updatedAt: Timestamp              // Auto
}
```

## 🎨 UI States

### ProjectManager States

```
┌─────────────────────────────────────┐
│  INITIAL STATE                      │
│  - No form open                     │
│  - All projects visible             │
│  - Add button enabled               │
└─────────────────────────────────────┘
         │
         ├─ Click "Add Project"
         │        ↓
         │  ┌─────────────────────────────────────┐
         │  │  CREATE MODE                        │
         │  │  - Form open (empty)                │
         │  │  - Edit buttons disabled            │
         │  │  - Add button disabled              │
         │  └─────────────────────────────────────┘
         │
         ├─ Click "Edit" on project
         │        ↓
         │  ┌─────────────────────────────────────┐
         │  │  EDIT MODE                          │
         │  │  - Form open (pre-filled)           │
         │  │  - Other edit buttons disabled      │
         │  │  - Add button disabled              │
         │  └─────────────────────────────────────┘
         │
         └─ During API call
                  ↓
            ┌─────────────────────────────────────┐
            │  SUBMITTING STATE                   │
            │  - Loading spinner in button        │
            │  - Form fields disabled             │
            │  - Cancel button disabled           │
            └─────────────────────────────────────┘
```

### RecentProjects States

```
┌─────────────────────────────────────┐
│  LOADING STATE                      │
│  - Spinner animation                │
│  - "Loading projects..." message    │
└─────────────────────────────────────┘
         │
         ├─ Success
         │        ↓
         │  ┌─────────────────────────────────────┐
         │  │  LOADED STATE                       │
         │  │  - Projects displayed               │
         │  │  - 2x2 grid layout                  │
         │  │  - All animations active            │
         │  └─────────────────────────────────────┘
         │
         ├─ Error
         │        ↓
         │  ┌─────────────────────────────────────┐
         │  │  ERROR STATE                        │
         │  │  - Error icon (⚠️)                   │
         │  │  - Error message                    │
         │  └─────────────────────────────────────┘
         │
         └─ No projects (empty)
                  ↓
            ┌─────────────────────────────────────┐
            │  EMPTY STATE                        │
            │  - Folder icon (📁)                  │
            │  - "No projects to display yet"     │
            └─────────────────────────────────────┘
```

## 🔐 Security Flow

```
User Request
     │
     ▼
┌─────────────────────┐
│  Authentication     │
│  (Firebase Auth)    │
└─────────┬───────────┘
          │
          ├─ Not Authenticated → Redirect to /admin/login
          │
          └─ Authenticated
                 │
                 ▼
         ┌───────────────────┐
         │  Authorization    │
         │  (Google Account) │
         └─────────┬─────────┘
                   │
                   └─ Authorized → Access Admin Panel
                             │
                             ▼
                     ┌─────────────────┐
                     │  API Request    │
                     └─────────┬───────┘
                               │
                               ▼
                     ┌─────────────────┐
                     │  Validation     │
                     │  (Client+Server)│
                     └─────────┬───────┘
                               │
                               ▼
                     ┌─────────────────┐
                     │  Database Op    │
                     │  (Firestore)    │
                     └─────────────────┘
```

## 📊 Validation Pipeline

```
User Input
    │
    ▼
┌──────────────────────────┐
│  Client-Side Validation  │
│  (Instant Feedback)      │
└──────────┬───────────────┘
           │
           ├─ Invalid → Show inline errors
           │
           └─ Valid
                  │
                  ▼
         ┌────────────────────────┐
         │  Form Submission       │
         └────────┬───────────────┘
                  │
                  ▼
         ┌────────────────────────┐
         │  API Route Validation  │
         │  (Server-Side)         │
         └────────┬───────────────┘
                  │
                  ├─ Invalid → Return 400 + errors
                  │
                  └─ Valid
                         │
                         ▼
                ┌────────────────────────┐
                │  Business Logic Check  │
                │  (Max 10, duplicates)  │
                └────────┬───────────────┘
                         │
                         ├─ Failed → Return 400 + message
                         │
                         └─ Passed
                                │
                                ▼
                       ┌────────────────────────┐
                       │  Database Operation    │
                       └────────┬───────────────┘
                                │
                                ▼
                       ┌────────────────────────┐
                       │  Success Response      │
                       └────────────────────────┘
```

## 🎯 Error Handling Hierarchy

```
ERROR OCCURS
     │
     ├─ Network Error
     │     │
     │     └─ Toast: "Network error. Check connection."
     │
     ├─ Validation Error
     │     │
     │     ├─ Client: Inline field errors
     │     │
     │     └─ Server: Toast with first error
     │
     ├─ Database Error
     │     │
     │     └─ Toast: "Database error. Try again."
     │
     ├─ Auth Error
     │     │
     │     └─ Redirect to login
     │
     └─ Unknown Error
           │
           └─ Toast: "Something went wrong."
                │
                └─ Console: Full error details
```

## 📱 Responsive Breakpoints

```
┌────────────────────────────────────────┐
│  MOBILE (< 768px)                      │
│  ┌──────────────────────────────────┐  │
│  │  Single Column                   │  │
│  │  ┌────────────────────────────┐  │  │
│  │  │  Project Card              │  │  │
│  │  └────────────────────────────┘  │  │
│  │  ┌────────────────────────────┐  │  │
│  │  │  Project Card              │  │  │
│  │  └────────────────────────────┘  │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  DESKTOP (≥ 768px)                     │
│  ┌──────────────────────────────────┐  │
│  │  Two Columns                     │  │
│  │  ┌─────────┐    ┌─────────┐     │  │
│  │  │ Card 1  │    │ Card 2  │     │  │
│  │  └─────────┘    └─────────┘     │  │
│  │  ┌─────────┐    ┌─────────┐     │  │
│  │  │ Card 3  │    │ Card 4  │     │  │
│  │  └─────────┘    └─────────┘     │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

## 🔄 State Synchronization

```
Admin Panel Change
        │
        ▼
Context State Updated
        │
        ├─────────────┬─────────────┐
        │             │             │
        ▼             ▼             ▼
  Admin UI      Database      Frontend
  Re-renders     Updated       (on next fetch)
        │             │             │
        └─────────────┴─────────────┘
                      │
                      ▼
              All Components
              Show Latest Data
```

---

**Visual Architecture v1.0** | Created for Portfolio Project Management System
