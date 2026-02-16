import mongoose, { Schema, type Document } from "mongoose"

export interface ITax extends Document {
  name: string
  rate: number
  type: "GST" | "IGST" | "CESS" | "OTHER"
  isActive: boolean
}

const TaxSchema = new Schema<ITax>(
  {
    name: String,
    rate: Number,
    type: {
      type: String,
      enum: ["GST", "IGST", "CESS", "OTHER"],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.Tax || mongoose.model<ITax>("Tax", TaxSchema)
