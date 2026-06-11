import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "เครื่องมือสร้างใบเสนอราคา ติดตั้งวงจรที่ 2 EV Charger",
  description: "ระบบสร้างและส่งใบเสนอราคาติดตั้งวงจรที่ 2 สำหรับชาร์จรถยนต์ไฟฟ้า (EV) ไปยังอีเมลอัตโนมัติ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-slate-900 text-slate-100">
        {children}
      </body>
    </html>
  );
}
