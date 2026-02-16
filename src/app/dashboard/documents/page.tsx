"use client"

import * as React from "react"
import { IconDatabase, IconFileText } from "@tabler/icons-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function DocumentsPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          Attachments and file management for invoices and bills
        </p>
      </div>
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconFileText className="size-5" />
              Document Storage
            </CardTitle>
            <CardDescription>
              Store receipts, contracts, and supporting documents. Cloudinary
              integration available for file uploads.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Use the Documents API to upload and attach files to invoices and
              bills. Configure Cloudinary credentials in .env.local for
              production file storage.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
