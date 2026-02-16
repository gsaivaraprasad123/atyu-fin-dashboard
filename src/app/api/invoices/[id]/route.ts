import { NextResponse } from "next/server"

import connectDB from "@/lib/db"
import Invoice from "@/models/Invoice"
import type { Types } from "mongoose"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const invoice = await Invoice.findById(id).populate("payments")

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error fetching invoice:", error)
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()

    // Recalculate totals if items are provided
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

    const invoice = await Invoice.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).populate("payments")

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error updating invoice:", error)
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const invoice = await Invoice.findByIdAndDelete(id)

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Invoice deleted successfully" })
  } catch (error) {
    console.error("Error deleting invoice:", error)
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    )
  }
}
