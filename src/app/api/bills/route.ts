import { NextResponse } from "next/server"

import connectDB from "@/lib/db"
import Bill from "@/models/Bill"

export async function GET() {
  try {
    await connectDB()
    const bills = await Bill.find({}).sort({ createdAt: -1 })
    return NextResponse.json(bills)
  } catch (error) {
    console.error("Error fetching bills:", error)
    return NextResponse.json(
      { error: "Failed to fetch bills" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()

    // Generate bill number if not provided
    if (!body.billNumber) {
      const count = await Bill.countDocuments()
      body.billNumber = `BILL-${String(count + 1).padStart(5, "0")}`
    }

    const bill = await Bill.create(body)
    return NextResponse.json(bill)
  } catch (error) {
    console.error("Error creating bill:", error)
    return NextResponse.json(
      { error: "Failed to create bill" },
      { status: 500 }
    )
  }
}
