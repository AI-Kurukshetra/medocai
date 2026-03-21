'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, UserPlus } from 'lucide-react'

const INSURANCE_TYPES = [
  { value: 'medicare', label: 'Medicare' },
  { value: 'medicaid', label: 'Medicaid' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'self_pay', label: 'Self Pay' },
  { value: 'other', label: 'Other' },
]

const DEPARTMENTS = [
  'Internal Medicine',
  'Cardiology',
  'Pulmonology',
  'Neurology',
  'Orthopedics',
  'General Surgery',
  'Oncology',
  'Nephrology',
  'Gastroenterology',
  'ICU / Critical Care',
  'Emergency Medicine',
  'Other',
]

const ENCOUNTER_TYPES = [
  { value: 'inpatient', label: 'Inpatient' },
  { value: 'outpatient', label: 'Outpatient' },
  { value: 'observation', label: 'Observation' },
  { value: 'emergency', label: 'Emergency' },
]

type Physician = { id: string; full_name: string; specialty: string | null }

export function NewCaseDialog({
  organizationId,
  onClose,
}: {
  organizationId: string
  physicians?: Physician[] // kept for API compat but ignored — we fetch client-side
  onClose: () => void
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [physicians, setPhysicians] = useState<Physician[]>([])
  const [loadingPhysicians, setLoadingPhysicians] = useState(true)

  // Patient fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [mrn, setMrn] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('')
  const [insurance, setInsurance] = useState('')

  // Encounter fields — default to local date/time (not UTC)
  const [admissionDate, setAdmissionDate] = useState(() => {
    const now = new Date()
    const offset = now.getTimezoneOffset() * 60000
    return new Date(now.getTime() - offset).toISOString().slice(0, 16)
  })
  const [encounterType, setEncounterType] = useState('inpatient')
  const [department, setDepartment] = useState('')
  const [physicianId, setPhysicianId] = useState('')
  const [admittingDiagnosis, setAdmittingDiagnosis] = useState('')

  // Fetch physicians via API route (uses service role key to bypass RLS)
  useEffect(() => {
    const fetchPhysicians = async () => {
      setLoadingPhysicians(true)
      try {
        const res = await fetch('/api/physicians')
        if (res.ok) {
          const data = await res.json()
          setPhysicians(data)
        }
      } finally {
        setLoadingPhysicians(false)
      }
    }
    fetchPhysicians()
  }, [])

  const canSave =
    firstName.trim() &&
    lastName.trim() &&
    mrn.trim() &&
    dob &&
    admissionDate &&
    physicianId

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()

      // 1. Create patient
      const { data: patient, error: patientError } = await (supabase as any)
        .from('patients')
        .insert({
          organization_id: organizationId,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          mrn: mrn.trim(),
          date_of_birth: dob,
          gender: gender || null,
          insurance_type: insurance || null,
        })
        .select('id')
        .single()

      if (patientError) {
        if (patientError.code === '23505') {
          setError('A patient with this MRN already exists in your organization.')
        } else {
          setError('Failed to create patient. Please try again.')
        }
        return
      }

      // 2. Create encounter
      const { error: encounterError } = await (supabase as any)
        .from('encounters')
        .insert({
          patient_id: patient.id,
          organization_id: organizationId,
          attending_physician_id: physicianId,
          encounter_type: encounterType,
          admission_date: new Date(admissionDate).toISOString(),
          department: department || null,
          admitting_diagnosis: admittingDiagnosis.trim() || null,
          status: 'active',
          cdi_status: 'unreviewed',
          documentation_gaps_count: 0,
        })

      if (encounterError) {
        setError('Patient created but failed to create encounter. Please try again.')
        return
      }

      onClose()
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-slate-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <UserPlus className="w-5 h-5 text-teal-500" />
            New Case Admission
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">

          {/* Patient Info */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Patient Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300 text-xs">First Name <span className="text-red-500">*</span></Label>
                <Input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Jane"
                  className="dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300 text-xs">Last Name <span className="text-red-500">*</span></Label>
                <Input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300 text-xs">MRN <span className="text-red-500">*</span></Label>
                <Input
                  value={mrn}
                  onChange={e => setMrn(e.target.value)}
                  placeholder="MRN-00001"
                  className="font-mono dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300 text-xs">Date of Birth <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className="dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300 text-xs">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300 text-xs">Insurance Type</Label>
                <Select value={insurance} onValueChange={setInsurance}>
                  <SelectTrigger className="dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
                    <SelectValue placeholder="Select insurance" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSURANCE_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Encounter Info */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Encounter Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300 text-xs">Admission Date & Time <span className="text-red-500">*</span></Label>
                <Input
                  type="datetime-local"
                  value={admissionDate}
                  onChange={e => setAdmissionDate(e.target.value)}
                  className="dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300 text-xs">Encounter Type</Label>
                <Select value={encounterType} onValueChange={setEncounterType}>
                  <SelectTrigger className="dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENCOUNTER_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300 text-xs">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300 text-xs">Attending Physician <span className="text-red-500">*</span></Label>
                <Select value={physicianId} onValueChange={setPhysicianId} disabled={loadingPhysicians}>
                  <SelectTrigger className="dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
                    <SelectValue placeholder={loadingPhysicians ? 'Loading...' : 'Select physician'} />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingPhysicians ? (
                      <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-400">
                        <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                      </div>
                    ) : physicians.length === 0 ? (
                      <div className="px-2 py-1.5 text-xs text-slate-400">
                        No physician accounts found in the system.
                      </div>
                    ) : (
                      physicians.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.full_name}{p.specialty ? ` — ${p.specialty}` : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300 text-xs">Admitting Diagnosis (optional)</Label>
                <Input
                  value={admittingDiagnosis}
                  onChange={e => setAdmittingDiagnosis(e.target.value)}
                  placeholder="e.g. Chest pain, shortness of breath"
                  className="dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="dark:border-slate-600 dark:text-slate-300">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!canSave || saving}
              style={{ background: 'var(--primary)', color: 'white' }}
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating case...</>
              ) : (
                'Create Case'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
