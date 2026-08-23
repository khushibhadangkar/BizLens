'use client'

import Link from 'next/link'
import { FileUp, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-serif tracking-tight text-foreground">Your intelligence workspace</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your verified documents and insights.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="p-12 text-center flex flex-col items-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <FileUp className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-foreground">No documents found</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            Upload your first business document to begin analyzing financial and operational data.
          </p>
          <div className="mt-8">
            <Button asChild>
              <Link href="/dashboard/files">
                Upload document
              </Link>
            </Button>
          </div>
        </div>
        <div className="bg-surface-muted px-6 py-4 border-t border-border flex items-start gap-3">
          <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            BizLens processes your spreadsheets and PDFs to extract verified insights.
          </p>
        </div>
      </div>
    </div>
  )
}
