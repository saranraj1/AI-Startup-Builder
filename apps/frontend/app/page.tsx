'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  ChevronRight,
  Copy,
  Download,
  Loader2,
  RotateCcw,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';

type Artifact = {
  id: string;
  category: string;
  title: string;
  summary: string;
  content: Record<string, unknown>;
  confidence: string;
};

type Project = {
  id: string;
  name: string;
  idea: string;
  score: number;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  artifacts: Artifact[];
  createdAt: string;
  errorMessage?: string | null;
};

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const nav = [
  ['overview', 'Overview'],
  ['analysis', 'Idea analysis'],
  ['research', 'Market research'],
  ['business', 'Business model'],
  ['revenue', 'Revenue'],
  ['brand', 'Brand system'],
  ['marketing', 'Marketing'],
  ['product', 'Product blueprint'],
  ['engineering', 'Engineering'],
  ['ai', 'AI strategy'],
  ['legal', 'Legal'],
  ['investor', 'Investor'],
  ['docs', 'Docs'],
];

export default function Home() {
  const [idea, setIdea] = useState('');
  const [project, setProject] = useState<Project | null>(null);
  const [active, setActive] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!project || project.status === 'completed' || project.status === 'failed') return;

    const timer = setInterval(async () => {
      try {
        const response = await fetch(`${API}/api/v1/projects/${project.id}`);
        if (!response.ok) throw new Error('Could not refresh project status.');
        setProject(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not refresh project status.');
      }
    }, 700);

    return () => clearInterval(timer);
  }, [project]);

  async function create() {
    if (idea.trim().length < 12) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API}/api/v1/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      });
      if (!response.ok) throw new Error('Could not create the startup workspace.');
      setProject(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the startup workspace.');
    } finally {
      setLoading(false);
    }
  }

  async function regenerate() {
    if (!project) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API}/api/v1/projects/${project.id}/generate`, { method: 'POST' });
      if (!response.ok) throw new Error('Could not restart generation.');
      setProject(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not restart generation.');
    } finally {
      setLoading(false);
    }
  }

  if (!project) {
    return <Landing idea={idea} setIdea={setIdea} create={create} loading={loading} error={error} />;
  }

  const selected = project.artifacts.find((artifact) => artifact.category === active);

  return (
    <main className="min-h-screen">
      <aside className="fixed inset-y-0 hidden w-72 border-r border-white/10 bg-black/10 p-6 lg:block">
        <Brand />
        <div className="mt-12 text-xs font-semibold uppercase tracking-widest text-slate-600">Workspace</div>
        <NavList active={active} setActive={setActive} />
        <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-violet-300/15 bg-violet-300/10 p-4">
          <div className="text-xs text-violet-200">Founder mode</div>
          <div className="mt-1 text-sm text-slate-300">Your workspace is private for this session.</div>
        </div>
      </aside>

      <section className="lg:pl-72">
        <header className="border-b border-white/10 px-6 py-5 md:px-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500">Workspace / {project.name}</div>
              <h2 className="font-display mt-1 text-xl font-semibold">
                {active === 'overview' ? 'Startup command center' : selected?.title || 'Generating...'}
              </h2>
            </div>
            <button
              onClick={() => exportProject(project)}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
            >
              <Download size={15} />
              Export
            </button>
          </div>

          <select
            value={active}
            onChange={(event) => setActive(event.target.value)}
            className="mt-4 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white lg:hidden"
          >
            {nav.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </header>

        <div className="mx-auto max-w-6xl p-6 md:p-10">
          {error && <Notice>{error}</Notice>}
          {project.status !== 'completed' && project.status !== 'failed' && <Progress project={project} />}
          {project.status === 'failed' && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
              <span>{project.errorMessage || 'Generation failed. Check backend logs.'}</span>
              <button
                onClick={regenerate}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-rose-200/25 px-3 py-2 font-semibold hover:bg-rose-200/10 disabled:opacity-50"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />}
                Retry generation
              </button>
            </div>
          )}

          {active === 'overview' ? (
            <Overview project={project} onSelect={setActive} />
          ) : selected ? (
            <ArtifactView artifact={selected} />
          ) : (
            <div className="glass rounded-3xl p-10 text-center text-slate-500">This workstream is queued.</div>
          )}
        </div>
      </section>
    </main>
  );
}

function Landing({
  idea,
  setIdea,
  create,
  loading,
  error,
}: {
  idea: string;
  setIdea: (value: string) => void;
  create: () => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <main className="min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(110,231,249,.16),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(155,138,251,.18),transparent_30%)]" />
      <nav className="relative mx-auto flex max-w-6xl items-center px-6 py-7">
        <Brand />
      </nav>

      <section className="relative mx-auto max-w-5xl px-6 pb-24 pt-20 text-center md:pt-32">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-4 py-2 text-xs text-cyan-100">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
          Private beta is open
        </div>
        <h1 className="font-display text-5xl font-semibold tracking-tight md:text-8xl">
          From spark
          <br />
          <span className="bg-gradient-to-r from-cyan-200 via-white to-violet-300 bg-clip-text text-transparent">
            to shipped.
          </span>
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-400">
          Forgeway turns one sentence into the strategy, product, brand, and launch plan your startup needs to move with conviction.
        </p>

        <div className="glass mx-auto mt-12 max-w-3xl rounded-3xl p-3 text-left">
          <textarea
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            placeholder="I want to build an AI platform that helps college students prepare for interviews..."
            className="min-h-28 w-full resize-none bg-transparent px-4 py-3 text-base text-white outline-none placeholder:text-slate-600"
          />
          <div className="flex flex-col gap-3 border-t border-white/10 px-3 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-slate-500">One sentence is enough. We will ask better questions later.</span>
            <button
              onClick={create}
              disabled={loading || idea.trim().length < 12}
              className="flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <ArrowUpRight size={16} />}
              Build my startup
            </button>
          </div>
        </div>

        {error && <div className="mx-auto mt-5 max-w-3xl"><Notice>{error}</Notice></div>}

        <div className="mt-12 flex flex-wrap justify-center gap-7 text-sm text-slate-500">
          <span className="flex items-center gap-2"><Check size={15} className="text-cyan-300" />12 strategic workstreams</span>
          <span className="flex items-center gap-2"><Check size={15} className="text-cyan-300" />Export-ready artifacts</span>
          <span className="flex items-center gap-2"><Check size={15} className="text-cyan-300" />Gemini-ready generation</span>
        </div>
      </section>
    </main>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 font-display text-xl font-bold">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-slate-950">
        <Sparkles size={18} />
      </span>
      forgeway
    </div>
  );
}

function NavList({ active, setActive }: { active: string; setActive: (value: string) => void }) {
  return (
    <div className="mt-4 space-y-1">
      {nav.map(([key, label]) => (
        <button
          key={key}
          onClick={() => setActive(key)}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm ${
            active === key ? 'bg-white/10 text-white' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
          }`}
        >
          <span>{label}</span>
          {active === key && <ChevronRight size={14} />}
        </button>
      ))}
    </div>
  );
}

