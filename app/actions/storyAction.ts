"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { API_URL, getAccessToken } from "@/auth";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Sends a community story for review (POST /stories, multipart with an
 * optional "image"). Reloads the page so "Your submissions" shows it.
 */
export async function submitStoryAction(formData: FormData): Promise<{ error?: string; message?: string }> {
  const token = await getAccessToken();
  if (!token) redirect("/login");

  const body = new FormData();
  for (const key of ["title", "body", "topic", "anonymous"]) {
    const value = formData.get(key);
    if (typeof value === "string") body.append(key, value.trim());
  }
  // Uploads can arrive as a Blob rather than a File, so accept both.
  const image = formData.get("image");
  if (image instanceof Blob && image.size > 0) {
    if (!IMAGE_TYPES.includes(image.type)) return { error: "Choose a JPG, PNG or WebP image." };
    if (image.size > MAX_IMAGE_BYTES) return { error: "Choose an image smaller than 5 MB." };
    body.append("image", image, image instanceof File && image.name ? image.name : "story-image");
  }

  try {
    const response = await fetch(`${API_URL}/api/v1/stories`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body,
      cache: "no-store",
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) return { error: json?.errors?.[0] ?? json?.message ?? "Couldn't send your story. Please try again." };
    refresh();
    return { message: json?.message };
  } catch {
    return { error: "Can't reach the server. Please check your connection and try again." };
  }
}
