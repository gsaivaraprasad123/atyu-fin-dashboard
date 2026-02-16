import { NextResponse } from "next/server"

import connectDB from "@/lib/db"
import Invoice from "@/models/Invoice"

export async function GET() {
  try {
    await connectDB()
    const invoices = await Invoice.find({})
      .sort({ createdAt: -1 })
      .populate("payments")
    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()

    // Generate invoice number if not provided
    if (!body.invoiceNumber) {
      const count = await Invoice.countDocuments()
      body.invoiceNumber = `INV-${String(count + 1).padStart(5, "0")}`
    }

    // Calculate totals from items
    if (body.items && body.items.length > 0) {
      let subtotal = 0
      let taxAmount = 0
      for (const item of body.items) {
        const itemTotal = (item.quantity || 0) * (item.price || 0)
        subtotal += itemTotal
        taxAmount += itemTotal * ((item.taxPercent || 0) / 100)
      }
      body.subtotal = subtotal
      body.taxAmount = taxAmount
      body.totalAmount = subtotal + taxAmount
    }

    const invoice = await Invoice.create(body)
    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error creating invoice:", error)
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    )
  }
}
