"use client"

import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/invoices": "Invoices",
  "/dashboard/bills": "Bills",
  "/dashboard/payments": "Payments",
  "/dashboard/reports": "Reports",
  "/dashboard/compliance": "Compliance",
  "/dashboard/settings": "Settings",
  "/dashboard/documents": "Documents",
}

function getPageTitle(pathname: string): string {
  if (pathname === "/dashboard") return "Dashboard"
  if (pathname.startsWith("/dashboard/invoices/new")) return "New Invoice"
  if (pathname.match(/\/dashboard\/invoices\/[^/]+\/edit/)) return "Edit Invoice"
  if (pathname.startsWith("/dashboard/invoices/")) return "Invoice Details"
  if (pathname.startsWith("/dashboard/bills/new")) return "New Bill"
  if (pathname.match(/\/dashboard\/bills\/[^/]+\/edit/)) return "Edit Bill"
  if (pathname.startsWith("/dashboard/bills/")) return "Bill Details"
  return routeTitles[pathname] || "Finance Admin"
}

export function SiteHeader() {
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2" />
      </div>
    </header>
  )
}
