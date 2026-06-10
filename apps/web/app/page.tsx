"use client";

import Link from "next/link";
import { GitHubStars } from "@/components/github-stars";
import { CopyButton } from "@/components/copy-button";
import { InstallCommandPanel } from "@/components/install-command-panel";
import { GitHubIcon, XIcon } from "@/components/icons";
import { ProofStrip } from "@/components/proof-strip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const siteUrl = "https://tokenreceipt.dev";
const productDescription =
  "Token Receipt turns your Codex and Claude Code logs into an AI bill with a thermal-paper receipt, share-ready captions, and skill-native workflows.";

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
        "agent skills",
        "AI bill",
        "satire",
        "developer tooling",
      ],
    },
  ],
};

const faqItems = [
  {
    value: "existing-subscription",
    question: "Does Token Receipt need another API key?",
    answer:
      "No for the skill-first path. The local runtime computes the facts, and Codex or Claude Code uses the session you are already in to phrase the roast. The runtime itself does not call OpenAI or Anthropic APIs directly in v1.",
  },
  {
    value: "providers",
    question: "Which agents does Token Receipt support first?",
    answer:
      "V1 is built around Codex and Claude Code. It reads the local session logs those tools already write, normalizes usage and tool activity, and produces a receipt plus share copy.",
  },
  {
    value: "privacy",
    question: "Does it upload prompts or code?",
    answer:
      "No. The runtime stays local. Skills are instructed to pass sanitized structured facts into the host agent instead of raw session logs unless you explicitly ask for deeper inspection.",
  },
  {
    value: "accuracy",
    question: "Is the receipt supposed to be financially accurate?",
    answer:
      "It is grounded in real local token and tool signals, but it is still an interpretation of local agent activity rather than a billing ledger.",
  },
  {
    value: "share-loop",
    question: "What makes this shareable?",
    answer:
      "Each run produces a thermal-paper PNG, an X caption, and a LinkedIn caption. The output feels personal because it is derived from your own agent habits, not from a generic meme generator.",
  },
];

function Divider() {
  return <hr className="h-1 w-full rounded border-0 bg-neutral-800" />;
}

