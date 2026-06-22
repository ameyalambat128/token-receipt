import Link from "next/link";
import { GitHubMetricsStrip } from "@/components/github-metrics-strip";
import { CommandPanel } from "@/components/command-panel";
import { GitHubIcon, XIcon } from "@/components/icons";
import { ReceiptPreview } from "@/components/receipt-preview";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const siteUrl = "https://tokenreceipt.ameyalambat.com";
const productDescription =
  "Token Receipt turns your Codex, Claude Code, Kiro CLI, and experimental Cursor local session logs into your coding-agent bill with a thermal-paper receipt, optional share text, and skill-native workflows.";

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
        "Cursor",
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
      "V1 supports Codex, Claude Code, Kiro CLI, and experimental local Cursor sessions. Cursor support is behavior-first today, so the receipt can reflect local tool activity even when spend fidelity is lower than Codex or Claude Code.",
  },
  {
    value: "cursor-experimental",
    question: "Why is Cursor marked with an asterisk?",
    answer:
      "Cursor support is experimental. Token Receipt reads local Cursor workspace metadata and request traces, so it captures tool activity well, but Cursor does not expose the same local token and cost counters here. That makes the Cursor portion behavior-rich but spend-light compared to Codex and Claude Code.",
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
      "It is grounded in real local usage and tool signals, but it is still an interpretation of local agent activity rather than a billing ledger. Kiro cost is based on local credit usage rather than token-derived API pricing, and experimental Cursor support currently emphasizes behavioral signals over invoice-grade spend accounting.",
  },
  {
    value: "share-loop",
    question: "What makes this shareable?",
    answer:
      "Each run produces a thermal-paper PNG plus a generic share caption you can edit anywhere. The output feels personal because it is derived from your own agent habits, not from a generic meme generator.",
  },
];

function Divider() {
  return <hr className="h-1 w-full rounded border-0 bg-neutral-800" />;
}

