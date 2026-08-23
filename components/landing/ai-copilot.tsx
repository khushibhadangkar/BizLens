'use client'

import { useState } from 'react'
import { MessageCircle, Sparkles } from 'lucide-react'
import { copilotAnswers } from '@/lib/bizlens-data'

const questions = Object.keys(copilotAnswers)

export function AiCopilot() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('Ask a question and BizLens will trace the answer back to the verified source trail.')

  return (
    <section id="copilot" className="mx-auto max-w-7xl px-6 py-24 md:px-12 lg:py-36">
      <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="eyebrow">/ 03 AI COPILOT</p>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl md:text-6xl leading-[1.05]">
            Ask the question behind the <span className="font-serif italic font-normal text-foreground/80">number</span>.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            A decision partner that knows where every answer came from.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 md:p-8 border border-border bg-surface shadow-xl">
          <div className="flex items-center gap-3.5 border-b border-border pb-5">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-5 fill-current text-primary-foreground" />
            </span>
            <div>
              <p className="font-semibold text-foreground text-base">BizLens Intelligence</p>
              <p className="text-xs text-muted-foreground">Grounded in your verified workspace</p>
            </div>
          </div>

          <div className="min-h-36 py-7">
            <p className="text-sm leading-relaxed text-foreground/80 font-normal">{answer}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {questions.map((item) => (
              <button 
                key={item} 
                onClick={() => { setQuestion(item); setAnswer(copilotAnswers[item]) }} 
                className={`rounded-full border px-4 py-2 text-left text-xs font-medium transition ${question === item ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border bg-surface-muted text-muted-foreground hover:border-border/80 hover:text-foreground'}`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-surface-muted p-4 text-sm text-muted-foreground">
            <MessageCircle className="size-4 text-muted-foreground" />
            <span>Ask a follow-up question</span>
          </div>
        </div>
      </div>
    </section>
  )
}
