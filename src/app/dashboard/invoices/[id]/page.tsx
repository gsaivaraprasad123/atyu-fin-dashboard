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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SENT: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  PARTIALLY_PAID: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  PAID: "bg-green-500/10 text-green-600 dark:text-green-400",
  OVERDUE: "bg-red-500/10 text-red-600 dark:text-red-400",
  CANCELLED: "bg-muted text-muted-foreground",
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

export default function InvoiceDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [invoice, setInvoice] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch(`/api/invoices/${id}`)
      .then((res) => res.json())
      .then(setInvoice)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="animate-pulse rounded-lg border p-12 text-center text-muted-foreground">
            Loading invoice...
          </div>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="rounded-lg border p-12 text-center text-muted-foreground">
            Invoice not found
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
            {invoice.invoiceNumber || invoice._id?.slice(-8)}
          </h1>
          <p className="text-muted-foreground">
            {invoice.clientName} · {formatDate(invoice.issueDate)}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge
            variant="secondary"
            className={statusColors[invoice.status] || ""}
          >
            {invoice.status?.replace("_", " ")}
          </Badge>
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/invoices/${id}/edit`}>
              <IconPencil className="mr-2 size-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-6 px-4 lg:grid-cols-2 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Details</CardTitle>
            <CardDescription>Billing information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">{invoice.clientName}</p>
            <p className="text-muted-foreground text-sm">
              {invoice.clientEmail}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Dates</CardTitle>
            <CardDescription>Invoice timeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <span className="text-muted-foreground">Issue:</span>{" "}
              {formatDate(invoice.issueDate)}
            </p>
            <p>
              <span className="text-muted-foreground">Due:</span>{" "}
              {formatDate(invoice.dueDate)}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
            <CardDescription>Items and amounts</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Tax %</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items?.map((item: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.price)}
                    </TableCell>
                    <TableCell className="text-right">{item.taxPercent}%</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(
                        item.quantity * item.price * (1 + item.taxPercent / 100)
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-6 flex justify-end gap-8 border-t pt-6">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal || 0)}</span>
            </div>
            <div className="flex justify-end gap-8">
              <span className="text-muted-foreground">Tax:</span>
              <span>{formatCurrency(invoice.taxAmount || 0)}</span>
            </div>
            <div className="flex justify-end gap-8 font-semibold">
              <span>Total:</span>
              <span>{formatCurrency(invoice.totalAmount || 0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
