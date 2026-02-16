import mongoose, { Schema, type Document } from "mongoose"

export interface IBill extends Document {
  vendorName: string
  billNumber: string
  amount: number
  dueDate: Date
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "SCHEDULED" | "PAID" | "REJECTED"
}

const BillSchema = new Schema<IBill>(
  {
    vendorName: String,
    billNumber: String,
    amount: Number,
    dueDate: Date,
    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "APPROVED", "SCHEDULED", "PAID", "REJECTED"],
      default: "DRAFT",
    },
  },
  { timestamps: true }
)

export default mongoose.models.Bill || mongoose.model<IBill>("Bill", BillSchema)