export default async function Home() {
  const installCommand =
    "npx skills add ameyalambat128/token-receipt --skill token-receipt";
  const agentPromptShort = "/token-receipt";
  const agentPrompt =
    "/token-receipt Generate a receipt for my last 30 days of Codex, Claude Code, Kiro CLI, and Cursor usage.";

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <header className="mx-6 max-w-6xl py-16 lg:mx-auto lg:py-24">
        <div className="flex items-center justify-between">
          <h1 className="gradient-text text-3xl font-bold tracking-tight">
            /token-receipt
          </h1>
          <GitHubMetricsStrip />
        </div>

        <div className="mt-12 grid items-start gap-12 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16">
          <div>
            <p className="text-balance text-2xl font-semibold leading-snug tracking-tight text-gray-50 sm:text-3xl">
              Your agent has expenses.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-gray-300">
              Officially itemized for Codex, Claude Code, and Cursor
              <a
                href="#faq"
                aria-label="Cursor support is experimental. See the FAQ."
                className="font-medium text-gray-400 underline-offset-2 transition-colors hover:text-gray-200"
              >
                <sup>*</sup>
              </a>{" "}
              local sessions.
            </p>

            <p className="mt-6 leading-relaxed text-gray-400">
              Token Receipt turns local agent logs into your coding-agent bill
              with a thermal-paper PNG, optional share text, and a skill-native
              flow that works inside the tools people already use.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Skill-first. Local-first.
            </p>

            <h2 className="gradient-text mb-4 mt-10 text-xl font-bold tracking-tight">
              Install Token Receipt
            </h2>
            <CommandPanel command={installCommand} shell />
          </div>

          <div className="lg:pt-1">
            <ReceiptPreview />
          </div>
        </div>
      </header>

      <div className="mx-6 max-w-4xl lg:mx-auto">
        <main className="space-y-12">
          <section>
            <h2 className="gradient-text mb-4 text-xl font-bold tracking-tight">
              Codex and Claude Code support
            </h2>
            <p className="mb-4 leading-relaxed text-gray-400">
              Both agents get the same skill-first flow. The skill calls the
              local runtime, reads the structured analysis, and then lets Codex
              or Claude Code write the final response using the session you are
              already in, instead of a separate API key.
            </p>
            <div className="space-y-5">
              <CommandPanel caption="Quickest" command={agentPromptShort} />
              <CommandPanel caption="Or be specific" command={agentPrompt} />
            </div>
          </section>

          <Divider />

          <section>
            <h2 className="gradient-text mb-4 text-xl font-bold tracking-tight">
              What is Token Receipt?
            </h2>
            <p className="mb-4 leading-relaxed text-gray-400">
              Token Receipt is a screenshot-first usage artifact for coding
              agents.
            </p>
            <p className="mb-4 leading-relaxed text-gray-400">
              It reads the session logs that Codex, Claude Code, and Kiro CLI
              already write locally, plus experimental local Cursor workspace
              metadata and request traces, turns those into structured usage
              facts, and lays them out as an itemized bill.
            </p>
            <p className="mb-6 leading-relaxed text-gray-400">
              The result feels personal because it reflects your own habits:
              repeated file reads, subagent sprawl, context bloat, and every
              other expensive little ritual.
            </p>
            <ul className="list-inside list-disc space-y-1 text-gray-400">
              <li>
                Reads local logs from Codex, Claude Code, Kiro CLI, and
                experimental Cursor local sessions
              </li>
              <li>
                Kiro spend uses local credit usage instead of token pricing
              </li>
              <li>
                Cursor receipts currently prioritize tool activity over exact
                spend accounting
              </li>
              <li>Builds a thermal-paper PNG plus a generic share caption</li>
              <li>Uses skills so the host agent can write the final roast</li>
            </ul>
          </section>

          <Divider />

          <section>
            <h2 className="gradient-text mb-4 text-xl font-bold tracking-tight">
              Kiro CLI session support
            </h2>
            <p className="mb-4 leading-relaxed text-gray-400">
              Kiro CLI is supported as a local session source. Token Receipt
              reads the Kiro SQLite session store, extracts tool activity and
              local credit usage, and folds that into the same receipt flow as
              the other supported agents.
            </p>
            <p className="leading-relaxed text-gray-400">
              Because Kiro does not expose the same local token counters here,
              the Kiro portion of the bill uses local credit usage instead of a
              token-derived API estimate.
            </p>
          </section>

          <Divider />

          <section>
            <h2 className="gradient-text mb-4 text-xl font-bold tracking-tight">
              Experimental Cursor local support
            </h2>
            <p className="mb-4 leading-relaxed text-gray-400">
              Cursor is supported experimentally from local workspace metadata
              and request trace logs. That gives Token Receipt enough signal to
              group Composer activity, count reads and searches, and fold those
              habits into the same receipt flow.
            </p>
            <p className="leading-relaxed text-gray-400">
              The tradeoff is accounting fidelity. Cursor does not currently
              expose the same local token and cost counters here, so the receipt
              treats Cursor as behavior-rich but spend-light.
            </p>
          </section>

          <Divider />

          <section>
            <h2 className="gradient-text mb-4 text-xl font-bold tracking-tight">
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
            <h2 className="gradient-text mb-4 text-xl font-bold tracking-tight">
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
            <h2 className="gradient-text mb-4 text-xl font-bold tracking-tight">
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
                  The runtime scans local Codex, Claude Code, and Kiro CLI
                  session logs, plus experimental Cursor local artifacts
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
            <h2 className="gradient-text mb-4 text-xl font-bold tracking-tight">
              Who this is for
            </h2>
            <ul className="list-inside list-disc space-y-1 text-gray-400">
              <li>
                People shipping with Codex, Claude Code, Kiro CLI, or Cursor
                every day
              </li>
              <li>
                People who want Kiro CLI credits and tool detours in the same
                receipt
              </li>
            </ul>
          </section>

          <Divider />

          <section>
            <h2 className="gradient-text mb-4 text-xl font-bold tracking-tight">
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

          <section id="faq" className="scroll-mt-10 pb-24">
            <h2 className="gradient-text mb-4 text-xl font-bold tracking-tight">
              FAQ
            </h2>
            <Accordion className="rounded-2xl border border-neutral-800 bg-neutral-900/40 px-5 sm:px-6">
              {faqItems.map((item) => (
                <AccordionItem key={item.value} value={item.value}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
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
