/**
 * Testimonial Images Migration - API-Based Approach
 *
 * This script migrates testimonial images to Firebase Storage via the upload API.
 * Works with existing Firebase configuration without needing Admin SDK setup.
 *
 * Usage: node scripts/migrate-testimonials-complete.mjs
 */

import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import FormData from "form-data";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_URL = "http://localhost:3000";

// Static images to migrate
const IMAGE_MIGRATIONS = [
  {
    type: "avatar",
    localPath: "profile.svg",
    name: "default-profile.svg",
    oldUrl: "/profile.svg",
  },
  {
    type: "logo",
    localPath: "cloud.svg",
    name: "cloudinary-logo.svg",
    oldUrl: "/cloud.svg",
    company: "Cloudinary",
  },
  {
    type: "logo",
    localPath: "app.svg",
    name: "appwrite-logo.svg",
    oldUrl: "/app.svg",
    company: "Appwrite",
  },
  {
    type: "logo",
    localPath: "host.svg",
    name: "hostinger-logo.svg",
    oldUrl: "/host.svg",
    company: "Hostinger",
  },
  {
    type: "logo",
    localPath: "s.svg",
    name: "stream-logo.svg",
    oldUrl: "/s.svg",
    company: "Stream",
  },
  {
    type: "logo",
    localPath: "dock.svg",
    name: "docker-logo.svg",
    oldUrl: "/dock.svg",
    company: "Docker",
  },
];

/**
 * Upload image file to Firebase Storage via API
 */
