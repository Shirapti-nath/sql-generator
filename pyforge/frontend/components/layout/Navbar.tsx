"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, Sun, Moon, LogOut, User, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { cn } from "@/lib/utils";

const links = [
  { href: "/playground", label: "Playground", icon: Terminal },
  { href: "/dashboard", label: "Dashboard", icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();

  return (
    <header className="sticky top-0 z-50 border-b border-border glass">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg group">
            <div className="p-1.5 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
              <Code2 className="h-5 w-5 text-accent" />
            </div>
            <span>
              Py<span className="text-accent">Forge</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all",
                  pathname.startsWith(link.href)
                    ? "bg-accent/15 text-accent font-medium"
                    : "text-muted hover:text-foreground hover:bg-card"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {user ? (
            <>
              <span className="hidden sm:flex items-center gap-1.5 text-sm px-2 py-1 rounded-lg bg-card">
                <User className="h-3.5 w-3.5 text-accent" />
                {user.display_name}
              </span>
              <Button variant="ghost" size="sm" onClick={logout} title="Log out">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/register">
                <Button variant="accent" size="sm">Sign up free</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
