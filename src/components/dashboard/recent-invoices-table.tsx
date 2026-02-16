"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconDotsVertical,
  IconEye,
  IconPencil,
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

interface Invoice {
  _id: string
  invoiceNumber: string
  clientName: string
  issueDate: string
  dueDate: string
  totalAmount: number
  status: string
}

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

export function RecentInvoicesTable({
  invoices,
  onDelete,
}: {
  invoices: Invoice[]
  onDelete?: (id: string) => void
}) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-lg border px-4 py-12 text-center text-muted-foreground">
        <p>No invoices yet. Create your first invoice to get started.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/invoices/new">Create Invoice</Link>
        </Button>
      </div>
    )
  }

  return (
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
          {invoices.slice(0, 10).map((invoice) => (
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
              <TableCell>{formatDate(invoice.issueDate || invoice.dueDate)}</TableCell>
              <TableCell>{formatDate(invoice.dueDate || invoice.issueDate)}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(invoice.totalAmount || 0)}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={statusColors[invoice.status] || ""}
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
                      <Link href={`/dashboard/invoices/${invoice._id}`}>
                        <IconEye className="mr-2 size-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/invoices/${invoice._id}/edit`}>
                        <IconPencil className="mr-2 size-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete?.(invoice._id)}
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
  )
}
