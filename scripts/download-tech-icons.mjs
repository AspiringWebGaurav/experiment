/**
 * Script to download technology icons and upload them to Firebase Storage
 * This ensures all icons are stored in your Firebase project for reliability
 *
 * Run: node scripts/download-tech-icons.mjs
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import https from "https";
import http from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Technology Icons (same as in techIcons.ts)
const TECH_ICONS = [
  // Frontend
  {
    id: "react",
    name: "React",
    category: "Frontend",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  },
  {
    id: "nextjs",
    name: "Next.js",
    category: "Frontend",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
  },
  {
    id: "vue",
    name: "Vue.js",
    category: "Frontend",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg",
  },
  {
    id: "angular",
    name: "Angular",
    category: "Frontend",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg",
  },
  {
    id: "typescript",
    name: "TypeScript",
    category: "Frontend",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  },
  {
    id: "javascript",
    name: "JavaScript",
    category: "Frontend",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  },
  {
    id: "tailwind",
    name: "Tailwind CSS",
    category: "Frontend",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg",
  },
  {
    id: "html5",
    name: "HTML5",
    category: "Frontend",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  },
  {
    id: "css3",
    name: "CSS3",
    category: "Frontend",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  },
  {
    id: "sass",
    name: "Sass",
    category: "Frontend",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg",
  },
  {
    id: "redux",
    name: "Redux",
    category: "Frontend",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg",
  },
  {
    id: "threejs",
    name: "Three.js",
    category: "Frontend",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg",
  },

  // Backend
  {
    id: "nodejs",
    name: "Node.js",
    category: "Backend",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  },
  {
    id: "express",
    name: "Express",
    category: "Backend",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
  },
  {
    id: "python",
    name: "Python",
    category: "Backend",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  },
  {
    id: "django",
    name: "Django",
    category: "Backend",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg",
  },
  {
    id: "flask",
    name: "Flask",
    category: "Backend",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg",
  },
  {
    id: "php",
    name: "PHP",
    category: "Backend",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
  },
  {
    id: "laravel",
    name: "Laravel",
    category: "Backend",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-plain.svg",
  },
  {
    id: "java",
    name: "Java",
    category: "Backend",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  },
  {
    id: "spring",
    name: "Spring",
    category: "Backend",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg",
  },
  {
    id: "go",
    name: "Go",
    category: "Backend",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg",
  },
  {
    id: "ruby",
    name: "Ruby",
    category: "Backend",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg",
  },
  {
    id: "rails",
    name: "Rails",
    category: "Backend",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rails/rails-plain.svg",
  },

  // Database
  {
    id: "mongodb",
    name: "MongoDB",
    category: "Database",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "Database",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
  },
  {
    id: "mysql",
    name: "MySQL",
    category: "Database",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  },
  {
    id: "redis",
    name: "Redis",
    category: "Database",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg",
  },
  {
    id: "firebase",
    name: "Firebase",
    category: "Database",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg",
  },
  {
    id: "supabase",
    name: "Supabase",
    category: "Database",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg",
  },

  // Cloud & Infrastructure
  {
    id: "aws",
    name: "AWS",
    category: "Cloud",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg",
  },
  {
    id: "gcp",
    name: "Google Cloud",
    category: "Cloud",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg",
  },
  {
    id: "azure",
    name: "Azure",
    category: "Cloud",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg",
  },
  {
    id: "docker",
    name: "Docker",
    category: "Cloud",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
  },
  {
    id: "kubernetes",
    name: "Kubernetes",
    category: "Cloud",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg",
  },
  {
    id: "vercel",
    name: "Vercel",
    category: "Cloud",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg",
  },
  {
    id: "netlify",
    name: "Netlify",
    category: "Cloud",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/netlify/netlify-original.svg",
  },

  // Tools
  {
    id: "git",
    name: "Git",
    category: "Tools",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
  },
  {
    id: "github",
    name: "GitHub",
    category: "Tools",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
  },
  {
    id: "gitlab",
    name: "GitLab",
    category: "Tools",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg",
  },
  {
    id: "vscode",
    name: "VS Code",
    category: "Tools",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg",
  },
  {
    id: "figma",
    name: "Figma",
    category: "Tools",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
  },
  {
    id: "webpack",
    name: "Webpack",
    category: "Tools",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/webpack/webpack-original.svg",
  },
  {
    id: "vite",
    name: "Vite",
    category: "Tools",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg",
  },

  // Mobile
  {
    id: "flutter",
    name: "Flutter",
    category: "Mobile",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg",
  },
  {
    id: "android",
    name: "Android",
    category: "Mobile",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/android/android-original.svg",
  },
  {
    id: "swift",
    name: "Swift",
    category: "Mobile",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg",
  },
  {
    id: "kotlin",
    name: "Kotlin",
    category: "Mobile",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg",
  },

  // AI/ML
  {
    id: "tensorflow",
    name: "TensorFlow",
    category: "AI/ML",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg",
  },
  {
    id: "pytorch",
    name: "PyTorch",
    category: "AI/ML",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg",
  },
  {
    id: "opencv",
    name: "OpenCV",
    category: "AI/ML",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg",
  },

  // Other
  {
    id: "graphql",
    name: "GraphQL",
    category: "Other",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg",
  },
  {
    id: "socketio",
    name: "Socket.io",
    category: "Other",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/socketio/socketio-original.svg",
  },
  {
    id: "nginx",
    name: "Nginx",
    category: "Other",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg",
  },
  {
    id: "jest",
    name: "Jest",
    category: "Other",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jest/jest-plain.svg",
  },
];

// Initialize Firebase Admin
const serviceAccountPath = join(__dirname, "..", "serviceAccountKey.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ Service account key not found!");
  console.log(
    "📝 Please place your serviceAccountKey.json in the project root"
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: `${serviceAccount.project_id}.appspot.com`,
});

const bucket = getStorage().bucket();

/**
 * Download file from URL
 */
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;

    protocol
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          // Handle redirects
          downloadFile(res.headers.location).then(resolve).catch(reject);
          return;
        }

        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download: ${res.statusCode}`));
          return;
        }

        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

/**
 * Upload icon to Firebase Storage
 */
async function uploadIcon(icon) {
  try {
    console.log(`⬇️  Downloading ${icon.name}...`);
    const buffer = await downloadFile(icon.url);

    const fileName = `tech-icons/${icon.id}.svg`;
    const file = bucket.file(fileName);

    console.log(`⬆️  Uploading ${icon.name} to Firebase...`);
    await file.save(buffer, {
      metadata: {
        contentType: "image/svg+xml",
        metadata: {
          name: icon.name,
          category: icon.category,
          originalUrl: icon.url,
        },
      },
    });

    // Make file publicly accessible
    await file.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    console.log(`✅ ${icon.name} uploaded: ${publicUrl}`);

    return {
      id: icon.id,
      name: icon.name,
      category: icon.category,
      url: publicUrl,
    };
  } catch (error) {
    console.error(`❌ Failed to upload ${icon.name}:`, error.message);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log("🚀 Starting tech icons download and upload...\n");
  console.log(`📦 Total icons to process: ${TECH_ICONS.length}\n`);

  const results = [];
  const failed = [];

  for (const icon of TECH_ICONS) {
    const result = await uploadIcon(icon);
    if (result) {
      results.push(result);
    } else {
      failed.push(icon);
    }
    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 Summary:");
  console.log(`✅ Successfully uploaded: ${results.length}`);
  console.log(`❌ Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log("\n⚠️  Failed icons:");
    failed.forEach((icon) => console.log(`  - ${icon.name}`));
  }

  // Save results to file
  const outputPath = join(__dirname, "tech-icons-firebase.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Icon URLs saved to: ${outputPath}`);
  console.log("\n✨ Done!");
}

main().catch(console.error);
