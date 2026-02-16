import mongoose, { Schema, type Document } from "mongoose"

export interface ILedger extends Document {
  transactionType: "INVOICE" | "BILL" | "PAYMENT"
  referenceId: string
  debit: number
  credit: number
  date: Date
}

const LedgerSchema = new Schema<ILedger>(
  {
    transactionType: String,
    referenceId: String,
    debit: Number,
    credit: Number,
    date: Date,
  },
  { timestamps: true }
)

export default mongoose.models.Ledger ||
  mongoose.model<ILedger>("Ledger", LedgerSchema)
