import mongoose, { Schema, type Document } from "mongoose"

export interface IExpense extends Document {
  description: string
  amount: number
  category: string
  date: Date
  status: "PENDING" | "APPROVED" | "REIMBURSED" | "REJECTED"
}

const ExpenseSchema = new Schema<IExpense>(
  {
    description: String,
    amount: Number,
    category: String,
    date: Date,
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REIMBURSED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
)

export default mongoose.models.Expense ||
  mongoose.model<IExpense>("Expense", ExpenseSchema)
