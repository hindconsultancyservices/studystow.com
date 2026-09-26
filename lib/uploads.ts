import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

// ============================================================
// UPLOAD CONFIGURATION
// ============================================================

export const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5 MB

  allowedImageTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ],

  allowedExtensions: [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
  ],
} as const;


// ============================================================
// TYPES
// ============================================================

export interface UploadResult {
  success: boolean;
  filename: string;
  url: string;
  path: string;
  size: number;
  type: string;
}


// ============================================================
// UPLOAD DIRECTORY
// ============================================================

export function getUploadDirectory() {
  return path.join(process.cwd(), "public", "uploads");
}


// ============================================================
// ENSURE UPLOAD DIRECTORY EXISTS
// ============================================================

export async function ensureUploadDirectory() {
  const uploadDirectory = getUploadDirectory();

  await fs.mkdir(uploadDirectory, {
    recursive: true,
  });

  return uploadDirectory;
}


// ============================================================
// VALIDATE IMAGE
// ============================================================

export function validateImage(file: File) {
  if (!file) {
    throw new Error("No file provided");
  }

  if (!file.type) {
    throw new Error("File type could not be detected");
  }

  if (
    !UPLOAD_CONFIG.allowedImageTypes.includes(
      file.type as (typeof UPLOAD_CONFIG.allowedImageTypes)[number]
    )
  ) {
    throw new Error(
      "Invalid image type. Only JPG, JPEG, PNG and WEBP files are allowed."
    );
  }

  if (file.size <= 0) {
    throw new Error("Uploaded file is empty");
  }

  if (file.size > UPLOAD_CONFIG.maxFileSize) {
    throw new Error(
      "Image size must be less than or equal to 5 MB."
    );
  }

  return true;
}


// ============================================================
// GENERATE SAFE FILENAME
// ============================================================

export function generateFilename(
  originalName: string,
  extension?: string
) {
  const originalExtension =
    path.extname(originalName).toLowerCase();

  const finalExtension =
    extension ||
    originalExtension ||
    ".jpg";

  const safeExtension = UPLOAD_CONFIG.allowedExtensions.includes(
    finalExtension as (typeof UPLOAD_CONFIG.allowedExtensions)[number]
  )
    ? finalExtension
    : ".jpg";

  const randomName = crypto
    .randomBytes(16)
    .toString("hex");

  return `${Date.now()}-${randomName}${safeExtension}`;
}


// ============================================================
// UPLOAD IMAGE
// ============================================================

export async function uploadImage(
  file: File
): Promise<UploadResult> {
  validateImage(file);

  const uploadDirectory =
    await ensureUploadDirectory();

  const filename = generateFilename(file.name);

  const filePath = path.join(
    uploadDirectory,
    filename
  );

  const bytes = await file.arrayBuffer();

  const buffer = Buffer.from(bytes);

  await fs.writeFile(filePath, buffer);

  return {
    success: true,
    filename,
    url: `/uploads/${filename}`,
    path: filePath,
    size: file.size,
    type: file.type,
  };
}


// ============================================================
// DELETE IMAGE
// ============================================================

export async function deleteImage(
  imageUrl: string
) {
  if (!imageUrl) {
    return false;
  }

  // Only allow deletion of files inside /public/uploads.
  if (!imageUrl.startsWith("/uploads/")) {
    throw new Error("Invalid upload path");
  }

  const filename = path.basename(imageUrl);

  if (!filename) {
    return false;
  }

  const uploadDirectory =
    getUploadDirectory();

  const filePath = path.join(
    uploadDirectory,
    filename
  );

  try {
    await fs.unlink(filePath);

    return true;
  } catch (error) {
    const fileError = error as NodeJS.ErrnoException;

    if (fileError.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}


// ============================================================
// CHECK FILE EXISTS
// ============================================================

export async function imageExists(
  imageUrl: string
) {
  if (!imageUrl || !imageUrl.startsWith("/uploads/")) {
    return false;
  }

  const filename = path.basename(imageUrl);

  const filePath = path.join(
    getUploadDirectory(),
    filename
  );

  try {
    await fs.access(filePath);

    return true;
  } catch {
    return false;
  }
}


// ============================================================
// GET FILE EXTENSION
// ============================================================

export function getFileExtension(
  filename: string
) {
  return path.extname(filename).toLowerCase();
}


// ============================================================
// SANITIZE ORIGINAL FILENAME
// ============================================================

export function sanitizeFilename(
  filename: string
) {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}
