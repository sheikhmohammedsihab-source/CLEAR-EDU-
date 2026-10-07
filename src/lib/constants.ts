/**
 * CLEAR EDU - Core Constants
 * Brand: Curated Learning, Education & Accessible Resources
 * Tagline: Learn without the noise.
 */

// Authority Admin UID & Emails - Authoritative platform admins
export const ADMIN_UID = "Kyh57omRpLd8Zbmbt2CqL4GvhN92";
export const ADMIN_EMAILS = [
  "sihabhossen937@gmail.com",
  "admin@clearedu.org",
  "admin@clearedu.com",
];

export function isUserAdmin(user: { uid?: string; email?: string | null } | null): boolean {
  if (!user) return false;
  if (user.uid === ADMIN_UID) return true;
  if (user.email && ADMIN_EMAILS.some((e) => e.toLowerCase() === user.email?.toLowerCase().trim())) {
    return true;
  }
  return false;
}

export const APP_NAME = "CLEAR EDU";
export const APP_TAGLINE = "Learn without the noise.";
export const APP_DESCRIPTION = "Curated Learning, Education & Accessible Resources. High-quality YouTube classes organized into structured academic learning paths.";

// Education categories (scalable for HSC, Admission, etc.)
export const EDUCATION_LEVELS = [
  { id: "ssc", name: "SSC (Secondary School Certificate)", active: true },
  { id: "hsc", name: "HSC (Higher Secondary Certificate)", active: false },
  { id: "admission", name: "University Admission", active: false },
  { id: "skills", name: "Core Skills & Tech", active: false },
];
