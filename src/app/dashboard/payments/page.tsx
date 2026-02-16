"use client"

import * as React from "react"
import {
  IconCreditCard,
  IconDotsVertical,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

import { PaymentForm } from "@/components/forms/payment-form"

const modeLabels: Record<string, string> = {
  BANK_TRANSFER: "Bank Transfer",
  UPI: "UPI",
  CASH: "Cash",
  CARD: "Card",
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

export default function PaymentsPage() {
  const [payments, setPayments] = React.useState<any[]>([])
  const [invoices, setInvoices] = React.useState<any[]>([])
  const [bills, setBills] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const fetchPayments = React.useCallback(() => {
    fetch("/api/payments")
      .then((res) => res.json())
      .then(setPayments)
      .catch(() => toast.error("Failed to load payments"))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  React.useEffect(() => {
    if (dialogOpen) {
      Promise.all([
        fetch("/api/invoices").then((r) => r.json()),
        fetch("/api/bills").then((r) => r.json()),
      ]).then(([inv, bl]) => {
        setInvoices(inv.filter((i: any) => i.status !== "PAID" && i.status !== "CANCELLED"))
        setBills(bl.filter((b: any) => b.status !== "PAID" && b.status !== "REJECTED"))
      })
    }
  }, [dialogOpen])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment?")) return
    try {
      const res = await fetch(`/api/payments/${id}`, { method: "DELETE" })
      if (res.ok) {
        setPayments((prev) => prev.filter((p) => p._id !== id))
        toast.success("Payment deleted")
      } else {
        toast.error("Failed to delete payment")
      }
    } catch {
      toast.error("Failed to delete payment")
    }
  }

  const handlePaymentCreated = () => {
    setDialogOpen(false)
    fetchPayments()
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            View and record all payment transactions
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className="mr-2 size-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Record a new payment for an invoice or bill
              </DialogDescription>
            </DialogHeader>
            <PaymentForm
              onSuccess={handlePaymentCreated}
              invoices={invoices}
              bills={bills}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="px-4 lg:px-6">
        {loading ? (
          <div className="rounded-lg border p-12 text-center text-muted-foreground">
            Loading payments...
          </div>
        ) : payments.length === 0 ? (
          <div className="rounded-lg border px-4 py-12 text-center text-muted-foreground">
            <IconCreditCard className="mx-auto mb-4 size-12 opacity-50" />
            <p>No payments recorded yet.</p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4">Record Payment</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                  <DialogDescription>
                    Record a new payment for an invoice or bill
                  </DialogDescription>
                </DialogHeader>
                <PaymentForm
                  onSuccess={handlePaymentCreated}
                  invoices={invoices}
                  bills={bills}
                />
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Linked To</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>
                      {formatDate(payment.paymentDate || payment.createdAt)}
                    </TableCell>
                    <TableCell className="font-medium tabular-nums">
                      {formatCurrency(payment.amount || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {modeLabels[payment.mode] || payment.mode}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {payment.referenceNumber || "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {payment.invoice?.invoiceNumber
                        ? `Invoice ${payment.invoice.invoiceNumber}`
                        : payment.bill?.billNumber
                          ? `Bill ${payment.bill.billNumber}`
                          : "—"}
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
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(payment._id)}
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
