/**
 * Migration Script: Seed Projects from Static Data
 *
 * This script migrates the static projects from data/index.ts to Firestore
 * Run this once to populate the database with your existing projects
 *
 * Usage: node scripts/seed-projects.js
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCMKuKgoWq7s_b_798pJq9QgGbHgUEy9kM",
  authDomain: "gaurav-portfolio-improved.firebaseapp.com",
  databaseURL:
    "https://gaurav-portfolio-improved-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gaurav-portfolio-improved",
  storageBucket: "gaurav-portfolio-improved.firebasestorage.app",
  messagingSenderId: "761696179429",
  appId: "1:761696179429:web:8919d6a499c2e8f0d4b00c",
  measurementId: "G-WQKV3WPPD8",
};

// Static projects from data/index.ts
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

async function seedProjects() {
  console.log("🚀 Starting project migration...\n");

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const projectsRef = collection(db, "projects");

    // Check if projects already exist
    const snapshot = await getDocs(projectsRef);
    if (snapshot.size > 0) {
      console.log(
        `⚠️  Warning: ${snapshot.size} projects already exist in the database.`
      );
      console.log(
        "   This script will add more projects. Continue? (Ctrl+C to cancel)\n"
      );

      // Wait 5 seconds before proceeding
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    // Add each project to Firestore
    const now = Timestamp.now();
    let successCount = 0;
    let errorCount = 0;

    for (const project of staticProjects) {
      try {
        const projectData = {
          ...project,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        };

        const docRef = await addDoc(projectsRef, projectData);
        console.log(
          `✅ Created project: "${project.title}" (ID: ${docRef.id})`
        );
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to create project: "${project.title}"`, error);
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Migration Summary:");
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(
      `   📁 Total projects in database: ${snapshot.size + successCount}`
    );
    console.log("=".repeat(60));
    console.log("\n✨ Migration completed!");
    console.log("   You can now manage these projects from the admin panel.\n");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
seedProjects();
