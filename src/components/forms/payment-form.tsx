"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount is required"),
  paymentDate: z.string().min(1, "Date is required"),
  mode: z.enum(["BANK_TRANSFER", "UPI", "CASH", "CARD"]),
  referenceNumber: z.string().optional(),
  invoice: z.string().optional(),
  bill: z.string().optional(),
})

type PaymentFormValues = z.infer<typeof paymentSchema>

interface PaymentFormProps {
  onSuccess: () => void
  invoices: { _id: string; invoiceNumber: string; totalAmount: number }[]
  bills: { _id: string; billNumber: string; amount: number }[]
}

export function PaymentForm({
  onSuccess,
  invoices = [],
  bills = [],
}: PaymentFormProps) {
  const [loading, setLoading] = React.useState(false)

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      paymentDate: new Date().toISOString().split("T")[0],
      mode: "BANK_TRANSFER",
      referenceNumber: "",
      invoice: "",
      bill: "",
    },
  })


  const onSubmit = async (data: PaymentFormValues) => {
    setLoading(true)
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: data.amount,
          paymentDate: new Date(data.paymentDate),
          mode: data.mode,
          referenceNumber: data.referenceNumber || undefined,
          invoice: data.invoice || undefined,
          bill: data.bill || undefined,
        }),
      })
      if (res.ok) {
        form.reset()
        onSuccess()
      } else {
        const err = await res.json()
        throw new Error(err.error || "Failed to record payment")
      }
    } catch (e) {
      form.setError("root", {
        message: e instanceof Error ? e.message : "Failed to record payment",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (₹)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseFloat(e.target.value) || 0)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paymentDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Mode</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="referenceNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference Number (optional)</FormLabel>
              <FormControl>
                <Input placeholder="TXN ID / UTR" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {invoices.length > 0 && (
          <FormField
            control={form.control}
            name="invoice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link to Invoice (optional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select invoice" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {invoices.map((inv) => (
                      <SelectItem key={inv._id} value={inv._id}>
                        {inv.invoiceNumber} - ₹{inv.totalAmount?.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {bills.length > 0 && (
          <FormField
            control={form.control}
            name="bill"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link to Bill (optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bill" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {bills.map((b) => (
                      <SelectItem key={b._id} value={b._id}>
                        {b.billNumber} - ₹{b.amount?.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {form.formState.errors.root && (
          <p className="text-destructive text-sm">
            {form.formState.errors.root.message}
          </p>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Recording..." : "Record Payment"}
        </Button>
      </form>
    </Form>
  )
}
