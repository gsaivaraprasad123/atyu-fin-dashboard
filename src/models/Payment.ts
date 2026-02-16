import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface IPayment extends Document {
  amount: number
  paymentDate: Date
  mode: "BANK_TRANSFER" | "UPI" | "CASH" | "CARD"
  referenceNumber?: string
  invoice?: Types.ObjectId
  bill?: Types.ObjectId
}

const PaymentSchema = new Schema<IPayment>(
  {
    amount: Number,
    paymentDate: Date,
    mode: {
      type: String,
      enum: ["BANK_TRANSFER", "UPI", "CASH", "CARD"],
    },
    referenceNumber: String,
    invoice: { type: Schema.Types.ObjectId, ref: "Invoice" },
    bill: { type: Schema.Types.ObjectId, ref: "Bill" },
  },
  { timestamps: true }
)

export default mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema)
