import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface IInvoiceItem {
  description: string
  quantity: number
  price: number
  taxPercent: number
}

export interface IInvoice extends Document {
  invoiceNumber: string
  clientName: string
  clientEmail: string
  issueDate: Date
  dueDate: Date
  items: IInvoiceItem[]
  subtotal: number
  taxAmount: number
  totalAmount: number
  status:
    | "DRAFT"
    | "SENT"
    | "PARTIALLY_PAID"
    | "PAID"
    | "OVERDUE"
    | "CANCELLED"
  payments: Types.ObjectId[]
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, unique: true },
    clientName: String,
    clientEmail: String,
    issueDate: Date,
    dueDate: Date,
    items: [
      {
        description: String,
        quantity: Number,
        price: Number,
        taxPercent: Number,
      },
    ],
    subtotal: Number,
    taxAmount: Number,
    totalAmount: Number,
    status: {
      type: String,
      enum: ["DRAFT", "SENT", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"],
      default: "DRAFT",
    },
    payments: [{ type: Schema.Types.ObjectId, ref: "Payment" }],
  },
  { timestamps: true }
)

export default mongoose.models.Invoice ||
  mongoose.model<IInvoice>("Invoice", InvoiceSchema)
