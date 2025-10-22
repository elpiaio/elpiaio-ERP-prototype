// src/app/layout.tsx
import "./globals.css";
import Header from "@/components/Header";

export const metadata = {
  title: "Elpiaio",
  description: "ERP para padarias",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Header />
        <main className="pt-4">{children}</main>
      </body>
    </html>
  );
}
