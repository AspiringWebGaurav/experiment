/**
 * Migration Script: Upload Default Avatar for Existing Testimonials
 *
 * This script adds the default profile picture to existing testimonials
 * that don't have a user avatar image set.
 *
 * Prerequisites:
 * 1. Make sure your Next.js dev server is running (npm run dev)
 *
 * Usage: node scripts/migrate-testimonial-avatars.mjs
 */

const DEFAULT_AVATAR = "/profile.svg";

async function migrateAvatars() {
  const API_URL = "http://localhost:3000/api/testimonials";

  console.log("\n🖼️  Starting testimonial avatar migration...\n");

  try {
    // Fetch all testimonials
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch testimonials");
    }

    const data = await response.json();
    const testimonials = data.testimonials;

    console.log(`📋 Found ${testimonials.length} testimonials\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    // Update testimonials without images
    for (const testimonial of testimonials) {
      if (!testimonial.img || testimonial.img === "") {
        console.log(`⏳ Updating ${testimonial.name}...`);

        try {
          const updateResponse = await fetch(
            `${API_URL}?id=${testimonial.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...testimonial,
                img: DEFAULT_AVATAR,
              }),
            }
          );

          if (!updateResponse.ok) {
            throw new Error(`Failed to update ${testimonial.name}`);
          }

          updatedCount++;
          console.log(`✅ Updated ${testimonial.name}`);
        } catch (error) {
          console.error(
            `❌ Failed to update ${testimonial.name}:`,
            error.message
          );
        }
      } else {
        console.log(`⏭️  Skipped ${testimonial.name} (already has image)`);
        skippedCount++;
      }
    }

    console.log("\n📊 Migration Summary:");
    console.log(`   Total: ${testimonials.length}`);
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log("\n✨ Avatar migration completed!\n");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.log(
      "\nMake sure your Next.js dev server is running (npm run dev)\n"
    );
    process.exit(1);
  }
}

async function main() {
  try {
    console.log("\n🚀 Testimonial Avatar Migration Script\n");
    console.log("=".repeat(50));

    await migrateAvatars();

    console.log("=".repeat(50));
    console.log("\n✅ All done!\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

main();
