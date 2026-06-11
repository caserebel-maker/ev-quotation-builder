import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoltLink Pro - Quotation System",
  description: "ระบบสร้างและส่งใบเสนอราคาติดตั้งระบบไฟฟ้าวงจรที่ 2 สำหรับชาร์จรถ EV",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700&family=Inter:wght@400;500&family=Geist:wght@400;500;600&display=swap" 
          rel="stylesheet"
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#f8f9fa] text-[#191c1d] antialiased">
        {children}
      </body>
    </html>
  );
}
