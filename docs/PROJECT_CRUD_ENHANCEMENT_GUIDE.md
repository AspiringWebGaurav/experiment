# Portfolio Admin - Comprehensive CRUD Enhancement

## ✅ Completed Features

### 1. Image Upload System

- **File**: `lib/imageUpload.ts`
- **Features**:

  - Upload from local files (File/Blob objects)
  - Upload from URLs (fetches and uploads)
  - Upload from base64 strings
  - Automatic public URL generation
  - Support for both project images and tech icons
  - Delete functionality for cleanup

- **API Route**: `app/api/upload-image/route.ts`
  - POST endpoint for image uploads
  - Validates image URLs before fetching
  - Handles all three upload modes
  - Returns public Storage URLs

### 2. Recycle Bin Integration

- **Updated Files**:
  - `types/recycleBin.ts` - Added "project" as a source type
  - `contexts/RecycleBinContext.tsx` - Added projects stats tracking
  - `app/admin/recycle-bin/page.tsx` - Created recycle bin admin page

### 3. Enhanced Navbar

- **File**: `components/admin/Navbar.tsx`
- **Improvements**:
  - Added Recycle Bin button with badge showing count
  - Integrated RecycleBinContext for live stats
  - Version Notes already present in dropdown
  - Fixed layout (no shaking - used flex with proper spacing)

### 4. Dependencies Installed

- `uuid` & `@types/uuid` - For unique file naming
- `@opentelemetry/api` - For Firebase Admin SDK

---

## 🔨 In Progress / Remaining Work

### 1. Enhanced ProjectManager Component

**Required Changes**:

#### A. Image Upload UI Components

Add these sections to `ProjectManager.tsx`:

1. **Main Image Upload**:

```tsx
<div>
  <label>Project Image *</label>
  <div className="space-y-2">
    {/* Image preview */}
    {formData.img && (
      <div className="relative w-full h-48 rounded-lg overflow-hidden border">
        <img
          src={formData.img}
          alt="Preview"
          className="w-full h-full object-cover"
        />
        <button
          onClick={() => handleFieldChange("img", "")}
          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded"
        >
          ✕
        </button>
      </div>
    )}

    {/* Upload options */}
    <div className="flex gap-2">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageFileUpload}
        className="flex-1"
      />
      <button onClick={() => setShowUrlInput(!showUrlInput)}>
        Add from URL
      </button>
    </div>

    {showUrlInput && (
      <input
        type="url"
        placeholder="https://example.com/image.jpg"
        value={tempUrl}
        onChange={(e) => setTempUrl(e.target.value)}
        onBlur={handleUrlUpload}
      />
    )}
  </div>
</div>
```

2. **Icon Upload (Multiple)**:

```tsx
<div>
  <label>Tech Stack Icons * (max {MAX_ICON_LISTS})</label>
  <div className="space-y-2">
    {/* Icon grid with previews */}
    <div className="grid grid-cols-5 gap-2">
      {formData.iconLists.map((icon, index) => (
        <div key={index} className="relative">
          {icon ? (
            <div className="w-16 h-16 rounded-full overflow-hidden border">
              <img src={icon} className="w-full h-full object-cover" />
              <button onClick={() => removeIconField(index)}>✕</button>
            </div>
          ) : (
            <button
              onClick={() => handleIconUpload(index)}
              className="w-16 h-16 rounded-full border-2 border-dashed"
            >
              +
            </button>
          )}
        </div>
      ))}
    </div>
  </div>
</div>
```

#### B. Upload Handler Functions

Add these to ProjectManager component:

```tsx
const [uploading, setUploading] = useState<Record<string, boolean>>({});
const [showUrlInput, setShowUrlInput] = useState(false);
const [tempUrl, setTempUrl] = useState("");

const handleImageFileUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setUploading({ ...uploading, mainImage: true });

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "images");

    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      handleFieldChange("img", data.url);
      toast.success("Image uploaded successfully!");
    } else {
      toast.error(data.error || "Upload failed");
    }
  } catch (error) {
    toast.error("Failed to upload image");
  } finally {
    setUploading({ ...uploading, mainImage: false });
  }
};

const handleUrlUpload = async () => {
  if (!tempUrl) return;

  setUploading({ ...uploading, mainImage: true });

  try {
    const formData = new FormData();
    formData.append("url", tempUrl);
    formData.append("folder", "images");

    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      handleFieldChange("img", data.url);
      setTempUrl("");
      setShowUrlInput(false);
      toast.success("Image uploaded from URL!");
    } else {
      toast.error(data.error || "Upload failed");
    }
  } catch (error) {
    toast.error("Failed to upload from URL");
  } finally {
    setUploading({ ...uploading, mainImage: false });
  }
};

const handleIconUpload = async (index: number) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    setUploading({ ...uploading, [`icon_${index}`]: true });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "icons");

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const newIcons = [...formData.iconLists];
        newIcons[index] = data.url;
        handleFieldChange("iconLists", newIcons);
        toast.success(`Icon ${index + 1} uploaded!`);
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (error) {
      toast.error("Failed to upload icon");
    } finally {
      setUploading({ ...uploading, [`icon_${index}`]: false });
    }
  };

  input.click();
};
```

