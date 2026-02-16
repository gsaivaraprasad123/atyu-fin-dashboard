import mongoose, { Schema, type Document } from "mongoose"

export interface ICompany extends Document {
  name: string
  address: string
  taxId: string
  currency: string
  fiscalYearStart: Date
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true },
    address: { type: String },
    taxId: String,
    currency: { type: String, default: "INR" },
    fiscalYearStart: Date,
  },
  { timestamps: true }
)

export default mongoose.models.Company ||
  mongoose.model<ICompany>("Company", CompanySchema)
