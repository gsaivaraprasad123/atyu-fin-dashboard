"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"

import { InvoiceForm } from "@/components/forms/invoice-form"
import { toast } from "sonner"

export default function EditInvoicePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [invoice, setInvoice] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    fetch(`/api/invoices/${id}`)
      .then((res) => res.json())
      .then(setInvoice)
      .catch(() => toast.error("Failed to load invoice"))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (data: {
    clientName: string
    clientEmail: string
    issueDate: string
    dueDate: string
    status: string
    items: { description: string; quantity: number; price: number; taxPercent: number }[]
  }) => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          issueDate: new Date(data.issueDate),
          dueDate: new Date(data.dueDate),
        }),
      })
      if (res.ok) {
        toast.success("Invoice updated successfully")
        router.push(`/dashboard/invoices/${id}`)
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to update invoice")
      }
    } catch {
      toast.error("Failed to update invoice")
    } finally {
      setIsSubmitting(false)
    }
  }

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
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Edit Invoice</h1>
        <p className="text-muted-foreground">
          Update invoice {invoice.invoiceNumber || id}
        </p>
      </div>
      <div className="px-4 lg:px-6">
        <div className="mx-auto max-w-3xl rounded-lg border bg-card p-6">
          <InvoiceForm
            defaultValues={{
              clientName: invoice.clientName,
              clientEmail: invoice.clientEmail,
              issueDate: invoice.issueDate,
              dueDate: invoice.dueDate,
              status: invoice.status,
              items: invoice.items || [
                { description: "", quantity: 1, price: 0, taxPercent: 18 },
              ],
            }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  )
}
