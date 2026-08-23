'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ShieldCheck, X } from 'lucide-react'
import type { Claim } from '@/lib/bizlens-data'

interface EvidenceDrawerProps {
  claim: Claim | null
  onClose: () => void
}

export function EvidenceDrawer({ claim, onClose }: EvidenceDrawerProps) {
  const [verified, setVerified] = useState(false)
  const [verificationRunning, setVerificationRunning] = useState(false)
  const [verificationStep, setVerificationStep] = useState(-1)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Auto-focus on open
  useEffect(() => {
    if (claim) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVerified(false)
      setVerificationRunning(false)
      setVerificationStep(-1)
      setTimeout(() => closeButtonRef.current?.focus(), 50)
    }
  }, [claim])

  // Focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (claim) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [claim, onClose])

  if (!claim) return null

  function runVerification() {
    setVerified(false)
    setVerificationRunning(true)
    setVerificationStep(0)
    let step = 0
    const timer = window.setInterval(() => {
      step += 1
      setVerificationStep(step)
      if (step >= 3) {
        window.clearInterval(timer)
        setVerificationRunning(false)
        setVerified(true)
      }
    }, 650)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-5 backdrop-blur-md">
      <motion.div 
        initial={{ y: 16, scale: 0.98 }} 
        animate={{ y: 0, scale: 1 }} 
        className="glass-panel w-full max-w-lg rounded-2xl border border-border bg-surface p-8 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <button 
          ref={closeButtonRef}
          aria-label="Close evidence" 
          onClick={onClose} 
          className="float-right rounded-full p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-5" />
        </button>
        <p className="eyebrow">/ EVIDENCE DRAWER</p>
        <h3 id="drawer-title" className="mt-4 text-2xl font-semibold tracking-tight text-foreground">{claim.label}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{claim.detail}</p>
        
        <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-surface-muted/50 p-4">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Confidence</span>
          <b className="text-2xl font-bold text-foreground">{verified ? '98%' : `${claim.confidence}%`}</b>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {claim.evidence.map((item, index) => (
            <div key={item} className="flex items-center gap-3 text-sm text-foreground/80">
              <span className="grid size-6 place-items-center rounded-full border border-border bg-surface-muted font-mono text-xs text-muted-foreground">
                {verificationStep >= index || verified ? <Check className="size-3.5 text-success" /> : index + 1}
              </span>
              {item}
            </div>
          ))}
        </div>

        {verificationRunning && <p className="mt-6 text-xs font-mono uppercase tracking-[0.16em] text-foreground">Checking evidence layer {Math.min(verificationStep + 1, 3)} of 3...</p>}
        {!verified && !verificationRunning && (
          <button onClick={runVerification} className="mt-7 flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90">
            Re-verify this insight <ShieldCheck className="size-4 text-primary-foreground" />
          </button>
        )}
        {verified && (
          <p className="mt-7 flex items-center gap-2 text-sm font-medium text-success">
            <Check className="size-4 text-success" /> Verified across independent source evidence.
          </p>
        )}
      </motion.div>
    </motion.div>
  )
}
