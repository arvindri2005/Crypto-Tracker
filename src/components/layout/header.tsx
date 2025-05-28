
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Flame, Menu } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";


export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Adjusted padding here: using px-2 sm:px-4 for less horizontal padding */}
      <div className="mx-auto flex h-14 w-full max-w-screen-xl items-center px-2 sm:px-4">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Flame className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              {siteConfig.name}
            </span>
          </Link>
        </div>
        
        <div className="md:hidden">
           <SidebarTrigger asChild>
             <Button variant="ghost" size="icon">
               <Menu className="h-5 w-5" />
               <span className="sr-only">Toggle Sidebar</span>
             </Button>
           </SidebarTrigger>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
