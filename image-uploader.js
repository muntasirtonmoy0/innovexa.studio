/* =========================================================
   INNOVEXA STUDIO - CLOUDINARY CLIENT-SIDE IMAGE UPLOADER
   ========================================================= */

// Replace with your Cloudinary Cloud Name
const CLOUD_NAME = "retvp8pw"; 
const UPLOAD_PRESET = "innovexa_uploads";

export async function uploadImageToCloud(file) {
  if (!file) return null;

  // Max 5MB limit check
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be smaller than 5MB.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || "Failed to upload image.");
  }

  const data = await res.json();
  return data.secure_url; // Returns the hosted image URL
}
