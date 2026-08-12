'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

/**
 * Data Clarity Mode Component
 * 
 * Full-screen light-themed section demonstrating the complete BizLens
 * data intelligence journey. Intentionally transitions from dark product UI
 * to light "data clarity reveal" experience.
 * 
 * Color Palette: white, soft blue (#60a5fa), aqua, mint tones
 */

export function DataClarityMode() {
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

      {/* Placeholder for future sections */}
      <div className="mx-auto max-w-7xl px-6 pb-32 md:px-12">
        <div className="text-center text-sm text-zinc-400">
          Additional Data Clarity sections will be added in Phase 2-4
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
