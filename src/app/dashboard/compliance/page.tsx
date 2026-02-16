"use client"

import * as React from "react"
import { IconShieldCheck } from "@tabler/icons-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function CompliancePage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Compliance</h1>
        <p className="text-muted-foreground">
          Financial compliance and audit trail
        </p>
      </div>
      <div className="grid gap-6 px-4 lg:grid-cols-2 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconShieldCheck className="size-5" />
              Tax Compliance
            </CardTitle>
            <CardDescription>
              GST, TDS, and other tax-related compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Configure tax rules, generate reports, and ensure regulatory
              compliance. Integrate with your accounting software for seamless
              tax filing.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
            <CardDescription>Track all financial transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Every invoice, bill, and payment is logged with timestamps and
              user actions. Export audit logs for external audits.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
