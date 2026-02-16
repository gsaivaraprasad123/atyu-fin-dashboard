"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { BillForm } from "@/components/forms/bill-form"
import { toast } from "sonner"

export default function NewBillPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (data: {
    vendorName: string
    billNumber?: string
    amount: number
    dueDate: string
    status: string
  }) => {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          dueDate: new Date(data.dueDate),
        }),
      })
      if (res.ok) {
        const bill = await res.json()
        toast.success("Bill created successfully")
        router.push(`/dashboard/bills/${bill._id}`)
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to create bill")
      }
    } catch {
      toast.error("Failed to create bill")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">New Bill</h1>
        <p className="text-muted-foreground">
          Add a new vendor bill (accounts payable)
        </p>
      </div>
      <div className="px-4 lg:px-6">
        <div className="mx-auto max-w-2xl rounded-lg border bg-card p-6">
          <BillForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>
    </div>
  )
}
