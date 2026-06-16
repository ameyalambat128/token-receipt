import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeDollarSign,
  Bot,
  FileImage,
  FileJson,
  FileText,
  FolderSearch,
  ScanSearch,
  Terminal,
  Workflow,
} from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { GitHubStars } from "@/components/github-stars";
import { GitHubIcon } from "@/components/icons";
import { InstallCommandPanel } from "@/components/install-command-panel";
import { ProofStrip } from "@/components/proof-strip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const siteUrl = "https://tokenreceipt.ameyalambat.com";
const repoUrl = "https://github.com/ameyalambat128/token-receipt";
const productDescription =
  "Token Receipt turns your Codex, Claude Code, and Kiro CLI logs into your coding-agent bill with a thermal-paper receipt, pricing-aware analysis, share-ready post copy, and skill-native workflows.";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Token Receipt",
      description: productDescription,
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: "Token Receipt",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "macOS",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: productDescription,
      softwareVersion: "0.1.0",
      url: siteUrl,
      keywords: [
        "Codex",
        "Claude Code",
        "Kiro CLI",
        "pricing metadata",
        "agent skills",
        "AI bill",
        "satire",
        "developer tooling",
      ],
    },
  ],
};

const installCommand =
  "npx skills add ameyalambat128/token-receipt --skill token-receipt";
const repoInstallCommand = "bun install && bun run skill:install";
const doctorCommand = "bun run -F token-receipt doctor";
const runtimeCommand =
  "bun run -F token-receipt generate -- --provider all --since 30d --out ./token-receipt-output";

const installItems = [
  { label: "skill", command: installCommand },
  { label: "repo", command: repoInstallCommand },
  { label: "doctor", command: doctorCommand },
  { label: "runtime", command: runtimeCommand },
];

const signalCards = [
  {
    value: "3 providers",
    label: "Codex, Claude Code, and Kiro CLI normalized into one receipt flow.",
  },
  {
    value: "Local-first",
    label:
      "The runtime reads session artifacts already on disk and keeps raw logs local.",
  },
  {
    value: "Pricing-aware",
    label:
      "Codex and Claude use catalog snapshots, Kiro uses local credit usage at $0.04.",
  },
];

const outputCards = [
  {
    icon: FileImage,
    title: "receipt.png",
    body: "A thermal-paper image you can post without hand-annotating the joke.",
  },
  {
    icon: FileJson,
    title: "analysis.json",
    body: "Structured facts, pricing metadata, and provider-level usage that stay inspectable.",
  },
  {
    icon: FileText,
    title: "share copy",
    body: "Editable social text for X and LinkedIn generated from the same local analysis.",
  },
];

const providerCards = [
  {
    name: "Codex",
    detail:
      "Reads local Codex sessions, tool activity, prompts, token usage, and waste signals into the shared parser.",
    pricing:
      "API-equivalent spend comes from the refreshable OpenAI pricing catalog snapshot stored with the run.",
  },
  {
    name: "Claude Code",
    detail:
      "Uses the same skill-native loop, with local transcript analysis and host-session copy generation.",
    pricing:
      "Claude pricing metadata is sourced from the refreshable Anthropic catalog snapshot recorded in analysis.json.",
  },
  {
    name: "Kiro CLI",
    detail:
      "Parses local CLI sessions out of Kiro's SQLite store, including tool activity, planning turns, and project directory context.",
    pricing:
      "Kiro fills spend from summed local credit usage. Token counters stay zero when local token fields are not present.",
  },
];

const workflowCards = [
  {
    icon: FolderSearch,
    title: "Discover local sessions",
    body: "Doctor and generate commands scan Codex, Claude Code, and Kiro CLI session sources on your machine.",
  },
  {
    icon: ScanSearch,
    title: "Normalize the chaos",
    body: "The core runtime converts prompts, tool calls, repeated actions, and pricing metadata into one analysis model.",
  },
  {
    icon: BadgeDollarSign,
    title: "Compute the bill",
    body: "API-equivalent spend is estimated per provider, with Kiro explicitly based on local credits rather than invented token math.",
  },
  {
    icon: Workflow,
    title: "Ship the artifacts",
    body: "Each run writes the receipt image, share copy, and JSON outputs into ./token-receipt-output.",
  },
];