export default function Home() {
  const installCommand =
    "npx skills add ameyalambat128/token-receipt --skill token-receipt";
  const repoInstallCommand = "bun install && bun run skill:install";
  const codexPrompt =
    "$token-receipt Generate a receipt for my last 30 days of agent usage.";
  const claudePrompt =
    "Use token-receipt to itemize my last 30 days of Codex and Claude Code usage.";
  const doctorCommand = "bun run -F token-receipt doctor";
  const runtimeCommand =
    "bun run -F token-receipt generate -- --provider all --since 30d --out ./token-receipt-output";
  const installItems = [
    { label: "skill", command: installCommand },
    { label: "repo", command: repoInstallCommand },
    { label: "doctor", command: doctorCommand },
    { label: "runtime", command: runtimeCommand },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <div className="mx-6 max-w-4xl lg:mx-auto">
        <header className="py-16 lg:py-24">
          <div className="flex items-center justify-between">
            <h1 className="gradient-text text-3xl font-bold tracking-tight">
              /token-receipt
            </h1>
            <GitHubStars />
          </div>

          <p className="mt-4 text-lg text-gray-100">
            Your Agent Has Expenses.
            <br className="hidden sm:block" />
            Officially itemized for Codex and Claude Code.
          </p>

          <p className="mt-6 leading-relaxed text-gray-400">
            Token Receipt turns local agent logs into an AI bill with a
            thermal-paper PNG, share-ready captions, and a skill-native flow
            that works inside the tools people already use.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Skill-first. Local-first. No extra model API in v1.
          </p>

          <h2 className="gradient-text mb-4 mt-16 text-xl font-bold">
            Install Token Receipt
          </h2>
          <InstallCommandPanel items={installItems} />
          <ProofStrip />
        </header>

        <main className="space-y-12">
          <section>
            <h2 className="gradient-text mb-4 text-xl font-bold">
              Codex support
            </h2>
            <p className="mb-4 leading-relaxed text-gray-400">
              Token Receipt ships a Codex skill that can be invoked from the
              thread with the exact workflow Codex already uses for skills. The
              skill calls the local runtime, reads the structured analysis, and
              then lets Codex write the final response in-session.
            </p>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 ring-1 ring-neutral-900">
              <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
                Codex prompt
              </p>
              <div className="mt-3 flex items-center justify-between gap-4">
                <div className="overflow-x-auto text-sm font-mono text-gray-400">
                  {codexPrompt}
                </div>
                <CopyButton text={codexPrompt} />
              </div>
            </div>
          </section>

          <Divider />

          <section>
            <h2 className="gradient-text mb-4 text-xl font-bold">
              Claude Code support
            </h2>
            <p className="mb-4 leading-relaxed text-gray-400">
              Claude Code gets the same skill-first flow: local parsing and
              image generation happen in the runtime, and Claude writes the
              final response using your existing session instead of a separate
              API key.
            </p>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 ring-1 ring-neutral-900">
              <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
                Claude Code prompt
              </p>
              <div className="mt-3 flex items-center justify-between gap-4">
                <div className="overflow-x-auto text-sm font-mono text-gray-400">
                  {claudePrompt}
                </div>
                <CopyButton text={claudePrompt} />
              </div>
            </div>
          </section>

          <Divider />

          <section>
            <h2 className="gradient-text mb-4 text-xl font-bold">
              What is Token Receipt?
            </h2>
            <p className="mb-4 leading-relaxed text-gray-400">
              Token Receipt is a receipt-style usage snapshot for coding agents.
            </p>
            <p className="mb-4 leading-relaxed text-gray-400">
              It reads the session logs that Codex and Claude Code already write
              locally, turns those into structured usage facts, and lays them
              out as an itemized bill.
            </p>
            <p className="mb-6 leading-relaxed text-gray-400">
              The result feels personal because it reflects your own habits:
              repeated file reads, subagent sprawl, context bloat, and every
              other expensive little ritual.
            </p>
            <ul className="list-inside list-disc space-y-1 text-gray-400">
              <li>Reads local logs from Codex and Claude Code</li>
              <li>Builds a thermal-paper PNG plus share text</li>
              <li>Uses skills so the host agent can write the final roast</li>
            </ul>
          </section>

          <Divider />

          <section>
            <h2 className="gradient-text mb-4 text-xl font-bold">
              Why this exists
            </h2>
            <p className="mb-4 leading-relaxed text-gray-400">
              The accurate observability product is not the point.
            </p>
            <p className="mb-4 leading-relaxed text-gray-400">
              The point is a screenshot people instantly understand: your coding
              agent bill, officially itemized, with a line item for every bad
              habit you already know you have.
            </p>
            <p className="leading-relaxed text-gray-400">
              Real local signals make the output feel specific instead of
              generic.
            </p>
          </section>

          <Divider />

          <section>
            <h2 className="gradient-text mb-4 text-xl font-bold">
              What it itemizes
            </h2>
            <p className="mb-4 leading-relaxed text-gray-400">
              V1 focuses on signals we can defend from the logs:
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                "Context window emotional support",
                "Repeated file reads",
                "Repeated shell confidence loops",
                "MCP tool tourism",
                "Subagent middle management",
                "Planning before touching a file",
                "Cache-heavy sessions",
                "Low-output expensive runs",
              ].map((item) => (
                <div key={item} className="py-1 text-sm text-gray-400">
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-gray-600">
              Every bill is derived from local agent logs.
            </p>
          </section>

          <Divider />

          <section>
            <h2 className="gradient-text mb-4 text-xl font-bold">
              How it works
            </h2>
            <p className="mb-6 leading-relaxed text-gray-400">
              Token Receipt is local parsing plus agent-native copywriting, not
              a new hosted AI layer.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <span className="font-mono text-gray-600">1.</span>
                <p className="text-gray-400">
                  The runtime scans local Codex and Claude Code session logs
                </p>
              </div>
              <div className="flex gap-4">
                <span className="font-mono text-gray-600">2.</span>
                <p className="text-gray-400">
                  Deterministic heuristics turn those logs into receipt facts
                </p>
              </div>
              <div className="flex gap-4">
                <span className="font-mono text-gray-600">3.</span>
                <p className="text-gray-400">
                  The skill asks Codex or Claude Code to phrase the final
                  response using the session you are already paying for
                </p>
              </div>
            </div>
            <p className="mt-6 text-sm text-gray-600">
              No prompt uploads by default. No telemetry in v1.
            </p>
          </section>

          <Divider />

          <section>
            <h2 className="gradient-text mb-4 text-xl font-bold">
              Who this is for
            </h2>
            <ul className="list-inside list-disc space-y-1 text-gray-400">
              <li>People shipping with Codex or Claude Code every day</li>
            </ul>
          </section>

          <Divider />

          <section>
            <h2 className="gradient-text mb-4 text-xl font-bold">
              Open source
            </h2>
            <p className="mb-6 leading-relaxed text-gray-400">
              MIT licensed and open source.
            </p>
            <div className="flex gap-4">
              <Link
                href="https://github.com/ameyalambat128/token-receipt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 transition-colors hover:text-white hover:underline"
              >
                GitHub repository
              </Link>
            </div>
          </section>

          <Divider />

          <section className="pb-24">
            <h2 className="gradient-text mb-4 text-xl font-bold">FAQ</h2>
            <Accordion className="rounded-2xl border border-neutral-800 bg-neutral-950/60 px-5 ring-1 ring-neutral-900">
              {faqItems.map((item) => (
                <AccordionItem key={item.value} value={item.value}>
                  <AccordionTrigger className="text-gray-200">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="leading-relaxed text-gray-400">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-10 flex flex-wrap gap-4 text-sm text-gray-500">
              <Link
                href="https://github.com/ameyalambat128/token-receipt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-white"
              >
                <GitHubIcon size={16} />
                GitHub
              </Link>
              <Link
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-white"
              >
                <XIcon size={16} />X
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
