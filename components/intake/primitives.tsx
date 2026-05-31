'use client'

import { useId } from 'react'
import { cf } from '@/lib/cf'
import { EMPTY_CONTACT, EMPTY_BENEFICIARY, formatPhone } from '@/lib/intake/schema'
import type { Contact, Beneficiary } from '@/lib/intake/schema'
import type React from 'react'

export function Field({
  label,
  hint,
  error,
  required,
  children,
  span = 6,
}: {
  label: React.ReactNode
  hint?: React.ReactNode
  error?: boolean
  required?: boolean
  children: React.ReactNode
  span?: number
}) {
  return (
    <label style={{ gridColumn: `span ${span}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{
        fontFamily: cf.sans, fontSize: 11, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: error ? cf.danger : cf.textMute,
        fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span>{label}</span>
        {required && <span style={{ color: cf.brass, fontSize: 10 }}>required</span>}
        {error && <span style={{ color: cf.danger, fontSize: 10 }}>· please complete</span>}
      </span>
      {children}
      {hint && !error && <span style={{ fontFamily: cf.sans, fontSize: 12, color: cf.textMute, lineHeight: 1.4 }}>{hint}</span>}
    </label>
  )
}

export function Input({
  value,
  onChange,
  placeholder,
  error,
  type = 'text',
  maxWidth,
  ...rest
}: {
  value?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  placeholder?: string
  error?: boolean
  type?: string
  maxWidth?: number
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        fontFamily: cf.sans, fontSize: 16, color: cf.ink, maxWidth,
        background: '#fff', border: `1px solid ${error ? cf.danger : cf.rule}`,
        padding: '12px 14px', outline: 'none', borderRadius: 0,
        transition: 'border-color .15s, box-shadow .15s',
      }}
      onFocus={e => { e.target.style.borderColor = cf.brass; e.target.style.boxShadow = `0 0 0 3px ${cf.brass}22`; }}
      onBlur={e => { e.target.style.borderColor = error ? cf.danger : cf.rule; e.target.style.boxShadow = 'none'; }}
      {...rest}
    />
  )
}

export function RadioCard({
  checked,
  onClick,
  label,
  sub,
  narrow = false,
}: {
  checked?: boolean
  onClick?: () => void
  label: React.ReactNode
  sub?: React.ReactNode
  narrow?: boolean
}) {
  return (
    <button type="button" onClick={onClick}
      style={{
        textAlign: 'left', cursor: 'pointer', background: checked ? '#fff' : 'transparent',
        border: `1px solid ${checked ? cf.brass : cf.rule}`,
        padding: narrow ? '10px 14px' : '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        fontFamily: cf.sans, color: cf.ink,
        transition: 'all .15s',
        boxShadow: checked ? `inset 0 0 0 1px ${cf.brass}` : 'none',
      }}>
      <span style={{
        width: 16, height: 16, borderRadius: '50%', flex: '0 0 16px',
        border: `1.5px solid ${checked ? cf.brass : cf.rule}`,
        background: '#fff', position: 'relative',
      }}>
        {checked && <span style={{ position: 'absolute', inset: 3, borderRadius: '50%', background: cf.brass }} />}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.2 }}>{label}</span>
        {sub && <span style={{ fontSize: 12, color: cf.textMute, lineHeight: 1.3 }}>{sub}</span>}
      </span>
    </button>
  )
}

export function CheckCard({
  checked,
  onClick,
  label,
  note,
}: {
  checked?: boolean
  onClick?: () => void
  label: React.ReactNode
  note?: React.ReactNode
}) {
  return (
    <button type="button" onClick={onClick}
      style={{
        textAlign: 'left', cursor: 'pointer',
        background: checked ? '#fff' : 'transparent',
        border: `1px solid ${checked ? cf.brass : cf.rule}`,
        boxShadow: checked ? `inset 0 0 0 1px ${cf.brass}` : 'none',
        padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12,
        fontFamily: cf.sans, color: cf.ink, transition: 'all .15s',
      }}>
      <span style={{
        width: 18, height: 18, flex: '0 0 18px', marginTop: 1,
        border: `1.5px solid ${checked ? cf.brass : cf.rule}`,
        background: checked ? cf.brass : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && (
          <svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6.2L4.6 8.8 10 3.4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
        {note && <span style={{ fontSize: 12, color: cf.textMute, lineHeight: 1.4 }}>{note}</span>}
      </span>
    </button>
  )
}

export function YesNo({
  value,
  onChange,
  error,
}: {
  value?: boolean | null
  onChange: (v: boolean) => void
  error?: boolean
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxWidth: 280 }}>
      {([['Yes', true], ['No', false]] as [string, boolean][]).map(([lbl, v]) => (
        <button key={lbl} type="button" onClick={() => onChange(v)}
          style={{
            cursor: 'pointer', padding: '11px 14px',
            background: value === v ? cf.ink : 'transparent',
            color: value === v ? cf.cream : cf.ink,
            border: `1px solid ${error ? cf.danger : (value === v ? cf.ink : cf.rule)}`,
            fontFamily: cf.sans, fontSize: 13, fontWeight: 500,
            letterSpacing: '0.04em', transition: 'all .15s',
          }}>{lbl}</button>
      ))}
    </div>
  )
}

export function TriOption({
  options,
  value,
  onChange,
  error,
  maxWidth = 420,
}: {
  options: [string, string][]
  value?: string
  onChange: (v: string) => void
  error?: boolean
  maxWidth?: number
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${options.length}, 1fr)`, gap: 8, maxWidth }}>
      {options.map(([lbl, v]) => (
        <button key={lbl} type="button" onClick={() => onChange(v)}
          style={{
            cursor: 'pointer', padding: '11px 14px',
            background: value === v ? cf.ink : 'transparent',
            color: value === v ? cf.cream : cf.ink,
            border: `1px solid ${error ? cf.danger : (value === v ? cf.ink : cf.rule)}`,
            fontFamily: cf.sans, fontSize: 13, fontWeight: 500,
            letterSpacing: '0.04em', transition: 'all .15s',
          }}>{lbl}</button>
      ))}
    </div>
  )
}

