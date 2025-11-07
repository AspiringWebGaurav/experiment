#!/usr/bin/env node
/**
 * Server-side Migration Script (Admin)
 *
 * Uploads project images and icon assets from `public/` to Firebase Storage
 * and creates Firestore documents (collection: `projects`) that reference
 * the uploaded storage URLs. Uses firebase-admin and requires a service
 * account JSON via the GOOGLE_APPLICATION_CREDENTIALS env var or
 * `scripts/serviceAccountKey.json`.
 *
 * Usage:
 *   node scripts/seed-projects-admin.mjs        # create documents (no delete)
 *   node scripts/seed-projects-admin.mjs --replace   # delete existing projects first
 *
 * Notes:
 * - This script will make uploaded files public (so frontend can fetch them)
 *   by calling file.makePublic(). If you prefer signed URLs or stricter
 *   ACLs, change the upload logic accordingly.
 */

import fs from "fs";
import path from "path";
import admin from "firebase-admin";

// Locate service account
const svcPathEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const defaultSvc = path.join(
  process.cwd(),
  "scripts",
  "serviceAccountKey.json"
);
const serviceAccountPath =
  svcPathEnv || (fs.existsSync(defaultSvc) ? defaultSvc : null);

if (!serviceAccountPath) {
  console.error("\n❌ Service account not found.");
  console.error(
    "Provide a Firebase service account JSON via the GOOGLE_APPLICATION_CREDENTIALS env var or place it at scripts/serviceAccountKey.json\n"
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

// Initialize admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Static projects (same data as earlier seed script)
const staticProjects = [
  {
    title: "3D Solar System Planets to Explore",
    des: "Explore the wonders of our solar system with this captivating 3D simulation of the planets using Three.js.",
    img: "/p1.svg",
    iconLists: ["/re.svg", "/tail.svg", "/ts.svg", "/three.svg", "/fm.svg"],
    link: "https://github.com/adrianhajdin?tab=repositories",
    order: 1,
  },
  {
    title: "Yoom - Video Conferencing App",
    des: "Simplify your video conferencing experience with Yoom. Seamlessly connect with colleagues and friends.",
    img: "/p2.svg",
    iconLists: ["/next.svg", "/tail.svg", "/ts.svg", "/stream.svg", "/c.svg"],
    link: "https://github.com/adrianhajdin/zoom-clone",
    order: 2,
  },
  {
    title: "AI Image SaaS - Canva Application",
    des: "A REAL Software-as-a-Service app with AI features and a payments and credits system using the latest tech stack.",
    img: "/p3.svg",
    iconLists: ["/re.svg", "/tail.svg", "/ts.svg", "/three.svg", "/c.svg"],
    link: "https://github.com/adrianhajdin/ai_saas_app",
    order: 3,
  },
  {
    title: "Animated Apple Iphone 3D Website",
    des: "Recreated the Apple iPhone 15 Pro website, combining GSAP animations and Three.js 3D effects.",
    img: "/p4.svg",
    iconLists: ["/next.svg", "/tail.svg", "/ts.svg", "/three.svg", "/gsap.svg"],
    link: "https://github.com/adrianhajdin/iphone",
    order: 4,
  },
];

async function uploadPublicFile(localPath, destPath) {
  if (!fs.existsSync(localPath)) {
    throw new Error(`Local file not found: ${localPath}`);
  }

  const options = {
    destination: destPath,
    metadata: {
      cacheControl: "public, max-age=31536000",
    },
  };

  await bucket.upload(localPath, options);
  const file = bucket.file(destPath);
  // Make file publicly readable so frontend can fetch without auth
  await file.makePublic();

  return `https://storage.googleapis.com/${bucket.name}/${destPath}`;
}

async function clearProjectsCollection() {
  console.log("Clearing existing projects collection...");
  const collRef = db.collection("projects");
  const snapshot = await collRef.get();
  const batchSize = 500;
  if (snapshot.empty) {
    console.log("No existing documents to delete.");
    return;
  }

  const batches = [];
  let batch = db.batch();
  let opCount = 0;
  snapshot.docs.forEach((docSnap, idx) => {
    batch.delete(docSnap.ref);
    opCount++;
    if (opCount >= batchSize) {
      batches.push(batch.commit());
      batch = db.batch();
      opCount = 0;
    }
  });
  if (opCount > 0) batches.push(batch.commit());

  await Promise.all(batches);
  console.log(`Deleted ${snapshot.size} documents.`);
}

async function main() {
  const args = process.argv.slice(2);
  const replace = args.includes("--replace");

  try {
    if (replace) {
      // destructive action, confirm via prompt
      const prompt = require("prompt-sync")({ sigint: true });
      const answer = prompt(
        "Are you sure you want to DELETE existing projects? Type YES to confirm: "
      );
      if (answer !== "YES") {
        console.log("Aborting.");
        process.exit(0);
      }
      await clearProjectsCollection();
    }

    console.log("Uploading assets and creating Firestore documents...");

    let created = 0;
    for (const project of staticProjects) {
      try {
        // Upload main image
        const imgName = project.img.replace(/^\//, "");
        const localImg = path.join(process.cwd(), "public", imgName);
        const destImg = `projects/images/${imgName}`;
        const imgUrl = await uploadPublicFile(localImg, destImg);

        // Upload icons and map to urls
        const iconUrls = [];
        for (const icon of project.iconLists) {
          const iconName = icon.replace(/^\//, "");
          const localIcon = path.join(process.cwd(), "public", iconName);
          const destIcon = `projects/icons/${iconName}`;
          try {
            const iconUrl = await uploadPublicFile(localIcon, destIcon);
            iconUrls.push(iconUrl);
          } catch (e) {
            console.warn(
              `Warning: failed to upload icon ${iconName}: ${e.message}. Skipping.`
            );
          }
        }

        const docData = {
          title: project.title,
          des: project.des,
          img: imgUrl,
          iconLists: iconUrls,
          link: project.link,
          order: project.order,
          isActive: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await db.collection("projects").add(docData);
        console.log(
          `✅ Created project: "${project.title}" (ID: ${docRef.id})`
        );
        created++;
      } catch (err) {
        console.error(
          `❌ Failed to process project "${project.title}":`,
          err.message || err
        );
      }
    }

    console.log("\nSummary:");
    console.log(`  Created: ${created}`);
    console.log("Done.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

main();
