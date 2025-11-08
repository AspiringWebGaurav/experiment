/**
 * Migration Script: Work Experience to Firestore
 *
 * This script migrates the hardcoded work experience data from data/index.ts
 * to Firestore database and uploads the icon images to Firebase Storage.
 *
 * Usage:
 *   node scripts/migrate-work-experience.mjs
 *
 * Reads Firebase credentials from .env.local file
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import http from "http";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("✅ Loaded environment variables from .env.local");
} else {
  console.error("❌ .env.local file not found!");
  console.log("Please create .env.local with Firebase credentials");
  process.exit(1);
}

// Hardcoded work experience data from data/index.ts
const workExperienceData = [
  {
    id: 1,
    title: "Frontend Engineer Intern",
    desc: "Assisted in the development of a web-based platform using React.js, enhancing interactivity.",
    className: "md:col-span-2",
    thumbnail: "/exp1.svg",
  },
  {
    id: 2,
    title: "Mobile App Dev - JSM Tech",
    desc: "Designed and developed mobile app for both iOS & Android platforms using React Native.",
    className: "md:col-span-2",
    thumbnail: "/exp2.svg",
  },
  {
    id: 3,
    title: "Freelance App Dev Project",
    desc: "Led the dev of a mobile app for a client, from initial concept to deployment on app stores.",
    className: "md:col-span-2",
    thumbnail: "/exp3.svg",
  },
  {
    id: 4,
    title: "Lead Frontend Developer",
    desc: "Developed and maintained user-facing features using modern frontend technologies.",
    className: "md:col-span-2",
    thumbnail: "/exp4.svg",
  },
];

// Initialize Firebase Admin
console.log("🔧 Initializing Firebase Admin...");

// Get credentials from environment variables
const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n"
);
const storageBucket =
  process.env.FIREBASE_ADMIN_STORAGE_BUCKET ||
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!projectId || !clientEmail || !privateKey) {
  console.error("❌ Missing Firebase Admin credentials in .env.local!");
  console.log("\n📋 Required environment variables:");
  console.log(
    "   - FIREBASE_ADMIN_PROJECT_ID (or NEXT_PUBLIC_FIREBASE_PROJECT_ID)"
  );
  console.log("   - FIREBASE_ADMIN_CLIENT_EMAIL");
  console.log("   - FIREBASE_ADMIN_PRIVATE_KEY");
  console.log(
    "   - FIREBASE_ADMIN_STORAGE_BUCKET (or NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)"
  );
  console.log("\n💡 These should be in your .env.local file");
  process.exit(1);
}

const serviceAccount = {
  projectId,
  clientEmail,
  privateKey,
};

console.log(`✅ Firebase Admin credentials loaded for project: ${projectId}`);

const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: storageBucket || `${projectId}.appspot.com`,
});

const db = getFirestore(app);
const storage = getStorage(app).bucket();

/**
 * Download file from URL
 */
async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;

    protocol
      .get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Follow redirect
          return downloadFile(response.headers.location)
            .then(resolve)
            .catch(reject);
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }

        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks)));
        response.on("error", reject);
      })
      .on("error", reject);
  });
}

/**
 * Upload image to Firebase Storage
 */
async function uploadImageToStorage(localPath, fileName) {
  try {
    // Check if it's a local file path
    if (localPath.startsWith("/")) {
      const publicPath = path.join(__dirname, "..", "public", localPath);

      if (!fs.existsSync(publicPath)) {
        console.log(`   ⚠️  Local file not found: ${publicPath}`);
        console.log(`   📥 Attempting to use CDN fallback...`);

        // Use a generic work experience icon from CDN as fallback
        const fallbackIcons = [
          "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
          "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",
          "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg",
          "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg",
        ];

        // Use different fallback for each experience
        const iconIndex =
          parseInt(fileName.match(/\d+/)?.[0] || 0) % fallbackIcons.length;
        return fallbackIcons[iconIndex];
      }

      const destination = `work-experience/${fileName}`;
      await storage.upload(publicPath, {
        destination,
        metadata: {
          contentType: "image/svg+xml",
          cacheControl: "public, max-age=31536000",
        },
      });

      const file = storage.file(destination);
      await file.makePublic();

      const publicUrl = `https://storage.googleapis.com/${storage.name}/${destination}`;
      console.log(`   ✅ Uploaded: ${publicUrl}`);
      return publicUrl;
    }

    // If it's already a URL, return it
    return localPath;
  } catch (error) {
    console.error(`   ❌ Error uploading ${fileName}:`, error.message);

    // Return CDN fallback on error
    const fallbackIcons = [
      "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg",
    ];

    const iconIndex =
      parseInt(fileName.match(/\d+/)?.[0] || 0) % fallbackIcons.length;
    return fallbackIcons[iconIndex];
  }
}

/**
 * Migrate work experiences to Firestore
 */
async function migrateWorkExperiences() {
  console.log("\n📦 Starting work experience migration...\n");

  const collectionRef = db.collection("workExperience");

  // Check if collection already has data
  const existingDocs = await collectionRef.get();
  if (!existingDocs.empty) {
    console.log(
      "⚠️  Collection already contains data. Do you want to continue?"
    );
    console.log(`   Found ${existingDocs.size} existing work experience(s).`);
    console.log(
      "   This will add new entries without removing existing ones.\n"
    );
  }

  let successCount = 0;
  let errorCount = 0;

  for (const experience of workExperienceData) {
    try {
      console.log(`\n📝 Processing: ${experience.title}`);
      console.log(`   Description: ${experience.desc.substring(0, 50)}...`);

      // Upload thumbnail
      console.log(`   📤 Uploading thumbnail...`);
      const thumbnailFileName = path.basename(experience.thumbnail);
      const thumbnailUrl = await uploadImageToStorage(
        experience.thumbnail,
        thumbnailFileName
      );

      // Prepare document data
      const now = Timestamp.now();
      const docData = {
        title: experience.title,
        desc: experience.desc,
        thumbnail: thumbnailUrl,
        company: experience.title.includes("-")
          ? experience.title.split("-")[1]?.trim()
          : "",
        duration: "",
        location: "",
        order: experience.id,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      // Add to Firestore
      const docRef = await collectionRef.add(docData);
      console.log(`   ✅ Created in Firestore with ID: ${docRef.id}`);

      successCount++;
    } catch (error) {
      console.error(
        `   ❌ Error processing ${experience.title}:`,
        error.message
      );
      errorCount++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 Migration Summary:");
  console.log("=".repeat(60));
  console.log(`✅ Successfully migrated: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📦 Total processed: ${workExperienceData.length}`);
  console.log("=".repeat(60));
  console.log("\n✨ Migration complete!\n");
}

// Run migration
migrateWorkExperiences()
  .then(() => {
    console.log(
      "🎉 All done! You can now manage work experiences from the admin panel."
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  });