async function uploadImage(localPath, folder, name) {
  try {
    const publicDir = join(__dirname, "..", "public");
    const filePath = join(publicDir, localPath);

    // Read file
    const fileBuffer = await readFile(filePath);

    // Create form data
    const formData = new FormData();
    formData.append("file", fileBuffer, {
      filename: name,
      contentType: localPath.endsWith(".svg") ? "image/svg+xml" : "image/png",
    });
    formData.append("folder", folder);

    // Upload via API
    const response = await fetch(`${API_URL}/api/upload-image`, {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Upload failed: ${error}`);
    }

    const data = await response.json();
    return {
      success: true,
      url: data.url,
      localPath,
      name,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      localPath,
      name,
    };
  }
}

/**
 * Fetch all testimonials from API
 */
async function fetchTestimonials() {
  try {
    const response = await fetch(`${API_URL}/api/testimonials`);
    if (!response.ok) {
      throw new Error("Failed to fetch testimonials");
    }
    const data = await response.json();
    return data.testimonials || [];
  } catch (error) {
    console.error("❌ Failed to fetch testimonials:", error.message);
    return [];
  }
}

/**
 * Update testimonial via API
 */
async function updateTestimonial(id, updates) {
  try {
    const response = await fetch(`${API_URL}/api/testimonials`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        ...updates,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Update failed: ${error}`);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Migrate all images
 */
async function migrateImages() {
  console.log("\n📤 Uploading Images to Firebase Storage...\n");

  const uploadResults = new Map();

  for (const migration of IMAGE_MIGRATIONS) {
    const folder =
      migration.type === "avatar"
        ? "testimonials/avatars"
        : "testimonials/logos";

    console.log(`⏳ Uploading ${migration.localPath}...`);

    const result = await uploadImage(
      migration.localPath,
      folder,
      migration.name
    );

    if (result.success) {
      console.log(`✅ Uploaded: ${result.url}`);
      uploadResults.set(migration.oldUrl, result.url);
    } else {
      console.log(`❌ Failed: ${result.error}`);
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return uploadResults;
}

/**
 * Update all testimonials with new URLs
 */
async function updateAllTestimonials(urlMapping) {
  console.log("\n📝 Updating Testimonials...\n");

  const testimonials = await fetchTestimonials();

  if (testimonials.length === 0) {
    console.log("⚠️  No testimonials found");
    return { updated: 0, skipped: 0, failed: 0 };
  }

  console.log(`📋 Found ${testimonials.length} testimonials\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const testimonial of testimonials) {
    const updates = {};
    let needsUpdate = false;

    // Check if avatar needs update
    if (testimonial.img && urlMapping.has(testimonial.img)) {
      updates.img = urlMapping.get(testimonial.img);
      needsUpdate = true;
    }

    // Check if company logo needs update
    if (testimonial.companyLogo && urlMapping.has(testimonial.companyLogo)) {
      updates.companyLogo = urlMapping.get(testimonial.companyLogo);
      needsUpdate = true;
    }

    if (needsUpdate) {
      console.log(`⏳ Updating ${testimonial.name}...`);
      const result = await updateTestimonial(testimonial.id, updates);

      if (result.success) {
        console.log(`✅ Updated successfully`);
        updated++;
      } else {
        console.log(`❌ Update failed: ${result.error}`);
        failed++;
      }

      // Small delay
      await new Promise((resolve) => setTimeout(resolve, 300));
    } else {
      console.log(`⏭️  ${testimonial.name} - No updates needed`);
      skipped++;
    }
  }

  return { updated, skipped, failed };
}

/**
 * Verify migration
 */
async function verifyMigration() {
  console.log("\n🔍 Verifying Migration...\n");

  const testimonials = await fetchTestimonials();

  let storageImages = 0;
  let staticImages = 0;

  testimonials.forEach((t) => {
    if (t.img) {
      if (
        t.img.includes("storage.googleapis.com") ||
        t.img.includes("firebasestorage")
      ) {
        storageImages++;
      } else if (t.img.startsWith("/")) {
        staticImages++;
      }
    }

    if (t.companyLogo) {
      if (
        t.companyLogo.includes("storage.googleapis.com") ||
        t.companyLogo.includes("firebasestorage")
      ) {
        storageImages++;
      } else if (t.companyLogo.startsWith("/")) {
        staticImages++;
      }
    }
  });

  console.log("📊 Verification Results:");
  console.log(`   ✅ Using Firebase Storage: ${storageImages}`);
  console.log(`   ⚠️  Using Static Paths: ${staticImages}`);

  const fullyMigrated = staticImages === 0 && storageImages > 0;

  if (fullyMigrated) {
    console.log("\n✨ All images successfully migrated to Firebase Storage!");
    console.log("🎯 App is now fully dynamic and synced with server!");
  } else {
    console.log("\n⚠️  Some images may still be using static paths");
  }

  return fullyMigrated;
}

/**
 * Main function
 */
async function main() {
  console.log("\n🚀 Complete Testimonial Migration to Firebase Storage\n");
  console.log("=".repeat(60));

  try {
    // Step 1: Upload all images
    const urlMapping = await migrateImages();

    if (urlMapping.size === 0) {
      console.log("\n❌ No images were uploaded. Migration aborted.");
      process.exit(1);
    }

    // Step 2: Update all testimonials
    const { updated, skipped, failed } = await updateAllTestimonials(
      urlMapping
    );

    // Step 3: Verify migration
    const verified = await verifyMigration();

    // Final summary
    console.log("\n" + "=".repeat(60));
    console.log("\n📊 Migration Summary:");
    console.log(`   Images uploaded: ${urlMapping.size}`);
    console.log(`   Testimonials updated: ${updated}`);
    console.log(`   Testimonials skipped: ${skipped}`);
    console.log(`   Testimonials failed: ${failed}`);
    console.log(`   Fully migrated: ${verified ? "YES ✅" : "PARTIAL ⚠️"}`);

    if (verified) {
      console.log("\n✨ SUCCESS! Your app is now fully dynamic! ✨");
      console.log("🔥 All testimonial data synced with Firebase Storage");
      console.log("🚀 No static dependencies remaining\n");
    } else {
      console.log("\n⚠️  Migration partially completed");
      console.log("💡 Check the logs above for any issues\n");
    }

    process.exit(verified ? 0 : 1);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
