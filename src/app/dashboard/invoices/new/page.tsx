"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { InvoiceForm } from "@/components/forms/invoice-form"
import { toast } from "sonner"

export default function NewInvoicePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

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
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          issueDate: new Date(data.issueDate),
          dueDate: new Date(data.dueDate),
        }),
      })
      if (res.ok) {
        const invoice = await res.json()
        toast.success("Invoice created successfully")
        router.push(`/dashboard/invoices/${invoice._id}`)
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to create invoice")
      }
    } catch {
      toast.error("Failed to create invoice")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">New Invoice</h1>
        <p className="text-muted-foreground">
          Create a new invoice for your client
        </p>
      </div>
      <div className="px-4 lg:px-6">
        <div className="mx-auto max-w-3xl rounded-lg border bg-card p-6">
          <InvoiceForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>
    </div>
  )
}
