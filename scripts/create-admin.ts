import { loadEnvConfig } from "@next/env";
import bcrypt from "bcryptjs";

// Load Next.js environment variables BEFORE importing db/model
loadEnvConfig(process.cwd());

async function createAdmin() {
  try {
    // Import after environment variables are loaded
    const { default: connectDB } = await import("../lib/db");
    const { default: User } = await import("../models/User");

    console.log("=================================");
    console.log("   StudyStow Admin Setup");
    console.log("=================================");
    console.log("");

    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is missing. Please check studystow.com/.env.local"
      );
    }

    console.log("MONGODB_URI found ✅");
    console.log("Connecting to MongoDB...");

    await connectDB();

    console.log("MongoDB connected ✅");
    console.log("");

    const email = "hindconsultancyservice@gmail.com";
    const password = "Admin@12345";
    const name = "StudyStow Admin";

    console.log("Checking existing user...");

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("Existing user found.");
      console.log("Updating user as admin...");

      existingUser.name = name;
      existingUser.role = "admin";
      existingUser.active = true;
      existingUser.password = await bcrypt.hash(password, 12);

      await existingUser.save();

      console.log("Admin account updated successfully ✅");
    } else {
      console.log("Admin user not found.");
      console.log("Creating new admin...");

      const hashedPassword = await bcrypt.hash(password, 12);

      await User.create({
        name,
        email,
        password: hashedPassword,
        role: "admin",
        active: true,
      });

      console.log("Admin user created successfully ✅");
    }

    console.log("");
    console.log("=================================");
    console.log("       ADMIN LOGIN DETAILS");
    console.log("=================================");
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log("=================================");
    console.log("");
    console.log("Login URL:");
    console.log("http://localhost:3000/admin/login");
    console.log("");
  } catch (error) {
    console.error("");
    console.error("❌ Failed to create admin");
    console.error(error);
    console.error("");
    process.exitCode = 1;
  }
}

createAdmin();