"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { IconPencil } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SUBMITTED: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  APPROVED: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  SCHEDULED: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  PAID: "bg-green-500/10 text-green-600 dark:text-green-400",
  REJECTED: "bg-red-500/10 text-red-600 dark:text-red-400",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default function BillDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [bill, setBill] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch(`/api/bills/${id}`)
      .then((res) => res.json())
      .then(setBill)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="animate-pulse rounded-lg border p-12 text-center text-muted-foreground">
            Loading bill...
          </div>
        </div>
      </div>
    )
  }

  if (!bill) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="rounded-lg border p-12 text-center text-muted-foreground">
            Bill not found
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {bill.billNumber || bill._id?.slice(-8)}
          </h1>
          <p className="text-muted-foreground">
            {bill.vendorName} · Due {formatDate(bill.dueDate)}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge
            variant="secondary"
            className={statusColors[bill.status] || ""}
          >
            {bill.status?.replace("_", " ")}
          </Badge>
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/bills/${id}/edit`}>
              <IconPencil className="mr-2 size-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Bill Details</CardTitle>
            <CardDescription>Vendor and amount information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-muted-foreground text-sm">Vendor</span>
              <p className="font-medium">{bill.vendorName}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">Due Date</span>
              <p>{formatDate(bill.dueDate)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">Amount</span>
              <p className="text-2xl font-semibold">
                {formatCurrency(bill.amount || 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
