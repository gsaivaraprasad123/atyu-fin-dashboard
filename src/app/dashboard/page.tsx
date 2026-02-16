"use client"

import * as React from "react"

import { FinanceChart } from "@/components/dashboard/finance-chart"
import { FinanceSectionCards } from "@/components/dashboard/finance-section-cards"
import { RecentInvoicesTable } from "@/components/dashboard/recent-invoices-table"
import { toast } from "sonner"

export default function DashboardPage() {
  const [stats, setStats] = React.useState<{
    totalRevenue: number
    outstandingReceivables: number
    totalOutstandingBills: number
    totalPaymentsMTD: number
    overdues: number
    drafts: number
    chartData: { month: string; revenue: number; desktop: number; mobile: number }[]
  } | null>(null)
  const [invoices, setInvoices] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [reportRes, invoicesRes] = await Promise.all([
          fetch("/api/reports/dashboard"),
          fetch("/api/invoices"),
        ])

        if (reportRes.ok) {
          const reportData = await reportRes.json()
          setStats(reportData)
        }

        if (invoicesRes.ok) {
          const invoicesData = await invoicesRes.json()
          setInvoices(invoicesData)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        toast.error("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" })
      if (res.ok) {
        setInvoices((prev) => prev.filter((inv) => inv._id !== id))
        toast.success("Invoice deleted")
        if (stats) {
          const reportRes = await fetch("/api/reports/dashboard")
          if (reportRes.ok) setStats(await reportRes.json())
        }
      } else {
        toast.error("Failed to delete invoice")
      }
    } catch {
      toast.error("Failed to delete invoice")
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your finance admin panel
        </p>
      </div>
      <FinanceSectionCards stats={stats} />
      <div className="px-4 lg:px-6">
        <FinanceChart chartData={stats?.chartData ?? []} />
      </div>
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <h2 className="text-lg font-semibold">Recent Invoices</h2>
        <RecentInvoicesTable invoices={invoices} onDelete={handleDeleteInvoice} />
      </div>
    </div>
  )
}
