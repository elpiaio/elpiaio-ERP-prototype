// src/components/Header.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Profile from "./Profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Grid, FileText, BarChart2 } from "lucide-react";

/**
 * Header component:
 * - brand (left)
 * - nav (center / hidden on xs)
 * - quick search
 * - actions + profile (right)
 *
 * Drop-in: import <Header /> into your layout.tsx top area.
 */

export default function Header() {
  const pathname = usePathname() || "/";

  const nav = [
    { label: "Pedidos", href: "/pedidos", icon: FileText },
    { label: "Produção", href: "/productions/view", icon: Grid },
    { label: "Dashboards", href: "/dashboards/production", icon: BarChart2 },
  ];

  return (
    <header className="w-full border-b bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: brand */}
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/" className="flex items-center gap-3 no-underline">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-sky-600 text-white font-bold">
                E
              </div>
              <div className="hidden sm:block">
                <div className="text-lg font-semibold leading-tight">Elpiaio</div>
                <div className="text-xs text-slate-500">ERP para padarias</div>
              </div>
            </Link>
          </div>

          {/* Center: nav + search */}
          <div className="flex-1 flex items-center justify-center">
            <nav className="hidden md:flex items-center gap-2">
              {nav.map((n) => {
                const ActiveIcon = n.icon;
                const isActive = pathname.startsWith(n.href);
                return (
                 <Link
                  key={n.href}
                  href={n.href}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                    isActive ? "bg-slate-100 dark:bg-slate-800 font-medium" : "text-slate-700 dark:text-slate-300"
                  } hover:bg-slate-100 dark:hover:bg-slate-800 transition`}
                >
                  <ActiveIcon className="w-4 h-4" />
                  <span>{n.label}</span>
                </Link>

                );
              })}
            </nav>
          </div>

          {/* Right: search + actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="relative">
                <Input
                  aria-label="Pesquisar"
                  placeholder="Buscar pedido, item, cliente..."
                  className="pl-9 pr-3 w-64"
                />
                <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/settings">Config</Link>
              </Button>

              <Profile />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
