// src/components/Profile.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, Globe } from "lucide-react";

export default function Profile() {
  const router = useRouter();
  const pathname = usePathname();
  const [language, setLanguage] = useState<string>("pt-br");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full overflow-hidden h-10 w-10 inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          aria-label="Abrir menu do usuário"
        >
          {/* Use next/image to optimize if image present, fallback to initials */}
          <div className="relative h-10 w-10">
            {/* If you prefer AvatarImage from radix, adapt here */}
            {/*<Image src={} alt="Avatar" className="rounded-full object-cover" fill />*/}
            <Avatar className="rounded-full object-cover" />
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-56 rounded-xl">
        <div className="px-3 py-2">
          <div className="text-sm font-medium">Astolfo Jose</div>
          <div className="text-xs text-slate-500">astolfo@elpiaio.com</div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2">
            <User className="w-4 h-4" /> Conta
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            router.push("/settings");
          }}
        >
          <Settings className="w-4 h-4 mr-2" /> Configurações
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Idioma</span>
            </div>
          </DropdownMenuSubTrigger>

          <DropdownMenuPortal>
            <DropdownMenuSubContent sideOffset={6} className="w-44">
              <DropdownMenuRadioGroup value={language} onValueChange={(v) => setLanguage(String(v))}>
                <DropdownMenuRadioItem value="pt-br">pt-BR</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="es">ES</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="en">EN</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            // simple sign-out redirect (adapt to your auth)
            router.push("/logout");
          }}
        >
          <LogOut className="w-4 h-4 mr-2" /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
