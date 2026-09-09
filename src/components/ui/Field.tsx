import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return <label className="field"><span className="field__label">{label}</span>{children}{hint && <small>{hint}</small>}{error && <small className="field__error">{error}</small>}</label>
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) { return <input className="input" {...props} /> }
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className="input textarea" {...props} /> }
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) { return <select className="input" {...props} /> }