function Progress({ project }: { project: Project }) {
  return (
    <div className="glass mb-7 rounded-2xl p-5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          <Loader2 size={16} className="animate-spin text-cyan-300" />
          Building your startup workspace
        </span>
        <span className="text-cyan-200">{project.progress}%</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400 transition-all"
          style={{ width: `${project.progress}%` }}
        />
      </div>
    </div>
  );
}

function Overview({ project, onSelect }: { project: Project; onSelect: (value: string) => void }) {
  const nextAction = project.status === 'completed' ? 'Validate' : 'Generating';

  return (
    <>
      <div className="grid gap-5 md:grid-cols-3">
        <Metric icon={<Target />} label="Startup score" value={`${project.score}/100`} note="Initial signal" />
        <Metric icon={<Zap />} label="Workstreams" value={`${project.artifacts.length}/12`} note="Generated and saved" />
        <Metric icon={<Sparkles />} label="Next action" value={nextAction} note="Talk to 5 target users" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="glass rounded-3xl p-7">
          <div className="text-xs uppercase tracking-widest text-slate-500">Your idea</div>
          <p className="mt-4 font-display text-2xl leading-relaxed">"{project.idea}"</p>
          <button onClick={() => onSelect('analysis')} className="mt-7 flex items-center gap-2 text-sm text-cyan-200">
            View the analysis <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="glass rounded-3xl p-7">
          <div className="text-xs uppercase tracking-widest text-slate-500">Recommended path</div>
          {['Validate the problem with 5 interviews', 'Pick your narrowest beachhead', 'Ship a concierge MVP'].map((item, index) => (
            <div key={item} className="mt-5 flex gap-3 text-sm">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs">{index + 1}</span>
              <span className="text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Metric({ icon, label, value, note }: { icon: ReactNode; label: string; value: string; note: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-sm">{label}</span>
        <span className="text-cyan-200">{icon}</span>
      </div>
      <div className="mt-5 font-display text-3xl font-semibold">{value}</div>
      <div className="mt-2 text-xs text-slate-500">{note}</div>
    </div>
  );
}

function ArtifactView({ artifact }: { artifact: Artifact }) {
  const markdown = useMemo(() => artifactMarkdown(artifact), [artifact]);
  const [copied, setCopied] = useState(false);

  async function copyArtifact() {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-sm text-cyan-200">{artifact.confidence === 'estimate' ? 'Estimate' : 'AI-generated first pass'}</div>
          <h1 className="font-display mt-2 text-4xl font-semibold">{artifact.title}</h1>
          <p className="mt-3 text-slate-400">{artifact.summary}</p>
        </div>
        <button
          onClick={copyArtifact}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
        >
          <Copy size={15} />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="glass rounded-3xl p-7">
        <StructuredContent value={artifact.content} />
      </div>
    </div>
  );
}

function StructuredContent({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    return (
      <ul className="space-y-3">
        {value.map((item, index) => (
          <li key={index} className="rounded-xl border border-white/10 bg-white/[.03] p-4 text-sm text-slate-300">
            <StructuredContent value={item} />
          </li>
        ))}
      </ul>
    );
  }

  if (value && typeof value === 'object') {
    return (
      <div className="space-y-5">
        {Object.entries(value as Record<string, unknown>).map(([key, item]) => (
          <section key={key}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">{labelize(key)}</h3>
            <StructuredContent value={item} />
          </section>
        ))}
      </div>
    );
  }

  return <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{String(value)}</p>;
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function labelize(value: string) {
  return value.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
}

function artifactMarkdown(artifact: Artifact) {
  return [
    `## ${artifact.title}`,
    '',
    artifact.summary,
    '',
    `**Confidence:** ${labelize(artifact.confidence)}`,
    '',
    renderMarkdownValue(artifact.content, 3),
  ].join('\n');
}

function exportProject(project: Project) {
  const body = [
    `# ${project.name}`,
    '',
    '## Startup Idea',
    '',
    project.idea,
    '',
    '## Workspace Summary',
    '',
    `- **Score:** ${project.score}/100`,
    `- **Workstreams:** ${project.artifacts.length}/12`,
    `- **Status:** ${labelize(project.status)}`,
    '',
    ...project.artifacts.map((artifact) => artifactMarkdown(artifact)),
  ].join('\n');
  const blob = new Blob([`\uFEFF${body}\n`], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'forgeway-project'}.md`;
  link.click();
  URL.revokeObjectURL(url);
}

function renderMarkdownValue(value: unknown, headingLevel: number): string {
  if (value === null || value === undefined || value === '') return '_Not provided._';

  if (Array.isArray(value)) {
    if (value.length === 0) return '_None provided._';
    return value
      .map((item) => {
        if (item && typeof item === 'object') {
          const nested = renderMarkdownValue(item, headingLevel + 1)
            .split('\n')
            .map((line) => `  ${line}`)
            .join('\n');
          return `-\n${nested}`;
        }
        return `- ${formatMarkdownScalar(item)}`;
      })
      .join('\n');
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => {
        const heading = '#'.repeat(Math.min(headingLevel, 6));
        return `${heading} ${labelize(key)}\n\n${renderMarkdownValue(item, headingLevel + 1)}`;
      })
      .join('\n\n');
  }

  return formatMarkdownScalar(value);
}

function formatMarkdownScalar(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return String(value);
  const text = String(value).trim();
  return text.includes('\n') ? text : text;
}
