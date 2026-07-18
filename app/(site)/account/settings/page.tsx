import { redirect } from "next/navigation";

// Password change + notification preferences moved to their own sections as
// part of the settings redesign — keep this URL alive for old bookmarks/links.
export default function LegacySettingsRedirect() {
  redirect("/account/security");
}