const pricingSources = [
  {
    label: "OpenAI pricing",
    href: "https://developers.openai.com/api/docs/pricing",
    body: "Used to refresh the Codex pricing catalog snapshot bundled into analysis metadata.",
  },
  {
    label: "Anthropic pricing",
    href: "https://platform.claude.com/docs/en/about-claude/pricing",
    body: "Used to refresh the Claude pricing catalog snapshot recorded per run.",
  },
  {
    label: "Kiro credit basis",
    href: "https://kiro.dev/pricing/",
    body: "Kiro spend is derived from locally tracked credit usage at the published $0.04 per additional credit rate.",
  },
];

const faqItems = [
  {
    value: "api-key",
    question: "Does Token Receipt need another API key?",
    answer:
      "No for the skill-first path. The runtime computes the facts locally, and Codex or Claude Code uses the host session you are already in to phrase the roast.",
  },
  {
    value: "providers",
    question: "Which agents are supported right now?",
    answer:
      "V1 supports Codex, Claude Code, and Kiro CLI. They are normalized into the same ParsedSession and analysis flow so the receipt can compare them directly.",
  },
  {
    value: "privacy",
    question: "Does it upload prompts or source code?",
    answer:
      "No by default. The runtime stays local, and the skills are designed to hand the host agent structured facts instead of raw logs unless you explicitly ask for deeper inspection.",
  },
  {
    value: "accuracy",
    question: "Is the bill meant to match provider invoices exactly?",
    answer:
      "No. It is grounded in real local usage signals, but it remains an interpreted local receipt rather than an official ledger. Kiro is especially explicit about using credits instead of token-derived pricing.",
  },
  {
    value: "pricing",
    question: "Where do the pricing assumptions come from?",
    answer:
      "The runtime stores pricing metadata in analysis.json. Codex and Claude use refreshable provider-page sourced catalogs, while Kiro uses local credit usage multiplied by the tracked overage rate.",
  },
  {
    value: "outputs",
    question: "What do I get after a run?",
    answer:
      "A receipt image, analysis.json, receipt.json, and share-ready text files in ./token-receipt-output.",
  },
];

function SectionIntro({
  badge,
  title,
  body,
}: {
  badge: string;
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-2xl space-y-3">
      <Badge variant="muted" className="w-fit">
        {badge}
      </Badge>
      <h2 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
        {title}
      </h2>
      <p className="text-base leading-7 text-muted-foreground sm:text-lg">
        {body}
      </p>
    </div>
  );
}

