import { redirect } from "next/navigation";

export default function RedirectStationPage() {
  // Immediately redirect when page loads (runs on server)
  redirect("/settings/edit-stations");
}