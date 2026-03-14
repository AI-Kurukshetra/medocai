import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, signOut } from "@/lib/auth";
import { navItems } from "@/lib/nav";
import { roleLabels } from "@/lib/roles";
import styles from "./app-shell.module.css";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const availableNav = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  async function handleSignOut() {
    "use server";
    await signOut();
    redirect("/login");
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Medocai</div>
        <nav className={styles.nav}>
          {availableNav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className={styles.content}>
        <header className={styles.topbar}>
          <div className={styles.roleBadge}>
            {roleLabels[user.role]} · {user.name}
          </div>
          <div className={styles.formRow}>
            <form action={handleSignOut}>
              <button type="submit">Sign out</button>
            </form>
          </div>
        </header>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
