/**
 * Migration Script: Testimonials to Firestore (API-based)
 *
 * This script migrates existing static testimonial data to Firestore
 * using the API routes (no service account needed).
 *
 * Prerequisites:
 * 1. Make sure your Next.js dev server is running (npm run dev)
 * 2. You must be authenticated in the admin panel
 *
 * Usage: node scripts/migrate-testimonials-api.mjs
 */

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

async function migrateTestimonials() {
  const API_URL = "http://localhost:3000/api/testimonials";

  console.log("\n📋 Starting testimonials migration via API...\n");

  // Check if testimonials already exist
  try {
    const checkResponse = await fetch(API_URL);
    if (checkResponse.ok) {
      const existing = await checkResponse.json();
      if (existing.length > 0) {
        console.log(
          `⚠️  Found ${existing.length} existing testimonials in database.`
        );
        console.log("Skipping migration - testimonials already exist.");
        console.log(
          "To force migration, manually delete testimonials from the admin panel first.\n"
        );
        return;
      }
    }
  } catch (error) {
    console.error("❌ Failed to check existing testimonials:", error.message);
    console.log(
      "\nMake sure your Next.js dev server is running (npm run dev)\n"
    );
    process.exit(1);
  }

  // Prepare batch testimonials
  const testimonialsToCreate = testimonials.map((testimonial, index) => ({
    quote: testimonial.quote,
    name: testimonial.name,
    title: testimonial.title,
    img: "", // No person images in static data
    companyLogo: mapCompanyLogo(testimonial.title, index),
    order: index + 1,
    isActive: true,
  }));

  // Use batch creation API
  try {
    console.log(
      `📤 Sending ${testimonialsToCreate.length} testimonials to API...\n`
    );

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testimonialsToCreate),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create testimonials");
    }

    const result = await response.json();

    console.log("✅ Batch migration successful!\n");
    console.log(`📊 Migration Summary:`);
    console.log(`   Total: ${testimonialsToCreate.length}`);
    console.log(
      `   ✅ Created: ${
        Array.isArray(result) ? result.length : testimonialsToCreate.length
      }`
    );
    console.log(
      "\n✨ Migration completed! You can now view testimonials in the admin panel.\n"
    );
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

async function main() {
  try {
    console.log("\n🚀 Testimonials Migration Script (API-based)\n");
    console.log("=".repeat(50));

    await migrateTestimonials();

    console.log("=".repeat(50));
    console.log("\n✅ All done!\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

main();
