import { NextResponse } from "next/server"

import connectDB from "@/lib/db"
import Document from "@/models/Document"

export async function GET() {
  try {
    await connectDB()
    const documents = await Document.find({})
      .sort({ createdAt: -1 })
      .populate("relatedInvoice")
      .populate("relatedBill")
    return NextResponse.json(documents)
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()
    const document = await Document.create(body)
    return NextResponse.json(document)
  } catch (error) {
    console.error("Error creating document:", error)
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    )
  }
}
