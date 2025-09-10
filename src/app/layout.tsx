// src/app/layout.tsx
import './globals.css';
import React from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

export const metadata = {
  title: 'Crypto Radar',
  description: 'Track crypto prices, indicators and alerts',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // App Router root layout is a Server Component by default.
  // We output <html className="dark"> so Dark Mode is default WITHOUT toggles.
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-surface-dark text-surface-100 antialiased">
        <div className="flex h-screen">
          {/* Sidebar */}
          <aside className="w-0 md:w-72 bg-primary-dark">
            <Sidebar />
          </aside>

          {/* Main content area */}
          <div className="flex flex-col">
            <header className="sticky top-0 z-40">
              <Navbar />
            </header>

            <main className="p-6 overflow-y-auto w-[100vw] md:w-full overflow-x-hidden">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
