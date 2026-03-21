'use client'
import Link from 'next/link'
import {
  Brain,
  MessageSquare,
  TrendingUp,
  Shield,
  CheckCircle,
  ArrowRight,
  Activity,
  DollarSign,
  Zap,
  ChevronRight,
} from 'lucide-react'

const STATS = [
  { value: '94%', label: 'Query Response Rate' },
  { value: '$2.4M', label: 'Avg Revenue Captured / Year' },
  { value: '3x', label: 'Faster CDI Review' },
  { value: '40%', label: 'Reduction in Documentation Gaps' },
]

const FEATURES = [
  {
    icon: Brain,
    title: 'AI-Powered Document Analysis',
    description:
      'Claude AI reads clinical documents and instantly surfaces missing diagnoses, undocumented comorbidities, and DRG opportunities your team would otherwise miss.',
    color: 'teal',
  },
  {
    icon: MessageSquare,
    title: 'Physician Query Workflow',
    description:
      'Draft targeted, evidence-based queries in seconds. Physicians respond directly in the platform — no phone tags, no paper forms.',
    color: 'violet',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Revenue Intelligence',
    description:
      'Track DRG shifts, CC/MCC capture rates, and revenue impact as documentation improves — updated live with every physician response.',
    color: 'emerald',
  },
  {
    icon: Shield,
    title: 'Compliance-First Architecture',
    description:
      'Every AI suggestion includes confidence scores and clinical rationale. Your team stays in control — the AI advises, the CDI specialist decides.',
    color: 'amber',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Ingest clinical documents',
    description: 'Physicians add H&Ps, progress notes, and discharge summaries directly in the platform.',
  },
  {
    step: '02',
    title: 'AI analyzes for gaps',
    description: 'Our AI scans each document for undercoded diagnoses, missing specificity, and DRG mismatches.',
  },
  {
    step: '03',
    title: 'CDI specialist reviews',
    description: 'Specialists review AI findings, add ICD-10 codes, and fire targeted physician queries.',
  },
  {
    step: '04',
    title: 'Revenue captured',
    description: 'Physicians respond, documentation is completed, and the correct DRG is locked in.',
  },
]

