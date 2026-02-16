"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"

import { BillForm } from "@/components/forms/bill-form"
import { toast } from "sonner"

export default function EditBillPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [bill, setBill] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    fetch(`/api/bills/${id}`)
      .then((res) => res.json())
      .then(setBill)
      .catch(() => toast.error("Failed to load bill"))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (data: {
    vendorName: string
    billNumber?: string
    amount: number
    dueDate: string
    status: string
  }) => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/bills/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          dueDate: new Date(data.dueDate),
        }),
      })
      if (res.ok) {
        toast.success("Bill updated successfully")
        router.push(`/dashboard/bills/${id}`)
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to update bill")
      }
    } catch {
      toast.error("Failed to update bill")
    } finally {
      setIsSubmitting(false)
    }
  }

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
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Edit Bill</h1>
        <p className="text-muted-foreground">
          Update bill {bill.billNumber || id}
        </p>
      </div>
      <div className="px-4 lg:px-6">
        <div className="mx-auto max-w-2xl rounded-lg border bg-card p-6">
          <BillForm
            defaultValues={{
              vendorName: bill.vendorName,
              billNumber: bill.billNumber,
              amount: bill.amount,
              dueDate: bill.dueDate,
              status: bill.status,
            }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  )
}
