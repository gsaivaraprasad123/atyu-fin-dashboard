import { NextResponse } from "next/server"

import connectDB from "@/lib/db"
import Invoice from "@/models/Invoice"
import Payment from "@/models/Payment"

export async function GET() {
  try {
    await connectDB()
    const payments = await Payment.find({})
      .sort({ paymentDate: -1 })
      .populate("invoice")
      .populate("bill")
    return NextResponse.json(payments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()

    const payment = await Payment.create(body)

    // Update invoice status if payment is linked to an invoice
    if (body.invoice) {
      const invoice = await Invoice.findById(body.invoice)
      if (invoice) {
        const existingPayments = await Payment.find({ invoice: body.invoice })
        const totalPaid = existingPayments.reduce((sum, p) => sum + p.amount, 0)
        let newStatus = invoice.status
        if (totalPaid >= invoice.totalAmount) {
          newStatus = "PAID"
        } else if (totalPaid > 0) {
          newStatus = "PARTIALLY_PAID"
        }
        await Invoice.findByIdAndUpdate(body.invoice, {
          $addToSet: { payments: payment._id },
          status: newStatus,
        })
      }
    }

    // Update bill status if payment is linked to a bill
    if (body.bill) {
      const Bill = (await import("@/models/Bill")).default
      await Bill.findByIdAndUpdate(body.bill, { status: "PAID" }).catch(() => {})
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    )
  }
}
