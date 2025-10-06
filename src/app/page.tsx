// src/app/page.tsx
"use client";
import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ClipboardList, CalendarDays, Edit } from "lucide-react";

export default function Home() {
  const tiles = [
    {
      title: "Pedidos",
      description: "Abrir o fluxo de PDV / adicionar pedidos rapidamente.",
      href: "/pedidos",
      cta: "Ir para Pedidos",
      icon: <PlusCircle className="w-5 h-5" />,
    },
    {
      title: "Editar Pedidos",
      description: "Visão e edição de pedidos por data/cliente.",
      href: "/pedidos/edit",
      cta: "Editar Pedidos",
      icon: <Edit className="w-5 h-5" />,
    },
    {
      title: "Planejamento — Visualizar",
      description: "Ver a ordem de produção do dia e filtrar por intervalo.",
      href: "/productions/view",
      cta: "Ver Produções",
      icon: <ClipboardList className="w-5 h-5" />,
    },
    {
      title: "Planejamento — Editar",
      description: "Editar a ordem de produção (quantidades, itens, salvar por data).",
      href: "/productions/edit",
      cta: "Editar Produção",
      icon: <CalendarDays className="w-5 h-5" />,
    },
  ];

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Elpiaio — ERP para Padarias</h1>
        <p className="mt-2 text-slate-600">Painel principal — atalhos rápidos para módulos principais</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {tiles.map((t) => (
          <Card key={t.href} className="p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100">
                  {t.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{t.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{t.description}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Link href={t.href} legacyBehavior>
                <a>
                  <Button>{t.cta}</Button>
                </a>
              </Link>
            </div>
          </Card>
        ))}
      </section>

      <section className="mt-8">
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-2">Dicas rápidas</h4>
          <ul className="text-sm text-slate-600 list-disc ml-5 space-y-1">
            <li>Use <strong>Planejamento — Editar</strong> para ajustar quantidades por data e salvar.</li>
            <li>Abra o gráfico na visualização do dia para analisar custo × receita × lucro.</li>
            <li>Filtros em <strong>Visualizar Planejamento</strong> permitem verificar intervalos e comparar dias.</li>
          </ul>
        </Card>
      </section>
    </main>
  );
}