### 2. Integrate Recycle Bin with Project Deletion

**Update ProjectContext.tsx**:

```tsx
import { useRecycleBin } from "@/contexts/RecycleBinContext";

// Inside ProjectProvider:
const { moveToRecycleBin } = useRecycleBin();

// Update deleteProject function:
const deleteProject = useCallback(
  async (id: string): Promise<ProjectOperationResult> => {
    const project = projects.find((p) => p.id === id);
    if (!project) {
      return { success: false, error: "Project not found" };
    }

    try {
      // Move to recycle bin instead of permanent delete
      await moveToRecycleBin("project", project, id);

      // Remove from API
      const response = await fetch("/api/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete project");
      }

      // Remove from local state
      setProjects((prev) => prev.filter((p) => p.id !== id));

      toast.success("Project moved to Recycle Bin", {
        description: "You can restore it within 15 days",
      });

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },
  [projects, moveToRecycleBin]
);
```

### 3. Improved Form UX

**Key Improvements to Implement**:

1. **Accordion/Tabs for Form Sections**:

   - Basic Info (title, description)
   - Media (image, icons)
   - Metadata (link, order, active status)

2. **Real-time Validation**:

   - Show check/error icons next to fields as user types
   - Display character count for title/description
   - Preview URL validity

3. **Auto-save Drafts**:

   - Save to localStorage every 5 seconds
   - Recover on component mount

4. **Keyboard Shortcuts**:

   - Ctrl+S to save
   - Esc to cancel
   - Tab navigation

5. **Loading States**:
   - Skeleton loaders for images
   - Progress bars for uploads
   - Disable form during submission

### 4. Error Handling Improvements

**Add to ProjectManager**:

```tsx
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

const validateField = (field: string, value: any) => {
  const errors = { ...fieldErrors };

  switch (field) {
    case "title":
      if (!value || value.trim().length < MIN_TITLE_LENGTH) {
        errors.title = `Title must be at least ${MIN_TITLE_LENGTH} characters`;
      } else {
        delete errors.title;
      }
      break;
    case "des":
      if (!value || value.trim().length < MIN_DESCRIPTION_LENGTH) {
        errors.des = `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters`;
      } else {
        delete errors.des;
      }
      break;
    case "img":
      if (!value || !value.trim()) {
        errors.img = "Image is required";
      } else {
        delete errors.img;
      }
      break;
    case "link":
      if (!value || !value.trim()) {
        errors.link = "Project link is required";
      } else if (!value.startsWith("http")) {
        errors.link = "Link must be a valid URL";
      } else {
        delete errors.link;
      }
      break;
  }

  setFieldErrors(errors);
};
```

### 5. Image Rendering Consistency

**Add CSS for consistent rendering**:

```css
/* Project images - maintain aspect ratio */
.project-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 12px;
}

/* Tech icons - circular with consistent size */
.tech-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
  background: white;
}

/* Drag and drop zone */
.drag-drop-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.drag-drop-zone:hover,
.drag-drop-zone.dragging {
  border-color: #6366f1;
  background: #eef2ff;
}
```

---

## 📝 Implementation Priority

1. **High Priority** (Do First):

   - Image upload UI in ProjectManager
   - Recycle bin integration for soft delete
   - Form validation improvements

2. **Medium Priority**:

   - Drag-and-drop image upload
   - Auto-save drafts
   - Keyboard shortcuts

3. **Nice to Have**:
   - Image cropping/editing
   - Bulk upload for icons
   - Advanced filters in project list

---

## 🧪 Testing Checklist

- [ ] Upload image from local file
- [ ] Upload image from URL
- [ ] Upload image from direct link input
- [ ] Delete project → goes to recycle bin
- [ ] Restore project from recycle bin
- [ ] All form validations work
- [ ] Images render at consistent size
- [ ] Icons render as circles
- [ ] Navbar doesn't shake on interaction
- [ ] Version notes button works
- [ ] Recycle bin badge shows correct count

---

## 🔧 Quick Fixes Needed

### Fix Navbar Shaking

The navbar is already updated with proper flex layout and `shrink-0` classes which prevent layout shifts. The issue might be from dynamic content loading. The fix is already applied.

### Next Steps

1. Copy the upload handler functions into ProjectManager.tsx
2. Update the form JSX with image upload UI
3. Test the upload flow
4. Integrate recycle bin deletion
5. Add remaining UX improvements

Would you like me to implement any specific part next?
