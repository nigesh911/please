'use client';

import { useEffect } from 'react';
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
