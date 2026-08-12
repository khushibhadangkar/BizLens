'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  FileSpreadsheet,
  FileText,
  Upload,
  Database,
  Brain,
  BarChart3,
  ShieldCheck,
  Target,
  ChevronRight,
  X
} from 'lucide-react'
import { novaRetail } from '@/lib/bizlens-data'

/**
 * Data Clarity Mode Component
 * 
 * Full-screen light-themed section demonstrating the complete BizLens
 * data intelligence journey. Intentionally transitions from dark product UI
 * to light "data clarity reveal" experience.
 * 
 * Color Palette: white, soft blue (#60a5fa), aqua, mint tones
 */

// Pipeline stage definitions matching the spec: Upload → Parse → Understand → Analyze → Verify → Decide
const PIPELINE_STAGES = [
  {
    id: 'upload',
    label: 'Upload',
    sublabel: 'File Ingestion',
    icon: Upload,
    description: 'Import CSV, XLSX, and PDF files from your workspace. Files are validated and queued for processing.'
  },
  {
    id: 'parse',
    label: 'Parse',
    sublabel: 'Schema Alignment',
    icon: Database,
    description: 'Extract structured data, normalize fields, align dates and business definitions across sources.'
  },
  {
    id: 'understand',
    label: 'Understand',
    sublabel: 'Context Retrieval',
    icon: Brain,
    description: 'Retrieve supporting context from connected files. Build the knowledge graph of relationships.'
  },
  {
    id: 'analyze',
    label: 'Analyze',
    sublabel: 'Generate Insights',
    icon: BarChart3,
    description: 'Generate dashboards, forecasts, and atomic claims from structured data. Compute KPIs and trends.'
  },
  {
    id: 'verify',
    label: 'Verify',
    sublabel: 'Independent Check',
    icon: ShieldCheck,
    description: 'Check every claim against independent evidence. Flag conflicts and calculate confidence scores.'
  },
  {
    id: 'decide',
    label: 'Decide',
    sublabel: 'Verified Decision',
    icon: Target,
    description: 'Turn verified signals into focused next actions. Every decision is grounded in evidence.'
  }
] as const

