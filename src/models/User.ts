import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role:
    | "FINANCE_ADMIN"
    | "FINANCE_EXECUTIVE"
    | "MANAGER"
    | "EMPLOYEE"
    | "AUDITOR"
  department?: string
  isActive: boolean
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: [
        "FINANCE_ADMIN",
        "FINANCE_EXECUTIVE",
        "MANAGER",
        "EMPLOYEE",
        "AUDITOR",
      ],
      required: true,
    },
    department: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