export function Select({
  value,
  onChange,
  children,
}: {
  value?: string
  onChange?: React.ChangeEventHandler<HTMLSelectElement>
  children: React.ReactNode
}) {
  return (
    <select value={value} onChange={onChange}
      style={{
        fontFamily: cf.sans, fontSize: 16, color: cf.ink,
        background: '#fff', border: `1px solid ${cf.rule}`,
        padding: '12px 14px', outline: 'none', appearance: 'none', borderRadius: 0,
        backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\'><path d=\'M0 0l5 6 5-6z\' fill=\'%231a2230\'/></svg>")',
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
        cursor: 'pointer',
      }}>
      {children}
    </select>
  )
}

// Subtle conditional reveal wrapper
export function Reveal({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: open ? '1fr' : '0fr',
      opacity: open ? 1 : 0,
      transition: 'grid-template-rows .35s cubic-bezier(.4,0,.2,1), opacity .25s',
    }}>
      <div style={{ overflow: 'hidden', minHeight: 0 }}>
        {open && <div style={{ paddingTop: 8 }}>{children}</div>}
      </div>
    </div>
  )
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  maxWidth,
}: {
  value?: string
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>
  placeholder?: string
  rows?: number
  maxWidth?: number
}) {
  return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      style={{
        fontFamily: cf.sans, fontSize: 15, color: cf.ink, lineHeight: 1.55, maxWidth,
        background: '#fff', border: `1px solid ${cf.rule}`,
        padding: '12px 14px', outline: 'none', resize: 'vertical', borderRadius: 0,
        transition: 'border-color .15s, box-shadow .15s',
      }}
      onFocus={e => { e.target.style.borderColor = cf.brass; e.target.style.boxShadow = `0 0 0 3px ${cf.brass}22`; }}
      onBlur={e => { e.target.style.borderColor = cf.rule; e.target.style.boxShadow = 'none'; }}
    />
  )
}

