"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Menu,
  DollarSign,
  BarChart3,
  Receipt,
  Home,
  ReceiptIcon,
  User,
} from "lucide-react";
import Logo from "../../../public/logo.png";

const menuItems = [
  {
    title: "Reimbursements",
    path: "/reimbursement",
    icon: Receipt,
  },
  {
    title: "Finance",
    path: "/finance",
    icon: DollarSign,
  },
  {
    title: "Analytics",
    path: "/analytics/general",
    icon: BarChart3,
  },
  {
    title: "Profile",
    path: "/analytics/self",
    icon: User,
  },
  {
    title: "Invoice",
    path: "/invoice",
    icon: ReceiptIcon,
  }
];

function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2  py-2">
          <Image
            src={Logo || "/placeholder.svg"}
            alt="Logo"
            width={48}
            height={48}
          />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Finance Dashboard</span>
            <span className="truncate text-xs text-muted-foreground">
              Reimbursement System
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.path}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <div className="flex items-center gap-2 pb-4">
          <Image
            src={Logo || "/placeholder.svg"}
            alt="Logo"
            width={32}
            height={32}
          />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Finance Dashboard</span>
            <span className="truncate text-xs text-muted-foreground">
              Reimbursement System
            </span>
          </div>
        </div>
        <nav className="grid gap-2 py-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.title}
                href={item.path}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
          <div className="border-t pt-4 mt-4">
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="flex items-center gap-2 md:hidden">
        <Image
          src={Logo || "/placeholder.svg"}
          alt="Logo"
          width={24}
          height={24}
        />
        <span className="font-semibold">Finance Dashboard</span>
      </div>
      <div className="ml-auto">
        <MobileNav />
      </div>
    </header>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
