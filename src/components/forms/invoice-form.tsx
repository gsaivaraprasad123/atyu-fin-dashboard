"use client"

import * as React from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { IconPlus, IconTrash } from "@tabler/icons-react"

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

const numSchema = (min = 0, max?: number) =>
  z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) || 0 : val))
    .pipe(max !== undefined ? z.number().min(min).max(max) : z.number().min(min))

const itemSchema = z.object({
  description: z.string().min(1, "Required"),
  quantity: numSchema(1),
  price: numSchema(0),
  taxPercent: numSchema(0, 100),
})

const invoiceSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Invalid email"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  status: z.enum([
    "DRAFT",
    "SENT",
    "PARTIALLY_PAID",
    "PAID",
    "OVERDUE",
    "CANCELLED",
  ]),
  items: z.array(itemSchema).min(1, "At least one item is required"),
})

type InvoiceFormValues = z.infer<typeof invoiceSchema>

interface InvoiceFormProps {
  defaultValues?: Partial<InvoiceFormValues> & {
    _id?: string
    items?: { description: string; quantity: number; price: number; taxPercent: number }[]
  }
  onSubmit: (data: InvoiceFormValues) => Promise<void>
  isSubmitting?: boolean
}

export function InvoiceForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: InvoiceFormProps) {
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema) as Resolver<InvoiceFormValues>,
    defaultValues: {
      clientName: defaultValues?.clientName ?? "",
      clientEmail: defaultValues?.clientEmail ?? "",
      issueDate:
        defaultValues?.issueDate
          ? new Date(defaultValues.issueDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      dueDate:
        defaultValues?.dueDate
          ? new Date(defaultValues.dueDate).toISOString().split("T")[0]
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
      status: defaultValues?.status ?? "DRAFT",
      items:
        defaultValues?.items && defaultValues.items.length > 0
          ? defaultValues.items
          : [{ description: "", quantity: 1, price: 0, taxPercent: 18 }],
    },
  })

  const items = form.watch("items")

  const addItem = () => {
    form.setValue("items", [
      ...items,
      { description: "", quantity: 1, price: 0, taxPercent: 18 },
    ])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      form.setValue(
        "items",
        items.filter((_, i) => i !== index)
      )
  }
  }

  const subtotal = React.useMemo(() => {
    return items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
      0
    )
  }, [items])

  const taxAmount = React.useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum +
        (item.quantity || 0) *
          (item.price || 0) *
          ((item.taxPercent || 0) / 100),
      0
    )
  }, [items])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => onSubmit(data))}
        className="space-y-6"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="clientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Corp" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="client@acme.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Line Items</FormLabel>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <IconPlus className="mr-2 size-4" />
              Add Item
            </Button>
          </div>
          <div className="space-y-4 rounded-lg border p-4">
            {items.map((_, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-md bg-muted/50 p-4 md:grid-cols-12"
              >
                <FormField
                  control={form.control}
                  name={`items.${index}.description`}
                  render={({ field }) => (
                    <FormItem className="md:col-span-5">
                      <FormLabel className="text-xs">Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Item description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-xs">Qty</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.price`}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-xs">Price (₹)</FormLabel>
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
                  name={`items.${index}.taxPercent`}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-xs">Tax %</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
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
                <div className="flex items-end md:col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length <= 1}
                  >
                    <IconTrash className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-4 rounded-lg border bg-muted/30 p-4">
            <div className="text-sm">
              Subtotal: ₹{subtotal.toLocaleString("en-IN")}
            </div>
            <div className="text-sm">Tax: ₹{taxAmount.toLocaleString("en-IN")}</div>
            <div className="font-semibold">
              Total: ₹{(subtotal + taxAmount).toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Invoice"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
