"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"

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

export default function InvoicesPage() {
  const [invoices, setInvoices] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch("/api/invoices")
      .then((res) => res.json())
      .then(setInvoices)
      .catch(() => toast.error("Failed to load invoices"))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" })
      if (res.ok) {
        setInvoices((prev) => prev.filter((inv) => inv._id !== id))
        toast.success("Invoice deleted")
      } else {
        toast.error("Failed to delete invoice")
      }
    } catch {
      toast.error("Failed to delete invoice")
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage accounts receivable and customer invoices
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/invoices/new">
            <IconPlus className="mr-2 size-4" />
            New Invoice
          </Link>
        </Button>
      </div>
      <div className="px-4 lg:px-6">
        {loading ? (
          <div className="rounded-lg border p-12 text-center text-muted-foreground">
            Loading invoices...
          </div>
        ) : invoices.length === 0 ? (
          <div className="rounded-lg border px-4 py-12 text-center text-muted-foreground">
            <p>No invoices yet. Create your first invoice to get started.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/invoices/new">Create Invoice</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice._id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/invoices/${invoice._id}`}
                        className="hover:underline"
                      >
                        {invoice.invoiceNumber || invoice._id.slice(-8)}
                      </Link>
                    </TableCell>
                    <TableCell>{invoice.clientName || "—"}</TableCell>
                    <TableCell>
                      {formatDate(invoice.issueDate || invoice.dueDate)}
                    </TableCell>
                    <TableCell>
                      {formatDate(invoice.dueDate || invoice.issueDate)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(invoice.totalAmount || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          statusColors[invoice.status] || ""
                        }
                      >
                        {invoice.status?.replace("_", " ") || "DRAFT"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                            size="icon"
                          >
                            <IconDotsVertical />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/invoices/${invoice._id}`}
                            >
                              <IconEye className="mr-2 size-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/invoices/${invoice._id}/edit`}
                            >
                              <IconPencil className="mr-2 size-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(invoice._id)}
                          >
                            <IconTrash className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