function PromptCard({
  eyebrow,
  title,
  body,
  prompt,
}: {
  eyebrow: string;
  title: string;
  body: string;
  prompt: string;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <Badge variant="accent" className="w-fit">
          {eyebrow}
        </Badge>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{body}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between gap-3 rounded-[1.3rem] border border-white/8 bg-black/30 px-4 py-4">
          <div className="overflow-x-auto font-mono text-sm leading-7 text-neutral-300">
            {prompt}
          </div>
          <CopyButton text={prompt} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const codexPrompt =
    "$token-receipt Generate a receipt for my last 30 days of agent usage.";
  const claudePrompt =
    "Use token-receipt to itemize my last 30 days of Codex, Claude Code, and Kiro CLI usage.";

  return (
    <div className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-24 pt-8 sm:gap-20 sm:pt-10 lg:px-8">
        <header className="space-y-10">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="font-mono text-sm uppercase tracking-[0.3em] text-foreground/88"
            >
              token-receipt
            </Link>
            <GitHubStars />
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <div className="space-y-8">
              <div className="space-y-5">
                <Badge variant="accent" className="w-fit">
                  Codex, Claude Code, and Kiro CLI
                </Badge>
                <div className="space-y-4">
                  <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.08em] text-foreground sm:text-6xl lg:text-7xl">
                    Turn agent chaos into a receipt worth posting.
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                    Token Receipt reads the local logs your coding agents
                    already write, prices the damage, and renders the whole
                    thing as a sharp thermal-paper artifact with share-ready
                    copy.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link
                    href={repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View GitHub
                    <ArrowUpRight />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="#install">
                    Install the skill
                    <ArrowRight />
                  </Link>
                </Button>
              </div>

              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                Skill-first. Local-first. No extra model API in v1. Kiro spend
                is computed from local credit usage rather than
                reverse-engineered token math.
              </p>

              <div className="grid gap-4 md:grid-cols-3">
                {signalCards.map((item) => (
                  <Card
                    key={item.value}
                    className="border-white/8 bg-white/[0.03]"
                  >
                    <CardHeader className="gap-2 pb-5">
                      <CardTitle className="text-base">{item.value}</CardTitle>
                      <CardDescription>{item.label}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]">
              <CardHeader className="space-y-4 pb-5">
                <Badge className="w-fit">What ships per run</Badge>
                <div className="space-y-3">
                  <CardTitle className="text-2xl tracking-[-0.04em]">
                    A local runtime with receipts, analysis, and pricing
                    provenance.
                  </CardTitle>
                  <CardDescription className="text-base">
                    The runtime keeps the serious part inspectable and lets the
                    host agent handle the in-session roast.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {outputCards.map((item) => (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-[1.35rem] border border-white/8 bg-black/24 p-4"
                  >
                    <div className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--paper)] text-[color:var(--paper-ink)]">
                      <item.icon className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-mono text-sm uppercase tracking-[0.18em] text-foreground/90">
                        {item.title}
                      </p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="rounded-[1.35rem] border border-[color:var(--accent-strong)]/20 bg-[color:var(--accent-strong)]/8 p-4 text-sm leading-6 text-neutral-200">
                  <span className="font-semibold text-white">
                    Pricing note:
                  </span>{" "}
                  Codex and Claude use refreshable provider pricing snapshots.
                  Kiro uses local credits and multiplies them by the tracked
                  $0.04 overage rate.
                </div>
              </CardContent>
            </Card>
          </div>

          <div
            id="install"
            className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start"
          >
            <InstallCommandPanel items={installItems} />
            <Card className="overflow-hidden">
              <CardHeader className="pb-4">
                <Badge variant="muted" className="w-fit">
                  Local proof
                </Badge>
                <CardTitle className="text-2xl tracking-[-0.04em]">
                  The receipt is the artifact, not the dashboard.
                </CardTitle>
                <CardDescription className="text-base">
                  Use the runtime directly, or invoke the installed skill from
                  Codex or Claude Code and let it format the final response
                  in-session.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-white/8 bg-black/25 p-4">
                    <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--accent-soft)]">
                      Runtime
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Generates analysis.json, receipt.json, receipt.png, and
                      share copy in one local pass.
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/8 bg-black/25 p-4">
                    <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--accent-soft)]">
                      Skill
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Wraps the runtime so the host agent can read the artifacts
                      and deliver the roast cleanly.
                    </p>
                  </div>
                </div>
                <div className="rounded-[1.35rem] border border-dashed border-white/10 bg-black/18 px-4 py-5">
                  <div className="flex items-center gap-3">
                    <Terminal className="size-4 text-[color:var(--accent-soft)]" />
                    <p className="font-mono text-sm uppercase tracking-[0.18em] text-foreground/90">
                      Doctor checks Kiro too
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    The doctor output now detects Kiro's local SQLite store,
                    surfaces sample session IDs, and reports project directories
                    alongside Codex and Claude diagnostics.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <ProofStrip />
        </header>

        <section className="space-y-8">
          <SectionIntro
            badge="Provider coverage"
            title="One receipt format, three distinct agent sources."
            body="The analysis pipeline stays shared, but the cost model is explicit about where each provider's numbers come from."
          />

          <div className="grid gap-5 lg:grid-cols-3">
            {providerCards.map((provider) => (
              <Card key={provider.name} className="h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl border border-white/8 bg-black/20">
                      <Bot className="size-5 text-[color:var(--accent-soft)]" />
                    </div>
                    <CardTitle>{provider.name}</CardTitle>
                  </div>
                  <CardDescription>{provider.detail}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-[1.25rem] border border-white/8 bg-black/25 p-4 text-sm leading-6 text-muted-foreground">
                    {provider.pricing}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <PromptCard
              eyebrow="Codex prompt"
              title="Invoke it directly inside Codex"
              body="Codex can run the skill wrapper and then summarize the local receipt artifacts inside the active thread."
              prompt={codexPrompt}
            />
            <PromptCard
              eyebrow="Claude Code prompt"
              title="Same loop for Claude Code"
              body="Claude Code gets the same structured local analysis, including Kiro sessions when you run provider all."
              prompt={claudePrompt}
            />
          </div>
        </section>

        <Separator />

        <section className="space-y-8">
          <SectionIntro
            badge="Pricing references"
            title="The site now says where the money math comes from."
            body="Token Receipt does not hide the assumptions. It records the pricing metadata used for the run and keeps Kiro on a clear credit-based model."
          />

          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <Card className="h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-[color:var(--paper)] text-[color:var(--paper-ink)]">
                    <BadgeDollarSign className="size-5" />
                  </div>
                  <CardTitle>
                    analysis.json now records pricing metadata
                  </CardTitle>
                </div>
                <CardDescription>
                  That lets the receipt explain which catalog snapshot or credit
                  model it used instead of presenting spend as unexplained
                  magic.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-white/8 bg-black/25 p-4">
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--accent-soft)]">
                      Catalog refresh
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Run{" "}
                      <span className="font-mono text-foreground">
                        bun run pricing:refresh
                      </span>{" "}
                      to update Codex and Claude pricing inputs from provider
                      pages.
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/8 bg-black/25 p-4">
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--accent-soft)]">
                      Kiro formula
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Credits are summed from local usage_info entries and
                      converted at $0.04 per extra credit.
                    </p>
                  </div>
                </div>
                <div className="rounded-[1.35rem] border border-dashed border-white/10 bg-black/18 px-4 py-5 text-sm leading-6 text-muted-foreground">
                  Token counters for Kiro stay at zero when equivalent local
                  token fields are not present. The existing waste-signal logic
                  still uses planning turns, tool activity, repeated reads,
                  repeated shell calls, and edits observed.
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {pricingSources.map((source) => (
                <Card key={source.label}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">{source.label}</CardTitle>
                    <CardDescription>{source.body}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      asChild
                      variant="secondary"
                      className="w-full justify-between"
                    >
                      <Link
                        href={source.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open source
                        <ArrowUpRight />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Separator />

        <section className="space-y-8">
          <SectionIntro
            badge="How it works"
            title="A simple pipeline with local inputs and opinionated outputs."
            body="The app is intentionally narrow: read what the agents already wrote, calculate the bill, and package the result into artifacts people actually share."
          />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {workflowCards.map((item) => (
              <Card key={item.title} className="h-full">
                <CardHeader className="pb-4">
                  <div className="flex size-11 items-center justify-center rounded-2xl border border-white/8 bg-black/20">
                    <item.icon className="size-5 text-[color:var(--accent-soft)]" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        <section className="space-y-8">
          <SectionIntro
            badge="FAQ"
            title="The obvious questions."
            body="Mostly about privacy, pricing assumptions, and whether this thing is trying to become a dashboard."
          />

          <Accordion>
            {faqItems.map((item) => (
              <AccordionItem key={item.value} value={item.value}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <footer className="rounded-[2rem] border border-white/10 bg-black/24 px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--accent-soft)]">
                Token Receipt
              </p>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                A local, skill-first receipt generator for Codex, Claude Code,
                and Kiro CLI. It exists because screenshots beat dashboards when
                the story is half accounting and half self-own.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href={repoUrl} target="_blank" rel="noopener noreferrer">
                  <GitHubIcon size={16} />
                  Repository
                </Link>
              </Button>
              <Button asChild>
                <Link href="#install">
                  Install now
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
