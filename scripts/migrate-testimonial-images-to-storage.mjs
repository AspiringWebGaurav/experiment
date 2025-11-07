/**
 * Complete Testimonial Images Migration to Firebase Storage
 *
 * This script:
 * 1. Uploads all static testimonial images (avatars & logos) to Firebase Storage
 * 2. Updates all testimonials in database with new Storage URLs
 * 3. Ensures app is fully dynamic with no static dependencies
 * 4. Provides detailed migration report
 *
 * Usage: node scripts/migrate-testimonial-images-to-storage.mjs
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Image files to migrate
const AVATAR_FILES = [{ local: "profile.svg", name: "default-profile.svg" }];

const COMPANY_LOGO_FILES = [
  { local: "cloud.svg", name: "cloudinary.svg", company: "Cloudinary" },
  { local: "app.svg", name: "appwrite.svg", company: "Appwrite" },
  { local: "host.svg", name: "hostinger.svg", company: "Hostinger" },
  { local: "s.svg", name: "stream.svg", company: "Stream" },
  { local: "dock.svg", name: "docker.svg", company: "Docker" },
];

let db, bucket;

/**
 * Initialize Firebase Admin
 */
async function initializeFirebase() {
  try {
    // Try to get existing app or initialize new one
    let app;
    try {
      const { getApps, getApp } = await import("firebase-admin/app");
      const apps = getApps();
      app = apps.length > 0 ? getApp() : null;
    } catch (e) {
      app = null;
    }

    if (!app) {
      // Initialize with default credentials (uses GOOGLE_APPLICATION_CREDENTIALS or ADC)
      app = initializeApp();
    }

    db = getFirestore();
    bucket = getStorage().bucket();

    console.log("✅ Firebase Admin initialized successfully");
    console.log(`📦 Storage bucket: ${bucket.name}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin:", error.message);
    console.log(
      "\n💡 Tip: Make sure Firebase credentials are set up correctly"
    );
    return false;
  }
}

/**
 * Upload image file to Firebase Storage
 */
async function uploadImageToStorage(localPath, storagePath) {
  try {
    const publicDir = join(__dirname, "..", "public");
    const filePath = join(publicDir, localPath);

    // Read file
    const fileBuffer = await readFile(filePath);

    // Upload to Storage
    const file = bucket.file(storagePath);
    await file.save(fileBuffer, {
      metadata: {
        contentType: localPath.endsWith(".svg") ? "image/svg+xml" : "image/png",
        cacheControl: "public, max-age=31536000",
      },
    });

    // Make public
    await file.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    return {
      success: true,
      url: publicUrl,
      localPath,
      storagePath,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      localPath,
    };
  }
}

/**
 * Migrate avatar images
 */
async function migrateAvatars() {
  console.log("\n👤 Migrating Avatar Images...\n");

  const results = [];

  for (const avatar of AVATAR_FILES) {
    const storagePath = `projects/testimonials/avatars/${avatar.name}`;

    console.log(`⏳ Uploading ${avatar.local} to Storage...`);
    const result = await uploadImageToStorage(avatar.local, storagePath);

    if (result.success) {
      console.log(`✅ Uploaded: ${result.url}`);
      results.push(result);
    } else {
      console.log(`❌ Failed: ${result.error}`);
    }
  }

  return results;
}

/**
 * Migrate company logo images
 */
async function migrateCompanyLogos() {
  console.log("\n🏢 Migrating Company Logo Images...\n");

  const results = [];

  for (const logo of COMPANY_LOGO_FILES) {
    const storagePath = `projects/testimonials/logos/${logo.name}`;

    console.log(`⏳ Uploading ${logo.local} (${logo.company}) to Storage...`);
    const result = await uploadImageToStorage(logo.local, storagePath);

    if (result.success) {
      console.log(`✅ Uploaded: ${result.url}`);
      results.push({
        ...result,
        company: logo.company,
        oldPath: `/${logo.local}`,
      });
    } else {
      console.log(`❌ Failed: ${result.error}`);
    }
  }

  return results;
}

/**
 * Update testimonials in database with new URLs
 */
async function updateTestimonialsInDatabase(avatarUrls, logoUrls) {
  console.log("\n📝 Updating Testimonials in Database...\n");

  try {
    const testimonialsRef = db.collection("testimonials");
    const snapshot = await testimonialsRef.get();

    if (snapshot.empty) {
      console.log("⚠️  No testimonials found in database");
      return { updated: 0, skipped: 0 };
    }

    console.log(`📋 Found ${snapshot.size} testimonials to update\n`);

    let updated = 0;
    let skipped = 0;

    // Create URL mappings
    const logoMapping = {};
    logoUrls.forEach((logo) => {
      logoMapping[logo.oldPath] = logo.url;
    });

    const defaultAvatarUrl =
      avatarUrls.find((a) => a.localPath === "profile.svg")?.url ||
      "/profile.svg";

    for (const doc of snapshot.docs) {
      const testimonial = doc.data();
      const updates = {};
      let needsUpdate = false;

      // Update avatar if it's using static path
      if (
        !testimonial.img ||
        testimonial.img === "/profile.svg" ||
        testimonial.img.startsWith("/")
      ) {
        updates.img = defaultAvatarUrl;
        needsUpdate = true;
      }

      // Update company logo if it's using static path
      if (testimonial.companyLogo && testimonial.companyLogo.startsWith("/")) {
        const newLogoUrl = logoMapping[testimonial.companyLogo];
        if (newLogoUrl) {
          updates.companyLogo = newLogoUrl;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        updates.updatedAt = new Date();
        await doc.ref.update(updates);
        console.log(`✅ Updated: ${testimonial.name}`);
        updated++;
      } else {
        console.log(
          `⏭️  Skipped: ${testimonial.name} (already using Storage URLs)`
        );
        skipped++;
      }
    }

    return { updated, skipped };
  } catch (error) {
    console.error("❌ Database update failed:", error.message);
    throw error;
  }
}

/**
 * Verify migration
 */
async function verifyMigration() {
  console.log("\n🔍 Verifying Migration...\n");

  try {
    const testimonialsRef = db.collection("testimonials");
    const snapshot = await testimonialsRef.get();

    let staticAvatars = 0;
    let staticLogos = 0;
    let storageAvatars = 0;
    let storageLogos = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();

      // Check avatar
      if (data.img) {
        if (data.img.startsWith("https://storage.googleapis.com/")) {
          storageAvatars++;
        } else if (data.img.startsWith("/")) {
          staticAvatars++;
        }
      }

      // Check logo
      if (data.companyLogo) {
        if (data.companyLogo.startsWith("https://storage.googleapis.com/")) {
          storageLogos++;
        } else if (data.companyLogo.startsWith("/")) {
          staticLogos++;
        }
      }
    });

    console.log("📊 Migration Verification:");
    console.log(`   Avatars:`);
    console.log(`     ✅ Using Storage: ${storageAvatars}`);
    console.log(`     ⚠️  Using Static: ${staticAvatars}`);
    console.log(`   Company Logos:`);
    console.log(`     ✅ Using Storage: ${storageLogos}`);
    console.log(`     ⚠️  Using Static: ${staticLogos}`);

    const fullyMigrated = staticAvatars === 0 && staticLogos === 0;

    if (fullyMigrated) {
      console.log("\n✨ All testimonials fully migrated to Firebase Storage!");
    } else {
      console.log("\n⚠️  Some testimonials still using static paths");
    }

    return fullyMigrated;
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    return false;
  }
}

/**
 * Main migration function
 */
async function main() {
  console.log("\n🚀 Testimonial Images Migration to Firebase Storage\n");
  console.log("=".repeat(60));

  try {
    // Initialize Firebase
    const initialized = await initializeFirebase();
    if (!initialized) {
      console.log("\n💡 Using API-based approach instead...\n");
      await migrateViaAPI();
      return;
    }

    // Migrate avatars
    const avatarUrls = await migrateAvatars();

    // Migrate company logos
    const logoUrls = await migrateCompanyLogos();

    // Update database
    const { updated, skipped } = await updateTestimonialsInDatabase(
      avatarUrls,
      logoUrls
    );

    // Verify migration
    const verified = await verifyMigration();

    // Final summary
    console.log("\n" + "=".repeat(60));
    console.log("\n📊 Migration Summary:");
    console.log(`   Avatars uploaded: ${avatarUrls.length}`);
    console.log(`   Logos uploaded: ${logoUrls.length}`);
    console.log(`   Testimonials updated: ${updated}`);
    console.log(`   Testimonials skipped: ${skipped}`);
    console.log(`   Fully migrated: ${verified ? "YES ✅" : "NO ⚠️"}`);

    console.log("\n✨ Migration completed!\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

/**
 * Alternative: Migrate via API (if Firebase Admin not available)
 */
async function migrateViaAPI() {
  console.log("📡 Starting API-based migration...\n");

  // This approach uploads files via the API endpoint
  const API_URL = "http://localhost:3000";

  try {
    // Fetch current testimonials
    const response = await fetch(`${API_URL}/api/testimonials`);
    if (!response.ok) throw new Error("Failed to fetch testimonials");

    const data = await response.json();
    const testimonials = data.testimonials || [];

    console.log(`📋 Found ${testimonials.length} testimonials\n`);

    // Note: File upload via API requires FormData which is complex in Node.js
    // Recommend using Firebase Admin SDK for proper migration
    console.log("⚠️  API-based migration requires manual file uploads");
    console.log(
      "💡 Please set up Firebase Admin SDK credentials for automatic migration\n"
    );
    console.log("Alternative: Upload images manually via the admin panel\n");
  } catch (error) {
    console.error("❌ API migration failed:", error.message);
  }
}

main();
