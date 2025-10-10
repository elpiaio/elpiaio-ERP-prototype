// src/app/page.tsx
"use client";
import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Importar ícones específicos do Lucide React
import { ArrowRight, Plus, List, Factory, Settings, Calendar, Edit3 } from "lucide-react"; 

/**
 * Minimal, clean homepage with grouped tiles (Pedidos / Produção).
 * Small descriptions, large touch targets, reduced visual noise.
 */

// Usar o Tile Component Aprimorado (ver seção 1 acima)
const Tile: React.FC<{
  title: string;
  subtitle?: string;
  href: string;
  isPrimary?: boolean; // Novo prop para destacar o tile
  icon: React.ReactNode; // Tornar o ícone obrigatório
}> = ({ title, subtitle, href, isPrimary = false, icon }) => {
  // ... Código do Tile Aprimorado (igual ao da seção 1) ...
  const baseClasses = "group flex items-center justify-between p-5 transition cursor-pointer";
  const hoverClasses = isPrimary ? "hover:shadow-xl hover:scale-[1.01] bg-blue-50 border-blue-100" : "hover:shadow-lg";
  const cardClasses = isPrimary ? "bg-white border border-blue-200 shadow-md" : "bg-white border border-slate-100";
  
  const iconBg = isPrimary ? "bg-blue-600 group-hover:bg-blue-700" : "bg-slate-50 group-hover:bg-slate-100";
  const iconColor = isPrimary ? "text-white" : "text-slate-700";

  return (
    <Link href={href} className="no-underline block">
      <Card className={`${baseClasses} ${hoverClasses} ${cardClasses}`}>
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl transition ${iconBg}`}>
            {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6 transition ${iconColor}" })}
          </div>
          <div>
            <div className={`text-lg font-semibold leading-tight ${isPrimary ? 'text-slate-900' : 'text-slate-700'}`}>{title}</div>
            {subtitle ? (
              <div className="text-sm text-slate-500 mt-1 max-w-[28rem]">{subtitle}</div>
            ) : null}
          </div>
        </div>
        <ArrowRight className={`w-5 h-5 ${isPrimary ? 'text-blue-500' : 'text-slate-400'} group-hover:translate-x-1 transition-transform`} />
      </Card>
    </Link>
  );
};


export default function HomePage() {
  return (
    // Fundo mais suave para dar contraste e "levantar" os cards
    <main className="min-h-screen bg-slate-50 p-6 max-w-6xl mx-auto">
      <header className="py-8 mb-8">
        {/* Usar cor primária para o nome do sistema */}
        <h1 className="text-4xl font-black tracking-tighter text-blue-700">Elpiaio</h1>
        <p className="mt-2 text-md text-slate-600 max-w-2xl font-light">
          Painel — atalhos rápidos para os módulos principais (design minimalista para foco operacional).
        </p>
      </header>

      {/* Aumentar o espaçamento vertical para melhor respiração visual */}
      <section className="space-y-8">
        {/* Grupos principais em duas colunas (Pedidos e Produção) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          
          {/* Pedidos Group */}
          <div>
            <h2 className="text-sm font-medium text-slate-700 mb-4 uppercase tracking-wider">Módulo: Pedidos</h2>
            <div className="space-y-4">
              {/* O primeiro tile é o CTA principal */}
              <Tile
                title="Novo Pedido Rápido (PDV)"
                subtitle="Inicie um novo pedido rapidamente via terminal de ponto de venda / protótipo."
                href="/pedidos"
                isPrimary={true} // Destaque!
                icon={<Plus />} 
              />
              <Tile
                title="Visualizar e Gerenciar Pedidos"
                subtitle="Acesse a lista completa para listar, editar e filtrar pedidos por cliente ou data."
                href="/pedidos/edit"
                icon={<List />}
              />
            </div>
          </div>

          {/* Produção Group */}
          <div>
            <h2 className="text-sm font-medium text-slate-700 mb-4 uppercase tracking-wider">Módulo: Produção</h2>
            <div className="space-y-4">
              <Tile
                title="Visualizar Produção Diária"
                subtitle="Ordem do dia, monitoramento de status com gráficos e filtros por intervalo."
                href="/productions/view"
                icon={<Factory />}
              />
              <Tile
                title="Editar Planejamento Mestre"
                subtitle="Acesse a tabela editável de planejamento — salve planos e padrões semanais."
                href="/productions/edit"
                icon={<Calendar />}
              />
            </div>
          </div>
        </div>
        
        {/* Grupo adicional (Geral / Administrativo) - Abaixo dos principais */}
        <div className="pt-4">
          <h2 className="text-sm font-medium text-slate-700 mb-4 uppercase tracking-wider">Geral / Administrativo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Tile
              title="Clientes & Catálogo"
              subtitle="Gerenciar clientes, fornecedores e o catálogo de produtos e serviços."
              href="/admin/data"
              icon={<Edit3 />}
            />
            <Tile
              title="Relatórios e Dashboards"
              subtitle="Acesse painéis de dados financeiros, de estoque e de desempenho da equipe."
              href="/reports"
              icon={<Settings />}
            />
          </div>
        </div>

      </section>

      {/* Footer / Link de Configurações - Mais discreto */}
      <footer className="mt-12 pt-6 border-t border-slate-200">
        <Card className="p-4 bg-white border border-dashed border-slate-200 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-slate-700 font-medium">Configurações do Sistema</div>
              <div className="text-xs text-slate-500 mt-1">Preferências de usuário, informações de sistema e gestão de acessos.</div>
            </div>
            <div>
              <Link href="/settings" className="no-underline">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">Abrir Configurações</Button>
              </Link>
            </div>
          </div>
        </Card>
      </footer>
    </main>
  );
}