export function DataClarityMode() {
  // Interactive file state
  const [files, setFiles] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  // Pipeline interaction state
  const [activeStage, setActiveStage] = useState<number>(0)

  // Native drag-and-drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      const fileList = Array.from(e.dataTransfer.files)
      const validFiles = fileList.filter(file =>
        /\.(csv|xlsx?|pdf)$/i.test(file.name)
      )

      if (validFiles.length > 0) {
        const fileNames = validFiles.map(f => f.name)
        setFiles(prev => [...new Set([...prev, ...fileNames])])
      }
    }
  }, [])

  const removeFile = useCallback((filename: string) => {
    setFiles(prev => prev.filter(f => f !== filename))
    if (selectedFile === filename) {
      setSelectedFile(null)
    }
  }, [selectedFile])

  return (
    <section
      id="data-clarity-mode"
      className="relative bg-[#fafbfc] text-zinc-900"
    >
      {/* Introduction Section */}
      <div className="mx-auto max-w-7xl px-6 py-32 md:px-12 lg:py-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-100px' }}
          className="mx-auto max-w-4xl text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-blue-200/80 bg-white px-5 py-2 shadow-sm">
            <Sparkles className="size-4 text-blue-500" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              Data Clarity Mode
            </span>
          </div>

          {/* Main Headline */}
          <h2 className="mt-8 text-5xl font-semibold leading-[1.08] tracking-[-0.03em] text-zinc-900 sm:text-6xl md:text-7xl">
            From file to insight to{' '}
            <span className="font-serif italic font-normal text-blue-600">verified decision</span>
          </h2>

          {/* Subtitle */}
          <p className="mt-6 text-lg leading-relaxed text-zinc-600 sm:text-xl">
            Watch your data transform into decisions you can defend. Every claim traced back to the source.
          </p>
        </motion.div>

        {/* Introduction Glass Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-100px' }}
          className="mx-auto mt-16 max-w-3xl"
        >
          <GlassPanel>
            <p className="text-base leading-relaxed text-zinc-700">
              BizLens transforms raw spreadsheets and reports into verified intelligence through a transparent six-stage pipeline: <strong className="font-semibold text-zinc-900">Upload → Parse → Understand → Analyze → Verify → Decide</strong>. Each step is auditable, each claim is independently checked, and every decision is grounded in evidence.
            </p>
          </GlassPanel>
        </motion.div>
      </div>

      {/* Interactive File Experience Section */}
      <div className="border-t border-blue-100/50 bg-gradient-to-b from-white to-blue-50/30 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center"
          >
            <h3 className="text-3xl font-semibold tracking-[-0.02em] text-zinc-900 sm:text-4xl md:text-5xl">
              Your data, <span className="font-serif italic font-normal text-blue-600">transformed</span>
            </h3>
            <p className="mt-4 text-base leading-relaxed text-zinc-600 sm:text-lg">
              Drop files to see the transformation from raw data to verified insights.
            </p>
          </motion.div>

          {/* File Drop Zone or File Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            viewport={{ once: true, margin: '-100px' }}
            className="mt-12"
          >
            {files.length === 0 ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300
                  ${isDragging
                    ? 'border-blue-400 bg-blue-50/50 shadow-md'
                    : 'border-blue-200/60 bg-white/50 hover:border-blue-300 hover:bg-white/80'
                  }
                `}
              >
                <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-blue-200/80 bg-blue-50/50">
                  <Upload className="size-7 text-blue-500" />
                </div>
                <p className="mt-4 text-base font-medium text-zinc-700">
                  Drop your CSV, XLSX, or PDF files here
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  Or use the demo files below to see the pipeline in action
                </p>

                {/* Demo file buttons */}
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {novaRetail.sources.map(source => (
                    <button
                      key={source.name}
                      onClick={() => setFiles(prev => [...new Set([...prev, source.name])])}
                      className="flex items-center gap-2 rounded-full border border-blue-200/80 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50/50 hover:shadow"
                    >
                      {source.name.endsWith('.pdf') ? (
                        <FileText className="size-4 text-blue-500" />
                      ) : (
                        <FileSpreadsheet className="size-4 text-emerald-500" />
                      )}
                      {source.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {files.map((filename, index) => (
                  <FileCard
                    key={filename}
                    filename={filename}
                    isActive={selectedFile === filename}
                    onClick={() => setSelectedFile(filename)}
                    onRemove={() => removeFile(filename)}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Interactive Pipeline Visualization Section */}
      <div className="border-t border-blue-100/50 bg-white py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center"
          >
            <h3 className="text-3xl font-semibold tracking-[-0.02em] text-zinc-900 sm:text-4xl md:text-5xl">
              The six-stage <span className="font-serif italic font-normal text-blue-600">intelligence pipeline</span>
            </h3>
            <p className="mt-4 text-base leading-relaxed text-zinc-600 sm:text-lg">
              Every stage is transparent, auditable, and designed to preserve verification as the core differentiator.
            </p>
          </motion.div>

          {/* Pipeline Stages - Horizontal on Desktop, Vertical on Mobile */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            viewport={{ once: true, margin: '-100px' }}
            className="mt-12"
          >
            {/* Desktop: Horizontal Layout */}
            <div className="hidden lg:block">
              <div className="relative flex items-start justify-between">
                {PIPELINE_STAGES.map((stage, index) => (
                  <div key={stage.id} className="relative flex-1">
                    <PipelineStage
                      stage={stage}
                      index={index}
                      isActive={activeStage === index}
                      isPast={activeStage > index}
                      onClick={() => setActiveStage(index)}
                    />

                    {/* Connection Line */}
                    {index < PIPELINE_STAGES.length - 1 && (
                      <div className="absolute left-full top-8 flex w-full items-center">
                        <motion.div
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          transition={{ duration: 0.5, delay: 0.1 * index }}
                          viewport={{ once: true }}
                          className="h-[2px] w-full origin-left bg-gradient-to-r from-blue-300/60 to-blue-200/40"
                        >
                          <ChevronRight className="absolute right-0 top-1/2 size-4 -translate-y-1/2 text-blue-300" />
                        </motion.div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile/Tablet: Vertical Layout */}
            <div className="space-y-6 lg:hidden">
              {PIPELINE_STAGES.map((stage, index) => (
                <div key={stage.id}>
                  <PipelineStage
                    stage={stage}
                    index={index}
                    isActive={activeStage === index}
                    isPast={activeStage > index}
                    onClick={() => setActiveStage(index)}
                    vertical
                  />

                  {/* Vertical Connection */}
                  {index < PIPELINE_STAGES.length - 1 && (
                    <div className="flex justify-center py-2">
                      <motion.div
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                        viewport={{ once: true }}
                        className="h-8 w-[2px] origin-top bg-gradient-to-b from-blue-300/60 to-blue-200/40"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Active Stage Detail Panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="mt-8"
            >
              <GlassPanel className="border-blue-200/80 bg-gradient-to-br from-white to-blue-50/30">
                <div className="flex items-start gap-4">
                  {(() => {
                    const Icon = PIPELINE_STAGES[activeStage].icon
                    return (
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-blue-200/80 bg-white shadow-sm">
                        <Icon className="size-6 text-blue-600" />
                      </div>
                    )
                  })()}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-zinc-900">
                      {PIPELINE_STAGES[activeStage].label}: {PIPELINE_STAGES[activeStage].sublabel}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                      {PIPELINE_STAGES[activeStage].description}
                    </p>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Placeholder for Phase 3-4 sections */}
      <div className="mx-auto max-w-7xl px-6 pb-32 md:px-12">
        <div className="text-center text-sm text-zinc-400">
          Dashboard, Copilot, and Verification sections will be added in Phase 3-4
        </div>
      </div>
    </section>
  )
}

/**
 * GlassPanel Component
 *
 * Reusable light-themed glass panel with restrained shadows and subtle borders.
 * Uses soft shadows instead of neon glow effects.
 *
 * Visual Style:
 * - Light background with subtle translucency
 * - Restrained shadows: soft depth, no glow
 * - Border: 1px solid with low opacity
 * - Hover: gentle scale and shadow depth change
 */

interface GlassPanelProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function GlassPanel({ children, className = '', hover = false }: GlassPanelProps) {
  return (
    <div
      className={`
        rounded-2xl border border-blue-100/60 bg-white/70 p-6 shadow-sm backdrop-blur-md
        ${hover ? 'transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-blue-200/80' : ''}
        ${className}
      `.trim()}
      style={{
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
      }}
    >
      {children}
    </div>
  )
}

/**
 * FileCard Component
 *
 * Interactive file representation that transforms into data preview.
 * Uses native browser drag-and-drop, Framer Motion animations.
 *
 * Props:
 * - filename: Name of the file
 * - isActive: Whether this file is selected
 * - onClick: Click handler
 * - onRemove: Remove file handler
 * - delay: Animation delay for staggered reveals
 */

interface FileCardProps {
  filename: string
  isActive: boolean
  onClick: () => void
  onRemove: () => void
  delay?: number
}

function FileCard({ filename, isActive, onClick, onRemove, delay = 0 }: FileCardProps) {
  const isPdf = filename.endsWith('.pdf')
  const isXlsx = /\.xlsx?$/i.test(filename)
  const isCsv = filename.endsWith('.csv')

  // Determine status from existing data sources
  const source = novaRetail.sources.find(s => s.name === filename)
  const status = source?.status || 'ready'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      onClick={onClick}
      className={`
        group relative cursor-pointer rounded-2xl border p-6 transition-all duration-300
        ${isActive
          ? 'border-blue-400/80 bg-gradient-to-br from-blue-50 to-white shadow-md'
          : 'border-blue-200/60 bg-white hover:border-blue-300 hover:shadow-sm'
        }
      `}
      style={{
        boxShadow: isActive
          ? '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)'
          : '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full border border-zinc-200 bg-white opacity-0 shadow-sm transition-opacity hover:bg-zinc-50 group-hover:opacity-100"
        aria-label={`Remove ${filename}`}
      >
        <X className="size-3.5 text-zinc-500" />
      </button>

      {/* File Icon */}
      <div className={`
        flex size-12 items-center justify-center rounded-xl border transition-all
        ${isActive ? 'border-blue-200 bg-blue-100/50' : 'border-blue-100 bg-blue-50/50 group-hover:border-blue-200'}
      `}>
        {isPdf ? (
          <FileText className={`size-6 ${isActive ? 'text-blue-600' : 'text-blue-500'}`} />
        ) : (
          <FileSpreadsheet className={`size-6 ${isActive ? 'text-emerald-600' : 'text-emerald-500'}`} />
        )}
      </div>

      {/* File Info */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-zinc-900 truncate">{filename}</h4>
        <p className="mt-1 text-xs text-zinc-500">
          {isPdf ? 'PDF Report' : isXlsx ? 'Excel Spreadsheet' : isCsv ? 'CSV Data' : 'Data File'}
          {source && ` · ${source.rows} rows`}
        </p>
      </div>

      {/* Status Badge */}
      <div className="mt-4 flex items-center gap-2">
        <div className={`
          flex size-2 rounded-full
          ${status === 'verified' ? 'bg-emerald-400' : status === 'conflict' ? 'bg-amber-400' : 'bg-blue-400'}
        `} />
        <span className={`
          text-xs font-medium uppercase tracking-wider
          ${status === 'verified' ? 'text-emerald-600' : status === 'conflict' ? 'text-amber-600' : 'text-blue-600'}
        `}>
          {status}
        </span>
      </div>

      {/* Active State Indicator */}
      {isActive && (
        <motion.div
          layoutId="activeFile"
          className="absolute inset-0 rounded-2xl border-2 border-blue-400/50"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </motion.div>
  )
}

/**
 * PipelineStage Component
 *
 * Individual stage in the six-stage pipeline visualization.
 * Supports horizontal (desktop) and vertical (mobile) layouts.
 *
 * Props:
 * - stage: Stage definition with label, icon, description
 * - index: Stage index for animation delays
 * - isActive: Whether this is the currently active stage
 * - isPast: Whether the pipeline has progressed past this stage
 * - onClick: Click handler
 * - vertical: Whether to use vertical layout (mobile)
 */

interface PipelineStageProps {
  stage: typeof PIPELINE_STAGES[number]
  index: number
  isActive: boolean
  isPast: boolean
  onClick: () => void
  vertical?: boolean
}

function PipelineStage({ stage, index, isActive, isPast, onClick, vertical = false }: PipelineStageProps) {
  const Icon = stage.icon

  return (
    <motion.button
      initial={{ opacity: 0, y: vertical ? 10 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * index, ease: 'easeOut' }}
      viewport={{ once: true, margin: '-50px' }}
      onClick={onClick}
      className={`
        group relative flex w-full items-start gap-4 rounded-xl border p-5 text-left transition-all duration-300
        ${isActive
          ? 'border-blue-400/80 bg-gradient-to-br from-blue-50 to-white shadow-md scale-[1.02]'
          : isPast
            ? 'border-blue-200/60 bg-white/80 hover:border-blue-300 hover:bg-white hover:shadow-sm'
            : 'border-zinc-200/60 bg-white/50 hover:border-blue-200 hover:bg-white/80'
        }
        ${vertical ? '' : 'flex-col items-center text-center'}
      `}
      style={{
        boxShadow: isActive
          ? '0 4px 12px rgba(59, 130, 246, 0.15)'
          : '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Icon */}
      <div className={`
        flex shrink-0 items-center justify-center rounded-xl border transition-all
        ${isActive
          ? 'size-14 border-blue-300 bg-blue-100/80 shadow-sm'
          : isPast
            ? 'size-12 border-blue-200/80 bg-blue-50/50'
            : 'size-12 border-zinc-200 bg-zinc-50/50 group-hover:border-blue-200 group-hover:bg-blue-50/50'
        }
      `}>
        <Icon className={`
          transition-all
          ${isActive
            ? 'size-7 text-blue-600'
            : isPast
              ? 'size-6 text-blue-500'
              : 'size-6 text-zinc-400 group-hover:text-blue-500'
          }
        `} />
      </div>

      {/* Content */}
      <div className={`flex-1 ${vertical ? '' : 'mt-3'}`}>
        <div className={`
          text-sm font-semibold transition-colors
          ${isActive ? 'text-blue-700' : isPast ? 'text-zinc-800' : 'text-zinc-500 group-hover:text-zinc-700'}
        `}>
          {stage.label}
        </div>
        <div className={`
          mt-1 text-xs transition-colors
          ${isActive ? 'text-blue-600' : isPast ? 'text-zinc-600' : 'text-zinc-400'}
        `}>
          {stage.sublabel}
        </div>
      </div>

      {/* Active Indicator - Verification stage gets special emphasis */}
      {isActive && stage.id === 'verify' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-md"
        >
          <ShieldCheck className="size-3.5 text-white" />
        </motion.div>
      )}
    </motion.button>
  )
}