// Structured 4-field block for a Trustee/Executor/POA slot. value/onChange follow
// the form-update pattern: onChange receives the next merged contact object.
export function ContactBlock({
  value,
  onChange,
  isMobile,
  namePlaceholder = 'Margaret A. Bellweather',
}: {
  value?: Contact
  onChange: (c: Contact) => void
  isMobile: boolean
  namePlaceholder?: string
}) {
  const v = value || { ...EMPTY_CONTACT }
  const patch = (k: keyof Contact, x: string) => onChange({ ...v, [k]: x })
  return (
    <div style={isMobile
      ? { display: 'flex', flexDirection: 'column', gap: 14 }
      : { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, gridRowGap: 14 }
    }>
      <Field label="Full name">
        <Input value={v.name} onChange={e => patch('name', e.target.value)} placeholder={namePlaceholder} />
      </Field>
      <Field label="Relationship">
        <Input value={v.relationship} onChange={e => patch('relationship', e.target.value)} placeholder="Spouse, brother, friend…" />
      </Field>
      <Field label="Address">
        <Input value={v.address} onChange={e => patch('address', e.target.value)} placeholder="123 Oak Lane, Plano TX 75093" />
      </Field>
      <Field label="Phone">
        <Input type="tel" value={v.phone} onChange={e => patch('phone', formatPhone(e.target.value))} placeholder="(972) 555-0100" />
      </Field>
    </div>
  )
}

// 3-field beneficiary row + remove button. Used inside a managed list.
export function BeneficiaryRow({
  value,
  onChange,
  onRemove,
  index,
  isMobile,
}: {
  value?: Beneficiary
  onChange: (b: Beneficiary) => void
  onRemove: () => void
  index: number
  isMobile: boolean
}) {
  const v = value || { ...EMPTY_BENEFICIARY }
  const patch = (k: keyof Beneficiary, x: string) => onChange({ ...v, [k]: x })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '16px 18px', background: cf.ivoryWarm, borderLeft: `2px solid ${cf.brass}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: cf.mono, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: cf.brass, fontWeight: 600 }}>
          Beneficiary {index + 1}
        </span>
        <button type="button" onClick={onRemove}
          style={{ background: 'transparent', border: 'none', color: cf.textMute, cursor: 'pointer',
            fontFamily: cf.sans, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
          Remove
        </button>
      </div>
      <div style={isMobile
        ? { display: 'flex', flexDirection: 'column', gap: 12 }
        : { display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr', gap: 14 }
      }>
        <Field label="Full name">
          <Input value={v.name} onChange={e => patch('name', e.target.value)} placeholder="Emma Bellweather" />
        </Field>
        <Field label="Relationship">
          <Input value={v.relationship} onChange={e => patch('relationship', e.target.value)} placeholder="Daughter" />
        </Field>
        <Field label="Share %" hint="0–100">
          <Input value={v.percentage} onChange={e => patch('percentage', e.target.value.replace(/\D/g,'').slice(0,3))} placeholder="50" maxWidth={120} />
        </Field>
      </div>
    </div>
  )
}

// Visual file picker — stores the filename only (no upload). Per demo
// agreement, real storage is deferred to engagement-letter stage.
export function FileUploadStub({
  value,
  onChange,
  label = 'Attach document',
}: {
  value?: string
  onChange: (name: string) => void
  label?: string
}) {
  const id = useId()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <label htmlFor={id}
        style={{
          fontFamily: cf.sans, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600,
          color: cf.ink, background: '#fff', border: `1px solid ${cf.rule}`,
          padding: '10px 16px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
        <span style={{ fontSize: 14, color: cf.brass }}>+</span> {label}
      </label>
      <input id={id} type="file" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files && e.target.files[0]; if (f) onChange(f.name); }} />
      {value && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: cf.sans, fontSize: 12.5, color: cf.textMute }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: cf.brass, display: 'inline-block' }} />
          {value}
          <button type="button" onClick={() => onChange('')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: cf.textMute, padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>
        </span>
      )}
    </div>
  )
}
