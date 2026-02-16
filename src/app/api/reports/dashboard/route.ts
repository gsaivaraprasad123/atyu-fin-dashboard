import { NextResponse } from "next/server"

import connectDB from "@/lib/db"
import Bill from "@/models/Bill"
import Invoice from "@/models/Invoice"
import Payment from "@/models/Payment"

export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "month" // month, quarter, year

    const now = new Date()
    let startDate = new Date()

    if (period === "month") {
      startDate.setMonth(now.getMonth() - 1)
    } else if (period === "quarter") {
      startDate.setMonth(now.getMonth() - 3)
    } else {
      startDate.setFullYear(now.getFullYear() - 1)
    }

    // Revenue (MTD) - Sum of paid invoices
    const revenueResult = await Invoice.aggregate([
      { $match: { status: "PAID" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ])
    const totalRevenue = revenueResult[0]?.totalRevenue ?? 0

    // Outstanding invoices (not paid/cancelled)
    const outstandingInvoices = await Invoice.aggregate([
      {
        $match: {
          status: { $nin: ["PAID", "CANCELLED"] },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ])
    const outstandingReceivables =
      outstandingInvoices[0]?.total ?? 0

    // Outstanding bills (not paid/rejected)
    const outstandingBills = await Bill.aggregate([
      {
        $match: {
          status: { $nin: ["PAID", "REJECTED"] },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])
    const totalOutstandingBills = outstandingBills[0]?.total ?? 0

    // Total payments this period
    const paymentsResult = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: startDate },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])
    const totalPaymentsMTD = paymentsResult[0]?.total ?? 0

    // Invoice counts by status
    const invoiceCounts = await Invoice.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ])
    const overdues =
      invoiceCounts.find((c) => c._id === "OVERDUE")?.count ?? 0
    const drafts = invoiceCounts.find((c) => c._id === "DRAFT")?.count ?? 0

    // Revenue chart data (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const revenueByMonth = await Invoice.aggregate([
      { $match: { status: "PAID", issueDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$issueDate" },
            month: { $month: "$issueDate" },
          },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ])

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ]
    const chartData = revenueByMonth.map((item) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
      desktop: item.revenue, // for chart compatibility
      mobile: 0,
    }))

    // If no data, add placeholder
    if (chartData.length === 0) {
      for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        chartData.push({
          month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
          revenue: 0,
          desktop: 0,
          mobile: 0,
        })
      }
    }

    return NextResponse.json({
      totalRevenue,
      outstandingReceivables,
      totalOutstandingBills,
      totalPaymentsMTD,
      overdues,
      drafts,
      chartData,
      invoiceCounts: Object.fromEntries(
        invoiceCounts.map((c) => [c._id, c.count])
      ),
    })
  } catch (error) {
    console.error("Error fetching dashboard report:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard report" },
      { status: 500 }
    )
  }
}
