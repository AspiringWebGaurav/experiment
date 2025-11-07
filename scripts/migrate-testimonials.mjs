/**
 * Migration Script: Testimonials to Firestore
 *
 * This script migrates existing static testimonial data to Firestore.
 * It maps static testimonials with company logos based on name patterns.
 *
 * Usage: node scripts/migrate-testimonials.mjs
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Static testimonials data (from data/index.ts)
const testimonials = [
  {
    quote:
      "Collaborating with Adrian was an absolute pleasure. His professionalism, promptness, and dedication to delivering exceptional results were evident throughout our project. Adrian's enthusiasm for every facet of development truly stands out. If you're seeking to elevate your website and elevate your brand, Adrian is the ideal partner.",
    name: "Michael Johnson",
    title: "Director of AlphaStream Technologies",
  },
  {
    quote:
      "Collaborating with Adrian was an absolute pleasure. His professionalism, promptness, and dedication to delivering exceptional results were evident throughout our project. Adrian's enthusiasm for every facet of development truly stands out. If you're seeking to elevate your website and elevate your brand, Adrian is the ideal partner.",
    name: "Michael Johnson",
    title: "Director of AlphaStream Technologies",
  },
  {
    quote:
      "Collaborating with Adrian was an absolute pleasure. His professionalism, promptness, and dedication to delivering exceptional results were evident throughout our project. Adrian's enthusiasm for every facet of development truly stands out. If you're seeking to elevate your website and elevate your brand, Adrian is the ideal partner.",
    name: "Michael Johnson",
    title: "Director of AlphaStream Technologies",
  },
  {
    quote:
      "Collaborating with Adrian was an absolute pleasure. His professionalism, promptness, and dedication to delivering exceptional results were evident throughout our project. Adrian's enthusiasm for every facet of development truly stands out. If you're seeking to elevate your website and elevate your brand, Adrian is the ideal partner.",
    name: "Michael Johnson",
    title: "Director of AlphaStream Technologies",
  },
  {
    quote:
      "Collaborating with Adrian was an absolute pleasure. His professionalism, promptness, and dedication to delivering exceptional results were evident throughout our project. Adrian's enthusiasm for every facet of development truly stands out. If you're seeking to elevate your website and elevate your brand, Adrian is the ideal partner.",
    name: "Michael Johnson",
    title: "Director of AlphaStream Technologies",
  },
];

// Company logos mapping
const companyLogosMap = {
  "AlphaStream Technologies": "/cloud.svg", // Cloudinary
};

// Default company logos rotation for duplicate entries
const defaultLogos = [
  "/app.svg", // Appwrite
  "/host.svg", // Hostinger
  "/s.svg", // Stream
  "/dock.svg", // Docker
];

async function initializeFirebase() {
  try {
    const serviceAccountPath = join(
      __dirname,
      "..",
      "firebase-service-account.json"
    );
    const serviceAccount = JSON.parse(
      await readFile(serviceAccountPath, "utf8")
    );

    initializeApp({
      credential: cert(serviceAccount),
    });

    console.log("✅ Firebase Admin initialized successfully");
    return getFirestore();
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin:", error.message);
    throw error;
  }
}

function mapCompanyLogo(title, index) {
  // Try to match from company name in title
  for (const [company, logo] of Object.entries(companyLogosMap)) {
    if (title.includes(company)) {
      return logo;
    }
  }

  // Use default logos in rotation for entries without specific company
  return defaultLogos[index % defaultLogos.length];
}

async function migrateTestimonials(db) {
  console.log("\n📋 Starting testimonials migration...\n");

  const testimonialsRef = db.collection("testimonials");

  // Check if testimonials already exist
  const snapshot = await testimonialsRef.get();
  if (!snapshot.empty) {
    console.log(
      `⚠️  Found ${snapshot.size} existing testimonials in database.`
    );
    console.log("Do you want to:");
    console.log("1. Skip migration (keep existing data)");
    console.log("2. Clear and migrate (delete all and re-import)");
    console.log("3. Append migration (add to existing data)\n");

    // For automated script, we'll skip if data exists
    console.log("Skipping migration - testimonials already exist.");
    console.log(
      "To force migration, manually delete the testimonials collection first.\n"
    );
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < testimonials.length; i++) {
    const testimonial = testimonials[i];

    try {
      const testimonialData = {
        quote: testimonial.quote,
        name: testimonial.name,
        title: testimonial.title,
        img: "", // No person images in static data
        companyLogo: mapCompanyLogo(testimonial.title, i),
        order: i + 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await testimonialsRef.add(testimonialData);

      successCount++;
      console.log(
        `✅ Migrated testimonial ${i + 1}/${testimonials.length}: ${
          testimonial.name
        }`
      );
    } catch (error) {
      errorCount++;
      console.error(
        `❌ Failed to migrate testimonial ${i + 1}:`,
        error.message
      );
    }
  }

  console.log("\n📊 Migration Summary:");
  console.log(`   Total: ${testimonials.length}`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log("\n✨ Migration completed!\n");
}

async function main() {
  try {
    console.log("\n🚀 Testimonials Migration Script\n");
    console.log("=".repeat(50));

    const db = await initializeFirebase();
    await migrateTestimonials(db);

    console.log("=".repeat(50));
    console.log(
      "\n✅ All done! You can now view testimonials in the admin panel.\n"
    );

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

main();