const TESTIMONIALS = [
  {
    quote: "medocai cut our average query turnaround from 4 days to 18 hours. The AI suggestions are accurate enough that our CDI team spends time on complex cases, not hunting for gaps.",
    name: 'Sarah Chen',
    title: 'Director of CDI, Regional Medical Center',
    avatar: 'SC',
  },
  {
    quote: "We captured $1.8M in additional revenue in the first six months. The physician query workflow alone was worth the switch.",
    name: 'Dr. Marcus Webb',
    title: 'CMO, University Health System',
    avatar: 'MW',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080D18] text-slate-100 overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 backdrop-blur-md bg-[#080D18]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">medocai</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-violet-500/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium mb-8">
            <Zap className="w-3 h-3" />
            Powered by Claude AI · Built for CDI teams
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight text-white mb-6">
            Clinical documentation<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
              that pays for itself
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            medocai uses AI to find documentation gaps, suggest accurate ICD-10 codes,
            and streamline physician queries — so your CDI team captures every dollar of
            revenue the clinical record supports.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-400/30"
            >
              Start free trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 px-7 py-3.5 rounded-xl transition-all"
            >
              Sign in to your account
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-600">No credit card required · HIPAA-compliant · SOC 2 Type II</p>
        </div>

        {/* Dashboard mockup */}
        <div className="relative max-w-5xl mx-auto mt-16">
          <div className="rounded-2xl border border-slate-700/60 overflow-hidden shadow-2xl shadow-black/60">
            {/* Browser chrome */}
            <div className="h-10 bg-slate-800/80 flex items-center px-4 gap-2 border-b border-slate-700/60">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="flex-1 mx-4 h-5 bg-slate-700/60 rounded text-center text-xs text-slate-500 leading-5">
                app.medocai.com/dashboard
              </div>
            </div>

            {/* Dashboard preview */}
            <div className="bg-[#0F172A] p-6">
              {/* KPI row */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Active Encounters', value: '47', color: 'text-white' },
                  { label: 'Pending Queries', value: '12', color: 'text-amber-400' },
                  { label: 'Revenue Captured', value: '$284K', color: 'text-emerald-400' },
                  { label: 'Cases Completed', value: '8', color: 'text-teal-400' },
                ].map(kpi => (
                  <div key={kpi.label} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
                    <p className="text-xs text-slate-500 mb-1">{kpi.label}</p>
                    <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                  </div>
                ))}
              </div>

              {/* Chart + case list */}
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-3 bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
                  <p className="text-xs text-slate-500 mb-3">Revenue Impact · Last 30 days</p>
                  <div className="flex items-end gap-2 h-24">
                    {[40, 65, 45, 80, 55, 90, 72, 95, 60, 85, 70, 100].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-gradient-to-t from-teal-600 to-teal-400 opacity-80"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="col-span-2 bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
                  <p className="text-xs text-slate-500 mb-3">Recent Cases</p>
                  <div className="space-y-2">
                    {[
                      { name: 'Johnson, R.', gap: '2 gaps', dot: 'bg-amber-500' },
                      { name: 'Williams, M.', gap: '3 gaps', dot: 'bg-red-500' },
                      { name: 'Patel, A.', gap: 'Complete', dot: 'bg-emerald-500' },
                    ].map(c => (
                      <div key={c.name} className="flex items-center justify-between py-1.5 border-b border-slate-700/40 last:border-0">
                        <span className="text-xs text-slate-300">{c.name}</span>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                          <span className="text-xs text-slate-500">{c.gap}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-teal-500/15 blur-3xl rounded-full" />
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-slate-800/60">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
          {STATS.map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-teal-400 text-sm font-medium mb-3 uppercase tracking-widest">Platform capabilities</p>
            <h2 className="text-4xl font-bold text-white mb-4">Everything your CDI team needs</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Built specifically for clinical documentation improvement specialists and the physicians they work with.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map(f => {
              const Icon = f.icon
              const colorMap: Record<string, string> = {
                teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
                violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
                emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
              }
              return (
                <div
                  key={f.title}
                  className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/40 hover:border-teal-500/30 hover:bg-slate-800/60 transition-all"
                >
                  <div className={`inline-flex p-2.5 rounded-xl border ${colorMap[f.color]} mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-slate-900/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-teal-400 text-sm font-medium mb-3 uppercase tracking-widest">Workflow</p>
            <h2 className="text-4xl font-bold text-white mb-4">From document to revenue in 4 steps</h2>
          </div>

          <div className="relative">
            <div className="hidden sm:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
            <div className="grid sm:grid-cols-4 gap-8">
              {HOW_IT_WORKS.map(step => (
                <div key={step.step} className="relative text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 font-bold text-lg mb-4 relative z-10">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-sm">{step.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-teal-400 text-sm font-medium mb-3 uppercase tracking-widest">Social proof</p>
            <h2 className="text-4xl font-bold text-white mb-4">Trusted by CDI teams nationwide</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/40">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-16 px-6 border-y border-slate-800/60">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-8">Everything included from day one</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              'AI document analysis',
              'ICD-10 code suggestions',
              'Physician query builder',
              'CC/MCC capture tracking',
              'DRG optimization',
              'Revenue impact reports',
              'Multi-role access control',
              'Real-time analytics',
              'HIPAA-compliant storage',
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-teal-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium mb-8">
            <DollarSign className="w-3 h-3" />
            Start capturing more revenue today
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
            Ready to close your documentation gaps?
          </h2>
          <p className="text-slate-400 mb-10 text-lg">
            Join CDI teams that are capturing millions in legitimate revenue using AI-assisted documentation improvement.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-400/35 text-base"
            >
              Create your free account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              Already have an account? Sign in →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-teal-500 flex items-center justify-center">
              <Activity className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-slate-500">medocai</span>
          </div>
          <p className="text-xs text-slate-600">© 2026 medocai. HIPAA-compliant · Built for clinical teams.</p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Privacy</Link>
            <Link href="/login" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Terms</Link>
            <Link href="/login" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
