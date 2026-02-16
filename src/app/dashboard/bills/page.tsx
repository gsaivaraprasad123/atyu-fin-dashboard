"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconDotsVertical,
  IconEye,
  IconFileText,
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

export default function BillsPage() {
  const [bills, setBills] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch("/api/bills")
      .then((res) => res.json())
      .then(setBills)
      .catch(() => toast.error("Failed to load bills"))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bill?")) return
    try {
      const res = await fetch(`/api/bills/${id}`, { method: "DELETE" })
      if (res.ok) {
        setBills((prev) => prev.filter((b) => b._id !== id))
        toast.success("Bill deleted")
      } else {
        toast.error("Failed to delete bill")
      }
    } catch {
      toast.error("Failed to delete bill")
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bills</h1>
          <p className="text-muted-foreground">
            Manage accounts payable and vendor bills
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/bills/new">
            <IconPlus className="mr-2 size-4" />
            New Bill
          </Link>
        </Button>
      </div>
      <div className="px-4 lg:px-6">
        {loading ? (
          <div className="rounded-lg border p-12 text-center text-muted-foreground">
            Loading bills...
          </div>
        ) : bills.length === 0 ? (
          <div className="rounded-lg border px-4 py-12 text-center text-muted-foreground">
            <IconFileText className="mx-auto mb-4 size-12 opacity-50" />
            <p>No bills yet. Create your first bill to get started.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/bills/new">Create Bill</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill #</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow key={bill._id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/bills/${bill._id}`}
                        className="hover:underline"
                      >
                        {bill.billNumber || bill._id.slice(-8)}
                      </Link>
                    </TableCell>
                    <TableCell>{bill.vendorName || "—"}</TableCell>
                    <TableCell>{formatDate(bill.dueDate)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(bill.amount || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusColors[bill.status] || ""}
                      >
                        {bill.status?.replace("_", " ")}
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
                            <Link href={`/dashboard/bills/${bill._id}`}>
                              <IconEye className="mr-2 size-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/bills/${bill._id}/edit`}>
                              <IconPencil className="mr-2 size-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(bill._id)}
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
