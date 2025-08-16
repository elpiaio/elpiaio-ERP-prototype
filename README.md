# Protótipo Front — PanERP (provisório)

**Protótipo front-end de um ERP modular focado em padarias** — reúne PDV rápido, módulo de produção (receitas/abatimento de insumos), controle de estoque e dashboards analíticos por turno/sazonalidade. Objetivo: validar UX, fluxos e dashboards antes de integrar ao backend/ERP definitivo.

> 🚧 Projeto em estágio de protótipo / MVP — destinado a testes de usabilidade, demonstrações para clientes e pilotos com padarias.

---

## Visão geral
Este repositório contém a interface (SPA) construída com React + TypeScript e Tailwind CSS. O foco é entregar rapidamente:
- Experiência de PDV rápida e responsiva (tablet/desktop);
- Cadastro de receitas e abatimento automático de insumos na venda;
- Dashboards com análises por turno, previsões simples e indicadores de desperdício;
- Fluxos de pedidos/encomendas e integração básica com canais de delivery (mock).

---

## Status do protótipo
- PDV: ✅ fluxos básicos implementados (scan, itens, fechamento);
- Produção/Receitas: ✅ cadastro e cálculo de rendimento; abatimento simulado;
- Dashboards: ✅ 3 dashboards principais (vendas por turno, top produtos, desperdício);
- Autenticação: 🔶 mock de login (a integrar com backend real);
- Integrações (iFood/TEF/ERP legado): 🔶 mocks/placas — ainda a implementar.

---

## Principais funcionalidades (MVP)
- PDV responsivo com finalização de venda e emissão simulada de cupom;
- Cadastro de produtos e insumos (com rendimento e perda);
- Módulo de Receitas (com cálculo de custo e abatimento automático);
- Dashboards: horário de pico, sazonalidade mensal, top 10 produtos;
- Encomendas: criação/gestão de pedidos para retirada;
- Exportação básica de relatórios (CSV / JSON).

---

## Tech stack
- Frontend: **React** + **TypeScript**
- Build: **Vite**
- Estilo: **Tailwind CSS**
- Componentes e UI: design system baseado em componentes (pronto para shadcn/ui)
- Animações: **Framer Motion**
- Gráficos: **recharts** (ou similar)
- Lint / Format: **ESLint**, **Prettier**
- Testes: **Vitest** / **React Testing Library**

---

## Instalação (local)
**Pré-requisitos**: Node >= 16, npm ou yarn

```bash
# clonar
git clone git@github.com:seu-usuario/panerp-frontend.git
cd panerp-frontend

# instalar dependências
npm install
# ou
yarn

# rodar em desenvolvimento
npm run dev
# ou
yarn dev
