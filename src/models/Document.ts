import mongoose, { Schema, type Document } from "mongoose"

export interface IDocument extends Document {
  type: string
  fileUrl: string
  relatedInvoice?: mongoose.Types.ObjectId
  relatedBill?: mongoose.Types.ObjectId
  tags: string[]
}

const DocumentSchema = new Schema<IDocument>(
  {
    type: String,
    fileUrl: String,
    relatedInvoice: { type: Schema.Types.ObjectId, ref: "Invoice" },
    relatedBill: { type: Schema.Types.ObjectId, ref: "Bill" },
    tags: [String],
  },
  { timestamps: true }
)

export default mongoose.models.Document ||
  mongoose.model<IDocument>("Document", DocumentSchema)
