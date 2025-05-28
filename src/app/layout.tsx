
import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { SidebarContent } from "@/components/layout/sidebar-content";
import { SidebarInset } from "@/components/ui/sidebar";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
        suppressHydrationWarning={true}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <div className="flex flex-1">
              <SidebarContent />
              <SidebarInset className="flex-1">
                <main className="max-w-screen-xl mx-auto py-8 px-4 md:px-6 lg:px-8">
                  {children}
                </main>
              </SidebarInset>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
