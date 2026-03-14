import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { roleLanding } from "@/lib/roles";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  redirect(roleLanding[user.role]);
}
